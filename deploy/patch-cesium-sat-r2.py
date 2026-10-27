"""Allow /cesium-sat/amap/r2/{z}/{x}/{y} on the live nginx config."""
from pathlib import Path

CONF = Path("/etc/nginx/conf.d/hello-roamly.conf")
OLD = "^/cesium-sat/amap/(?<tz>\\d+)"
NEW = "^/cesium-sat/amap/(?:r2/)?(?<tz>\\d+)"


def main() -> None:
    text = CONF.read_text(encoding="utf-8")
    count = text.count(OLD)
    if count == 0 and "(?:r2/)?" in text:
        print("already-r2")
        return
    if count == 0:
        raise SystemExit("PATTERN_MISSING")
    CONF.write_text(text.replace(OLD, NEW), encoding="utf-8")
    print(f"patched {count}")


if __name__ == "__main__":
    main()
