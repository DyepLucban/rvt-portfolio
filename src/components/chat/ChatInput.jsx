import { forwardRef, useState } from "react";
import { Send, Square } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";
import { MAX_MESSAGE_CHARS } from "@/hooks/useChat";

// The 500-character cap is enforced here for the visitor's benefit and again
// on the server for everyone else's — the UI is not the security boundary.
const ChatInput = forwardRef(function ChatInput({ onSend, onStop, streaming }, ref) {
  const [value, setValue] = useState("");

  const submit = () => {
    const message = value.trim();
    if (!message || streaming) return;
    onSend(message);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const remaining = MAX_MESSAGE_CHARS - value.length;

  return (
    <div className="border-t border-border/60 bg-black/10 p-3">
      <div className="flex items-end gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about Jeffrey
        </label>
        <textarea
          id="chat-input"
          ref={ref}
          rows={1}
          value={value}
          maxLength={MAX_MESSAGE_CHARS}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Jeffrey"
          className={cn(
            "max-h-28 min-h-10 flex-1 resize-none rounded-sm border border-border bg-surface/60 px-3 py-2",
            "font-mono text-xs text-text placeholder:text-text-muted/50",
            "focus:border-accent focus:outline-none"
          )}
        />
        {streaming ? (
          <IconButton
            label="Stop generating"
            onClick={onStop}
            icon={<Square strokeWidth={2} />}
          />
        ) : (
          <IconButton
            label="Send message"
            onClick={submit}
            disabled={!value.trim()}
            className="disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-muted"
            icon={<Send strokeWidth={1.75} />}
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[10px] text-text-muted/50">
        <span>Enter to send</span>
        <span className={cn(remaining < 50 && "text-accent-warm")}>
          {remaining}
        </span>
      </div>
    </div>
  );
});

export default ChatInput;
