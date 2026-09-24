"""Build static HTML from shared navigation, service data and page content. No dependencies."""
import json, re, posixpath
from pathlib import Path
from string import Template
from html import escape
from urllib.parse import urlsplit, urlunsplit
ROOT=Path(__file__).resolve().parents[1]
GROUPS=json.loads((ROOT/'content/services.json').read_text())
PAGES=json.loads((ROOT/'content/pages.json').read_text())
REDIRECTS=json.loads((ROOT/'content/redirects.json').read_text())
def link(url,label,cls='',current=None):
    selected=' aria-current="page"' if url==current else ''
    class_attr=f' class="{cls}"' if cls else ''
    return f'<a href="{url}"{class_attr}{selected}>{label}</a>'
def group_links(group,current=None):
    root='/service/'+group['slug']+'/'
    return link(root,group['title'],'mega-title',current)+''.join(link(root+s['slug']+'/',s['title'],'',current) for s in group['services'])
def header(current):
    active=' class="is-current"' if current.startswith('/service/') else ''
    return f'''<header class="site-header">
      <div class="header-utility wrap"><span>人材とITで、企業の成長を支える。</span><div>{link('/introduction/','お仕事をお探しの方',current=current)}{link('/registered/','登録スタッフの方',current=current)}</div></div>
      <div class="header-main wrap">{link('/','<img src="/images/common/logo.png" alt="ELEVATE" width="174" height="48">','site-brand')}
      <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav"><span>MENU</span><i aria-hidden="true"></i></button>
      <nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
        <div class="service-menu"><a class="service-fallback" href="/service/">サービス一覧</a><button type="button" data-service-toggle aria-expanded="false" aria-controls="service-menu"{active}>サービス <span aria-hidden="true">＋</span></button>
        <div class="mega-menu" id="service-menu" hidden><div class="mega-intro"><p class="eyebrow">OUR SERVICES</p><p>人材とIT。<br>課題に合う支援を。</p>{link('/service/','サービス全体を見る →','',current)}</div>{''.join('<div class="mega-group">'+group_links(g,current)+'</div>' for g in GROUPS)}</div></div>
        {link('/cases/','支援事例','nav-link',current)}{link('/company/','会社情報','nav-link',current)}{link('/news/','お知らせ','nav-link',current)}
        {link('/contact/','法人のご相談 <span aria-hidden="true">↗</span>','button button-small',current)}
        <div class="nav-audience"><p>お仕事をお探しの方・登録済みの方</p>{link('/introduction/','お仕事をお探しの方 →')}{link('/web-registered/','かんたんWeb登録 →')}{link('/registered/','登録スタッフの方 →')}</div>
      </nav></div></header>'''
def footer():
    return f'''<footer class="site-footer"><div class="wrap"><div class="footer-top"><div>{link('/','<img src="/images/common/logo.png" alt="ELEVATE" width="174" height="48">','site-brand')}<p>人の力と技術力。<br>働く未来を創造する。</p><small>〒595-0072<br>大阪府泉大津市松之浜町1丁目1-10-3F</small></div>
    {''.join('<div class="footer-group">'+group_links(g)+'</div>' for g in GROUPS)}
    <div class="footer-group">{link('/company/','会社情報','mega-title')}{link('/cases/','支援事例')}{link('/news/','お知らせ')}{link('/contact/','法人のお問い合わせ')}{link('/introduction/','お仕事をお探しの方')}{link('/registered/','登録スタッフの方')}</div></div>
    <div class="footer-bottom">{link('/privacy/','プライバシーポリシー')}<small>© <span data-year>2026</span> ELEVATE Co., Ltd.</small></div></div></footer>'''
def relative_links(html,path):
    def convert(value):
        u=urlsplit(value)
        if u.scheme or u.netloc or not u.path.startswith('/'):return value
        target=u.path.lstrip('/')
        if not target or target.endswith('/'):target+='index.html'
        return urlunsplit(('','',posixpath.relpath(target,posixpath.dirname(path) or '.'),u.query,u.fragment))
    html=re.sub(r'\b(href|src)=("|\')(.*?)\2',lambda m:m[1]+'='+m[2]+convert(m[3])+m[2],html)
    return re.sub(r'url\((/[^)]+)\)',lambda m:'url('+convert(m[1])+')',html)
def service_panels():
    result=[]
    for i,g in enumerate(GROUPS):
        rows=''
        for service in g['services']:
            label='<span><small>'+service['need']+'</small><strong>'+service['title']+'</strong></span><span aria-hidden="true">↗</span>'
            rows+='<li>'+link('/service/'+g['slug']+'/'+service['slug']+'/',label)+'</li>' 
        result.append(f'<article class="business-panel"><div class="business-photo"><img src="/images/top/elevate/{g["image"]}" alt="" loading="lazy"><span>0{i+1} / {g["en"]}</span></div><div class="business-body"><h3>{g["title"]}</h3><p>{g["description"]}</p><ul class="service-rows">{rows}</ul>{link("/service/"+g["slug"]+"/",g["title"]+"を比較する →","text-link")}</div></article>')
    return '<div class="business-grid">'+''.join(result)+'</div>'
for page in PAGES:
    path=page['file'];current='/' if path=='index.html' else '/'+path.removesuffix('index.html')
    content=(ROOT/'content/pages'/path).read_text().replace('<!-- SERVICE_PANELS -->',service_panels())
    crumbs=[link('/','TOP')]+[link(url,label) for label,url in page.get('parents',[])]+[f'<span aria-current="page">{escape(page["title"])}</span>']
    breadcrumb='' if path=='index.html' else '<nav class="breadcrumbs wrap" aria-label="パンくずリスト"><ol>'+''.join('<li>'+c+'</li>' for c in crumbs)+'</ol></nav>'
    main_class=f' class="{page["class"]}"' if page.get('class') else ''
    html=Template((ROOT/'templates/layout.html').read_text()).substitute(title=escape(page['title']+' | 株式会社ELEVATE'),description=escape(page['description']),header=header(current),footer=footer(),breadcrumb=breadcrumb,main_class=main_class,content=content)
    target=ROOT/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text("\n".join(line.rstrip() for line in relative_links(html,path).splitlines())+"\n")
for old,new in REDIRECTS.items():
    dest=posixpath.relpath(new,posixpath.dirname(old));target=ROOT/old
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(f'<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url={dest}"><title>ページ移転 | ELEVATE</title></head><body><p>ページを移動しました。<a href="{dest}">新しいページへ進む</a></p><script src="'+posixpath.relpath('commn/js/redirect.js',posixpath.dirname(old))+'" defer></script></body></html>')
print(f'Built {len(PAGES)} pages and {len(REDIRECTS)} redirects.')
