"use client";

import { useId, useState, type FormEvent } from "react";
import type { MentorMessage } from "@/types";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";

interface MentorChatProps {
  messages: MentorMessage[];
  onAsk: (question: string) => void;
  isAsking: boolean;
}

/** A scoped chat interface for implementation questions about the selected project. */
export function MentorChat({ messages, onAsk, isAsking }: MentorChatProps) {
  const [draft, setDraft] = useState("");
  const inputId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isAsking) return;
    onAsk(trimmed);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        aria-live="polite"
        className="max-h-[28rem] space-y-4 overflow-y-auto border border-paper-line bg-white/60 p-4"
      >
        {messages.length === 0 && !isAsking && (
          <EmptyState
            title="No questions yet"
            description="Ask about scope, tech choices, architecture, or anything blocking you."
          />
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-auto bg-navy text-white"
                : "border border-paper-line bg-white text-ink/90"
            }`}
          >
            {message.content}
          </div>
        ))}
        {isAsking && <LoadingState label="Mentor is thinking..." skeletonRows={2} />}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Ask your mentor a question
        </label>
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Can I finish this in 4 months?"
          className="flex-1 border border-paper-line bg-white px-3 py-2.5 text-sm focus:border-navy"
          aria-describedby={`${inputId}-help`}
        />
        <Button type="submit" isLoading={isAsking} disabled={!draft.trim()}>
          Ask
        </Button>
      </form>
      <p id={`${inputId}-help`} className="sr-only">
        Your question is answered in the context of your selected project.
      </p>
    </div>
  );
}
