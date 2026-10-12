"""Import Clarke EPUB text, including spine entries missing from their NCX TOC.

Usage: python tools/import_clarke.py --source-dir PATH (beautifulsoup4 required).
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
from bs4 import BeautifulSoup
from import_asimov import ROOT, clean, normal, document

BOOKS = [
    ("Childhood's End", 'Childhoods End', 'childhoods-end', 1953),
    ('The City and the Stars', 'The City and the Stars', 'the-city-and-the-stars', 1956),
    ('2001: A Space Odyssey', '2001 - A Space Odyssey', '2001-a-space-odyssey', 1968),
    ('The Best of Arthur C. Clarke 1937–1955', 'The Best of Arthur C. Clarke 1937-55', 'best-of-clarke-1937-1955', 1976),
    ('The Best of Arthur C. Clarke 1956–1972', 'The Best of Arthur C. Clarke 1956-72', 'best-of-clarke-1956-1972', 1977),
    ('The Fountains of Paradise', 'The Fountains of Paradise', 'the-fountains-of-paradise', 1979),
]


def run(source_dir, title, prefix, slug, year):
    paths = list(source_dir.glob(prefix + '*.epub'))
    assert len(paths) == 1, (prefix, len(paths))
    file = paths[0]
    pages = []
    with ZipFile(file) as z:
        opf = ET.fromstring(z.read('META-INF/container.xml')).find('.//{*}rootfile').get('full-path')
        base = posixpath.dirname(opf)
        pkg = ET.fromstring(z.read(opf))
        man = {i.get('id'): i for i in pkg.findall('.//{*}manifest/{*}item')}
        spine = pkg.find('.//{*}spine')
        ncx = ET.fromstring(z.read(posixpath.join(base, man[spine.get('toc')].get('href'))))
        labels = {}
        for n in ncx.findall('.//{*}navPoint'):
            source = posixpath.normpath(posixpath.join(base, n.find('{*}content').get('src').split('#')[0]))
            labels[source] = normal(n.find('{*}navLabel/{*}text').text)
        if slug == '2001-a-space-odyssey':
            # This EPUB has only 24 NCX chapter entries; chapter 21 is split
            # across files and the last file contains the rest of the novel.
            nodes = []
            for item in spine:
                source = posixpath.join(base, man[item.get('idref')].get('href'))
                if not re.search(r'/part\d+', source):
                    continue
                body = document(z, source).body
                for div in list(body.find_all('div')):
                    div.unwrap()
                for h in body.find_all('h1'):
                    if normal(h.get_text()) == '2001-A Space Odyssey':
                        h.decompose()
                nodes.extend((source, node) for node in body.contents)
            active = {'title': 'Edition information, Foreword and Dedication', 'slug': 'foreword', 'source': nodes[0][0], 'nodes': []}
            for source, node in nodes:
                label = normal(node.get_text()) if getattr(node, 'name', None) else ''
                # Chapter 25's heading is absent, but its opening paragraph is
                # retained between the completed failure diagnosis and EVA.
                # Title and six-part boundaries: Open Library OL7575930M TOC.
                if label.startswith('Frank Poole had been through the whole routine before'):
                    assert active['slug'] == 'chapter-24'
                    pages.append(active)
                    heading = BeautifulSoup('<h2>25 - First Man to Saturn</h2>', 'html.parser').h2
                    active = {'title': '25 - First Man to Saturn', 'slug': 'chapter-25', 'source': source, 'nodes': [heading]}
                match = re.match(r'^(\d+)\s*-\s*\S', label) if len(label) < 100 else None
                if match or label == 'Epilogue: After 2001':
                    pages.append(active)
                    active = {'title': label, 'slug': 'chapter-' + match[1].zfill(2) if match else 'epilogue', 'source': source, 'nodes': []}
                    if node.name == 'p':
                        node.name = 'h2'
                active['nodes'].append(node)
            pages.append(active)
            nums = [int(p['slug'].split('-')[1]) for p in pages if p['slug'].startswith('chapter-')]
            assert nums == list(range(1, 48)), nums
            for p in pages:
                p['body'] = BeautifulSoup('<body>' + ''.join(map(str, p.pop('nodes'))) + '</body>', 'html.parser').body
                for node in p['body'].find_all(string=True):
                    if 'remembert thi sis' in node:
                        node.replace_with(str(node).replace('remembert thi sis', 'remember this is'))
            note = '已参照 [Open Library 收录的纸本目录](https://openlibrary.org/books/OL7575930M/2001)，恢复六个分部、47 章及原文件中缺失的第 25 章标题，合并跨文件的第 21 章。正文沿用所提供 EPUB，未用缩写本或电影剧本替换；原版本附有前言与后记。'
        else:
            for item in spine:
                source = posixpath.join(base, man[item.get('idref')].get('href'))
                stem = Path(source).stem
                label = labels.get(source)
                if label and label.lower() in ('cover', 'title page', 'contents'):
                    continue
                if stem.lower() in ('blurb', 'titlepage', 'title', 'tp', 'cvi', 'toc'):
                    continue
                body = document(z, source).body
                if not normal(body.get_text()):
                    continue
                if re.fullmatch(r'c\d+', stem):
                    page_slug = 'chapter-' + str(int(stem[1:])).zfill(2)
                elif re.fullmatch(r'[Ss]tory-\d+', stem):
                    page_slug = 'story-' + str(int(stem.split('-')[1])).zfill(2)
                elif re.fullmatch(r'p\d+', stem):
                    page_slug = 'part-' + str(int(stem[1:])).zfill(2)
                else:
                    names = {'cop': 'copyright', 'copyright': 'copyright', 'ded': 'dedication', 'fwd': 'foreword', 'prl': 'prologue', 'itr': 'introduction', 'intro': 'introduction', 'prf': 'preface', 'app': 'appendix', 'epi': 'epilogue', 'ack': 'sources-and-acknowledgments', 'bib': 'bibliography'}
                    page_slug = 'epigraph' if stem.lower() == 'fm' else names.get(stem.lower(), stem.lower())
                if not label:
                    heading = body.find(['h1', 'h2', 'h3'])
                    label = normal(heading.get_text()) if heading else page_slug.replace('-', ' ').title()
                pages.append({'title': label, 'slug': page_slug, 'source': source, 'body': body})
            note = '按所提供 EPUB 的阅读顺序保留正文、前言及附录；未翻译。'
            if slug.startswith('best-of-'):
                note += '标题中的年份为作品年代范围；合集最初于 1973 年合卷出版，这里按分卷版本标注年份。'
                if year == 1977:
                    note += '此卷书目记录列 1977 年，所提供 EPUB 版权页写 1976 年，原版本信息保留供核对。'
                if year == 1976:
                    note += '已对照大学出版社所列分卷目录核对 11 篇小说；所提供 EPUB 未包含纸本目录列出的 Bibliography，本站也未补造此附录。'
        mapping = {}
        for p in pages:
            p['url'] = f'/translations/{slug}/{p["slug"]}/'
            mapping.setdefault((p['source'], ''), p['url'])
            for n in p['body'].find_all(attrs={'id': True}):
                mapping[p['source'], n['id']] = p['url']
        for i, p in enumerate(pages):
            body = p.pop('body')
            for e in body.find_all(['svg', 'img']):
                e.decompose()
            original = normal(body.get_text())
            content = clean(body, p['source'], mapping)
            assert normal(BeautifulSoup(content, 'html.parser').get_text()) == original, (title, p['title'])
            assert '{{' not in content and '{%' not in content
            p['characters'] = len(original)
            p['text_sha256'] = hashlib.sha256(original.encode()).hexdigest()
            neighbors = []
            if i: neighbors.append(f'<a href="{pages[i-1]["url"]}">← 上一节</a>')
            if i + 1 < len(pages): neighbors.append(f'<a href="{pages[i+1]["url"]}">下一节 →</a>')
            nav = f'<nav class="stapledon-chapter-nav" aria-label="章节导航"><a href="/translations/{slug}/">← 返回全书目录</a><span>{" · ".join(neighbors)}</span></nav>'
            fm = {'layout': 'post', 'title': title + ' · ' + p['title'], 'date': '2026-10-12 21:45:00 +0800', 'categories': ['英文文学'], 'permalink': p['url'], 'lang': 'en', 'toc': False, 'comments': False}
            output = '---\n' + '\n'.join(k + ': ' + json.dumps(v, ensure_ascii=False) for k, v in fm.items()) + '\n---\n\n'
            output += '<link rel="stylesheet" href="{{ \'/assets/css/stapledon-reader.css\' | relative_url }}">\n\n'
            output += f'<div class="stapledon-meta"><em>{html.escape(title)}</em> · {year} · Arthur C. Clarke · English</div>\n\n' + nav + '\n\n'
            output += '<article class="stapledon-reader" id="stapledon-reader">\n<section class="stapledon-body" data-story-lang="en" lang="en" aria-label="English original">\n' + content + '\n</section>\n</article>\n\n' + nav + '\n'
            (ROOT / '_posts' / f'2026-10-12-clarke-{slug}-{p["slug"]}.md').write_text(output, encoding='utf-8')
        directory = ROOT / 'translations' / slug
        directory.mkdir(parents=True, exist_ok=True)
        index = f'---\nlayout: page\ntitle: {json.dumps(title, ensure_ascii=False)}\npermalink: /translations/{slug}/\ntoc: false\nlang: en\n---\n\nArthur C. Clarke · *{title}* · {year}\n\n本书提供 **English 原文**，分章 / 分篇连续阅读，支持划线、笔记与全书摘录汇总。\n\n{note}\n\n## 全书目录\n\n'
        for p in pages:
            if slug == '2001-a-space-odyssey':
                parts = {'chapter-01': 'I. Primeval Night', 'chapter-07': 'II. TMA-1', 'chapter-15': 'III. Between Planets', 'chapter-21': 'IV. Abyss', 'chapter-31': 'V. The Moons of Saturn', 'chapter-41': 'VI. Through the Star Gate'}
                if p['slug'] in parts:
                    index += '\n### ' + parts[p['slug']] + '\n\n'
                elif p['slug'] == 'epilogue':
                    index += '\n### Epilogue\n\n'
            if p['slug'].startswith('part-'):
                index += f'\n### [{p["title"]}]({p["url"]})\n\n'
            else:
                index += f'- [{p["title"]}]({p["url"]})\n'
        index += '\n---\n\n<small>正文依据提供的英文 EPUB 整理，未上传原 EPUB、封面或字体。原有电子版信息按源文件保留。</small>\n\n[书目参考：The Encyclopedia of Science Fiction](https://sf-encyclopedia.com/entry/clarke_arthur_c)\n\n[← 返回个人译作](/translations/)\n'
        index = index.replace('[书目参考：The Encyclopedia', '[版本与目录参考：University of Illinois Press](https://www.press.uillinois.edu/books/?id=p083594)\n\n[书目参考：The Encyclopedia')
        (directory / 'index.md').write_text(index, encoding='utf-8')
        return {'title': title, 'slug': slug, 'year': year, 'epub_sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'pages': pages}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=Path, required=True)
    args = parser.parse_args()
    result = [run(args.source_dir, *b) for b in BOOKS]
    (ROOT / '_data' / 'clarke.yml').write_text('\n'.join(f'- title: {json.dumps(b["title"], ensure_ascii=False)}\n  slug: {b["slug"]}\n  year: {b["year"]}\n  kind: {"作品集" if b["slug"].startswith("best-of-") else "长篇小说"}' for b in result) + '\n', encoding='utf-8')
    (ROOT / '_data' / 'clarke_import.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps([{'title': b['title'], 'year': b['year'], 'pages': len(b['pages'])} for b in result], ensure_ascii=False, indent=2))
