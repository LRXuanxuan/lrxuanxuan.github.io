# frozen_string_literal: true

# The paper archive contains notes whose legacy "http本地资料：..."
# references are descriptions of local files, not web URLs.
# Keep the original Markdown downloads intact, but do not publish
# unusable links in the generated pages.
#
# Some bilingual notes also use <a id="..."></a> as section targets.
# Convert those to <span id="..."></span> so fragment navigation
# still works and HTML-Proofer does not see a link without href.
Jekyll::Hooks.register :pages, :post_render do |page|
  next unless page.url.start_with?("/papers/")

  html = page.output
  next unless html && (html.include?("http本地资料") || html.include?("<a id="))

  local_refs = 0
  anchors = 0

  html = html.gsub(/<a\b(?=[^>]*\bhref\s*=\s*["']http本地资料：)[^>]*>(.*?)<\/a>/im) do
    local_refs += 1
    %(<span class="text-muted" title="原始笔记中的本地资料引用，不是公开网址">#{Regexp.last_match(1)}</span>)
  end

  html = html.gsub(/<a\s+id\s*=\s*(["'])([^"']+)\1\s*><\/a>/i) do
    anchors += 1
    %(<span id="#{Regexp.last_match(2)}"></span>)
  end

  if local_refs.positive? || anchors.positive?
    page.output = html
    Jekyll.logger.info "Paper link cleanup:", "#{page.url} (local references: #{local_refs}, anchors: #{anchors})"
  end
end
