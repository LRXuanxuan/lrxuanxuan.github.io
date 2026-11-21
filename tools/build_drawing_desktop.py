#!/usr/bin/env python3
"""Build a small, entirely local Tauri frontend from the maintained web app."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import shutil
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'desktop' / 'dist'
PAGES = ('drawing-studio.html', 'color-block-studio.html')
DIRECTORIES = ('assets/drawing-studio', 'assets/color-block-studio')
FILES = ('assets/js/studio-filenames.js',)
WEBSITE = 'https://lrxuanxuan.github.io'


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths: list[str] = []

    def handle_starttag(self, tag, attrs):
        fields = dict(attrs)
        if tag == 'script' and fields.get('src'):
            self.paths.append(fields['src'])
        if tag == 'link' and fields.get('rel') == 'stylesheet':
            self.paths.append(fields['href'])


def main():
    # Only this generated directory is cleared, never website source or user files.
    if DEST.is_symlink():
        raise RuntimeError('Refusing to replace a linked output directory.')
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir(parents=True)
    for path in DIRECTORIES:
        shutil.copytree(ROOT / path, DEST / path)
    for path in FILES:
        target = DEST / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, target)
    shutil.copyfile(ROOT / 'desktop' / 'desktop.js', DEST / 'desktop.js')
    shutil.copyfile(ROOT / 'LICENSE', DEST / 'LICENSE.txt')
    shutil.copyfile(ROOT / 'desktop' / 'THIRD_PARTY_NOTICES.txt', DEST / 'THIRD_PARTY_NOTICES.txt')
    native_licenses = ROOT / 'desktop' / 'generated-licenses'
    if native_licenses.is_dir():
        if not (native_licenses / 'rust-dependencies.json').is_file():
            raise RuntimeError('Native dependency license inventory is incomplete.')
        shutil.copytree(native_licenses, DEST / 'licenses')
    elif os.environ.get('GITHUB_ACTIONS') == 'true':
        raise RuntimeError('Release builds must collect native dependency licenses before packaging.')

    for page in PAGES:
        html = (ROOT / page).read_text(encoding='utf-8')
        if not html.lstrip().lower().startswith('<!doctype html>'):
            raise RuntimeError(f'{page}: expected a standalone page, not a Jekyll template.')
        # A classic script runs before the app in both pages (the study app is inline).
        html = html.replace('<head>', '<head>\n<script src="desktop.js"></script>', 1)
        html = re.sub(r'href=([\'"])/?playthings/\1', f'href="{WEBSITE}/playthings/"', html)
        html = re.sub(r'href=([\'"])/?drawing-desktop.html\1', f'href="{WEBSITE}/drawing-desktop.html"', html)
        html = html.replace('下载桌面版', '查看新版')
        html = html.replace('<title>轻绘 · 本地画室 · Ruixuan\'s Corner</title>', '<title>轻绘 · 本地画室</title>')
        parser = References()
        parser.feed(html)
        for reference in parser.paths:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                raise RuntimeError(f'{page}: a startup asset is not offline: {reference}')
            path = unquote(url.path).lstrip('/')
            if not (DEST / path).is_file():
                raise RuntimeError(f'{page}: missing bundled asset {reference}')
        (DEST / page).write_text(html, encoding='utf-8', newline='\n')

    # These resources load later and do not appear in the HTML asset list.
    for path in ('assets/drawing-studio/vector-worker.js',
                 'assets/drawing-studio/vendor/pdfjs/pdf.mjs',
                 'assets/drawing-studio/vendor/pdfjs/pdf.worker.mjs',
                 'assets/drawing-studio/vendor/pdfjs/LICENSE'):
        if not (DEST / path).is_file():
            raise RuntimeError(f'Missing deferred asset: {path}')
    config = json.loads((ROOT / 'desktop' / 'src-tauri' / 'tauri.conf.json').read_text(encoding='utf-8'))
    manifest = {'version': config['version'], 'sourceCommit': os.environ.get('GITHUB_SHA', ''), 'files': []}
    for path in sorted(DEST.rglob('*')):
        if not path.is_file():
            continue
        data = path.read_bytes()
        manifest['files'].append({'path': path.relative_to(DEST).as_posix(), 'bytes': len(data),
                                  'sha256': hashlib.sha256(data).hexdigest()})
    (DEST / 'build-info.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    total = sum(row['bytes'] for row in manifest['files'])
    print(f"Desktop frontend: {len(manifest['files'])} local files, {total:,} bytes before executable compression.")


if __name__ == '__main__':
    main()
