"""Build the site pages from src/.

  python3 build.py

- Assembles partials/head.html + src/<page>.html + partials/foot.html (pages listed in PAGES)
- Inlines the wordmark and GitHub icon vectors
- Appends a content hash to local CSS/JS URLs so browsers never serve stale files
Edit files under src/, never the generated index.html.
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'
PARTS = SRC / 'partials'

DESC = 'TGO 鲲鹏会北京分会第 46 组。十一位技术、管理与商业一线的同行者，通过月度组会交流近况，每年一次团建。'


def svg_path(name: str) -> str:
    text = (ROOT / 'assets/brand' / name).read_text()
    return re.search(r' d="([^"]+)"', text).group(1)


def bust(match: re.Match) -> str:
    attr, url = match.group(1), match.group(2)
    digest = hashlib.sha1((ROOT / url).read_bytes()).hexdigest()[:8]
    return f'{attr}="{url}?v={digest}"'


def fill(text: str, values: dict) -> str:
    for key, value in values.items():
        text = text.replace(f'%%{key}%%', value)
    leftover = re.findall(r'%%[A-Z_]+%%', text)
    if leftover:
        raise SystemExit(f'unfilled placeholders: {sorted(set(leftover))}')
    return text


def page(body: str, values: dict) -> str:
    html = (PARTS / 'head.html').read_text() + body + (PARTS / 'foot.html').read_text()
    html = fill(html, {
        'WM': svg_path('tgo46-wordmark.svg'),
        'GH': svg_path('github.svg'),
        'VAULT': (PARTS / 'vault.html').read_text().rstrip('\n'),
        'FONT_LOADING': ' media="print" onload="this.media=\'all\'"' if values['PAGE'] == 'index' else '',
        **values,
    })
    return re.sub(r'(href|src)="((?:css|js)/[^"?]+)"', bust, html)


PAGES = [
    # (source, output, title, page id, prefix for links back to homepage sections)
    ('index.html', 'index.html', 'TGO46 · 与优秀同行，共筑不凡', 'index', ''),
    ('journey.html', 'journey.html', '同行印记 · TGO46', 'journey', 'index.html'),
]


def main() -> None:
    for src, out, title, page_id, home in PAGES:
        html = page((SRC / src).read_text(), {'TITLE': title, 'DESC': DESC, 'PAGE': page_id, 'HOME': home})
        (ROOT / out).write_text(html)
        print(f'built: {out}')


if __name__ == '__main__':
    main()
