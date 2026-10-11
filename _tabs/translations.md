---
title: 个人译作
icon: fas fa-book-open
order: 2
---

这里收录我整理的文学中文译本，其中 **8 部作品提供 EPUB**，另有可直接在网页阅读的威尔斯专题、序言及书信译稿。书目按作者和内容归类。

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

## H. G. 威尔斯（H. G. Wells）

本专题汇集威尔斯的小说观、未来观、政治论述及影评，并收录其他作家为其作品撰写的导读、后记和相关书信。**全部采用网页博文形式阅读，不提供 EPUB 下载。**

### 威尔斯本人

- [《Boon》第四章：论艺术、文学与亨利·詹姆斯](/posts/wells-boon-chapter-four/) · *Boon*, Chapter IV（1915）
- [《当代小说》](/posts/wells-the-contemporary-novel/) · *The Contemporary Novel*（1912）
- [《未来的发现》](/posts/wells-the-discovery-of-the-future/) · *The Discovery of the Future*（1902）
- [《七部著名小说》序言](/posts/wells-seven-famous-novels-preface/) · *Preface to Seven Famous Novels*（1934）
- [《大西洋版总序》](/posts/wells-atlantic-edition-introduction/) · *A General Introduction to the Atlantic Edition*（1924）
- [威尔斯评《大都会》：1927 年影评](/posts/wells-metropolis-review/) · *Mr. Wells Reviews a “Current” Film*（1927）
- [《公开密谋：世界革命蓝图》（全书）](/posts/wells-the-open-conspiracy/) · *The Open Conspiracy*（1928）

### 他人论威尔斯及相关书信

- [亨利·詹姆斯致威尔斯：1905 年的赞美信](/posts/wells-henry-james-letter-1905/) · Henry James（1905）
- [阿瑟·克拉克：《威尔斯与科幻小说》导读](/posts/wells-clarke-sf-introduction/) · Arthur C. Clarke（1962）
- [艾萨克·阿西莫夫：《世界大战》后记](/posts/wells-asimov-war-of-worlds-afterword/) · Isaac Asimov

以上为 LLM 译稿，其中署名亨利·詹姆斯、克拉克和阿西莫夫的文章均非威尔斯本人所写。尚未完成的《自传实验》不在本专题中。

---
## 科幻史料与书信（网页阅读）

### 《从纳尼亚到太空漫游：阿瑟·克拉克与 C. S. 刘易斯的思想之争》

*From Narnia to a Space Odyssey: The War of Ideas Between Arthur C. Clarke and C. S. Lewis* · Ryder W. Miller 编 · ibooks，2003

- [编者导言与克拉克亲笔前言（中文译稿）](/posts/clarke-lewis-prefaces/)
- [克拉克与刘易斯往来书信（1943—1954；附 2003 年短札）](/posts/clarke-lewis-correspondence/)

**我的评论：**

> From Narnia to a Space Odyssey: The War of Ideas Between Arthur C. Clarke and C. S. Lewis这书属于彻头彻尾的标题党，起了一个有着仿佛战至大道磨灭气势的标题，实际上只有一小半篇幅属于通信内容——总体甚至比较客气但是符合各自人设的通信内容。不过通过它们能了解到包括但不仅限于CS刘易斯是被托尔金拉入教的等热（？）知识，可以当成八卦看( ﹁ ﹁ ) ~→

---

<small>说明：本页整理个人译作；原作、信件、译文及封面等材料的公开传播均应以相应权利许可为前提。页面上的版权说明不等同于取得许可。</small>
