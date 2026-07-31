"""Restore visible thin snail from source — opaque brand ink, mild core keep."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "assets" / "snail-drag-earth.source.png"
OUT = ROOT / "src" / "assets" / "snail-drag-earth.png"
PUB = ROOT / "public" / "assets" / "snail-drag-earth.png"
INK = (44, 107, 88, 255)
SCALE = 4


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    w0, h0 = src.size
    up = src.resize((w0 * SCALE, h0 * SCALE), Image.Resampling.LANCZOS)
    rgb = np.asarray(up).astype(np.float32)
    luma = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]

    # Visible dark cores (not over-peeled)
    ink = luma < 165
    # peel only soft AA fringe once
    labeled, n = ndi.label(ink)
    protect = np.zeros_like(ink)
    for i in range(1, n + 1):
        area = int((labeled == i).sum())
        if 2 <= area <= 80:
            protect |= labeled == i
    ink = ndi.binary_erosion(ink, iterations=1) | protect

    h, w = ink.shape
    cut = max(3, int(w * 0.05))
    for x in range(cut):
        if ink[:, x].sum() < h * 0.08:
            ink[:, x] = False

    ys, xs = np.where(ink)
    if xs.size == 0:
        raise SystemExit("no ink — threshold too strict")
    pad = 16
    minx, maxx = max(0, int(xs.min()) - pad), min(w - 1, int(xs.max()) + pad)
    miny, maxy = max(0, int(ys.min()) - pad), min(h - 1, int(ys.max()) + pad)
    crop = ink[miny : maxy + 1, minx : maxx + 1]

    rgba = np.zeros((*crop.shape, 4), dtype=np.uint8)
    rgba[crop] = INK
    out = Image.fromarray(rgba, "RGBA")

    dist = ndi.distance_transform_edt(crop)
    d = dist[crop]
    print(f"ink={int(crop.sum())} stroke~{float(np.median(d)*2):.1f}px size={out.size}")

    out.save(OUT, optimize=True)
    PUB.parent.mkdir(parents=True, exist_ok=True)
    out.save(PUB, optimize=True)


if __name__ == "__main__":
    main()
