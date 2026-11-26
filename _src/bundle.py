#!/usr/bin/env python3
"""Builds gentrobyte-standalone.html (everything inlined) from index.html.
Run build.py first. Usage: python3 bundle.py ../index.html ../gentrobyte-standalone.html"""
import base64, os, re, sys
SRC, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.abspath(SRC))
rd = lambda p: open(os.path.join(ROOT, p), encoding='utf-8').read()
b64 = lambda p: base64.b64encode(open(os.path.join(ROOT, p), 'rb').read()).decode()
html = open(SRC, encoding='utf-8').read()

css = rd('styles.css')
css = re.sub(r'url\((assets/fonts/[^)]+\.woff2)\)', lambda m: f'url(data:font/woff2;base64,{b64(m.group(1))})', css)
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>' + css + '</style>')

scripts = re.findall(r'<script src="([^"]+)" defer></script>\n?', html)
html = re.sub(r'<script src="[^"]+" defer></script>\n?', '', html)
inline = ''.join('<script>' + rd(s).replace('</script', '<\\/script') + '</script>\n' for s in scripts)
html = html.replace('</body>', inline + '</body>')
html = re.sub(r'src="assets/logo\.webp"', lambda m: 'src="data:image/webp;base64,' + b64('assets/logo.webp') + '"', html)
open(OUT, 'w', encoding='utf-8').write(html)
print(OUT, len(html), 'scripts:', scripts)
