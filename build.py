"""Builds the playable files from src/game.html.

  python3 build.py

Writes index.html (the home-screen app served by GitHub Pages) and
alinka-offline.html (a single file that runs without internet).
three.js r128 (MIT License) is built into both so nothing loads from the internet.
"""
import re, pathlib

root = pathlib.Path(__file__).parent
game = (root / 'src/game.html').read_text()
three = (root / 'src/three.min.js').read_text()

cdn = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
assert game.count(cdn) == 1
game = game.replace(cdn, '<script>/* three.js r128, MIT License, https://threejs.org */\n' + three + '\n</script>')

head = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">\n'
app_meta = '''<meta name="theme-color" content="#cfe9ff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Alinka">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" href="icon-192.png">
'''
register = '''<script>
// Save the game on the device so it also starts without internet.
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
'''
split = game.index('<div id="stage">')
def page(extra_head, extra_body):
    return head + viewport + extra_head + game[:split] + '</head>\n<body>\n' + game[split:] + '\n' + extra_body + '</body>\n</html>\n'

(root / 'index.html').write_text(page(app_meta, register))
(root / 'alinka-offline.html').write_text(page('', ''))
print('built index.html and alinka-offline.html')
