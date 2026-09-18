"""Validate generated pages, local links, anchors, headings, form contracts and structure."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json,re
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True); self.links=[];self.ids=[];self.headings=[];self.forms=[];self.fields=[];self.stack=[];self.errors=[];self.main=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='main':self.main+=1
  if 'id' in a:self.ids.append(a['id'])
  for name in ('href','src','poster'):
   if a.get(name):self.links.append(a[name])
  if a.get('srcset'):self.links.extend(item.strip().split()[0] for item in a['srcset'].split(','))
  if a.get('style'):self.links.extend(re.findall(r'url\(([^)]+)\)',a['style']))
  if re.fullmatch('h[1-6]',tag):self.headings.append(tag)
  if tag=='form':self.forms.append({key:a.get(key) for key in ['action','method','enctype']})
  if tag in ['input','select','textarea'] and a.get('name'):self.fields.append({key:a.get(key) for key in ['name','type','value']})
  if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:
   self.stack.append(tag)
 def handle_endtag(self,tag):
  if self.stack and self.stack[-1]==tag:self.stack.pop()
  elif tag in self.stack:
   self.errors.append(f'Closing {tag} while {self.stack[-1]} is open');self.stack=self.stack[:self.stack.index(tag)]
  else:self.errors.append(f'Unexpected closing {tag}')
 def handle_startendtag(self,tag,attrs):
  size=len(self.stack);self.handle_starttag(tag,attrs)
  if len(self.stack)>size:self.handle_endtag(tag)
configs=json.loads((ROOT/'content/pages.json').read_text()); redirects=json.loads((ROOT/'content/redirects.json').read_text())
paths=[ROOT/p['file'] for p in configs]+[ROOT/p for p in redirects]; parsed={p:Page(p.read_text()) for p in paths};errors=[];external=set()
for path,page in parsed.items():
 if len(page.ids)!=len(set(page.ids)):errors.append(f'{path.relative_to(ROOT)} duplicate ids')
 if path.relative_to(ROOT).as_posix() not in redirects:
  if page.main!=1 or page.headings.count('h1')!=1:errors.append(f'{path.relative_to(ROOT)} main={page.main} h1={page.headings.count("h1")}')
  if page.errors:errors.extend(f'{path.relative_to(ROOT)}: {e}' for e in page.errors)
  if page.stack:errors.append(f'{path.relative_to(ROOT)} unclosed tags {page.stack}')
 for href in page.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:
   if u.scheme in ['http','https']:external.add(href)
   continue
  target=(path.parent/unquote(u.path)).resolve() if u.path else path
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{path.relative_to(ROOT)} missing {href}');continue
  if u.fragment and target.suffix=='.html':
   other=parsed.get(target) or Page(target.read_text())
   if unquote(u.fragment) not in other.ids:errors.append(f'{path.relative_to(ROOT)} missing anchor {href}')
for path in ROOT.glob('commn/css/*.css'):
 if path.name not in ['site.css','subpages.css']:continue
 for asset in re.findall(r'url\([\"\']?([^\)\"\']+)',path.read_text()):
  if not asset.startswith(('data:','http','var(')) and not (path.parent/asset).exists():errors.append(f'{path}: missing CSS asset {asset}')
# Original externally submitted form contracts must not change.
import subprocess
for cfg in configs:
 path=ROOT/cfg['file'];page=parsed[path]
 if not page.forms:continue
 original=Page(subprocess.check_output(['git','show','HEAD:'+cfg['file']],cwd=ROOT,text=True))
 if page.forms!=original.forms:errors.append(f'{cfg["file"]}: form endpoint or encoding changed')
 if page.fields!=original.fields:errors.append(f'{cfg["file"]}: backend field contract changed')
print('\n'.join(errors) if errors else f'PASS: {len(configs)} pages, {len(redirects)} redirects; local URLs/assets/anchors, IDs, document structure, h1 and form contracts.')
print('External links:',*sorted(external),sep='\n')
raise SystemExit(bool(errors))
