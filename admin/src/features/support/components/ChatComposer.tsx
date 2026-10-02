import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholderName: string;
}

/**
 * The reply box: a label naming who the reply goes to, a Send button that's
 * disabled until there's text, and a textarea where Enter sends (Shift+Enter
 * for a newline). The old paperclip/image/emoji buttons only fired "not
 * simulated" toasts, so they're gone.
 */
export function ChatComposer({ value, onChange, onSend, placeholderName }: ChatComposerProps) {
  const { t } = useTranslation();
  return (
    <div className="p-4 border-t border-border shrink-0">
      <div className="bg-muted/50 rounded-xl p-3 border border-border">
        <div className="flex items-center justify-between gap-3 mb-2">
          <label htmlFor="support-reply" className="text-xs font-semibold text-muted-foreground">
            {t("support.replyToName", { name: placeholderName, defaultValue: "Reply to {{name}}" })}
          </label>
          <button
            onClick={onSend}
            disabled={!value.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-card rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {t("support.send")} <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          id="support-reply"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={t("support.typeResponsePressEnter")}
          className="w-full bg-transparent text-sm placeholder:text-muted-foreground resize-none focus:outline-none h-[72px]"
        />
      </div>
    </div>
  );
}
