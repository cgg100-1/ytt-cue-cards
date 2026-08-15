#!/usr/bin/env python3
import json
import re
from pathlib import Path

ALLOWED_TYPES = {"Pose", "Link", "Context"}
ALLOWED_STATUSES = {"clear", "check", "blank"}
root = Path(__file__).resolve().parents[1]
data_dir = root / "data"
files = [data_dir / f"seq{i:02d}.js" for i in range(1, 12)]
groups_path = data_dir / "groups.js"

sequences = []
canonical_ids = set()
node_count = 0
group_ref_count = 0

for path in files:
    assert path.is_file(), f"missing data file: {path.name}"
    text = path.read_text(encoding="utf-8").strip()
    match = re.fullmatch(r"window\.YTT_DATA\.push\((.*)\);", text, re.DOTALL)
    assert match, f"unexpected wrapper in {path.name}"
    sequence = json.loads(match.group(1))
    assert isinstance(sequence.get("title"), str) and sequence["title"], f"title missing in {path.name}"
    assert isinstance(sequence.get("nodes"), list), f"nodes missing in {path.name}"
    assert sequence["nodes"], f"no nodes in {path.name}"
    sequences.append((path, sequence))

    for node in sequence["nodes"]:
        if node.get("groupRef"):
            group_ref_count += 1
            continue
        node_count += 1
        canonical_id = node.get("canonicalId")
        if canonical_id:
            assert isinstance(canonical_id, str), f"invalid canonicalId in {path.name}"
            assert canonical_id not in canonical_ids, f"duplicate canonicalId: {canonical_id}"
            canonical_ids.add(canonical_id)

assert groups_path.is_file(), "missing data/groups.js"
groups_text = groups_path.read_text(encoding="utf-8")
group_ids = set(re.findall(r'\bid\s*:\s*"([^"]+)"', groups_text))
group_node_refs = re.findall(r'\bref\s*:\s*"([^"]+)"', groups_text)
assert group_ids, "no reusable groups found"
for ref in group_node_refs:
    assert ref in canonical_ids, f"unknown canonical ref {ref} in groups.js"

for path, sequence in sequences:
    for node in sequence["nodes"]:
        group_ref = node.get("groupRef")
        if group_ref:
            assert isinstance(group_ref, str), f"invalid groupRef in {path.name}"
            assert group_ref in group_ids, f"unknown groupRef {group_ref} in {path.name}"
            if "transcripts" in node:
                assert isinstance(node["transcripts"], dict), f"invalid transcripts map in {path.name}"
                assert all(isinstance(value, str) for value in node["transcripts"].values()), f"invalid group transcript in {path.name}"
            continue

        ref = node.get("ref")
        if ref:
            assert isinstance(ref, str), f"invalid ref in {path.name}"
            assert ref in canonical_ids, f"unknown canonical ref {ref} in {path.name}"
            assert isinstance(node.get("transcript", ""), str), f"transcript invalid in {path.name}"
            if "status" in node:
                assert node["status"] in ALLOWED_STATUSES, f"invalid status in {path.name}"
            continue

        assert node.get("type") in ALLOWED_TYPES, f"invalid type in {path.name}"
        assert node.get("status") in ALLOWED_STATUSES, f"invalid status in {path.name}"
        assert isinstance(node.get("transcript"), str), f"transcript missing in {path.name}"
        if "cue" in node:
            assert isinstance(node["cue"], str), f"cue invalid in {path.name}"
        if "cueTemplate" in node:
            assert isinstance(node["cueTemplate"], str), f"cueTemplate invalid in {path.name}"

assert node_count > 0, "no nodes found"
print(f"OK: {len(files)} sequences, {node_count} direct nodes, {group_ref_count} group refs, {len(canonical_ids)} canonical components, {len(group_ids)} reusable groups")
