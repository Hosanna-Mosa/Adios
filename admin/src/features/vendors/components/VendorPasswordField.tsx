import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";

interface VendorPasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  hint?: ReactNode;
}

/** One labeled show/hide password input on the VendorSettings change-password form. */
export function VendorPasswordField({ label, placeholder, value, onChange, show, onToggleShow, hint }: VendorPasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pl-10 pr-10 h-11"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint}
    </div>
  );
}
