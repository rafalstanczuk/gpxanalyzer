#!/usr/bin/env python3
"""
i18n build for gpxanalyzer.app (static GitHub Pages site).

  python3 i18n/build.py extract   # write i18n/strings.en.json (all translatable units of index.html)
  python3 i18n/build.py build     # write /<lang>/index.html for every language in i18n/languages.json,
                                  # refresh hreflang + language switcher in index.html, refresh sitemap.xml
  python3 i18n/build.py check     # exit 1 if any language is missing translations (drift detection)

index.html (English) is the single source of truth. Translations live in i18n/<lang>.json as
{"strings": {"<english unit>": "<translated unit>"}}. A unit is the inner HTML of a text block
(p, li, h1-h6, summary, ...), a bare text node, or an attribute value (alt/title/aria-label/meta content).
Inline tags inside a unit must be kept verbatim in the translation.
"""
import json, re, sys, html, pathlib
from bs4 import BeautifulSoup, NavigableString, Comment, Doctype, CData, ProcessingInstruction, Declaration

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'index.html'
SITE = 'https://gpxanalyzer.app'
LANGS = json.loads((ROOT / 'i18n' / 'languages.json').read_text(encoding='utf-8'))
BLOCKS = {'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'summary', 'figcaption', 'dt', 'dd', 'td', 'th', 'blockquote', 'label', 'button', 'title'}
CONTAINERS = BLOCKS | {'div', 'ul', 'ol', 'section', 'table', 'details', 'nav', 'header', 'footer', 'main', 'article', 'aside', 'form', 'figure',
                       'img', 'svg', 'picture', 'iframe', 'video', 'select'}  # media inside a block => translate its text nodes one by one instead
ATTRS = ('alt', 'title', 'aria-label', 'placeholder')
META_NAMES = {'description', 'twitter:title', 'twitter:description', 'twitter:image:alt'}
META_PROPS = {'og:title', 'og:description', 'og:image:alt'}
SKIP_PARENTS = {'script', 'style', 'noscript'}
WS = re.compile(r'\s+')

def norm(s):
    return WS.sub(' ', s).strip()

def translatable(s):
    s = norm(s)
    return bool(s) and re.search(r'[A-Za-z]', s) is not None and not re.fullmatch(r'(https?://\S+|[\w.+-]+@[\w.-]+)', s)

def in_switcher(node):
    """The generated language switcher is language-neutral (native names, codes); never translate it."""
    el = node if getattr(node, 'name', None) else node.parent
    while el is not None:
        if el.name == 'details' and 'lang-menu' in (el.get('class') or []):
            return True
        el = el.parent
    return False

def is_unit(el):
    if el.name not in BLOCKS:
        return False
    return not any(d.name in CONTAINERS for d in el.find_all(True))

def inner_html(el):
    return norm(el.decode_contents())

def iter_units(soup):
    """Yield (kind, node, key) for every translatable thing, in document order."""
    seen_text_nodes = set()
    for el in soup.find_all(True):
        if el.name in SKIP_PARENTS or in_switcher(el):
            continue
        if is_unit(el):
            key = inner_html(el)
            if translatable(re.sub(r'<[^>]+>', ' ', key)):
                yield ('unit', el, key)
            for t in el.find_all(string=True):
                seen_text_nodes.add(id(t))
        for a in ATTRS:
            v = el.get(a)
            if isinstance(v, str) and translatable(v):
                yield ('attr:' + a, el, norm(v))
        if el.name == 'meta':
            if el.get('name') in META_NAMES or el.get('property') in META_PROPS:
                v = el.get('content')
                if v and translatable(v):
                    yield ('attr:content', el, norm(v))
    for t in soup.find_all(string=True):
        if id(t) in seen_text_nodes or type(t) is not NavigableString:  # skip Doctype, Comment, CData, ...
            continue
        if t.parent and (t.parent.name in SKIP_PARENTS or in_switcher(t)):
            continue
        if translatable(str(t)):
            yield ('text', t, norm(str(t)))

def load_source():
    return SRC.read_text(encoding='utf-8')

def extract():
    soup = BeautifulSoup(load_source(), 'html.parser')
    keys = []
    for kind, node, key in iter_units(soup):
        if key not in keys:
            keys.append(key)
    out = ROOT / 'i18n' / 'strings.en.json'
    out.write_text(json.dumps({k: '' for k in keys}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'{len(keys)} unique units -> {out.relative_to(ROOT)}')

def tags_of(s):
    return sorted(re.findall(r'<(/?[a-z0-9]+)', s))

def alternates_html(current):
    lines = []
    for L in LANGS:
        lines.append(f'<link rel="alternate" hreflang="{L["hreflang"]}" href="{SITE}{L["path"]}">')
    lines.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}/">')
    for L in LANGS:
        if L['code'] != current:
            lines.append(f'<meta property="og:locale:alternate" content="{L["og_locale"]}">')
    return '\n    '.join(lines)

def switcher_html(current):
    cur = next(L for L in LANGS if L['code'] == current)
    items = []
    for L in LANGS:
        is_cur = L['code'] == current
        extra = ' aria-current="page"' if is_cur else ''
        cls = ' is-current' if is_cur else ''
        items.append(f'<li><a class="lang-option{cls}" href="{L["path"]}" hreflang="{L["hreflang"]}" lang="{L["hreflang"]}"{extra}>'
                     f'<img src="/icons/flags/{L["flag"]}.svg" alt="" width="20" height="15" class="lang-flag" loading="lazy" decoding="async">'
                     f'<span>{L["native"]}</span></a></li>')
    return (f'<details class="lang-menu" id="lang-menu">\n'
            f'                    <summary class="lang-menu-summary" title="{cur["switcher_label"]}">'
            f'<img src="/icons/flags/{cur["flag"]}.svg" alt="" width="20" height="15" class="lang-flag" decoding="async">'
            f'<span class="lang-code">{cur["code"].upper()}</span>'
            f'<span class="lang-menu-label">{cur["switcher_label"]}</span></summary>\n'
            f'                    <ul class="lang-menu-list">\n                        ' + '\n                        '.join(items) +
            f'\n                    </ul>\n                </details>')

def fill_markers(text, current):
    text, n1 = re.subn(r'(<!-- i18n:alternates -->).*?(<!-- /i18n:alternates -->)',
                       lambda m: f'{m.group(1)}\n    {alternates_html(current)}\n    {m.group(2)}', text, flags=re.S)
    text, n2 = re.subn(r'(<!-- i18n:switcher -->).*?(<!-- /i18n:switcher -->)',
                       lambda m: f'{m.group(1)}\n                {switcher_html(current)}\n                {m.group(2)}', text, flags=re.S)
    assert n1 == 1 and n2 == 1, 'index.html needs <!-- i18n:alternates --> ... <!-- /i18n:alternates --> in <head> and <!-- i18n:switcher --> ... <!-- /i18n:switcher --> in the navbar'
    return text

def absolutize(soup, lang_path):
    for el in soup.find_all(True):
        for a in ('src', 'href', 'poster'):
            v = el.get(a)
            if not isinstance(v, str):
                continue
            if v in ('./', '.', 'index.html', './index.html'):
                el[a] = lang_path
            elif v and not v.startswith(('/', 'http://', 'https://', '#', 'mailto:', 'tel:', 'data:', 'javascript:')):
                el[a] = '/' + v
        ss = el.get('srcset')
        if isinstance(ss, str):
            parts = []
            for p in ss.split(','):
                p = p.strip()
                if p and not p.startswith(('/', 'http')):
                    p = '/' + p
                parts.append(p)
            el['srcset'] = ', '.join(parts)

def translate_jsonld(soup, L, strings):
    for sc in soup.find_all('script', type='application/ld+json'):
        d = json.loads(sc.string)
        def walk(o):
            if isinstance(o, dict):
                for k, v in list(o.items()):
                    if isinstance(v, str) and norm(v) in strings and strings[norm(v)]:
                        o[k] = strings[norm(v)]
                    else:
                        walk(v)
            elif isinstance(o, list):
                for x in o:
                    walk(x)
        walk(d)
        for g in d.get('@graph', []):
            if g.get('@type') == 'WebPage':
                g['@id'] = f'{SITE}{L["path"]}#webpage'
                g['url'] = f'{SITE}{L["path"]}'
                g['inLanguage'] = L['hreflang']
        indent = re.match(r'\n?(\s*)', sc.string).group(1)
        body = json.dumps(d, indent=2, ensure_ascii=False)
        sc.string = '\n' + '\n'.join((indent + l) if l else l for l in body.split('\n')) + '\n' + indent[:-2]

def build_lang(source_text, L, strict):
    strings = json.loads((ROOT / 'i18n' / f'{L["code"]}.json').read_text(encoding='utf-8'))['strings']
    text = fill_markers(source_text, L['code'])
    soup = BeautifulSoup(text, 'html.parser')
    missing, bad_tags = [], []
    for kind, node, key in list(iter_units(soup)):
        tr = strings.get(key)
        if not tr:
            missing.append(key)
            continue
        if kind == 'unit':
            if tags_of(tr) != tags_of(key):
                bad_tags.append(key)
                continue
            new = BeautifulSoup(tr, 'html.parser')
            node.clear()
            for child in list(new.contents):
                node.append(child)
        elif kind.startswith('attr:'):
            node[kind[5:]] = tr
        elif kind == 'text':
            lead = re.match(r'^\s*', str(node)).group(0)
            trail = re.search(r'\s*$', str(node)).group(0)
            node.replace_with(NavigableString(lead + tr + trail))
    soup.html['lang'] = L['hreflang']
    # canonical / og:url / locale
    can = soup.find('link', rel='canonical')
    if can:
        can['href'] = f'{SITE}{L["path"]}'
    ogu = soup.find('meta', property='og:url')
    if ogu:
        ogu['content'] = f'{SITE}{L["path"]}'
    ogl = soup.find('meta', property='og:locale')
    if ogl:
        ogl['content'] = L['og_locale']  # og:locale:alternate tags come from the i18n:alternates marker block
    translate_jsonld(soup, L, strings)
    absolutize(soup, L['path'])
    out_dir = ROOT / L['path'].strip('/')
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'index.html').write_text(str(soup), encoding='utf-8')
    dedup = lambda xs: list(dict.fromkeys(xs))
    missing, bad_tags = dedup(missing), dedup(bad_tags)
    print(f'[{L["code"]}] wrote {L["path"]}index.html | missing: {len(missing)} | tag mismatch: {len(bad_tags)}')
    for k in missing[:15]:
        print('    MISSING:', k[:110])
    for k in bad_tags[:15]:
        print('    TAGS   :', k[:110])
    return not missing and not bad_tags

def update_sitemap():
    p = ROOT / 'sitemap.xml'
    x = p.read_text(encoding='utf-8')
    if 'xmlns:xhtml' not in x:
        x = x.replace('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
                      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">', 1)
    alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{L["hreflang"]}" href="{SITE}{L["path"]}"/>' for L in LANGS)
    alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}/"/>'
    # home <url>: refresh alternates right after <loc>
    x = re.sub(r'(<loc>' + re.escape(SITE) + r'/</loc>)(\n    <xhtml:link[^\n]*)*', lambda m: m.group(1) + alts, x, count=1)
    lastmod = re.search(r'<loc>' + re.escape(SITE) + r'/</loc>.*?<lastmod>([^<]+)</lastmod>', x, re.S).group(1)
    block = '<!-- i18n:start -->'
    for L in LANGS:
        if L['path'] == '/':
            continue
        block += (f'\n  <url>\n    <loc>{SITE}{L["path"]}</loc>{alts}\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>')
    block += '\n  <!-- i18n:end -->'
    if '<!-- i18n:start -->' in x:
        x = re.sub(r'<!-- i18n:start -->.*?<!-- i18n:end -->', block, x, flags=re.S)
    else:
        x = x.replace('</urlset>', '  ' + block + '\n</urlset>')
    p.write_text(x, encoding='utf-8')
    print('sitemap.xml updated')

def build(strict=False):
    source = load_source()
    en = fill_markers(source, 'en')
    if en != source:
        SRC.write_text(en, encoding='utf-8')
        print('index.html: hreflang + language switcher refreshed')
    ok = True
    for L in LANGS:
        if L['path'] == '/':
            continue
        ok &= build_lang(en, L, strict)
    update_sitemap()
    return ok

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'build'
    if cmd == 'extract':
        extract()
    elif cmd == 'build':
        build()
    elif cmd == 'check':
        sys.exit(0 if build(strict=True) else 1)
    else:
        sys.exit(__doc__)
