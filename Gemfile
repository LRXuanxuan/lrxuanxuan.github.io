# frozen_string_literal: true

source "https://rubygems.org"

gem "jekyll-theme-chirpy", "~> 7.6"

gem "html-proofer", "~> 5.0", group: :test

# Temporary CI workaround: Nokogiri 1.19.7 segfaults in XPath during
# html-proofer fragment checks. Keep the checks enabled; revisit this pin
# when a corrected upstream version is available.
gem "nokogiri", "= 1.19.4"

platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.2.0", :platforms => [:windows]
