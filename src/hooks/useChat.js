import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "@/services/chatService";

// Deviates from useProjects/useSkills in exactly one respect: it's imperative
// rather than fetch-on-mount, because messages are sent in response to a user
// action. The { data, loading, error } contract carries over as
// { messages, streaming, error }.

const MAX_MESSAGE_CHARS = 500;
// Mirrors the server cap. Sending more just gets trimmed server-side; not
// sending it saves the tokens.
const MAX_HISTORY_TURNS = 8;

let nextId = 0;
const makeId = () => `m${Date.now()}-${nextId++}`;

// The thread lives in React state only — nothing is persisted. The widget is
// mounted once in MainLayout, so it survives route changes; closing the panel
// (or a refresh) starts a fresh conversation. No history by design.
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Abort an in-flight answer if the whole widget goes away.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (input) => {
      const message = input.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!message || streaming) return;

      setError(null);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const replyId = makeId();
      let history = [];

      setMessages((current) => {
        history = current
          .filter((m) => m.content)
          .slice(-MAX_HISTORY_TURNS)
          .map(({ role, content }) => ({ role, content }));

        return [
          ...current,
          { id: makeId(), role: "user", content: message },
          { id: replyId, role: "assistant", content: "" },
        ];
      });

      try {
        for await (const delta of streamChat({
          message,
          history,
          signal: controller.signal,
        })) {
          setMessages((current) =>
            current.map((m) =>
              m.id === replyId ? { ...m, content: m.content + delta } : m
            )
          );
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err);
        // Drop the empty placeholder — an error banner says it better than a
        // blank assistant bubble does.
        setMessages((current) =>
          current.filter((m) => !(m.id === replyId && !m.content))
        );
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [streaming]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, send, stop, reset, streaming, error };
}

export { MAX_MESSAGE_CHARS };
