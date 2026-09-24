import { toast } from "sonner";
import { Image, Paperclip, Send, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SupportChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  placeholderName: string;
}

/** The chat window's input row: Enter-to-send textarea, attachment/emoji stubs, and a send button disabled while empty. */
export function SupportChatComposer({ value, onChange, onKeyDown, onSend, placeholderName }: SupportChatComposerProps) {
  const { t } = useTranslation();
  return (
    <div className="p-4 border-t border-border shrink-0 bg-muted/10">
      <div className="bg-card rounded-xl p-3 border border-border shadow-sm flex flex-col">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("support.typeYourResponseTo", { name: placeholderName, defaultValue: "Type your response to {{name}}..." })}
          className="w-full bg-transparent text-sm placeholder:text-muted-foreground resize-none focus:outline-none min-h-[60px]"
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
          <div className="flex gap-2">
            <button onClick={() => toast.info(t("support.attachmentsDialogClicked"))} className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border" title={t("support.attachFiles")}>
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => toast.info(t("support.imagesAttachmentSelected"))} className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border" title={t("support.attachImages")}>
              <Image className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => toast.info(t("support.emojiDrawerClicked"))} className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border" title={t("support.addEmojis")}>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <button
            onClick={onSend}
            disabled={!value.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
          >
            {t("support.sendMessage")} <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
