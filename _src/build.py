#!/usr/bin/env python3
"""Builds index.html (+ service-data.js) for Gentrobyte AI Labs. Content comes from the live gentrobyte.com site only.
Service detail copy lives in services/*.json. Usage: python3 build.py ../index.html map.json"""
import html, json, os, sys

OUT, MAPF = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
MAP = json.load(open(MAPF))
IC = json.load(open(os.path.join(HERE, 'icons.json')))
e = html.escape


def ic(name, size=24, cls=''):
    return f'<svg class="ic {cls}" viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{IC["lucide"][name]}</svg>'


def brand(key, color, size=22):
    return f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" aria-hidden="true"><path fill="{color}" d="{IC["brand"][key]}"/></svg>'


# ------------------------------------------------------------------ content (from gentrobyte.com)
ABOUT_TEXT = 'Gentrobyte AI Labs - next-generation AI innovation company delivering intelligent software solutions for automation, digital transformation, and data-driven products.'

ABOUT = [  # About Us cards
    ('AI-powered Software', 'Custom AI models and automation tools', 'bot'),
    ('Mobile Apps', 'Android and iOS app development', 'smartphone'),
    ('Web Apps', 'Scalable and responsive web solutions', 'globe'),
    ('CRM & LMS', 'Enterprise-grade management systems', 'refresh-cw'),
    ('Automation', 'Workflow and business process automation', 'zap'),
    ('Cloud Solutions', 'Scalable and secure cloud infrastructure', 'cloud'),
    ('Digital Transformation', 'End-to-end digital modernization', 'rocket'),
    ('AI & Data Analytics', 'Intelligent insights from data', 'brain'),
    ('DevOps & Cloud Infrastructure', 'Seamless deployment and scalability', 'wrench'),
    ('UI/UX Design', 'Intuitive and engaging product design', 'palette'),
]

SERVICES = [  # Our Services cards
    ('Mobile App Development', 'Android & iOS Apps', 'smartphone'),
    ('Web Application Development', 'Modern Web Solutions', 'globe'),
    ('AI Automation & Chatbots', 'Intelligent Automation', 'bot'),
    ('DevOps & Cloud Infrastructure', 'Scalable Cloud Solutions', 'cloud-cog'),
    ('SAP ERP / GTS / S4HANA', 'Enterprise Resource Planning', 'factory'),
    ('CRM, LMS, HRMS & Billing', 'Business Management Systems', 'users'),
    ('Digital Marketing & SEO', 'Brand Growth & Visibility', 'megaphone'),
    ('Data Science & ML', 'Predictive Analytics', 'chart-line'),
    ('AI & Data Analytics', 'Machine Learning & Insights', 'brain-circuit'),
    ('UI/UX Design', 'User-Centric Interfaces', 'pen-tool'),
    ('Product Design', 'Innovation & Consultation', 'lightbulb'),
    ('Custom Software Solutions', 'Tailored Development', 'code-xml'),
]

SVC_RE = [
    r'\b(mobile|apps?|android|ios|iphone|ipad)\b', r'\b(web|websites?|portals?|dashboards?|e-?commerce|online store|booking|storefront)\b',
    r'\b(chat ?bots?|bots?|automat\w*|workflows?|assistants?|ai|artificial intelligence)\b', r'\b(devops|cloud|aws|azure|servers?|hosting|deploy\w*|infrastructure)\b',
    r'\b(erp|sap|s/?4 ?hana|gts|inventory|production|procurement|factory|manufactur\w*|warehouse)\b', r'\b(crm|lms|hrms|billing|invoices?|payroll|attendance|leads?|customers?|students?|training|employees?)\b',
    r'\b(marketing|seo|ads?|instagram|facebook|social|campaigns?|brand\w*|visibility)\b', r'\b(machine learning|ml|data science|predict\w*|forecast\w*|models?)\b',
    r'\b(analytics|analy[sz]e|reports?|insights?|data|kpis?|metrics)\b', r'\b(ui|ux|design\w*|wireframes?|prototypes?|figma|interface|redesign)\b',
    r'\b(idea|startup|start-?up|mvp|product|consult\w*|advice|concept)\b', r'\b(custom|software|systems?|platform|tool|tools|application)\b',
]

# ------------------------------------------------------------------ service detail pages
# One JSON file per service in _src/services/. Every entry in SERVICES must have exactly one file (matched by name),
# so adding a service card without its detail content fails the build instead of shipping a dead link.
import glob, re as _re
DETAIL = {}
for _f in sorted(glob.glob(os.path.join(HERE, 'services', '*.json'))):
    _d = json.load(open(_f))
    DETAIL[_d['name']] = _d
_names = [n for n, t, k in SERVICES]
_missing = [n for n in _names if n not in DETAIL]
_extra = [n for n in DETAIL if n not in _names]
if _missing or _extra:
    sys.exit(f'service content mismatch: missing={_missing} extra={_extra}')
_slugs = [DETAIL[n]['slug'] for n in _names]
if len(set(_slugs)) != len(_slugs) or not all(_re.fullmatch(r'[a-z0-9-]+', x) for x in _slugs):
    sys.exit('service slugs must be unique and match [a-z0-9-]+')
SLUG = {n: DETAIL[n]['slug'] for n in _names}


def service_data_js():
    rows = []
    for n, t, k in SERVICES:
        d = dict(DETAIL[n]); d['tag'] = t; d['i'] = IC['lucide'][k]
        rows.append(d)
    return 'window.GB_SERVICES=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'


DOTS = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg>'

SOCIAL = [('Tech Solutions', '50K', 245), ('AI Innovations', '75K', 312), ('Digital Trends', '100K', 489), ('Future Labs', '65K', 198)]
ADS = [  # name, brand key, colour, reach, engagement, 4 bar heights
    ('Instagram', 'instagram', 'url(#igg)', '2.5M', '8.5%', [.42, .56, .5, .86]),
    ('WhatsApp', 'whatsapp', '#25D366', '1.8M', '12.3%', [.9, .5, .4, .72]),
    ('Google Ads', 'google', '#4285F4', '3.2M', '6.7%', [.4, .48, .28, .95]),
    ('Facebook', 'facebook', '#1877F2', '2.1M', '7.9%', [.72, .96, .76, .56]),
]
STATS = [('35', 'Countries'), ('150', 'Partners'), ('500', 'Projects')]

# Official page links.
SOCIAL_URLS = [
    ('LinkedIn', 'linkedin', '#0A66C2', 'https://www.linkedin.com/company/gentrobyte-ai-labs/'),
    ('Instagram', 'instagram', 'url(#igg)', 'https://www.instagram.com/gentrobyte/'),
    ('YouTube', 'youtube', '#FF0000', 'https://www.youtube.com/channel/UCbdMOvwpKgI5KQ4FkIiphgQ'),
    ('WhatsApp', 'whatsapp', '#25D366', 'https://wa.me/919159247730'),
    ('X (Twitter)', 'x', '#FFFFFF', 'https://x.com/gentrobyte'),
    ('Facebook', 'facebook', '#1877F2', 'https://www.facebook.com/gentrobyte'),
    ('Google Search', 'google', '#4285F4', 'https://www.google.com/search?q=Gentrobyte+AI+Labs'),
]


GRAD_DEF = '<defs><linearGradient id="igg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".3" stop-color="#FA7E1E"/><stop offset=".55" stop-color="#D62976"/><stop offset=".8" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs>'


# ------------------------------------------------------------------ fragments
def about_list():
    li = ''.join(f'''<li><button type="button" class="ab-item" role="tab" aria-selected="{str(i == 0).lower()}" data-i="{i}"><span class="n">{i + 1:02d}</span><span class="t">{e(n)}</span>{ic("chevron-right", 16, "ch")}</button></li>''' for i, (n, d, k) in enumerate(ABOUT))
    return li


def about_data():
    return json.dumps({'about': [{'n': n, 'd': d, 'i': IC['lucide'][k]} for n, d, k in ABOUT],
                       'svc': [{'n': n, 't': t, 're': SVC_RE[i], 'i': IC['lucide'][k]} for i, (n, t, k) in enumerate(SERVICES)]})


def services():
    out = []
    for i, (n, t, k) in enumerate(SERVICES):
        out.append(f'''<article class="svc glass" data-n="{e(n)}">
          <div class="svc-top"><span class="svc-ic">{ic(k, 26)}</span><a class="svc-more" href="#/services/{SLUG[n]}" aria-label="View details: {e(n)}" title="View details">{DOTS}</a></div>
          <h3>{e(n)}</h3><p>{e(t)}</p>
          <button type="button" class="add" data-add="{e(n)}" aria-pressed="false">{ic("plus", 15)}<span>Add to brief</span></button>
        </article>''')
    return ''.join(out)


def social():
    return ''.join(f'''<li class="acct glass"><div class="acct-h"><span class="av" aria-hidden="true">{e(n[0])}</span><div><h4>{e(n)}</h4><p>{f} followers</p></div></div>
        <div class="tiles" aria-hidden="true">{'<i></i>' * 6}</div><p class="posts"><b>{p}</b> posts</p></li>''' for n, f, p in SOCIAL)


def ads():
    out = []
    for n, key, col, reach, eng, bars in ADS:
        b = ''.join(f'<i style="--h:{h * 100:.0f}%"></i>' for h in bars)
        out.append(f'''<li class="ad glass"><div class="ad-h"><span class="ad-ic">{brand(key, col, 24)}</span><h4>{e(n)}</h4></div>
        <dl><div><dt>Reach</dt><dd>{reach}</dd></div><div><dt>Engagement</dt><dd>{eng}</dd></div></dl>
        <div class="bars" aria-hidden="true">{b}</div></li>''')
    return ''.join(out)


def links():
    out = []
    for n, key, col, url in SOCIAL_URLS:
        out.append(f'<li><a href="{url}" target="_blank" rel="noopener noreferrer" aria-label="{e(n)} (opens in a new tab)"><span class="sico">{brand(key, col, 20)}</span><span class="ln">{e(n)}</span>{ic("arrow-up-right", 16, "go")}</a></li>')
    return ''.join(out)


def stats():
    return ''.join(f'<div><dd><span data-count="{v}">{v}</span>+</dd><dt>{e(k)}</dt></div>' for v, k in STATS)


def map_svg():
    arcs = ''.join(f'<path class="arc" pathLength="1" style="--d:{i * 0.4:.2f}s" d="{a["d"]}"/><circle class="end" cx="{a["x"]}" cy="{a["y"]}" r="1.1" style="--d:{i * 0.4:.2f}s"/>' for i, a in enumerate(MAP['arcs']))
    hx, hy = MAP['hub']
    return f'''<svg class="map" viewBox="0 0 {MAP['w']} {MAP['h']}" role="img" aria-label="Dotted world map with lines from one point to cities on every continent">
      <path class="land" d="{MAP['dots']}"/><g class="arcs">{arcs}</g>
      <circle class="hub-ring" cx="{hx}" cy="{hy}" r="2.2"/><circle class="hub" cx="{hx}" cy="{hy}" r="1.5"/></svg>'''



def marquee():
    item = ''.join(f'<span>{e(n)}</span><i></i>' for n, d, k in ABOUT)
    return f'<div class="marq-in">{item}{item}</div>'


def shop():
    prods = ''.join(f'<div class="prod"><div class="pimg p{i % 4}"></div><b>Product {i + 1}</b><button type="button" class="padd">Add</button></div>' for i in range(8))
    return f'''<div class="shop"><div class="shop-nav"><b>E-Commerce</b><span class="sn-links"><i></i><i></i><i></i></span><span class="sn-menu" aria-hidden="true">≡</span><span class="cart">Cart <em id="cartN">0</em></span></div>
      <div class="shop-hero"><b>E-Commerce</b><span id="rzView">Desktop View</span></div><div class="grid">{prods}</div></div>'''


def phone(name):
    feats = ''.join(f'<button type="button" class="feat" data-f="{i}">Feature {i}</button>' for i in range(1, 5))
    return f'''<div class="ph" data-app="{name}"><div class="notch"></div><div class="sb"><span>9:41</span><span>●●●</span></div>
        <div class="scr"><div class="v home"><span class="ai">{ic("smartphone", 26)}</span><b>Booking App</b>{feats}</div>
        <div class="v detail" aria-hidden="true"><button type="button" class="back" aria-label="Back to Booking App">{ic("chevron-right", 18)}Back</button><b>Booking App</b><span class="big">Feature <em>1</em></span><i class="sh"></i><i class="sh"></i><i class="sh"></i></div></div></div>'''


PAGE = open(os.path.join(HERE, 'page.html')).read()
for k, v in {
    '<!--ABOUT_LIST-->': about_list(), '/*ABOUT_DATA*/': about_data(), '<!--SERVICES-->': services(),
    '<!--SOCIAL-->': social(), '<!--ADS-->': ads(), '<!--LINKS-->': links(), '<!--STATS-->': stats(),
    '<!--MAP-->': map_svg(), '<!--GRAD-->': GRAD_DEF,
    '<!--MARQUEE-->': marquee(), '<!--SHOP-->': shop(), '<!--PHONE_ANDROID-->': phone('android'), '<!--PHONE_IPHONE-->': phone('iphone'), '<!--IC_PAPERCLIP-->': ic('paperclip', 20), '<!--IC_SEND-->': ic('send', 18), '<!--IC_ARROW-->': ic('arrow-up-right', 16),
    '<!--IC_MONITOR-->': ic('monitor', 16), '<!--IC_LAPTOP-->': ic('laptop', 16), '<!--IC_TABLET-->': ic('tablet', 16), '<!--IC_PHONE-->': ic('smartphone', 16),
}.items():
    PAGE = PAGE.replace(k, v)
# page.html is a head fragment + body fragment split by <!--/HEAD-->; wrap it into the final document.
HEAD, BODY = PAGE.split('<!--/HEAD-->', 1)
HEAD = _re.sub(r'<link rel="preload"[^>]*>\n', '', HEAD)
DOC = '<!doctype html>\n<html lang="en">\n<head>\n' + HEAD.rstrip('\n') + '\n</head>\n<body>\n' + BODY + '\n</body>\n</html>\n'
open(OUT, 'w').write(DOC)
open(os.path.join(os.path.dirname(os.path.abspath(OUT)), 'service-data.js'), 'w').write(service_data_js())
print(OUT, len(DOC), '+ service-data.js', len(DETAIL), 'services')
