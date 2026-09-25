import { Eye, QrCode, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { Restaurant } from "../restaurantMenuTypes";

const HEADER_CLASS = "px-6 py-4.5 font-bold";
const CELL_CLASS = "px-6 py-5";

interface RestaurantTableProps {
  restaurants: Restaurant[];
  onViewClick: (restaurant: Restaurant) => void;
  onQrClick: (restaurant: Restaurant) => void;
  onEditClick: (restaurant: Restaurant) => void;
  onDelete: (restaurant: Restaurant) => void;
}

/** The restaurant list table. Only rendered once loading/empty are ruled out at the page level -- see RestaurantMenu.tsx. */
export function RestaurantTable({ restaurants, onViewClick, onQrClick, onEditClick, onDelete }: RestaurantTableProps) {
  const { t } = useTranslation();
  const columns: DataTableColumn<Restaurant>[] = [
    {
      key: "restaurant",
      header: t("catalog.restaurant"),
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (res) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#e6f4f2] text-[#00665c] flex items-center justify-center font-bold text-sm shadow-sm shrink-0 border border-[#00665c]/10">
            {res.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">{res.name}</div>
            <div className="text-xs text-slate-400 font-medium">{t("catalog.idColon", { value: res._id.substring(res._id.length - 6), defaultValue: "ID: {{value}}" })}</div>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      header: t("catalog.address"),
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (res) => (
        <div className="text-slate-600 font-medium text-xs max-w-xs line-clamp-2 leading-relaxed" title={res.address}>
          {res.address}
        </div>
      ),
    },
    {
      key: "contact",
      header: t("catalog.contactInfo"),
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (res) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-700 font-bold text-xs">{res.phone}</span>
          <span className="text-slate-400 font-medium text-[11px] truncate max-w-[180px]">{res.email || t("catalog.noEmail")}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: t("catalog.type"),
      headerClassName: `${HEADER_CLASS} w-40`,
      cellClassName: CELL_CLASS,
      cell: (res) =>
        res.isPureVeg ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black bg-[#e6f4f2] text-[#00665c] border border-[#00665c]/10 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00665c]" /> {t("catalog.pureVegCaps")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200/50 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {t("catalog.vegAndNonVegCaps")}
          </span>
        ),
    },
    {
      key: "actions",
      header: t("orders.action"),
      headerClassName: `${HEADER_CLASS} w-44 text-center`,
      cellClassName: `${CELL_CLASS} text-center`,
      cell: (res) => (
        <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-2xl">
          <Button variant="ghost" size="icon" onClick={() => onViewClick(res)} className="h-8 w-8 text-blue-600 hover:bg-white rounded-xl shadow-none hover:shadow-sm transition-all" title={t("catalog.seeMenu")}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onQrClick(res)} className="h-8 w-8 text-indigo-600 hover:bg-white rounded-xl shadow-none hover:shadow-sm transition-all" title={t("catalog.generateQrMenu")}>
            <QrCode className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEditClick(res)} className="h-8 w-8 text-teal-600 hover:bg-white rounded-xl shadow-none hover:shadow-sm transition-all" title={t("catalog.editRestaurantAndMenu")}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(res)} className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl transition-all" title={t("catalog.deleteAction")}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={restaurants}
        rowKey={(res) => res._id}
        tableClassName="w-full text-sm text-left border-collapse"
        theadClassName="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
        headerRowClassName=""
        rowClassName="hover:bg-slate-50/60 transition-colors duration-200"
        tbodyClassName="divide-y divide-slate-100"
      />
    </div>
  );
}
