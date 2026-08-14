const ALLOWED_NODE_TYPES = new Set(["pose", "link", "context"]);
const ALLOWED_STATUSES = new Set(["clear", "check", "blank"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateSession(session) {
  assert(session && typeof session === "object", "Session data must be an object.");
  assert(session.schemaVersion === 1, "Unsupported session schema version.");
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

      if (node.type === "pose") {
        assert(node.pose && typeof node.pose === "object", `Pose node ${node.id} needs a pose object.`);
      }
    }
  }

  return session;
}

export async function loadSession(url = "data/session.json") {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load session data (${response.status}).`);
  return validateSession(await response.json());
}
