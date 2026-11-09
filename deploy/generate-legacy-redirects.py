"""Regenerate the exact-path Caddy redirects from the reviewed URL map."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
mapping = json.loads((root / 'legacy-urls.json').read_text(encoding='utf-8'))
start, end = '  # BEGIN legacy URLs', '  # END legacy URLs'
lines = [start, '  map {http.request.uri.path} {legacy_destination} {', '    default ""']
for source, destination in mapping.items():
    assert source.startswith('/') and destination.startswith('/')
    assert source not in mapping.values() and not any(c in source + destination for c in ' "{}?\n')
    lines.extend([f'    {source} {destination}', f'    {source}/ {destination}'])
lines += ['  }', '  @legacyWithQuery {', '    method GET HEAD',
          '    expression `{legacy_destination} != "" && {http.request.uri.query} != ""`', '  }',
          '  @legacyKnown {', '    method GET HEAD', '    expression `{legacy_destination} != ""`', '  }',
          '  redir @legacyWithQuery {legacy_destination}?{http.request.uri.query} 301',
          '  redir @legacyKnown {legacy_destination} 301', end]
p = root / 'Caddyfile'
text = p.read_text()
if start in text:
    begin, remaining = text.split(start, 1)
    text = begin + '\n'.join(lines) + remaining.split(end, 1)[1]
else:
    text = text.replace('  # Keep both advertising domains', '\n'.join(lines) + '\n  # Keep both advertising domains', 1)
p.write_text(text, encoding='utf-8', newline='\n')
print(f'{len(mapping)} legacy paths, including trailing slash variants')
