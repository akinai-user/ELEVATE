"""Verify restored copy and local links using only the Python standard library."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.text = []
        self.fields = []
        self.links = []
        self.ids = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.in_main = True
        if 'id' in attrs: self.ids.append(attrs['id'])
        for key in ('src', 'href'):
            if attrs.get(key): self.links.append(attrs[key])
        if self.in_main and tag in ('input', 'select', 'textarea', 'button'):
            self.fields.append(dict(tag=tag, **{k: attrs.get(k) for k in ('name','type','value','placeholder')}))
    def handle_endtag(self, tag):
        if tag == 'main': self.in_main = False
    def handle_data(self, text):
        if self.in_main: self.text.append(text)

entries = json.loads((ROOT/'docs/content-baseline.json').read_text())
for entry in entries:
    path = ROOT/entry['file']
    page = Page(path.read_text())
    assert re.sub(r'\s+', '', ''.join(page.text)) == entry['text'], f'Copy changed: {path}'
    assert page.fields == entry['fields'], f'Form fields changed: {path}'
    assert len(set(page.ids)) == len(page.ids), f'Duplicate IDs: {path}'
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc: continue
        target = (path.parent/unquote(url.path)).resolve() if url.path else path
        assert target.exists(), f'Missing link: {path}: {link}'
        if url.fragment and target.suffix == '.html':
            assert url.fragment in Page(target.read_text()).ids, f'Missing anchor: {path}: {link}'
print(f'{len(entries)} pages: original text, form fields, local links and IDs verified.')
