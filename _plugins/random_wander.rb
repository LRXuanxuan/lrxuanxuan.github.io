# frozen_string_literal: true

require 'json'
require 'cgi'

# A tiny, automatically rebuilt discovery index. Do not hand-maintain article URLs.
module RuixuanBlog
  class RandomWander < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      items = []
      site.posts.docs.each do |post|
        route = post.url.to_s
        categories = Array(post.data['categories'])
        next unless route.start_with?('/translations/') || categories.include?('个人译作')

        push(items, 'literature', post.data['title'], route,
             post.data['description'] || paragraph(post.content) ||
             '翻开一节文学作品，读一点想象与思想。')
      end

      Array(site.data['tidbits']).each do |entry|
        next unless entry.is_a?(Hash) && !entry['slug'].to_s.empty?

        push(items, 'tidbits', entry['title'], "/tidbits/##{entry['slug']}",
             entry['teaser'] || '一条值得随手翻阅的小知识。')
      end

      site.pages.each do |page|
        next unless page.path.to_s.tr('\\', '/').start_with?('papers/translations/')

        push(items, 'papers', page.data['title'], page.url,
             page.data['description'] || abstract(page.content) ||
             '阅读这份论文译稿，了解研究问题、方法与实验。')
      end

      items.uniq! { |item| item['url'] }
      site.pages << IndexPage.new(site, JSON.generate(items))
    end

    private

    def push(items, category, title, url, description)
      return if title.to_s.strip.empty? || url.to_s.strip.empty?

      items << {
        'category' => category,
        'title' => title.to_s.strip,
        'url' => url.to_s,
        'description' => shorten(description)
      }
    end

    def paragraph(content)
      text = content.to_s
      chinese = text.match(/<section\b[^>]*data-story-lang=["']zh["'][^>]*>(.*?)<\/section>/im)
      text = chinese[1] if chinese
      text.scan(/<p\b[^>]*>(.*?)<\/p>/im).each do |match|
        candidate = clean(match.first)
        return candidate if candidate.length >= 35 && !candidate.start_with?('译文说明')
      end
      nil
    end

    def abstract(content)
      text = content.to_s
      match = text.match(/^[#]{2,3}\s*(?:摘要|Abstract)\s*\n(.*?)(?=^[#]{1,3}\s|\z)/im)
      return nil unless match

      content = match[1].split(/\n\s*\n/).map { |piece| clean(piece) }
      content.find { |piece| piece.length >= 35 }
    end

    def clean(text)
      plain = text.to_s.gsub(/<[^>]+>/, ' ')
      plain = plain.gsub(/!\[[^\]]*\]\([^)]*\)/, '')
      plain = plain.gsub(/\[([^\]]+)\]\([^)]*\)/, '\\1')
      plain = plain.gsub(/[\x60*_#]/, '')
      CGI.unescapeHTML(plain).gsub(/\s+/, ' ').strip
    end

    def shorten(raw)
      plain = clean(raw)
      return '打开这一页，随意读读。' if plain.empty?

      first = plain[0, 96]
      sentence_end = first.match(/[。！？!?]/)
      return first[0..sentence_end.begin(0)] if sentence_end && sentence_end.begin(0) >= 24

      plain.length > 96 ? "#{first}…" : plain
    end
  end

  class IndexPage < Jekyll::PageWithoutAFile
    def initialize(site, json)
      super(site, site.source, 'assets/data', 'random-walk.json')
      data['layout'] = nil
      self.content = json
    end
  end
end
