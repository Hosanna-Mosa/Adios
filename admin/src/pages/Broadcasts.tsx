import { useState } from "react";
import { Loader2, Megaphone, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { appConfirm } from "@/lib/dialog";
import { useBroadcasts, type Audience } from "@/features/broadcasts/useBroadcasts";

const AUDIENCES: Audience[] = ["users", "drivers", "partners", "everyone"];
const PARTNER_SCREENS = [
  ["", "Just open the app"],
  ["/(tabs)/orders", "Orders"],
  ["/(tabs)/menu", "Menu"],
  ["/(tabs)/inventory", "Meat inventory"],
  ["/payouts", "Payouts"],
  ["/scheduled-orders", "Scheduled orders"],
  ["/support", "Support"],
] as const;

export default function Broadcasts() {
  const { t, i18n } = useTranslation();
  const [audience, setAudience] = useState<Audience>("users");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [screen, setScreen] = useState("");

  const { history, isLoading, send } = useBroadcasts();

  const submit = async () => {
    if (!title.trim() || !body.trim()) return toast.error(t("broadcast.needsText", "Enter a title and a message."));
    const ok = await appConfirm({
      title: t("broadcast.confirmTitle", "Send this notification?"),
      description: t("broadcast.confirmDesc", { audience: t(`broadcast.audience.${audience}`, audience), defaultValue: "It goes to every registered device of: {{audience}}. It cannot be recalled." }),
    });
    if (!ok) return;
    send.mutate(
      { audience, title, body, ...(screen ? { screen } : {}) },
      {
        onSuccess: (sent) => {
          toast.success(t("broadcast.sent", { count: sent.recipients, defaultValue: "Sent to {{count}} devices." }));
          setTitle("");
          setBody("");
          setScreen("");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <DashboardLayout searchPlaceholder={t("broadcast.search", "Search")}>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("broadcast.title", "Push broadcast")}</h1>
          <p className="page-subtitle">{t("broadcast.subtitle", "Send a one-off announcement to customers, drivers or partners. One broadcast every 30 seconds; every send is logged.")}</p>
        </div>

        <div className="section-card p-6 space-y-4 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${audience === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}
              >
                {t(`broadcast.audience.${a}`, a.charAt(0).toUpperCase() + a.slice(1))}
              </button>
            ))}
          </div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("broadcast.titlePlaceholder", "Title (max 60 characters)")} maxLength={60} />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("broadcast.bodyPlaceholder", "Message (max 200 characters)")} maxLength={200} rows={3} />
          {(audience === "partners" || audience === "everyone") && (
            <label className="block text-sm">
              <span className="font-medium">{t("broadcast.partnerScreen", "When a partner taps it")}</span>
              <select value={screen} onChange={(e) => setScreen(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {PARTNER_SCREENS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button onClick={submit} disabled={send.isPending} className="h-11">
            {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {t("broadcast.send", "Send notification")}
          </Button>
        </div>

        <div className="section-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-foreground">{t("broadcast.history", "Sent so far")}</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">{t("broadcast.none", "Nothing has been broadcast yet.")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((b) => (
                <li key={b._id} className="px-6 py-3">
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-sm text-muted-foreground">{b.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t(`broadcast.audience.${b.audience}`, b.audience)} · {b.recipients} {t("broadcast.devices", "devices")} · {b.sentByName || "—"} · {new Date(b.createdAt).toLocaleString(i18n.language)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
