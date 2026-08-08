import { portfolioAPI } from "@/lib/supabaseClient";

// The only file in the frontend that knows SSE exists. Everything above it
// consumes an async iterable of text deltas, so the transport could change
// without the hook or the components noticing.

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
  return error instanceof Error ? error : new Error(String(error));
}

export async function* streamChat({ message, history = [], signal }) {
  const { data, error } = await portfolioAPI.sendChat({ message, history }, { signal });
  if (error) throw await toError(error);

  if (!(data instanceof Response) || !data.body) {
    throw new Error("The assistant returned an unexpected response.");
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
        if (parsed.error) throw new Error(parsed.error);
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
