#!/usr/bin/env python3
"""Bundle the maintained studios as offline Android assets, without copying app code."""
from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'android/app/build/generated/lightdrawAssets'
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


def android_print_hook(html: str) -> str:
    """Adapt just the print entry point; the maintained webpage stays unchanged."""
    start = html.index('  function openPrintWindow(includeOriginal) {')
    end = html.index('  /* ---------------- 控件启用状态', start)
    original = html[start:end]
    needle = "    var dataURL = c.toDataURL('image/png');"
    if original.count(needle) != 1:
        raise RuntimeError('Study print entry point changed; review the Android print hook.')
    hook = """    if (window.DrawingDesktop && window.DrawingDesktop.print) {
      canvasToBlob(c).then(function (blob) {
        return window.DrawingDesktop.print(blob, '打印参考卡');
      }).catch(function (error) { toast(error.message || String(error)); });
      return;
    }
"""
    return html[:start] + original.replace(needle, hook + needle, 1) + html[end:]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--license-dir', type=Path)
    args = parser.parse_args()
    ci = os.environ.get('GITHUB_ACTIONS') == 'true'
    if ci and not args.license_dir:
        raise RuntimeError('CI APKs must include resolved runtime dependency licenses.')
    if args.license_dir and not (args.license_dir / 'dependencies.json').is_file():
        raise RuntimeError('Resolved runtime license inventory is missing.')
    # Generated output only. Never follow an output symlink outside this project.
    if DEST.resolve() != DEST.absolute():
        raise RuntimeError('Refusing a linked Android output path.')
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir(parents=True)
    for relative in DIRECTORIES:
        shutil.copytree(ROOT / relative, DEST / relative)
    for relative in FILES:
        target = DEST / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / relative, target)
    shutil.copyfile(ROOT / 'android/android.js', DEST / 'android.js')
    shutil.copyfile(ROOT / 'LICENSE', DEST / 'LICENSE.txt')
    shutil.copyfile(ROOT / 'android/THIRD_PARTY_NOTICES.txt', DEST / 'THIRD_PARTY_NOTICES.txt')
    license_dest = DEST / 'licenses'
    if args.license_dir:
        shutil.copytree(args.license_dir, license_dest)
    else:
        license_dest.mkdir()
    shutil.copyfile(ROOT / 'assets/drawing-studio/vendor/pdfjs/LICENSE', license_dest / 'Apache-2.0.txt')

    for page in PAGES:
        html = (ROOT / page).read_text(encoding='utf-8')
        if not html.lstrip().lower().startswith('<!doctype html>'):
            raise RuntimeError(f'{page}: expected a standalone page.')
        if not (0 <= html.find('<head>') < html.find('</head>') < html.find('<body')):
            raise RuntimeError(f'{page}: head changed; review native adapter injection.')
        html = html.replace('<head>', '<head>\n<script src="/android.js"></script>', 1)
        for external in ('playthings/', 'drawing-desktop.html'):
            html = re.sub(r'href=([\'"])/?' + re.escape(external) + r'\1',
                          f'href="{WEBSITE}/{external}"', html)
        if page == 'drawing-studio.html':
            desktop_link = f'<a href="{WEBSITE}/drawing-desktop.html">下载桌面版</a>'
            if html.count(desktop_link) != 1:
                raise RuntimeError('Drawing header changed; review the Android website link.')
            html = html.replace(desktop_link, f'<a href="{WEBSITE}/drawing-studio.html">网页版</a>', 1)
            html = html.replace("<title>轻绘 · 本地画室 · Ruixuan's Corner</title>",
                                '<title>轻绘 · 本地画室</title>')
        else:
            html = android_print_hook(html)
        references = References()
        references.feed(html)
        for reference in references.paths:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                raise RuntimeError(f'{page}: non-local startup resource: {reference}')
            path = unquote(url.path).lstrip('/')
            if '..' in Path(path).parts or not (DEST / path).is_file():
                raise RuntimeError(f'{page}: missing local startup resource: {reference}')
        (DEST / page).write_text(html, encoding='utf-8', newline='\n')

    for relative in ('assets/drawing-studio/vector-worker.js',
                     'assets/drawing-studio/vendor/pdfjs/pdf.mjs',
                     'assets/drawing-studio/vendor/pdfjs/pdf.worker.mjs',
                     'assets/drawing-studio/vendor/pdfjs/LICENSE'):
        if not (DEST / relative).is_file():
            raise RuntimeError(f'Missing deferred resource: {relative}')
    gradle = (ROOT / 'android/app/build.gradle').read_text(encoding='utf-8')
    version = re.search(r"versionName\s+'(\d+\.\d+\.\d+)'", gradle)
    version_code = re.search(r'versionCode\s+(\d+)', gradle)
    if not version or not version_code:
        raise RuntimeError('Android app version is missing.')
    source = os.environ.get('GITHUB_SHA', '')
    if ci and not re.fullmatch(r'[0-9a-f]{40}', source):
        raise RuntimeError('CI must record its exact source commit.')
    manifest = {'platform': 'android', 'version': version.group(1),
                'versionCode': int(version_code.group(1)),
                'sourceCommit': source, 'origin': 'https://appassets.androidplatform.net',
                'dependencyLicensesIncluded': bool(args.license_dir), 'files': []}
    for path in sorted(DEST.rglob('*')):
        if not path.is_file():
            continue
        data = path.read_bytes()
        manifest['files'].append({'path': path.relative_to(DEST).as_posix(), 'bytes': len(data),
                                  'sha256': hashlib.sha256(data).hexdigest()})
    (DEST / 'build-info.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
                                          encoding='utf-8')
    print(f"Android offline assets: {len(manifest['files'])} files, "
          f"{sum(item['bytes'] for item in manifest['files']):,} bytes before APK compression.")
    if not args.license_dir:
        print('Local asset check only: runtime dependency notices will be resolved by Gradle before an APK build.')


if __name__ == '__main__':
    main()
