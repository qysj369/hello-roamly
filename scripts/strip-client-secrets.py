"""Remove VITE_DEEPSEEK_API_KEY values from built index JS before public deploy."""
from __future__ import annotations

import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
assets = root / "dist-new-build" / "assets"
files = sorted(assets.glob("index-*.js"), key=lambda p: p.stat().st_size, reverse=True)
if not files:
    print("no index js", file=sys.stderr)
    sys.exit(1)

target = files[0]
text = target.read_text(encoding="utf-8")
patched = re.sub(
    r'"VITE_DEEPSEEK_API_KEY"\s*:\s*"sk-[^"]*"',
    '"VITE_DEEPSEEK_API_KEY":""',
    text,
)
# also plain key remnants
patched = patched.replace("sk-a7383856a91047baab702d3bfe143010", "")
changed = patched != text
target.write_text(patched, encoding="utf-8")
print(f"{target.name}: changed={changed} still_has_prefix={'sk-a738' in patched}")
