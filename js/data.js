const ALLOWED_NODE_TYPES = new Set(["pose", "link", "context"]);
const ALLOWED_STATUSES = new Set(["clear", "check", "blank"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function slugify(value) {
  return String(value ?? "item")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

function normaliseSequence(rawSequence) {
  const sequenceId = slugify(rawSequence.title);
  const seenNodeIds = new Map();

  const nodes = rawSequence.nodes.map((rawNode) => {
    const type = String(rawNode.type ?? "").toLowerCase();
    const label = rawNode.english || rawNode.sanskrit || "Untitled";
    const baseId = `${sequenceId}-${slugify(label)}`;
    const occurrence = (seenNodeIds.get(baseId) ?? 0) + 1;
    seenNodeIds.set(baseId, occurrence);

    return {
      id: occurrence === 1 ? baseId : `${baseId}-${occurrence}`,
      type,
      label,
      cue: rawNode.cue ?? rawNode.transcript ?? "",
      status: String(rawNode.status ?? "").toLowerCase(),
      source: {
        reviewNote: rawNode.note ?? "",
        transcript: rawNode.transcript ?? "",
        transcripts: Array.isArray(rawNode.sourceTranscripts) ? rawNode.sourceTranscripts : []
      },
      ...(type === "pose" ? {
        pose: {
          sanskrit: rawNode.sanskrit || null,
          english: rawNode.english || null
        }
      } : {})
    };
  });

  return { id: sequenceId, title: rawSequence.title, nodes };
}

export function validateSession(session) {
  assert(session && typeof session === "object", "Session data must be an object.");
  assert(Array.isArray(session.sequences), "Session must contain a sequences array.");

  const sequenceIds = new Set();
  const nodeIds = new Set();

  for (const sequence of session.sequences) {
    assert(typeof sequence.id === "string" && sequence.id, "Each sequence needs an id.");
    assert(!sequenceIds.has(sequence.id), `Duplicate sequence id: ${sequence.id}`);
    sequenceIds.add(sequence.id);
    assert(typeof sequence.title === "string" && sequence.title, `Sequence ${sequence.id} needs a title.`);
    assert(Array.isArray(sequence.nodes), `Sequence ${sequence.id} needs a nodes array.`);

    for (const node of sequence.nodes) {
      assert(typeof node.id === "string" && node.id, `A node in ${sequence.id} is missing an id.`);
      assert(!nodeIds.has(node.id), `Duplicate node id: ${node.id}`);
      nodeIds.add(node.id);
      assert(ALLOWED_NODE_TYPES.has(node.type), `Invalid node type on ${node.id}: ${node.type}`);
      assert(ALLOWED_STATUSES.has(node.status), `Invalid status on ${node.id}: ${node.status}`);
      assert(typeof node.label === "string", `Node ${node.id} label must be a string.`);
      assert(typeof node.cue === "string", `Node ${node.id} cue must be a string.`);
      if (node.type === "pose") assert(node.pose && typeof node.pose === "object", `Pose node ${node.id} needs a pose object.`);
    }
  }

  return session;
}

export function loadSession() {
  const rawSequences = window.YTT_DATA;
  assert(Array.isArray(rawSequences), "Cue-card source data was not loaded.");

  return validateSession({
    schemaVersion: 1,
    sessionId: "ytt100-session-1",
    title: "YTT Cue Cards",
    sequences: rawSequences.map(normaliseSequence)
  });
}
