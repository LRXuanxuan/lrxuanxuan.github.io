# Literature import audit — 2026-10-12

Imported five Asimov books, six Clarke books, and the English and existing Chinese text of *Dimension of Miracles*. Import manifests in `_data/*_import.json` record source EPUB hashes, page paths and normalized text hashes. Importers verify that HTML cleanup preserves extracted text; this verifies conversion, not the accuracy of the source edition.

## Bibliographic checks and repairs

- Asimov publication years: https://www.asimovonline.com/oldsite/asimov_catalogue.html
- Clarke novels and two-volume collection contents/years: https://www.press.uillinois.edu/books/?id=p083594 and https://sf-encyclopedia.com/entry/clarke_arthur_c
- *2001* six parts and 47 chapter titles: https://openlibrary.org/books/OL7575930M/2001
- The *2001* EPUB lists only 24 chapters in its NCX. Its spine retains the later chapters in a single file. The importer joins the two files containing chapter 21, separates chapters 24–47, and restores the missing chapter 25 title at the paragraph beginning “Frank Poole had been through the whole routine before”. This boundary was also checked against chapter-25 summaries.
- A second full-novel PDF transcription was consulted locally for comparison. It shares OCR characteristics with the EPUB and therefore is not independent proof of an authoritative edition. One clear foreword typo, `remembert thi sis`, was corrected to `remember this is`, which is also present in that transcription. No speculative bulk substitutions were made.
- Screenplay PDFs and Pearson abridged retellings found during the search were excluded.
- Clarke collection volume 1 contains the eleven stories listed in the bibliographic reference but omits the printed edition's Bibliography. The reader directory discloses this. Volume 2's EPUB copyright date conflicts with the bibliographic publication year; its original copyright text is retained and the discrepancy disclosed.
- The two supplied English *Dimension of Miracles* files have identical hashes. English and Chinese each contain 28 chapters in five parts. Chinese is the existing site edition; no new translation was generated.

## Validation

348 generated reader/directory pages: internal routes, anchors and duplicate IDs checked. Isolated Edge browser checks cover English-only reading, bilingual switching, selection/highlighting, notes, persistence, editing/deletion, whole-book aggregation, return-to-source, JSON export/import, and light/dark layouts at 1280px and 390px.

All books retain the supplied English text except the documented *2001* repair. Bibliographic and structural checks do not constitute a line-by-line comparison against publisher-certified texts. Do not describe these files as such.
