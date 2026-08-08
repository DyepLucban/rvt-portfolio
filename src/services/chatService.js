import { portfolioAPI } from "@/lib/supabaseClient";

// The only file in the frontend that knows SSE exists. Everything above it
// consumes an async iterable of text deltas, so the transport could change
// without the hook or the components noticing.

// Anything we didn't deliberately word server-side (a dropped connection, a
// 500, a malformed response) surfaces as this instead of a raw technical
// string the visitor can't act on.
export const GENERIC_ERROR =
  "Something went wrong on my end. Please try again in a moment.";

// supabase-js wraps a non-2xx response in a FunctionsHttpError whose
// `.context` is the raw Response — that's where the server's friendly message
// (the 429 copy, a validation complaint) actually lives.
async function toError(error) {
  const response = error?.context;
  if (response instanceof Response) {
    const body = await response.json().catch(() => null);
    if (body?.error) {
      const wrapped = new Error(body.error);
      wrapped.status = response.status;
      return wrapped;
    }
  }
  // No deliberate message from the server — don't leak "Failed to fetch".
  return new Error(GENERIC_ERROR);
}

export async function* streamChat({ message, history = [], signal }) {
  const { data, error } = await portfolioAPI.sendChat({ message, history }, { signal });
  if (error) throw await toError(error);

  if (!(data instanceof Response) || !data.body) {
    throw new Error(GENERIC_ERROR);
  }

  const reader = data.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Events are separated by a blank line, and a network chunk can end
      // mid-event — so only whole events leave the buffer.
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;

        const payload = line.slice(5).trim();
        if (!payload) continue;

        const parsed = JSON.parse(payload);
        // Mid-stream failures arrive as a raw "Error: ..." string — swap it
        // for the visitor-facing generic rather than surface internals.
        if (parsed.error) throw new Error(GENERIC_ERROR);
        if (parsed.done) return;
        if (parsed.delta) yield parsed.delta;
      }
    }
  } finally {
    // Covers the abort path too: without this the connection stays open
    // after the visitor closes the panel mid-answer.
    reader.cancel().catch(() => {});
  }
}
