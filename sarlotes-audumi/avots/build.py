#!/usr/bin/env python3
"""Šarlotes audumi — būvēšana: src/ -> dist/index.html (+ balsu saraksts un manifests)."""
import json, os, re, sys, glob, html

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src'); DIST = os.path.join(ROOT, 'dist')
BASE_URL = os.environ.get('BASE_URL', '').rstrip('/')

def read(p):
    with open(p, encoding='utf-8') as f: return f.read()

# ---- teksti: id | runātājs | teksts ----
lines, order = {}, []
for n, raw in enumerate(read(os.path.join(SRC, 'lines.txt')).splitlines(), 1):
    s = raw.strip()
    if not s or s.startswith('#'): continue
    parts = [p.strip() for p in s.split('|', 2)]
    if len(parts) != 3: sys.exit(f'lines.txt:{n}: vajag 3 daļas: {raw}')
    lid, spk, text = parts
    if lid in lines: sys.exit(f'lines.txt:{n}: dubults ID {lid}')
    lines[lid] = [spk, text]; order.append(lid)

js_files = sorted(glob.glob(os.path.join(SRC, 'js', '*.js')))
parts = []
for p in js_files:
    if os.path.basename(p).startswith('99_'):
        parts.append('LINES = ' + json.dumps(lines, ensure_ascii=False) + ';')
    parts.append('/* ---- ' + os.path.basename(p) + ' ---- */\n' + read(p))
parts.insert(0, 'const SHARE_URL = ' + json.dumps(BASE_URL + '/' if BASE_URL else '') + ';')
js = '\n'.join(parts)

# ---- pārbaude: vai visi izmantotie ID ir sarakstā ----
used = set(re.findall(r"""(?:say|T|chat|sayL|line)\(\s*'([a-z][a-z0-9_]*)'""", js))
for arr in re.findall(r"(?:seq|hints\s*:|chatSeq)\s*\(?\s*\[([^\]]*)\]", js):
    used |= set(re.findall(r"'([a-z][a-z0-9_]*)'", arr))
missing = sorted(u for u in used if u not in lines and not u.endswith('_'))
if missing:
    print('TRŪKST TEKSTU:', ', '.join(missing)); sys.exit(1)

shell = read(os.path.join(SRC, 'shell.html'))
og = ''
if BASE_URL:
    og = f'''<meta property="og:type" content="website">
<meta property="og:title" content="Šarlotes audumi — viena diena veikalā">
<meta property="og:description" content="Visi ir saslimuši, un veikals šodien ir tavs! Jautra spēle telefonā vai datorā, bez lejupielādes.">
<meta property="og:url" content="{BASE_URL}/">
<meta property="og:image" content="{BASE_URL}/vaks.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{BASE_URL}/vaks.jpg">'''
out = shell.replace('<!--__OG__-->', og).replace('/*__JS__*/', js.replace('</script>', '<\\/script>'))
os.makedirs(os.path.join(DIST, 'voice'), exist_ok=True)
with open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8') as f: f.write(out)

# ---- balsis: manifests pēc esošajiem failiem ----
have = sorted(os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(DIST, 'voice', '*.mp3')))
with open(os.path.join(DIST, 'voice', 'manifest.js'), 'w', encoding='utf-8') as f:
    f.write('window.SA_VOICES = ' + json.dumps([h for h in have if h in lines]) + ';\n')

# ---- tabula balsu ierakstīšanai ----
VOICE_HINT = {'sniedze': 'Sniedze, vadītāja', 'agrita': 'Agrita, kolēģe', 'kitija': 'Kitija, kolēģe',
              'nar': 'Stāstnieks', 'barista': 'Bārists Toms (30 g.)', 'kl': 'Kliente (45-70 g.)', 'klv': 'Klients (50-70 g.)',
              'kurjers': 'Kurjers', 'apsargs': 'Apsardzes darbinieks', 'me': 'Spēlētāja (tu)', 'sys': '(netiek ierakstīts)'}
with open(os.path.join(DIST, 'Sarlotes_audumi_balsis.tsv'), 'w', encoding='utf-8') as f:
    f.write('ID\tRunātājs\tBalss\tTeksts\tPiezīme\n')
    for lid in order:
        spk, text = lines[lid]
        note = 'vārds tiek ievietots — ierakstīt bez vārda vai nerakstīt' if '{name}' in text else ''
        f.write(f'{lid}\t{spk}\t{VOICE_HINT.get(spk, spk)}\t{text}\t{note}\n')
print(f'OK: {len(lines)} teksti, {len(js_files)} JS faili, {len(out)//1024} KB, balsis: {len(have)}')
