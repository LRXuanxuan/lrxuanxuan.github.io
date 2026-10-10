---
title: 个人译作
icon: fas fa-book-open
order: 2
---

这里收录我的文学翻译整理稿。目前共整理了 **8 部作品**，主要为科幻文学译作。书目按照作者归类，电子版采用 EPUB 格式，适合在各类电子阅读器中阅读。

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
