#!/usr/bin/env python3
"""Render the 1200x630 Open Graph image for every language: icons/og-image.png (en) and icons/og-image-<lang>.png.
Fonts: Inter TTFs in local/fonts/ (downloaded from Google Fonts on first run)."""
import json, pathlib, urllib.request, re
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / 'local' / 'fonts'
TEXT = {
    'en': ('Free GPX Viewer & Track Analyzer for Android', 'Elevation profiles · Speed charts · GPS smoothing', 'Route drawing · GPX / TCX / KML / FIT / GeoJSON'),
    'pl': ('Darmowa przeglądarka i analizator plików GPX na Androida', 'Profil wysokości · Wykresy prędkości · Wygładzanie GPS', 'Rysowanie tras · GPX / TCX / KML / FIT / GeoJSON'),
    'de': ('Kostenloser GPX Viewer & Track-Analyzer für Android', 'Höhenprofil · Tempo-Diagramme · GPS-Glättung', 'Routen zeichnen · GPX / TCX / KML / FIT / GeoJSON'),
    'fr': ('Lecteur et analyseur de traces GPX gratuit pour Android', 'Profil altimétrique · Vitesse · Lissage GPS', "Tracé d'itinéraires · GPX / TCX / KML / FIT / GeoJSON"),
    'es': ('Visor y analizador de tracks GPX gratis para Android', 'Perfil de elevación · Velocidad · Suavizado GPS', 'Dibujo de rutas · GPX / TCX / KML / FIT / GeoJSON'),
    'it': ('Visualizzatore e analizzatore di tracce GPX gratuito per Android', 'Profilo altimetrico · Velocità · Filtro GPS', 'Disegno percorsi · GPX / TCX / KML / FIT / GeoJSON'),
}
BG, BG2, ON, PRIMARY, MUTED, BLUE, PILL = (15, 21, 18), (26, 33, 29), (223, 228, 222), (130, 218, 160), (191, 201, 191), (96, 165, 250), (37, 43, 39)

def ensure_fonts():
    FONTS.mkdir(parents=True, exist_ok=True)
    missing = [w for w in (500, 700, 800) if not (FONTS / f'Inter-{w}.ttf').exists()]
    if not missing:
        return
    css = urllib.request.urlopen(urllib.request.Request('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800', headers={'User-Agent': 'curl'})).read().decode()
    for w in missing:
        url = re.search(r'font-weight: %d;\s*src: url\(([^)]+)\)' % w, css).group(1)
        (FONTS / f'Inter-{w}.ttf').write_bytes(urllib.request.urlopen(url).read())

def font(w, size):
    return ImageFont.truetype(str(FONTS / f'Inter-{w}.ttf'), size)

def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if draw.textlength(t, font=fnt) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = wd
    lines.append(cur)
    return lines

def render(lang, out):
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), BG)
    px = img.load()
    for x in range(W):
        c = tuple(int(BG[i] + (BG2[i] - BG[i]) * x / W) for i in range(3))
        for y in range(H):
            px[x, y] = c
    d = ImageDraw.Draw(img, 'RGBA')
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(255, 255, 255, 8))
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(255, 255, 255, 8))
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((20, 100, 460, 540), fill=PRIMARY + (60,))
    img = Image.alpha_composite(img.convert('RGBA'), glow.filter(ImageFilter.GaussianBlur(80)))
    icon = Image.open(ROOT / 'icons' / 'ic_launcher-playstore.png').convert('RGBA').resize((300, 300), Image.LANCZOS)
    img.alpha_composite(icon, (90, 165))
    d = ImageDraw.Draw(img)
    tx, maxw = 460, W - 460 - 50
    y = 150
    f = font(800, 92); d.text((tx, y), 'GpxAnalyzer', font=f, fill=ON); y += 108
    sub, l1, l2 = TEXT[lang]
    size = 44
    while True:
        f = font(700, size); lines = wrap(d, sub, f, maxw)
        if len(lines) <= 2 or size <= 30:
            break
        size -= 2
    for ln in lines:
        d.text((tx, y), ln, font=f, fill=PRIMARY); y += int(size * 1.22)
    y += 18
    f = font(500, 27)
    for ln in (l1, l2):
        s = 27
        while d.textlength(ln, font=font(500, s)) > maxw and s > 20:
            s -= 1
        d.text((tx, y), ln, font=font(500, s), fill=MUTED); y += 40
    f = font(700, 30); label = 'gpxanalyzer.app'; tw = d.textlength(label, font=f)
    x0, y0 = W - 60 - tw - 44, H - 60 - 58
    d.rounded_rectangle((x0, y0, x0 + tw + 44, y0 + 58), radius=16, fill=PILL)
    d.text((x0 + 22, y0 + 12), label, font=f, fill=BLUE)
    img.convert('RGB').save(out, optimize=True)
    return out.stat().st_size

if __name__ == '__main__':
    ensure_fonts()
    for lang in TEXT:
        out = ROOT / 'icons' / ('og-image.png' if lang == 'en' else f'og-image-{lang}.png')
        print(f'{out.relative_to(ROOT)}: {render(lang, out)} bytes')
