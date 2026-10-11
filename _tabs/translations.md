---
title: 个人译作
icon: fas fa-book-open
order: 2
---

这里收录我整理的文学中文译本，其中 **8 部作品提供 EPUB**，另有可直接在网页阅读的序言及书信译稿。书目按作者和内容归类。

> **关于翻译与署名**：这些中文译文由大型语言模型（LLM）生成，并非由我独立翻译。我主要负责收集和整理，不以人工译者自居。LLM 译文难免可能存在误译、漏译或表达不当，阅读时请以原文为准。此说明仅用于交代译文来源，并不代表原作或译文已获得公开传播许可。

{% assign epub_paths = site.static_files | map: "path" %}

## 奥拉夫·斯特普尔顿（Olaf Stapledon）

{% assign stapleton_books = site.data.translations | where: "author", "Olaf Stapledon" %}
{% for book in stapleton_books %}
### 《{{ book.title }}》

*{{ book.original }}*{% if book.note %} · {{ book.note }}{% endif %}

{% assign epub_path = "/assets/epub/" | append: book.filename %}
{% if epub_paths contains epub_path %}
[下载 EPUB]({{ book.download_url | relative_url }})
{% else %}
<small class="text-muted">EPUB 文件尚未上传</small>
{% endif %}

{% endfor %}

## 罗伯特·谢克里（Robert Sheckley）

{% assign sheckley_books = site.data.translations | where: "author", "Robert Sheckley" %}
{% for book in sheckley_books %}
### 《{{ book.title }}》

*{{ book.original }}*

{% assign epub_path = "/assets/epub/" | append: book.filename %}
{% if epub_paths contains epub_path %}
[下载 EPUB]({{ book.download_url | relative_url }})
{% else %}
<small class="text-muted">EPUB 文件尚未上传</small>
{% endif %}

{% endfor %}

---

## 科幻史料与书信（网页阅读）

### 《从纳尼亚到太空漫游：阿瑟·克拉克与 C. S. 刘易斯的思想之争》

*From Narnia to a Space Odyssey: The War of Ideas Between Arthur C. Clarke and C. S. Lewis* · Ryder W. Miller 编 · ibooks，2003

- [编者导言与克拉克亲笔前言（中文译稿）](/posts/clarke-lewis-prefaces/)
- [克拉克与刘易斯往来书信（1943—1954；附 2003 年短札）](/posts/clarke-lewis-correspondence/)

本项直接以长篇博文呈现，**不提供 EPUB**，亦不收录原书所选两人的小说、随笔。译稿由 LLM 生成，手写信中不能可靠辨认的文字另有校勘标注。

---

<small>说明：本页整理个人译作；原作、信件、译文及封面等材料的公开传播均应以相应权利许可为前提。页面上的版权说明不等同于取得许可。</small>
