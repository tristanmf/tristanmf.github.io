#!/usr/bin/env python3
"""Fabrique les images d'aperçu (1200 × 630) listées dans apercus.json.

    python3 scripts/apercus/rendre.py                 # toutes
    python3 scripts/apercus/rendre.py ia/…/apercu.jpg # une seule

Chrome sans interface photographie gabarit.html, Pillow convertit en JPEG.
À lancer depuis le Mac (Chrome + Pillow) ; les images sont commitées.
"""
import json, subprocess, sys, tempfile, time, urllib.parse
from pathlib import Path
from PIL import Image

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def rendre(entree):
    frag = urllib.parse.quote(json.dumps(entree, ensure_ascii=False))
    url = (ICI / "gabarit.html").as_uri() + "#" + frag
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / "a.png"
        cmd = [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
               "--force-device-scale-factor=1", f"--user-data-dir={tmp}/profil", "--window-size=1200,630",
               "--virtual-time-budget=4000", f"--screenshot={png}", url]
        p = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # Chrome sans interface ne rend pas toujours la main : on attend le fichier.
        for _ in range(120):
            if png.exists() and png.stat().st_size > 0 and p.poll() is not None: break
            if png.exists() and png.stat().st_size > 0: time.sleep(1); break
            time.sleep(0.25)
        p.kill()
        if not png.exists(): raise SystemExit(f"échec du rendu : {entree['sortie']}")
        sortie = RACINE / entree["sortie"]
        sortie.parent.mkdir(parents=True, exist_ok=True)
        Image.open(png).convert("RGB").crop((0, 0, 1200, 630)).save(sortie, "JPEG", quality=86, optimize=True, progressive=True)
        print(f"✓ {entree['sortie']} ({sortie.stat().st_size // 1024} Ko)")

liste = json.loads((ICI / "apercus.json").read_text())["apercus"]
voulu = set(sys.argv[1:])
for e in liste:
    if not voulu or e["sortie"] in voulu:
        rendre(e)
