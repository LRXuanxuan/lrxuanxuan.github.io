---
title: 个人译作
icon: fas fa-book-open
order: 2
---

这里收录我整理的文学译本与英文原版，其中《造星主》《最后与最初的人》《伦敦的最后人》《黑暗与光明》《天狼星》《怪约翰》《星际人？》《斯特普尔顿短篇小说集》及《奇迹维度》可直接分章或分篇阅读，切换中文与英文；阿西莫夫与克拉克作品提供纯英文网页阅读。其他部分书目提供 EPUB，另收录威尔斯专题、序言及书信译稿。其他书目按作者与内容归类，斯特普尔顿作品则按首次出版或发表年份排列。

**阅读摘录**：进入任一网页版作品的正文，选中喜欢的中英文句子，即可划波浪线或写笔记。在该作品的目录页可集中查看全书摘录，并跳回原文。记录只保存在当前浏览器；建议使用摘录面板中的 JSON 导出功能定期备份。

> **关于翻译与署名**：本栏目既有由大型语言模型（LLM）生成的中文译稿，也有依照已有出版译本整理的内容，具体来源请参见各作品页面。其中《最后与最初的人》采用已有出版中文译本，不应视作 LLM 翻译。我主要负责收集与整理，不以原作或译本译者自居。LLM 译稿可能存在误译、漏译或表达不当，请结合原文阅读；公开传播仍须遵守相关版权与授权要求。

{% assign epub_paths = site.static_files | map: "path" %}

## 奥拉夫·斯特普尔顿（Olaf Stapledon）

以下按英文原作首版／首次发表年份由早到晚排列。短篇集收录作品发表年份横跨 1916—1979 年，因而按最晚年份置于末尾，并非指整部选集于 1979 年初版。

{% assign stapleton_books = site.data.translations | where: "author", "Olaf Stapledon" | sort: "sort_year" %}
{% for book in stapleton_books %}
{% if book.title == "斯特普尔顿短篇小说集" %}
### [《{{ book.title }}》]({{ '/translations/stapledon/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[选择篇目 · 中英切换]({{ '/translations/stapledon/' | relative_url }})
{% elsif book.title == "造星主" %}
### [《{{ book.title }}》]({{ '/translations/star-maker/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[分章阅读 · 中文 / English]({{ '/translations/star-maker/' | relative_url }})
{% elsif book.title == "最后与最初的人" %}
### [《{{ book.title }}》]({{ '/translations/last-and-first-men/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[分章阅读 · 中文 / English]({{ '/translations/last-and-first-men/' | relative_url }})
{% elsif book.title == "伦敦的最后人" %}
### [《{{ book.title }}》]({{ '/translations/last-men-in-london/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[分节阅读 · 中文 / English]({{ '/translations/last-men-in-london/' | relative_url }})
{% elsif book.title == "黑暗与光明" %}
### [《{{ book.title }}》]({{ '/translations/darkness-and-the-light/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[分节阅读 · 中文 / English]({{ '/translations/darkness-and-the-light/' | relative_url }})
{% elsif book.title == "天狼星" %}
### [《{{ book.title }}》]({{ '/translations/sirius/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[分章阅读 · 中文 / English]({{ '/translations/sirius/' | relative_url }})
{% elsif book.title == "怪约翰" %}
### [《{{ book.title }}》]({{ '/translations/odd-john/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[分章阅读 · 中文 / English]({{ '/translations/odd-john/' | relative_url }})
{% elsif book.title == "星际人？" %}
### [《{{ book.title }}》]({{ '/translations/interplanetary-man/' | relative_url }})（{{ book.year_label }}）

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

[分节阅读 · 中文 / English]({{ '/translations/interplanetary-man/' | relative_url }})
{% else %}
### 《{{ book.title }}》

*{{ book.original }}* · {{ book.kind }}{% if book.note %} · {{ book.note }}{% endif %}

{% assign epub_path = "/assets/epub/" | append: book.filename %}
{% if epub_paths contains epub_path %}
[下载 EPUB]({{ book.download_url | relative_url }})
{% else %}
<small class="text-muted">EPUB 文件尚未上传</small>
{% endif %}
{% endif %}
{% endfor %}

## 罗伯特·谢克里（Robert Sheckley）

{% assign sheckley_books = site.data.translations | where: "author", "Robert Sheckley" %}
{% for book in sheckley_books %}
### [《{{ book.title }}》]({{ '/translations/dimension-of-miracles/' | relative_url }}) · 1968

*{{ book.original }}* · {{ book.kind }}

[分章阅读 · 中文 / English]({{ '/translations/dimension-of-miracles/' | relative_url }})

{% endfor %}

---

## 哈兰·埃里森（Harlan Ellison）

### [《一个男孩和他的狗》A Boy and His Dog]({{ '/translations/a-boy-and-his-dog/' | relative_url }}) · 1969

中篇小说（Novella） · English · **本机 EPUB 原文阅读器**

[打开阅读页 · 十节跳转、划线、笔记与 GPT 辅助精读]({{ '/translations/a-boy-and-his-dog/' | relative_url }})

本书尚受版权保护：本站仅提供浏览器本地导入入口，不托管全文，使用个人合法获取的 EPUB 阅读。

---

## 艾萨克·阿西莫夫（Isaac Asimov）

英文原版，按单行本首版年份排列。点击作品名进入全书目录，支持划线与笔记。

{% assign asimov_books = site.data.asimov | sort: "year" %}
{% for book in asimov_books %}
### [{{ book.title }}]({{ '/translations/' | append: book.slug | append: '/' | relative_url }}) · {{ book.year }}

{{ book.kind }} · English

[分章 / 分篇阅读 · 英文原版]({{ '/translations/' | append: book.slug | append: '/' | relative_url }})

{% endfor %}

---

## 阿瑟·克拉克（Arthur C. Clarke）

英文原版，按出版年份排列；两卷选集按分卷出版年标注，标题中的年份表示作品年代范围。

{% assign clarke_books = site.data.clarke | sort: "year" %}
{% for book in clarke_books %}
### [{{ book.title }}]({{ '/translations/' | append: book.slug | append: '/' | relative_url }}) · {{ book.year }}

{{ book.kind }} · English

[分章 / 分篇阅读 · 英文原版]({{ '/translations/' | append: book.slug | append: '/' | relative_url }})

{% endfor %}

---

## H. G. 威尔斯（H. G. Wells）

本专题汇集威尔斯的小说观、未来观、政治论述及影评，并收录其他作家为其作品撰写的导读、后记和相关书信。

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

以上为 LLM 译稿，其中署名亨利·詹姆斯、克拉克和阿西莫夫的文章均非威尔斯本人所写。

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
