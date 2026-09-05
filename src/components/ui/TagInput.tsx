import { useId, useState, type KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  helpText: string;
  errorId?: string;
  maxItems?: number;
}

/**
 * A labeled, keyboard-accessible input for entering a short list of free-text
 * tokens (skills or interests). Enter or comma commits the current token.
 */
export function TagInput({
  label,
  values,
  onChange,
  placeholder,
  helpText,
  errorId,
  maxItems = 10,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const helpId = useId();

  function commitDraft() {
    const trimmed = draft.trim();
    if (!trimmed || values.length >= maxItems) {
      setDraft("");
      return;
    }
    if (!values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 border border-paper-line bg-white px-2.5 py-2 focus-within:border-navy">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-navy/10 px-2 py-1 text-xs font-medium text-navy"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-navy/60 hover:text-danger"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={values.length === 0 ? placeholder : ""}
          aria-describedby={`${helpId}${errorId ? ` ${errorId}` : ""}`}
          className="min-w-[8ch] flex-1 border-none bg-transparent py-1 text-sm outline-none"
          disabled={values.length >= maxItems}
        />
      </div>
      <p id={helpId} className="mt-1 text-xs text-navy/50">
        {helpText}
      </p>
    </div>
  );
}
