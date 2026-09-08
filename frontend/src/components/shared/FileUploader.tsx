import { useState } from "react";
import { Icon } from "./Icon";

export function FileUploader({
  label,
  desc,
  required,
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
}: {
  label: string;
  desc?: string;
  required?: boolean;
  file: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputId = `file-${label.replace(/[^a-zA-Z0-9]/g, "")}`;

  const handleUseDummy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ext = accept.includes(".csv") ? "csv" : "png";
    const dummyName = `${label.toLowerCase().replace(/[^a-z0-9]/g, "_")}_dummy.${ext}`;
    const fileContent =
      ext === "csv"
        ? [
            "category",
            "itemName",
            "price",
            "description",
            "type",
            "isBestseller",
          ].join(",")
        : "dummy data";
    onChange(
      new File([fileContent], dummyName, {
        type: ext === "csv" ? "text/csv" : "image/png",
      }),
    );
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onChange(f);
      }}
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
        dragOver
          ? "border-brand-kinetic bg-brand-kinetic/5"
          : file
            ? "border-green-300 bg-green-50/50"
            : "border-gray-200 bg-white hover:border-brand-kinetic/40 hover:bg-gray-50/50"
      }`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        id={fileInputId}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <Icon name="description" className="text-2xl text-green-600" />
          <div className="text-left">
            <p className="text-sm font-semibold text-green-700 truncate max-w-[200px]">
              {file.name}
            </p>
            <p className="text-xs text-green-500">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>
      ) : (
        <div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Icon name="cloud_upload" className="text-2xl text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">{label}</p>
          {desc && <p className="text-xs text-secondary-app mb-2">{desc}</p>}

          <div className="flex flex-col items-center justify-center gap-2 mt-2">
            <label
              htmlFor={fileInputId}
              className="text-xs text-secondary-app/60 cursor-pointer"
            >
              <span className="text-brand-kinetic font-medium hover:underline">
                Click to upload
              </span>{" "}
              or drag & drop
            </label>
            <button
              type="button"
              onClick={handleUseDummy}
              className="text-xs font-semibold text-brand-kinetic bg-brand-kinetic/10 hover:bg-brand-kinetic/20 px-3 py-1 rounded-full transition-all border border-brand-kinetic/20"
            >
              Use Dummy File
            </button>
          </div>

          <p className="text-[10px] text-secondary-app/40 mt-2">
            {accept.includes(".xlsx")
              ? "CSV, XLSX (max 10MB)"
              : "PDF, JPG, PNG (max 10MB)"}
          </p>
        </div>
      )}
    </div>
  );
}
