import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { badgeHover, scaleUp, transitionConfig } from "@/lib/motionVariants";
import { cn } from "@/lib/utils";
import ChatPanel from "./ChatPanel";

// Mounted once in MainLayout, outside the route AnimatePresence, so the thread
// survives navigation. Owns open/closed state; the hook owns the conversation.
// Closing discards the thread — reopening always starts a fresh conversation.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { messages, send, stop, reset, streaming, error } = useChat();

  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  // Only pull focus back to the launcher if the panel was actually open —
  // otherwise the first render would steal focus from the page.
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else if (wasOpen.current) {
      launcherRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  // Every close path funnels through here: reset() aborts any in-flight answer
  // and empties the thread.
  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            {...(reduceMotion
              ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
              : { ...scaleUp, exit: { opacity: 0, scale: 0.95 } })}
            transition={transitionConfig}
            style={{ originX: 1, originY: 1 }}
            className={cn(
              "fixed z-50",
              // Near-full-bleed sheet on phones, stopping above the launcher
              // (which doubles as the close button there); anchored panel from sm up.
              "inset-x-3 bottom-20 top-16",
              "sm:inset-auto sm:right-6 sm:bottom-24 sm:top-auto sm:h-128 sm:w-104"
            )}
          >
            <ChatPanel
              messages={messages}
              streaming={streaming}
              error={error}
              onSend={send}
              onStop={stop}
              onReset={reset}
              onClose={close}
              inputRef={inputRef}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? "Close the chat assistant" : "Ask about Jeffrey"}
        aria-expanded={open}
        {...badgeHover}
        className={cn(
          "fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6",
          "inline-flex items-center gap-2 rounded-sm border border-accent bg-accent px-4 py-2.5",
          "font-display text-xs uppercase tracking-wide text-bg shadow-lg transition-colors hover:bg-accent-warm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        )}
      >
        <MessageSquare className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        <span className={cn(open && "hidden sm:inline")}>Know more</span>
      </motion.button>
    </>
  );
}
