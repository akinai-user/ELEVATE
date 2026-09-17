"""No dependencies: original copy, local assets, fragments and one page title."""
import json,re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.text=[];self.links=[];self.ids=[];self.h1=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1': self.h1+=1
  if 'id' in a:self.ids.append(a['id'])
  for key in ('src','href'):
   if a.get(key):self.links.append(a[key])
 def handle_data(self,data):self.text.append(data)
p=Page((root/'index.html').read_text());text=re.sub(r'\s+','',''.join(p.text))
base=json.loads((root/'docs/top-copy-baseline.json').read_text())
for fragment in base['blocks']+base['imageCopy']:
 assert fragment in text, f'Missing original text: {fragment}'
assert p.h1==1
assert len(p.ids)==len(set(p.ids))
for link in p.links:
 u=urlsplit(link)
 if u.scheme or u.netloc:continue
 dest=root/unquote(u.path) if u.path else root/'index.html'
 assert dest.exists(),f'Missing: {link}'
 if u.fragment:
  assert u.fragment in Page(dest.read_text()).ids,f'Missing anchor: {link}'
css=(root/'css/style.css').read_text()
for path in re.findall(r'url\(["\']?([^\)"\']+)',css):
 if not urlsplit(path).scheme: assert (root/'css'/path).exists(),path
print(f'TOP: {len(base["blocks"])} original text fragments, image copy, links, assets and IDs passed.')
