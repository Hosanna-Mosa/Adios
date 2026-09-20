import { toast } from "sonner";
import { Paperclip, Image, Smile, Send } from "lucide-react";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholderName: string;
}

/** The message input row: textarea, attachment/emoji stub buttons, and send. */
export function ChatComposer({ value, onChange, onSend, placeholderName }: ChatComposerProps) {
  return (
    <div className="p-4 border-t border-border">
      <div className="bg-muted/50 rounded-xl p-3 border border-border">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Type your response to ${placeholderName}...`}
          className="w-full bg-transparent text-sm placeholder:text-muted-foreground resize-none focus:outline-none min-h-[60px]"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <button onClick={() => toast.info("Attachments dialog closed.")} className="p-1.5 hover:bg-muted rounded transition-colors">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => toast.info("Images attachment selected.")} className="p-1.5 hover:bg-muted rounded transition-colors">
              <Image className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => toast.info("Emoji drawer not simulated.")} className="p-1.5 hover:bg-muted rounded transition-colors">
              <Smile className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <button onClick={onSend} className="flex items-center gap-2 px-4 py-2 bg-foreground text-card rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            Send Message <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
