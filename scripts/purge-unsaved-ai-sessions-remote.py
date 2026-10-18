import json
import os

CANDIDATES = [
    "/opt/hello-roamly/server/.data/travel-buddy-db.json",
    "/root/hello-roamly/server/.data/travel-buddy-db.json",
    "/var/www/hello-roamly/server/.data/travel-buddy-db.json",
]

found = False
for path in CANDIDATES:
    if not os.path.exists(path):
        print("MISS", path)
        continue
    found = True
    with open(path, encoding="utf-8") as handle:
        db = json.load(handle)
    sessions = db.get("userAiSessions") or []
    kept = [item for item in sessions if item.get("isSaved")]
    removed = len(sessions) - len(kept)
    db["userAiSessions"] = kept
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(db, handle, ensure_ascii=False, indent=2)
    print("OK", path, "removed", removed, "kept", len(kept))

if not found:
    print("NO_DB")
