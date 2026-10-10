---
title: 个人译作
icon: fas fa-book-open
order: 2
---

这里收录我整理的文学中文译本，目前共 **8 部作品**，以科幻文学为主。书目按作者归类，电子版采用 EPUB 格式。

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

<small>说明：本页整理个人翻译作品；电子文件的公开提供应以相应原作及译文的权利许可为前提。</small>
