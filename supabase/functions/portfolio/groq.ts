import { corsHeaders } from "./http.ts";

// The only file that knows Groq exists. Everything above it speaks in
// messages-in / {delta} events-out, so swapping inference providers is a
// change confined to this module.
//
// Model IDs churn (two Llama models were retired in June 2026). Check
// console.groq.com/docs/deprecations before each deploy.
export const MODEL = "openai/gpt-oss-120b";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_COMPLETION_TOKENS = 600;

export type Message = { role: "system" | "user" | "assistant"; content: string };

export type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  // Groq reports prompt-cache hits here; watch it to confirm the static
  // prefix is still matching (a silent miss doubles input cost).
  prompt_tokens_details?: { cached_tokens?: number };
};

export type StreamResult = { text: string; usage: Usage | null };

// Our own event shape, deliberately smaller than OpenAI's:
//   data: {"delta":"Jeffrey "}
//   data: {"done":true}
//   data: {"error":"..."}
function event(payload: unknown) {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function streamChatCompletion(
  messages: Message[],
  onFinish?: (result: StreamResult) => void | Promise<void>
): Promise<Response> {
  const upstream = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3, // grounded, not creative
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      stream: true,
      stream_options: { include_usage: true },
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    throw new Error(`Groq responded ${upstream.status}: ${detail.slice(0, 500)}`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let usage: Usage | null = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by a blank line; a chunk boundary can
          // land mid-event, so only complete events leave the buffer.
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;

            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            const parsed = JSON.parse(payload);
            if (parsed.usage) usage = parsed.usage;

            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              text += delta;
              controller.enqueue(event({ delta }));
            }
          }
        }

        controller.enqueue(event({ done: true }));
      } catch (error) {
        // Emitted in-band so the widget can show a failure instead of
        // hanging on a stream that just stops.
        controller.enqueue(event({ error: String(error) }));
      } finally {
        controller.close();
        // Logging must not be able to break the response the visitor sees.
        try {
          await onFinish?.({ text, usage });
        } catch (_) {
          // ignored on purpose
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
