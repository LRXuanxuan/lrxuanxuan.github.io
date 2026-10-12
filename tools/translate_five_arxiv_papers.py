#!/usr/bin/env python3
"""Build text-only Chinese reading pages for five supplied arXiv PDFs.

Source PDFs are downloaded at build time; no PDF or image is committed.
Text is translated using an online translation endpoint with validation and term normalization.
The resulting pages are MACHINE FIRST DRAFTS, never peer-reviewed translations.
"""
from __future__ import annotations

import html
import re
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
PAPERS = [
    ("2607.15713", "2e094f4029e01a73", "以地图作为提示：面向跨场景无线定位的多模态空间—信号基础模型学习", "Map as a Prompt: Learning Multi-Modal Spatial-Signal Foundation Models for Cross-scenario Wireless Localization", 17),
    ("2607.17954", "ad7c6f680aefcbc8", "基于记忆式在线高斯过程的流式频谱测量无线电地图更新", "Radio Map Updating from Streaming Spectrum Measurements via Memory-Based Online Gaussian Processes", 14),
    ("2607.17133", "2b09701c969754d7", "动态信道知识地图：基本原理、构建方法与应用", "Dynamic Channel Knowledge Map: Fundamentals, Construction, and Applications", 7),
    ("2607.16361", "65907205876c1561", "生成式常微分方程中积分误差的空间传输", "Spatial Transport of Integration Error in Generative ODEs", 21),
    ("2607.12975", "5cc0d0d751befc62", "面向隐式数据同化的集合控制流滤波方法", "Ensemble Controlled-Flow Filtering for Implicit Data Assimilation", 26),
]
OUTPUT = ROOT / "papers" / "translations"
ASSET = ROOT / "assets" / "papers" / "translations"
CACHE = Path("/tmp/arxiv-paper-translation-cache")


class ScientificTranslator:
    """Online EN->ZH translator with retries and communications terminology checks."""

    def __init__(self):
        self.cache = {}
        self.calls = 0

    def translate(self, text: str) -> str:
        if not text.strip():
            return ""
        if text in self.cache:
            return self.cache[text]
        q = urllib.parse.urlencode({
            "client": "gtx", "sl": "en", "tl": "zh-CN", "dt": "t", "q": text
        })
        req = urllib.request.Request(
            "https://translate.googleapis.com/translate_a/single?" + q,
            headers={"User-Agent": "Mozilla/5.0 (research paper translation quality pass)"}
        )
        for attempt in range(6):
            try:
                with urllib.request.urlopen(req, timeout=40) as resp:
                    payload = json.load(resp)
                result = "".join(part[0] or "" for part in payload[0])
                if not result.strip():
                    raise ValueError("translation service returned an empty result")
                result = self.normalize_terms(result)
                if re.search(r"(.{2,9})\\1{10,}", result):
                    raise ValueError("repeated-output degeneration detected")
                self.cache[text] = result
                self.calls += 1
                if self.calls % 80 == 0:
                    print("MT_BLOCKS_DONE=", self.calls, flush=True)
                time.sleep(0.08)
                return result
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError,
                    ValueError, IndexError, TypeError) as exc:
                if attempt == 5:
                    raise RuntimeError(f"Translation request failed after retries: {exc}") from exc
                time.sleep(min(40, 2 ** attempt + 1))
        raise AssertionError("unreachable")

    @staticmethod
    def normalize_terms(text: str) -> str:
        substitutions = [
            ("渠道知识图谱", "信道知识地图"),
            ("渠道知识地图", "信道知识地图"),
            ("频道知识图谱", "信道知识地图"),
            ("信道知识图谱", "信道知识地图"),
            ("通道知识地图", "信道知识地图"),
            ("无线电地图", "无线电地图"),
            ("飞行员符号", "导频符号"),
            ("飞行员开销", "导频开销"),
            ("导频额外费用", "导频开销"),
            ("飞行员", "导频"),
            ("综艺滤波器", "集合滤波器"),
            ("综艺过滤", "集合滤波"),
            ("综艺节目", "集合"),
            ("增材高斯", "加性高斯"),
            ("添加剂高斯", "加性高斯"),
            ("附加高斯", "加性高斯"),
            ("双胞胎数字", "数字孪生"),
            ("数字双胞胎", "数字孪生"),
            ("广义射线追踪", "射线追踪"),
        ]
        for a, b in substitutions:
            text = text.replace(a, b)
        text = text.replace("渠道状态信息", "信道状态信息")
        text = text.replace("频道状态信息", "信道状态信息")
        text = text.replace("渠道", "信道")
        return text


def translator():
    return ScientificTranslator()


def download(arxiv_id: str) -> Path:
    CACHE.mkdir(exist_ok=True, parents=True)
    dest = CACHE / (arxiv_id + ".pdf")
    if dest.is_file() and dest.stat().st_size > 10000:
        return dest
    req = urllib.request.Request(
        "https://arxiv.org/pdf/" + arxiv_id,
        headers={"User-Agent": "Mozilla/5.0 (academic personal-archive text translation)"},
    )
    with urllib.request.urlopen(req, timeout=90) as src, dest.open("wb") as dst:
        import shutil
        shutil.copyfileobj(src, dst)
    if dest.stat().st_size < 10000 or not dest.read_bytes()[:5] == b"%PDF-":
        raise RuntimeError("Invalid download for " + arxiv_id)
    return dest


def normalize(x: str) -> str:
    x = x.replace("\u00ad", "").replace("\ufb01", "fi").replace("\ufb02", "fl")
    x = x.replace("\u2010", "-").replace("\u200b", "")
    x = re.sub(r"([A-Za-z])-\n(?=[a-z])", r"\1", x)
    x = re.sub(r"(?<!\n)\n(?!\n)", " ", x)
    x = re.sub(r"\s{2,}", " ", x)
    return x.strip()


def is_mathy(x: str) -> bool:
    if not x or not re.search(r"[A-Za-z]", x):
        return True
    alpha = sum(bool(ch.isalpha()) for ch in x)
    return (alpha / len(x) < 0.42) or (
        len(x) < 230 and len(re.findall(r"[=∫∑∂∝√∇∥≤≥∈πρσθφΨλμ⊤]|[{}^_]", x)) >= 3
    )


def is_reference_heading(x: str) -> bool:
    t = re.sub(r"[^a-z]", "", x.lower())
    return t in ("references", "bibliography", "acknowledgmentsreferences")


def extract(doc, expected_pages: int):
    if len(doc) != expected_pages:
        raise RuntimeError(f"Page count mismatch: {len(doc)} != {expected_pages}")
    output = []
    ref_mode = False
    for n, page in enumerate(doc, start=1):
        blocks = page.get_text("blocks")
        parts = []
        for b in blocks:
            if len(b) > 6 and b[6] != 0:
                continue
            text = normalize(b[4])
            if len(text) < 2:
                continue
            # Suppress isolated publication headers and bare page counters.
            if text.isdigit() and len(text) <= 3:
                continue
            if re.match(r"^(Published as a conference paper at ICLR|arXiv:\d{4}\.\d+v\d+)", text, re.I):
                continue
            if is_reference_heading(text):
                ref_mode = True
            parts.append((text, is_mathy(text), ref_mode))
        if not parts:
            raise RuntimeError(f"PDF page {n}: extraction returned no text")
        output.append(parts)
    return output


def translate_text(model, text: str) -> str:
    """Translate all prose, including long blocks; never drop long spans."""
    sentences = re.split(r"(?<=[.!?])\\s+(?=[A-Z(\\[])", text)
    chunks, cur = [], ""
    for sent in sentences:
        if len(sent) > 1050:
            # Fallback for tables or PDF merges without sentence boundaries.
            words = sent.split()
            parts, curpart = [], ""
            for word in words:
                if curpart and len(curpart) + len(word) > 950:
                    parts.append(curpart)
                    curpart = ""
                curpart += (" " if curpart else "") + word
            if curpart:
                parts.append(curpart)
        else:
            parts = [sent]
        for part in parts:
            if len(cur) + len(part) > 1050 and cur:
                chunks.append(cur)
                cur = ""
            cur += (" " if cur else "") + part
    if cur:
        chunks.append(cur)
    translated = [model.translate(chunk) for chunk in chunks]
    return " ".join(translated)


def ensure_safe(x: str) -> str:
    # Avoid Jekyll/HTML interpreting raw PDF symbols as markup.
    return html.escape(x, quote=False).replace("{%", "{% raw %}{%{% endraw %}")


def article(meta, pages, model):
    aid, pid, zh_title, en_title, num_pages = meta
    slug = f"2026-10-12-{aid.replace('.', '')}"
    permalink = f"/papers/translations/{slug}/"
    lines = [
        "---", "layout: page", f"title: '{zh_title}'",
        f"permalink: {permalink}", "math: true", "toc: true", "---", "",
        "{% raw %}",
        "[← 返回论文库](/papers/) · [对应论文条目](/papers/items/" + pid + "/) · [官方 PDF](https://arxiv.org/pdf/" + aid + ")",
        "",
        "# " + zh_title, "", "**原题**：" + en_title, "",
        f"**论文来源**：[arXiv:{aid}](https://arxiv.org/abs/{aid}) · PDF {num_pages} 页",
        "",
        "> 状态：全文自动中译初稿（第二轮翻译及通信术语校正），尚未逐段人工核校。原文公式、参考文献按原样保留；复杂公式、双栏表格和图中文字应对照官方 PDF 核实。请勿将本稿当作正式学术译本。",
        "",
        "## 页码导航", "",
        " · ".join(f"[{n}](#page-{n})" for n in range(1, num_pages + 1)),
        "",
        "## 全文逐页中译", "",
    ]
    ntrans, nmath, nrefs, nfallback = 0, 0, 0, 0
    for pg_idx, blocks in enumerate(pages, start=1):
        lines.extend([f"## 第 {pg_idx} 页", "", f'<span id="page-{pg_idx}"></span>', ""])
        for idx, (text, mathy, ref_mode) in enumerate(blocks, start=1):
            if ref_mode:
                # Bibliography is preserved in its original citation form.
                lines.append(ensure_safe(text) + "\n")
                nrefs += 1
                continue
            if mathy:
                lines.extend([
                    f"<details><summary>公式／符号原文（第 {pg_idx} 页，第 {idx} 块）</summary>",
                    "", "<pre>" + html.escape(text) + "</pre>", "", "</details>", "",
                ])
                nmath += 1
                continue
            try:
                chinese = translate_text(model, text)
            except Exception as e:
                raise RuntimeError(f"{aid} p{pg_idx} block{idx}: {e}") from e
            if len(chinese.strip()) < 2:
                # Translators can return an empty string on mixed TeX/PDF glyphs.
                # Retry a prose-only projection, but never silently discard content.
                cleaned = re.sub(r"[^\\x20-\\x7e]+", " ", text).strip()
                if cleaned:
                    chinese = translate_text(model, cleaned)
                if len(chinese.strip()) < 2:
                    nfallback += 1
                    chinese = "【机器译文未识别，原文保留待校订】" + text
            lines.append(ensure_safe(chinese) + "\n")
            ntrans += 1
        lines.extend([
            f"[本页原文 ↗](https://arxiv.org/pdf/{aid}#page={pg_idx})", "",
        ])
    lines.extend(["", "## 文本完整性和核对说明", "",
        f"- PDF 原件页数：{num_pages}；译稿覆盖页数：{len(pages)}。",
        f"- 英文文字块：{ntrans}；机器译文未识别而保留原文的文字块：{nfallback}；公式与非语言文字块保留原文：{nmath}；参考文献块保留原文：{nrefs}。",
        "- 源 PDF 自动文字提取可能造成公式上下标、双栏阅读顺序与跨页表格损坏。官方 PDF 是准确原文的依据。",
        "- 译文采用自动化翻译并进行了通信术语归一化，专有名词、定理和公式周边文字仍需进一步学术审校。",
        "",
        "{% endraw %}", ""
    ])
    if nfallback > max(6, ntrans // 50):
        raise RuntimeError(f"Too many untranslatable blocks: {aid}: {nfallback}/{ntrans}")
    if ntrans < num_pages * 3:
        raise RuntimeError(f"Suspiciously few translated blocks: {aid} ({ntrans})")
    return slug, "\n".join(lines), (ntrans, nmath, nrefs)


def update_item(pid: str, slug: str) -> None:
    item = ROOT / "papers" / "items" / f"{pid}.md"
    txt = item.read_text(encoding="utf-8")
    newlink = f"/papers/translations/{slug}/"
    txt2 = txt.replace(
        f"[全文翻译（待补齐）](/papers/items/{pid}/#paper-translation)",
        f"[全文逐页机器中译初稿]({newlink})",
    )
    txt2 = txt2.replace(
        "本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。",
        f"[阅读已覆盖全文的中文机器翻译初稿]({newlink})（未逐段学术审校；公式及参考文献请核对原文）。",
    )
    if txt2 == txt:
        raise RuntimeError(f"Could not replace translation placeholder for {pid}")
    item.write_text(txt2, encoding="utf-8")


def main():
    model = translator()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    ASSET.mkdir(parents=True, exist_ok=True)
    for meta in PAPERS:
        aid = meta[0]
        pdf = download(aid)
        with fitz.open(pdf) as doc:
            blocks = extract(doc, meta[4])
        slug, rendered, stats = article(meta, blocks, model)
        path = OUTPUT / f"{slug}.md"
        path.write_text(rendered, encoding="utf-8")
        # Assets copy omits page-layout metadata and Liquid wrappers.
        raw = rendered.split("{% raw %}", 1)[1].rsplit("{% endraw %}", 1)[0]
        (ASSET / f"{slug}.md").write_text(raw.strip() + "\n", encoding="utf-8")
        update_item(meta[1], slug)
        print(f"READY {aid}: {len(blocks)} pages; MT/math/refs={stats}; chars={len(rendered)}", flush=True)
    print("TRANSLATIONS_COMPLETE=5")


if __name__ == "__main__":
    main()
