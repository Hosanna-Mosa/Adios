import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Ban, Mail, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { AdminUser } from "../types";

interface UserTableProps {
  data: AdminUser[];
  isLoading: boolean;
  onBan: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

const ROLE_LABEL_KEY: Record<string, string> = {
  USER: "users.roleUser",
  DRIVER: "users.roleDriver",
  ADMIN: "users.roleAdmin",
  SUPPORT: "users.roleSupport",
};

/** The 7-column user list table, moved verbatim out of Users.tsx onto DataTable. */
export function UserTable({ data, isLoading, onBan, onDelete }: UserTableProps) {
  const { t } = useTranslation();
  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "details",
      header: t("users.userDetails"),
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
            {u.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <Link to={`/users/${u._id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors hover:underline">
              {u.name}
            </Link>
            <p className="text-xs text-muted-foreground">{u.email || u.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: t("users.role"),
      cell: (u) => (
        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          {ROLE_LABEL_KEY[u.role] ? t(ROLE_LABEL_KEY[u.role]) : u.role}
        </span>
      ),
    },
    {
      key: "status",
      header: t("users.status"),
      cell: (u) => (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${u.isBlocked ? "bg-destructive" : "bg-success"}`} />
          <span className="text-sm text-foreground">{u.isBlocked ? t("users.blocked") : t("users.active")}</span>
        </div>
      ),
    },
    {
      key: "orders",
      header: t("users.orders"),
      cell: (u) => <span className="text-sm font-semibold text-foreground">{u.addresses?.length || 0}</span>,
    },
    {
      key: "joined",
      header: t("users.joined"),
      cell: (u) => <span className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "lastActive",
      header: t("users.lastActive"),
      cell: (u) => <span className="text-sm text-muted-foreground">{new Date(u.updatedAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: t("dashboard.action"),
      cell: (u) => (
        <div className="flex items-center gap-1.5">
          <Link to={`/users/${u._id}`} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title={t("users.viewDetails")}>
            <Eye className="h-4 w-4" />
          </Link>
          <button onClick={() => toast.info(t("users.draftingEmailTo", { contact: u.email || u.phone, defaultValue: "Drafting email to {{contact}}..." }))} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title={t("users.messageUser")}>
            <Mail className="h-4 w-4" />
          </button>
          <button
            onClick={() => onBan(u)}
            className={`p-1.5 rounded-full transition-colors ${u.isBlocked ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
            title={u.isBlocked ? t("users.unblockUser") : t("users.blockUser")}
          >
            <Ban className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(u)} className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title={t("users.deleteUser")}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(u) => u._id}
      isLoading={isLoading}
      loadingLabel={t("users.loadingUsers")}
      emptyLabel={t("users.noUsersFoundMatchingFilter")}
    />
  );
}
