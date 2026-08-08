import { useEffect, useRef } from "react";
import { AlertTriangle, RotateCcw, X } from "lucide-react";
import Frame from "@/components/ui/Frame";
import IconButton from "@/components/ui/IconButton";
import PanelHeader from "@/components/ui/PanelHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";

export default function ChatPanel({
  messages,
  streaming,
  error,
  onSend,
  onStop,
  onReset,
  onClose,
  inputRef,
}) {
  const scrollRef = useRef(null);
  // Auto-scroll follows the answer, but stops the moment the visitor scrolls
  // up to re-read something — yanking them back is worse than a stale view.
  const pinnedToBottom = useRef(true);

  useEffect(() => {
    const node = scrollRef.current;
    if (node && pinnedToBottom.current) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    pinnedToBottom.current = scrollHeight - scrollTop - clientHeight < 40;
  };

  const isEmpty = messages.length === 0;
  const lastIndex = messages.length - 1;

  return (
    <Frame className="flex h-full flex-col overflow-hidden rounded-sm border border-border bg-surface/95 shadow-2xl backdrop-blur-md">
      <div className="relative">
        <PanelHeader label="~/ask.me" />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          {!isEmpty && (
            <IconButton
              size="sm"
              variant="ghost"
              label="Clear conversation"
              onClick={onReset}
              icon={<RotateCcw strokeWidth={1.5} />}
            />
          )}
          <IconButton
            size="sm"
            variant="ghost"
            label="Close chat"
            onClick={onClose}
            icon={<X strokeWidth={1.5} />}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {isEmpty ? (
          <div className="space-y-4">
            <p className="font-mono text-xs leading-relaxed text-text-muted">
              <span className="text-accent-warm">{"> "}</span>
              Hi! I&apos;m Jeffrey&apos;s AI assistant. Ask me anything about his experiences, skills, or projects.
            </p>
            {/* <SuggestedQuestions onSelect={onSend} disabled={streaming} /> */}
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              streaming={streaming && index === lastIndex && message.role === "assistant"}
            />
          ))
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-sm border border-accent-inactive/40 bg-accent-inactive/10 px-3 py-2 font-mono text-xs leading-relaxed text-text"
          >
            <AlertTriangle
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-inactive"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{error.message}</span>
          </div>
        )}
      </div>

      <ChatInput ref={inputRef} onSend={onSend} onStop={onStop} streaming={streaming} />
    </Frame>
  );
}
