import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, User, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generatePassword } from "../hooks/useSupportMembers";
import type { NewSupportMemberForm, SupportMember } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;

type Props =
  | {
      mode: "create";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSubmit: (form: NewSupportMemberForm) => Promise<unknown>;
      member?: undefined;
    }
  | {
      mode: "reset";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSubmit: (form: NewSupportMemberForm) => Promise<unknown>;
      member: SupportMember;
    };

const EMPTY_FORM: NewSupportMemberForm = { name: "", email: "", password: "" };

/**
 * "Add new member" and "Reset password" share this dialog. On success it swaps
 * to a one-time credentials card — passwords are hashed server-side, so this is
 * the only moment the admin can see and copy the password.
 */
export function SupportMemberDialog({ mode, open, onOpenChange, onSubmit, member }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<NewSupportMemberForm>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<NewSupportMemberForm | null>(null);

  const isReset = mode === "reset";

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Forget the password as soon as the dialog closes.
      setForm(EMPTY_FORM);
      setSaved(null);
      setShowPassword(false);
    }
    onOpenChange(next);
  };

  const validate = (): string | null => {
    if (!isReset) {
      if (!form.name.trim()) return t("supportTeam.nameRequired", "Enter the member's name.");
      if (!EMAIL_PATTERN.test(form.email.trim())) return t("supportTeam.emailInvalid", "Enter a valid email address.");
    }
    if (form.password.length < MIN_PASSWORD) return t("supportTeam.passwordTooShort", "Password must be at least 8 characters.");
    if (form.password.length > MAX_PASSWORD) return t("supportTeam.passwordTooLong", "Password must be at most 72 characters.");
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = isReset
      ? { name: member.name, email: member.email, password: form.password }
      : { name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password };

    setIsSaving(true);
    try {
      await onSubmit(payload);
      setSaved(payload);
      toast.success(
        isReset ? t("supportTeam.passwordReset", "Password updated. They've been signed out everywhere.") : t("supportTeam.memberAdded", "Support member added."),
      );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl">
        {saved ? (
          <CredentialsCard credentials={saved} onDone={() => handleOpenChange(false)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {isReset ? t("supportTeam.resetPasswordTitle", "Reset password") : t("supportTeam.addMemberTitle", "Add support member")}
              </DialogTitle>
              <DialogDescription>
                {isReset
                  ? t("supportTeam.resetPasswordDesc", {
                      name: member.name,
                      defaultValue: "Set a new password for {{name}}. Their current sessions will be signed out.",
                    })
                  : t("supportTeam.addMemberDesc", "They'll sign in on the login page by choosing “Support team”. They can only see support cases and chats.")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {!isReset && (
                <>
                  <Field id="member-name" label={t("supportTeam.fullName", "Full name")} icon={User}>
                    <Input
                      id="member-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="pl-10 h-11"
                      maxLength={80}
                      autoFocus
                    />
                  </Field>
                  <Field id="member-email" label={t("supportTeam.email", "Email")} icon={Mail}>
                    <Input
                      id="member-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@company.com"
                      className="pl-10 h-11"
                      autoComplete="off"
                    />
                  </Field>
                </>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="member-password" className="text-sm font-medium">
                    {isReset ? t("supportTeam.newPassword", "New password") : t("supportTeam.password", "Password")}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, password: generatePassword() });
                      setShowPassword(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    {t("supportTeam.generate", "Generate")}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="member-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={t("supportTeam.passwordPlaceholder", "At least 8 characters")}
                    className="pl-10 pr-10 h-11 font-mono"
                    autoComplete="new-password"
                    autoFocus={isReset}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? t("supportTeam.hidePassword", "Hide password") : t("supportTeam.showPassword", "Show password")}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 mt-2" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isReset ? (
                  t("supportTeam.updatePassword", "Update password")
                ) : (
                  t("supportTeam.createAccount", "Create account")
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}

function CredentialsCard({ credentials, onDone }: { credentials: NewSupportMemberForm; onDone: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <DialogHeader>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle className="text-xl font-bold">{t("supportTeam.credentialsTitle", "Share these login details")}</DialogTitle>
        <DialogDescription>
          {t("supportTeam.credentialsDesc", {
            name: credentials.name,
            defaultValue: "Send these to {{name}} privately. For security the password is stored encrypted and won't be shown again — you can always reset it.",
          })}
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-2xl border border-border bg-muted/30 divide-y divide-border">
        <CopyRow label={t("supportTeam.loginAs", "Sign in as")} value={t("panelAuth.roleSupport", "Support team")} copyable={false} />
        <CopyRow label={t("supportTeam.email", "Email")} value={credentials.email} />
        <CopyRow label={t("supportTeam.password", "Password")} value={credentials.password} mono />
      </div>

      <Button
        variant="outline"
        className="w-full h-11"
        onClick={() => {
          copy(`Email: ${credentials.email}\nPassword: ${credentials.password}\nLogin: ${window.location.origin}/vendor-login (choose “Support team”)`, t);
        }}
      >
        <Copy className="h-4 w-4 mr-2" />
        {t("supportTeam.copyAll", "Copy all details")}
      </Button>
      <Button className="w-full h-11" onClick={onDone}>
        {t("supportTeam.done", "Done")}
      </Button>
    </div>
  );
}

function CopyRow({ label, value, mono, copyable = true }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={async () => {
            if (await copy(value, t, false)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          }}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={t("supportTeam.copy", "Copy")}
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

async function copy(text: string, t: (key: string, fallback: string) => string, announce = true) {
  try {
    await navigator.clipboard.writeText(text);
    if (announce) toast.success(t("supportTeam.copied", "Copied to clipboard"));
    return true;
  } catch {
    toast.error(t("supportTeam.copyFailed", "Couldn't copy — select the text instead."));
    return false;
  }
}
