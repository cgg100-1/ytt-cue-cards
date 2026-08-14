#!/usr/bin/env python3
import json
import re
from pathlib import Path

ALLOWED_TYPES = {"Pose", "Link", "Context"}
ALLOWED_STATUSES = {"clear", "check", "blank"}
root = Path(__file__).resolve().parents[1]
data_dir = root / "data"
files = [data_dir / f"seq{i:02d}.js" for i in range(1, 12)]

node_count = 0
for path in files:
    assert path.is_file(), f"missing data file: {path.name}"
    text = path.read_text(encoding="utf-8").strip()
    match = re.fullmatch(r"window\.YTT_DATA\.push\((.*)\);", text, re.DOTALL)
    assert match, f"unexpected wrapper in {path.name}"
    sequence = json.loads(match.group(1))
    assert isinstance(sequence.get("title"), str) and sequence["title"], f"title missing in {path.name}"
    assert isinstance(sequence.get("nodes"), list), f"nodes missing in {path.name}"
    assert sequence["nodes"], f"no nodes in {path.name}"
    for node in sequence["nodes"]:
        node_count += 1
        assert node.get("type") in ALLOWED_TYPES, f"invalid type in {path.name}"
        assert node.get("status") in ALLOWED_STATUSES, f"invalid status in {path.name}"
        assert isinstance(node.get("transcript"), str), f"transcript missing in {path.name}"

assert node_count > 0, "no nodes found"
print(f"OK: {len(files)} sequences, {node_count} nodes")
