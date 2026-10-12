"""Pair existing Chinese EPUB with the supplied English Dimension of Miracles.

Usage: python tools/import_dimension.py --english PATH --chinese PATH
"""
import argparse
import hashlib
import html
import json
import posixpath
import re
from zipfile import ZipFile
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from import_asimov import ROOT, clean, normal, document

SLUG = 'dimension-of-miracles'


def run(en_path, zh_path):
    pages = []
    with ZipFile(en_path) as en, ZipFile(zh_path) as zh:
        opf = ET.fromstring(en.read('META-INF/container.xml')).find('.//{*}rootfile').get('full-path')
        base = posixpath.dirname(opf)
        pkg = ET.fromstring(en.read(opf))
        man = {n.get('id'): n for n in pkg.findall('.//{*}manifest/{*}item')}
        ncx = ET.fromstring(en.read(posixpath.join(base, man[pkg.find('.//{*}spine').get('toc')].get('href'))))
        part_number = 0
        for n in ncx.findall('.//{*}navPoint'):
            label = normal(n.find('{*}navLabel/{*}text').text)
            source = posixpath.normpath(posixpath.join(base, n.find('{*}content').get('src')))
            chapter = re.fullmatch(r'Chapter (\d+)', label)
            if chapter:
                page_slug = 'chapter-' + chapter[1].zfill(2)
                chinese = f'OEBPS/chapter{chapter[1]}.xhtml'
            elif label.startswith('Part '):
                part_number += 1
                page_slug = 'part-' + str(part_number).zfill(2)
                chinese = f'OEBPS/part{part_number}.xhtml'
            else:
                page_slug = label.lower()
                chinese = None
            title = label
            if chinese:
                body = document(zh, chinese).body
                heading = body.find(['h1', 'h2'])
                title = normal(heading.get_text())
            pages.append({'title': title, 'english_title': label, 'slug': page_slug, 'source': source, 'chinese_source': chinese, 'url': f'/translations/{SLUG}/{page_slug}/'})
        assert len([p for p in pages if p['slug'].startswith('chapter-')]) == 28
        mapping_en = {(p['source'], ''): p['url'] for p in pages}
        mapping_zh = {(p['chinese_source'], ''): p['url'] for p in pages if p['chinese_source']}
        for i, p in enumerate(pages):
            sections = []
            text_hashes = {}
            for lang, archive, source, mapping in [('zh', zh, p['chinese_source'], mapping_zh), ('en', en, p['source'], mapping_en)]:
                if not source: continue
                body = document(archive, source).body
                original = normal(body.get_text())
                content = clean(body, source, mapping)
                assert re.sub(r'\s+', '', BeautifulSoup(content, 'html.parser').get_text()) == re.sub(r'\s+', '', original), (p['slug'], lang)
                assert '{{' not in content and '{%' not in content
                text_hashes[lang] = hashlib.sha256(original.encode()).hexdigest()
                hidden = ' hidden' if lang == 'en' and p['chinese_source'] else ''
                sections.append(f'<section class="stapledon-body" data-story-lang="{lang}" lang="{"zh-CN" if lang == "zh" else "en"}" aria-label="{"中文译文" if lang == "zh" else "English original"}"{hidden}>\n{content}\n</section>')
            p['text_sha256'] = text_hashes
            links = []
            if i: links.append(f'<a href="{pages[i-1]["url"]}">← 上一节</a>')
            if i+1 < len(pages): links.append(f'<a href="{pages[i+1]["url"]}">下一节 →</a>')
            nav = f'<nav class="stapledon-chapter-nav" aria-label="章节导航"><a href="/translations/{SLUG}/">← 返回全书目录</a><span>{" · ".join(links)}</span></nav>'
            fm = {'layout': 'post', 'title': '奇迹维度 · ' + p['title'], 'date': '2026-10-12 21:45:00 +0800', 'categories': ['文学译本'], 'permalink': p['url'], 'toc': False, 'comments': False}
            out = '---\n' + '\n'.join(k + ': ' + json.dumps(v, ensure_ascii=False) for k,v in fm.items()) + '\n---\n\n'
            out += '<link rel="stylesheet" href="{{ \'/assets/css/stapledon-reader.css\' | relative_url }}">\n\n<div class="stapledon-meta"><em>Dimension of Miracles</em> · 1968 · 罗伯特·谢克里（Robert Sheckley）</div>\n\n' + nav + '\n\n'
            if p['chinese_source']:
                out += '<div class="stapledon-language-switch" role="group" aria-label="选择阅读语言"><span class="stapledon-switch-label">阅读语言</span><button type="button" data-stapledon-lang="zh" aria-pressed="true">中文</button><button type="button" data-stapledon-lang="en" aria-pressed="false">English</button></div>\n\n'
            out += '<article class="stapledon-reader" id="stapledon-reader">\n' + '\n'.join(sections) + '\n</article>\n\n' + nav + '\n'
            if p['chinese_source']:
                out += '<script src="{{ \'/assets/js/stapledon-language.js\' | relative_url }}" defer></script>\n'
            (ROOT / '_posts' / f'2026-10-12-dimension-of-miracles-{p["slug"]}.md').write_text(out, encoding='utf-8')
    index = '---\nlayout: page\ntitle: 奇迹维度\npermalink: /translations/dimension-of-miracles/\ntoc: false\n---\n\n罗伯特·谢克里（Robert Sheckley）· *Dimension of Miracles* · 1968\n\n全书五部、28 章，按原章节提供 **中文 / English** 切换阅读，支持划线、笔记与全书摘录汇总。\n\n中文沿用本站原有 EPUB 中的非官方简体中文译稿；英文依据本次提供的原版 EPUB。中文稿未包含题辞与献词，这两页保留英文。未新增翻译，也未提供 EPUB 下载。\n\n## 全书目录\n\n'
    for p in pages:
        if p['slug'].startswith('part-'):
            index += f'\n### [{p["title"]}]({p["url"]})\n\n'
        else:
            index += f'- [{p["title"]}]({p["url"]})\n'
    index += '\n---\n\n<small>中文为非官方译稿，可能存在误译或漏译，请结合英文原文阅读。</small>\n\n[← 返回个人译作](/translations/)\n'
    dest = ROOT / 'translations' / SLUG
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'index.md').write_text(index, encoding='utf-8')
    manifest = {'title': 'Dimension of Miracles', 'slug': SLUG, 'year': 1968, 'english_sha256': hashlib.sha256(en_path.read_bytes()).hexdigest(), 'chinese_sha256': hashlib.sha256(zh_path.read_bytes()).hexdigest(), 'pages': pages}
    (ROOT / '_data' / 'dimension_import.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Dimension of Miracles: {len(pages)} pages, 28 bilingual chapters')


if __name__ == '__main__':
    from pathlib import Path
    p = argparse.ArgumentParser()
    p.add_argument('--english', type=Path, required=True)
    p.add_argument('--chinese', type=Path, required=True)
    args = p.parse_args()
    run(args.english, args.chinese)
