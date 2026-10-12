# frozen_string_literal: true

require 'time'
require 'date'

# Build a single, lightweight recent-updates feed for the Chirpy right panel.
# Reads existing Jekyll pages and data; no client-side fetch or GitHub API calls.
module RuixuanBlog
  class UnifiedRecentUpdates < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      entries = []

      site.posts.docs.each do |post|
        add(entries, post.data['last_modified_at'] || post.data['date'] || post.date,
            post.data['title'], post.url, '博文')
      end

      Array(site.data['tidbits']).each do |entry|
        next unless entry.is_a?(Hash) && entry['slug']

        add(entries, entry['added_at'], entry['title'],
            "/tidbits/##{entry['slug']}", '豆知识')
      end

      Array(site.data['home_updates']).each do |entry|
        next unless entry.is_a?(Hash)

        add(entries, entry['date'], entry['title'], entry['url'], '栏目')
      end

      site.pages.each do |page|
        path = page.path.to_s.tr('\\', '/')
        case path
        when %r{\Apapers/reports/(\d{4}-\d{2}-\d{2})\.md\z}
          date = Regexp.last_match(1)
          add(entries, date, "#{date} 前沿论文推荐", page.url, '论文日报')
        when %r{\Apapers/translations/(\d{4}-\d{2}-\d{2})-[^/]+\.md\z}
          date = Regexp.last_match(1)
          add(entries, date, page.data['title'], page.url, '论文译文')
        end
      end

      entries.sort_by! { |entry| [entry['timestamp'], entry['title']] }
      entries.reverse!
      # Only the compact metadata is used by Liquid; never serialize article bodies.
      site.data['recent_updates'] = entries.map do |entry|
        entry.reject { |key, _| key == 'timestamp' }
      end
    end

    private

    def add(entries, value, title, url, kind)
      return if title.to_s.strip.empty? || url.to_s.strip.empty?

      timestamp = normalize_time(value)
      return unless timestamp

      entries << {
        'timestamp' => timestamp.to_f,
        'date' => timestamp.iso8601,
        'title' => title.to_s,
        'url' => url.to_s,
        'kind' => kind
      }
    end

    def normalize_time(value)
      case value
      when Time
        value
      when DateTime
        value.to_time
      when Date
        Time.parse("#{value.iso8601}T00:00:00+08:00")
      else
        raw = value.to_s.strip
        return nil if raw.empty?

        raw += 'T00:00:00+08:00' if raw.match?(/\A\d{4}-\d{2}-\d{2}\z/)
        Time.parse(raw)
      end
    rescue ArgumentError, TypeError
      nil
    end
  end
end
