"""Import user-supplied English EPUBs; no EPUBs, images or fonts are published.

Usage: python tools/import_asimov.py --source-dir PATH
Requires beautifulsoup4. Chapters retain text, emphasis, section and footnote IDs.
"""
import argparse
import hashlib
import html
import json
import posixpath
import re
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup, Comment

BOOKS = [
    ('The Caves of Steel', 'the-caves-of-steel', 1954, 18),
    ('The Naked Sun', 'the-naked-sun', 1957, 18),
    ('The Rest of the Robots', 'the-rest-of-the-robots', 1964, 8),
    ('The Robots of Dawn', 'the-robots-of-dawn', 1983, 19),
    ('Robots and Empire', 'robots-and-empire', 1985, 19),
]
ROOT = Path(__file__).resolve().parents[1]


def normal(text):
    return re.sub(r'\s+', ' ', text).strip()


def document(z, path):
    # Decode explicitly: EPUB declarations and typography are UTF-8.
    return BeautifulSoup(z.read(path).decode('utf-8-sig'), 'html.parser')


def clean(body, source, target_map):
    for e in body.find_all(['script', 'style', 'img', 'svg']):
        e.decompose()
    for e in body.find_all(attrs={'epub:type': 'pagebreak'}):
        e.decompose()
    for e in body.find_all(string=lambda s: isinstance(s, Comment)):
        e.extract()
    for e in list(body.find_all(True)):
        if e.name == 'a':
            href = e.get('href', '')
            if href and not re.match(r'https?://', href):
                file, _, anchor = href.partition('#')
                dest = posixpath.normpath(posixpath.join(posixpath.dirname(source), file)) if file else source
                page = target_map.get((dest, anchor)) or target_map.get((dest, ''))
                if page:
                    e['href'] = page + ('#' + anchor if anchor else '')
                else:
                    e.unwrap()
                    continue
            elif href and not re.match(r'https?://', href):
                e.unwrap()
                continue
        classes = ' '.join(e.get('class', [])).lower()
        if e.name == 'h1':
            e.name = 'h2'
        if e.name == 'span' and 'italic' in classes:
            e.name = 'em'
        elif e.name == 'span' and 'bold' in classes:
            e.name = 'strong'
        e.attrs = {k: v for k, v in e.attrs.items() if k in ('id', 'href', 'lang')}
        if e.name == 'span':
            e.unwrap()
        elif e.name not in ('p', 'h2', 'h3', 'h4', 'em', 'strong', 'i', 'b', 'br', 'hr', 'a', 'sup', 'sub', 'blockquote', 'ul', 'ol', 'li', 'aside'):
            e.unwrap()
    for p in body.find_all('p'):
        if not p.get_text(strip=True) and not p.find(['hr', 'br']):
            p.decompose()
    return '\n'.join(str(e) for e in body.contents if str(e).strip())


def import_book(source_dir, title, slug, year, expected):
    files = list(source_dir.glob(title + '*.epub'))
    if len(files) != 1:
        raise ValueError(f'{title}: expected exactly one EPUB, found {len(files)}')
    file = files[0]
    pages = []
    groups = {}
    with ZipFile(file) as z:
        container = ET.fromstring(z.read('META-INF/container.xml'))
        opf = container.find('.//{*}rootfile').get('full-path')
        base = posixpath.dirname(opf)
        package = ET.fromstring(z.read(opf))
        manifest = {x.get('id'): x for x in package.findall('.//{*}manifest/{*}item')}
        spine = package.find('.//{*}spine')
        ncx_path = posixpath.join(base, manifest[spine.get('toc')].get('href'))
        ncx = ET.fromstring(z.read(ncx_path))
        current_part = ''
        for point in ncx.findall('.//{*}navPoint'):
            label = normal(point.find('{*}navLabel/{*}text').text)
            src = point.find('{*}content').get('src')
            rel, _, anchor = src.partition('#')
            path = posixpath.normpath(posixpath.join(base, rel))
            if slug == 'robots-and-empire' and label.startswith('Part '):
                current_part = label
                continue
            chapter = re.match(r'^(?:Chapter )?(\d+)\s+\S', label)
            if chapter:
                page_slug = 'chapter-' + chapter[1].zfill(2)
                group = current_part
            elif label in ('Copyright', 'Dedication', 'Introduction', 'Footnotes', 'About the Author'):
                page_slug = label.lower().replace(' ', '-')
                group = ''
            elif slug == 'the-rest-of-the-robots' and label.startswith('Part '):
                page_slug = 'part-' + str(len(groups) + 1).zfill(2)
                group = ''
                current_part = label
                groups[label] = page_slug
            else:
                continue
            if chapter and slug == 'the-rest-of-the-robots':
                group = current_part
            pages.append(dict(title=label, slug=page_slug, source=path, anchor=anchor, group=group))
        assert sum(p['slug'].startswith('chapter-') for p in pages) == expected
        mapping = {}
        docs = {}
        for p in pages:
            p['url'] = f'/translations/{slug}/{p["slug"]}/'
            mapping[p['source'], p['anchor']] = p['url']
            if p['source'] not in docs:
                docs[p['source']] = document(z, p['source'])
            # Map all original IDs to a published page, including footnote targets.
            for node in docs[p['source']].body.find_all(attrs={'id': True}):
                mapping.setdefault((p['source'], node['id']), p['url'])
        # Multiple chapters in a single part file need IDs assigned to their chapter.
        for path, doc in docs.items():
            chapter_pages = [p for p in pages if p['source'] == path and p['anchor']]
            if chapter_pages:
                current = None
                for node in doc.body.find_all(True):
                    current = next((p for p in chapter_pages if p['anchor'] == node.get('id')), current)
                    if current and node.get('id'):
                        mapping[path, node['id']] = current['url']
        for i, p in enumerate(pages):
            doc = docs[p['source']]
            if p['anchor']:
                start = doc.find(id=p['anchor'])
                nodes = [start]
                for sibling in start.next_siblings:
                    if getattr(sibling, 'name', None) == 'h3':
                        break
                    nodes.append(sibling)
                body = BeautifulSoup('<body>' + ''.join(map(str, nodes)) + '</body>', 'html.parser').body
            else:
                body = BeautifulSoup(str(doc.body), 'html.parser').body
            # Record normalized source text, then check conversion loses no words.
            for e in body.find_all(['svg', 'img']):
                e.decompose()
            source_text = normal(body.get_text())
            content = clean(body, p['source'], mapping)
            assert normal(BeautifulSoup(content, 'html.parser').get_text()) == source_text, (title, p['title'])
            p['text_sha256'] = hashlib.sha256(source_text.encode()).hexdigest()
            p['characters'] = len(source_text)
            adjacent = []
            if i:
                adjacent.append(f'<a href="{pages[i-1]["url"]}">← 上一节</a>')
            if i + 1 < len(pages):
                adjacent.append(f'<a href="{pages[i+1]["url"]}">下一节 →</a>')
            nav = f'<nav class="stapledon-chapter-nav" aria-label="章节导航"><a href="/translations/{slug}/">← 返回全书目录</a><span>{" · ".join(adjacent)}</span></nav>'
            meta = f'<div class="stapledon-meta"><em>{html.escape(title)}</em> · {year} · Isaac Asimov · English' + (f' · {p["group"]}' if p['group'] else '') + '</div>'
            front = {'layout': 'post', 'title': title + ' · ' + p['title'], 'date': '2026-10-12 21:45:00 +0800', 'categories': ['英文文学'], 'permalink': p['url'], 'lang': 'en', 'toc': False, 'comments': False}
            header = '---\n' + '\n'.join(k + ': ' + json.dumps(v, ensure_ascii=False) for k, v in front.items()) + '\n---\n\n'
            output = header + '<link rel="stylesheet" href="{{ \'/assets/css/stapledon-reader.css\' | relative_url }}">\n\n' + meta + '\n\n' + nav + '\n\n'
            output += '<article class="stapledon-reader" id="stapledon-reader">\n<section class="stapledon-body" data-story-lang="en" lang="en" aria-label="English original">\n' + content + '\n</section>\n</article>\n\n' + nav + '\n'
            # Literal book text must not be interpreted as Liquid.
            assert '{{' not in content and '{%' not in content
            dest = ROOT / '_posts' / f'2026-10-12-asimov-{slug}-{p["slug"]}.md'
            dest.write_text(output, encoding='utf-8')
    directory = ROOT / 'translations' / slug
    directory.mkdir(parents=True, exist_ok=True)
    index = f'---\nlayout: page\ntitle: {json.dumps(title)}\npermalink: /translations/{slug}/\ntoc: false\nlang: en\n---\n\nIsaac Asimov · *{title}* · {year}\n\n'
    index += '本书提供 **English 原文**，按原书章节或篇目分为独立网页。正文可划线、写笔记；本页汇总全书摘录。\n\n'
    if slug == 'the-rest-of-the-robots':
        index += '此处依照所提供 EPUB 收录导言、三个分部与八篇短篇，保留各篇前后的作者说明和脚注。\n\n'
    index += '## 全书目录\n\n'
    last_group = ''
    for p in pages:
        if p['slug'].startswith('part-'):
            index += f'\n### [{p["title"]}]({p["url"]})\n\n'
            last_group = p['title']
            continue
        if p['group'] and p['group'] != last_group:
            index += f'\n### {p["group"]}\n\n'
        elif not p['group'] and last_group:
            index += '\n### 附录\n\n'
        index += f'- [{p["title"]}]({p["url"]})\n'
        last_group = p['group']
    index += '\n---\n\n<small>英文正文依据提供的 EPUB 整理；未翻译，未上传原 EPUB、封面或字体。作品名旁年份指单行本首版年，所用电子版的版本信息见 Copyright 页。</small>\n\n'
    index += '[出版年份参考：Isaac Asimov 作品目录](https://www.asimovonline.com/oldsite/asimov_catalogue.html)\n\n[← 返回个人译作](/translations/)\n'
    (directory / 'index.md').write_text(index, encoding='utf-8')
    return {'title': title, 'slug': slug, 'year': year, 'epub_sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'pages': pages}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=Path, required=True)
    args = parser.parse_args()
    result = [import_book(args.source_dir, *book) for book in BOOKS]
    (ROOT / '_data' / 'asimov.yml').write_text('\n'.join(f'- title: {json.dumps(b["title"])}\n  slug: {b["slug"]}\n  year: {b["year"]}\n  kind: {"作品集" if b["slug"] == "the-rest-of-the-robots" else "长篇小说"}' for b in result) + '\n', encoding='utf-8')
    (ROOT / '_data' / 'asimov_import.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps([{'title': b['title'], 'year': b['year'], 'pages': len(b['pages'])} for b in result], indent=2))
