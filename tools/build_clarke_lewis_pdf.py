#!/usr/bin/env python3
"""Generate a screen-friendly A5 PDF from existing Jekyll posts.

No external hyperlinks are included. Every letter's notes follow that letter.
Long letters may span A5 pages; short letters are packed together where possible.
"""
import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer,
)

ROOT = Path(__file__).resolve().parents[1]
PREFACE = ROOT / "_posts/2026-10-11-clarke-lewis-prefaces.md"
LETTERS = ROOT / "_posts/2026-10-11-clarke-lewis-correspondence.md"
OUTPUT = ROOT / "assets/pdf/clarke-lewis-a5.pdf"

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/arphic-gbsn00lp/gbsn00lp.ttf",
    "/usr/share/fonts/truetype/arphic/uming.ttc",
]
font = next((p for p in FONT_CANDIDATES if Path(p).exists()), None)
if not font:
    raise FileNotFoundError("Install the fonts-arphic-gbsn00lp package.")
pdfmetrics.registerFont(TTFont("MobileSong", font))

PAGE_W, PAGE_H = A5
PAD_X = 24
PAD_TOP = 27
PAD_BOTTOM = 27
TEXT_WIDTH = PAGE_W - PAD_X * 2
BODY_COLOR = colors.HexColor("#253044")
MUTED_COLOR = colors.HexColor("#6b788b")
ACCENT_COLOR = colors.HexColor("#315b87")

styles = {
    "date": ParagraphStyle(
        "date", fontName="MobileSong", fontSize=15.5, leading=23,
        textColor=BODY_COLOR, spaceAfter=3, wordWrap="CJK",
    ),
    "label": ParagraphStyle(
        "label", fontName="MobileSong", fontSize=9.1, leading=14,
        textColor=ACCENT_COLOR, spaceAfter=4, wordWrap="CJK",
    ),
    "body": ParagraphStyle(
        "body", fontName="MobileSong", fontSize=11.55, leading=19.2,
        textColor=BODY_COLOR, alignment=TA_LEFT,
        spaceAfter=10, wordWrap="CJK", splitLongWords=True,
    ),
    "noteHead": ParagraphStyle(
        "noteHead", fontName="MobileSong", fontSize=9.3, leading=14.5,
        textColor=ACCENT_COLOR, spaceBefore=8, spaceAfter=4,
        wordWrap="CJK",
    ),
    "note": ParagraphStyle(
        "note", fontName="MobileSong", fontSize=9.25, leading=15.2,
        textColor=MUTED_COLOR, spaceAfter=6, wordWrap="CJK",
        splitLongWords=True,
    ),
}

LINK = re.compile(r"\[([^\]]+)\]\((?:https?://[^)]*|/[^)]*)\)")
REF = re.compile(r"\[\^([a-z0-9]+)\]")


def plain_markup(s):
    s = LINK.sub(r"\1", s)
    s = re.sub(r"\*\*|\*(?=[^\s])|(?<=[^\s])\*", "", s)
    s = re.sub(r"(?m)^>\s*", "", s)
    s = s.replace("  \n", "\n")
    return s.strip()


def definitions(full):
    return dict(re.findall(r"(?m)^\[\^([a-z0-9]+)\]: (.+)$", full))


def body_range(doc, start, end):
    a = doc.find(start)
    b = doc.find(end, a + 1)
    if a < 0 or b < 0:
        raise ValueError(f"Could not locate manuscript sections: {start}, {end}")
    return doc[a + len(start):b].strip()


def letters_from_md(doc):
    material = body_range(doc, "## 一、1943 年", "## 注释与出处")
    head = re.compile(
        r"(?m)^###\s+(\d+)\.\s+([^\n]+)\n+\*\*([^\n]+)\*\*\s*\n"
    )
    hits = list(head.finditer(material))
    sections = []
    for i, hit in enumerate(hits):
        stop = hits[i + 1].start() if i + 1 < len(hits) else material.find("## 附：", hit.end())
        if stop == -1:
            stop = len(material)
        body = material[hit.end():stop].strip()
        sections.append(dict(
            num=int(hit.group(1)), sender=hit.group(2).strip(),
            date=hit.group(3).split("｜")[0].strip(), body=body,
        ))
    postscript = material.find("## 附：")
    if postscript < 0:
        raise ValueError("2003 postscript missing")
    last = material[postscript:]
    match = re.search(r"\*\*([^\n]+)\*\*\s*\n", last)
    if not match:
        raise ValueError("Postscript date missing")
    sections.append(dict(
        num=16, sender="克拉克致刘易斯",
        date=match.group(1).split("｜")[0].strip(),
        body=last[match.end():].split("\n---", 1)[0].strip(),
    ))
    if [x["num"] for x in sections] != list(range(1, 17)):
        raise ValueError("Expected 15 numbered letters and one 2003 postscript")
    return sections


def note_text(note):
    # Remove bibliographic web links rather than printing unclickable addresses.
    note = LINK.sub("", note)
    note = plain_markup(note)
    note = re.sub(r"\s*[·、，]\s*(?=[。，；])", "", note)
    note = re.sub(r"[·、， ]+\s*$", "", note).rstrip()
    return note


def format_paragraph(text, ref_numbers):
    text = plain_markup(text)
    safe = html.escape(text, quote=False)
    def superscript(m):
        n = ref_numbers.get(m.group(1))
        return (f'<super><font color="#315b87" size="7.6">{n}</font></super>'
                if n else "")
    safe = REF.sub(superscript, safe)
    return safe


def build_section(date, sender, body, notes, preface=False):
    codes = list(dict.fromkeys(REF.findall(body)))
    code_nums = {code: n + 1 for n, code in enumerate(codes)}
    missing = [c for c in codes if c not in notes]
    if missing:
        raise ValueError(f"Footnotes missing: {missing}")
    items = [
        Paragraph("克拉克自序" if preface else sender, styles["label"]),
        Paragraph(html.escape(date), styles["date"]),
        Spacer(1, 6),
    ]
    # Remove the brief bibliographic header preceding Clarke's preface.
    if preface:
        body = re.sub(r"(?s)^.*?\*原书第 [^\n]+\*\s*", "", body, count=1)
    for paragraph in re.split(r"\n\s*\n", body):
        paragraph = paragraph.strip()
        if not paragraph or paragraph.startswith("## "):
            continue
        paragraph = paragraph.replace("\n", " ")
        items.append(Paragraph(format_paragraph(paragraph, code_nums), styles["body"]))
    if codes:
        items.append(Paragraph("注释", styles["noteHead"]))
        for code, num in code_nums.items():
            value = note_text(notes[code])
            if value:
                items.append(Paragraph(
                    f'<font color="#315b87">{num}.</font> ' + html.escape(value),
                    styles["note"],
                ))
    items.append(Spacer(1, 13))
    return items


def estimated_height(items):
    height = 0
    for item in items:
        _w, h = item.wrap(TEXT_WIDTH, PAGE_H)
        height += h + item.getSpaceBefore() + item.getSpaceAfter()
    return height


def draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#dce3eb"))
    canvas.setLineWidth(0.45)
    canvas.line(PAD_X, 21, PAGE_W - PAD_X, 21)
    canvas.setFillColor(MUTED_COLOR)
    canvas.setFont("MobileSong", 8.1)
    canvas.drawCentredString(PAGE_W / 2, 10.5, str(doc.page))
    canvas.restoreState()


class A5Document(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(
            str(filename), pagesize=A5, leftMargin=PAD_X, rightMargin=PAD_X,
            topMargin=PAD_TOP, bottomMargin=PAD_BOTTOM,
            title="克拉克与刘易斯：自序及通信（A5 阅读版）",
            author="据《From Narnia to a Space Odyssey》博客中文译稿编排",
            pageCompression=1,
        )
        frame = Frame(
            PAD_X, PAD_BOTTOM, PAGE_W - 2 * PAD_X,
            PAGE_H - PAD_TOP - PAD_BOTTOM,
            leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
        )
        self.addPageTemplates(PageTemplate(id="A5", frames=frame, onPage=draw_footer))


def main():
    pre = PREFACE.read_text(encoding="utf-8")
    letter_md = LETTERS.read_text(encoding="utf-8")
    prebody = body_range(pre, "## 克拉克前言", "## 编校注与延伸阅读")
    pd = definitions(pre)
    ld = definitions(letter_md)
    story = []
    story.extend(build_section("2001 年 1 月 24 日", "克拉克自序", prebody, pd, preface=True))
    story.append(PageBreak())

    sections = letters_from_md(letter_md)
    previous_long = False
    for i, section in enumerate(sections):
        block = build_section(
            section["date"], section["sender"], section["body"], ld,
        )
        height = estimated_height(block)
        is_long = height > (PAGE_H - PAD_TOP - PAD_BOTTOM - 25)
        if i and (is_long or previous_long):
            story.append(PageBreak())
        if is_long:
            story.extend(block)
        else:
            # A short letter and its annotations remain intact; multiple
            # short letters may share one A5 page.
            story.append(KeepTogether(block))
        previous_long = is_long

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    A5Document(OUTPUT).build(story)
    if OUTPUT.stat().st_size < 10000:
        raise ValueError("PDF unexpectedly small")
    print(f"Created {OUTPUT}, {OUTPUT.stat().st_size:,} bytes, {len(sections)} letters/short notes")


if __name__ == "__main__":
    main()
