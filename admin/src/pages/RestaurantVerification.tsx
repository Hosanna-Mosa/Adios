import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVerificationQueue, type ReviewAction } from "@/features/verification/hooks/useVerificationQueue";
import {
  AttachedFile,
  DetailRow,
  DetailSection,
  ReviewActions,
  ReviewHistory,
  StatusPill,
  StatusTabs,
} from "@/features/verification/components/VerificationParts";
import { formatDate } from "@/features/verification/format";
import type { DocumentOption, VendorApplication } from "@/features/verification/types";

/** Case/spacing-insensitive name comparison, to flag an owner who isn't the DigiLocker holder. */
const sameName = (a?: string, b?: string) =>
  Boolean(a && b && a.trim().toLowerCase().replace(/\s+/g, " ") === b.trim().toLowerCase().replace(/\s+/g, " "));

/**
 * Restaurant and meat-center applications from the partner website. A vendor
 * can only sign in to the vendor portal (and appear to customers) after an
 * admin approves it here.
 */
export default function RestaurantVerification() {
  const { t } = useTranslation();
  const queue = useVerificationQueue<VendorApplication>("vendors", "submitted");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.items.find((vendor) => vendor._id === selectedId) || null;

  const statusOptions = [
    { value: "submitted", label: t("verification.status.pending", "Pending review") },
    { value: "resubmission_required", label: t("verification.status.resubmission", "Documents requested") },
    { value: "rejected", label: t("verification.status.rejected", "Rejected") },
    { value: "approved", label: t("verification.status.approved", "Approved") },
  ];

  const documentOptions: DocumentOption[] = [
    { value: "identity", label: t("verification.docs.identity", "Owner identity (DigiLocker)") },
    { value: "pan", label: t("verification.docs.pan", "PAN card") },
    { value: "gst", label: t("verification.docs.gst", "GST certificate") },
    { value: "fssai", label: t("verification.docs.fssai", "FSSAI licence") },
    { value: "bank", label: t("verification.docs.vendorBank", "Bank account / cancelled cheque") },
  ];

  const act = (action: ReviewAction) => {
    if (!selected) return;
    queue.review.mutate({ id: selected._id, action }, { onSuccess: () => setSelectedId(null) });
  };

  const fssaiExpired = (expiry?: string) => Boolean(expiry && new Date(expiry).getTime() < Date.now());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("verification.vendors.title", "Restaurant Verification")}</h1>
          <p className="page-subtitle">
            {t(
              "verification.vendors.subtitle",
              "Review partner applications. A restaurant can only sign in to the vendor portal after you approve it.",
            )}
          </p>
        </div>

        <StatusTabs options={statusOptions} value={queue.status} onChange={queue.setStatus} counts={queue.counts} />

        <div className="section-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("verification.columns.business", "Business")}</TableHead>
                <TableHead>{t("verification.columns.owner", "Owner")}</TableHead>
                <TableHead>{t("verification.columns.identity", "Identity")}</TableHead>
                <TableHead>{t("verification.columns.submitted", "Submitted")}</TableHead>
                <TableHead>{t("verification.columns.status", "Status")}</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {t("verification.loading", "Loading applications…")}
                  </TableCell>
                </TableRow>
              ) : queue.isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-destructive">
                    {queue.error?.message}
                  </TableCell>
                </TableRow>
              ) : queue.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {t("verification.empty", "No applications here.")}
                  </TableCell>
                </TableRow>
              ) : (
                queue.items.map((vendor) => (
                  <TableRow key={vendor._id}>
                    <TableCell>
                      <div className="font-semibold">{vendor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {vendor.partnerType === "meat" ? t("verification.meatCenter", "Meat center") : t("verification.restaurant", "Restaurant")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{vendor.owner?.name}</div>
                      <div className="text-xs text-muted-foreground">{vendor.owner?.phone || vendor.phone}</div>
                    </TableCell>
                    <TableCell>
                      {vendor.kyc?.digilockerVerified ? (
                        <span className="text-xs font-semibold text-emerald-700">{t("verification.viaDigilocker", "DigiLocker verified")}</span>
                      ) : (
                        <span className="text-xs text-rose-600">{t("verification.notVerified", "Not verified")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(vendor.submittedAt || vendor.createdAt)}</TableCell>
                    <TableCell>
                      <StatusPill status={vendor.onboardingStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedId(vendor._id)}>
                        {t("verification.review", "Review")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="sm:max-w-[680px] rounded-3xl max-h-[88vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                  {selected.name}
                  <StatusPill status={selected.onboardingStatus} />
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <ReviewHistory review={selected.verificationReview} documentOptions={documentOptions} />

                <DetailSection title={t("verification.sections.business", "Business")}>
                  <DetailRow
                    label={t("verification.fields.type", "Type")}
                    value={selected.partnerType === "meat" ? t("verification.meatCenter", "Meat center") : t("verification.restaurant", "Restaurant")}
                  />
                  <DetailRow label={t("verification.fields.categories", "Categories")} value={selected.categories?.join(", ")} />
                  <DetailRow label={t("verification.fields.address", "Address")} value={selected.address} />
                  <DetailRow label={t("verification.fields.submitted", "Submitted")} value={formatDate(selected.submittedAt || selected.createdAt)} />
                </DetailSection>

                <DetailSection title={t("verification.sections.owner", "Owner")}>
                  <DetailRow label={t("verification.fields.name", "Name")} value={selected.owner?.name} />
                  <DetailRow label={t("verification.fields.email", "Email")} value={selected.owner?.email || selected.email} />
                  <DetailRow label={t("verification.fields.phone", "Phone")} value={selected.owner?.phone || selected.phone} />
                  <DetailRow label={t("verification.fields.primaryContact", "Primary contact")} value={selected.owner?.primaryContact} />
                </DetailSection>

                <DetailSection title={t("verification.docs.identity", "Owner identity (DigiLocker)")}>
                  {selected.kyc?.digilockerVerified ? (
                    <>
                      {selected.kyc.sandbox && (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                          {t("verification.sandboxKyc", "Sandbox DigiLocker — simulated test data, not a real verification.")}
                        </p>
                      )}
                      <DetailRow
                        label={t("verification.fields.holderName", "Name on DigiLocker")}
                        value={selected.kyc.holderName}
                        verified={sameName(selected.kyc.holderName, selected.owner?.name)}
                      />
                      {!sameName(selected.kyc.holderName, selected.owner?.name) && (
                        <p className="text-xs text-amber-700">
                          {t("verification.nameMismatch", "Doesn't exactly match the owner name entered on the form — check before approving.")}
                        </p>
                      )}
                      <DetailRow label={t("verification.docs.aadhaar", "Aadhaar")} value={selected.kyc.maskedAadhaar} verified={Boolean(selected.kyc.aadhaarVerified)} />
                      <DetailRow label={t("verification.fields.digilockerPan", "PAN on DigiLocker")} value={selected.kyc.panNumber} />
                      <DetailRow label={t("verification.fields.dob", "Date of birth")} value={selected.kyc.dob} />
                      <DetailRow label={t("verification.fields.verifiedAt", "Verified at")} value={formatDate(selected.kyc.verifiedAt)} />
                      {selected.kyc.issuedDocuments?.length ? (
                        <DetailRow label={t("verification.fields.issuedDocuments", "Documents in DigiLocker")} value={selected.kyc.issuedDocuments.join(", ")} />
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-rose-600">{t("verification.noDigilocker", "The owner has not verified their identity with DigiLocker.")}</p>
                  )}
                </DetailSection>

                <DetailSection title={t("verification.sections.tax", "Tax & licences")}>
                  <DetailRow
                    label={t("verification.docs.pan", "PAN card")}
                    value={
                      selected.legal?.panNumber &&
                      `${selected.legal.panNumber} · ${
                        selected.legal.panVerified ? t("verification.matchesDigilocker", "matches DigiLocker") : t("verification.manualReview", "manual review")
                      }`
                    }
                    verified={Boolean(selected.legal?.panVerified)}
                  />
                  {!selected.legal?.panVerified && (
                    <DetailRow label={t("verification.fields.panCopy", "PAN copy")} value={<AttachedFile name={selected.legal?.panFileName} />} />
                  )}
                  {selected.legal?.gstExempt ? (
                    <DetailRow label={t("verification.docs.gst", "GST certificate")} value={t("verification.gstExempt", "GST exempt / composition")} />
                  ) : (
                    <>
                      <DetailRow label={t("verification.fields.gstin", "GSTIN")} value={selected.legal?.gstin} />
                      <DetailRow label={t("verification.fields.gstCopy", "GST certificate")} value={<AttachedFile name={selected.legal?.gstFileName} />} />
                    </>
                  )}
                  <DetailRow label={t("verification.fields.fssaiNumber", "FSSAI number")} value={selected.legal?.fssaiNumber} />
                  <DetailRow
                    label={t("verification.fields.fssaiExpiry", "FSSAI valid till")}
                    value={
                      selected.legal?.fssaiExpiry &&
                      `${selected.legal.fssaiExpiry}${fssaiExpired(selected.legal.fssaiExpiry) ? ` · ${t("verification.expired", "expired")}` : ""}`
                    }
                    verified={selected.legal?.fssaiExpiry ? !fssaiExpired(selected.legal.fssaiExpiry) : undefined}
                  />
                  <DetailRow label={t("verification.fields.fssaiCopy", "FSSAI licence")} value={<AttachedFile name={selected.legal?.fssaiFileName} />} />
                </DetailSection>

                <DetailSection title={t("verification.docs.vendorBank", "Bank account / cancelled cheque")}>
                  <DetailRow label={t("verification.fields.accountNumber", "Account number")} value={selected.legal?.bankAccount} />
                  <DetailRow label={t("verification.fields.accountType", "Account type")} value={selected.legal?.accountType} />
                  <DetailRow label={t("verification.fields.ifsc", "IFSC")} value={selected.legal?.ifsc} />
                  <DetailRow label={t("verification.fields.cheque", "Cheque / statement")} value={<AttachedFile name={selected.legal?.chequeFileName} />} />
                </DetailSection>

                <DetailSection title={t("verification.sections.contract", "Contract")}>
                  <DetailRow label={t("verification.fields.signature", "Signed by")} value={selected.contract?.signature} />
                  <DetailRow label={t("verification.fields.signedAt", "Signed at")} value={formatDate(selected.contract?.signedAt)} />
                </DetailSection>
              </div>

              <ReviewActions
                documentOptions={documentOptions}
                isPending={queue.review.isPending}
                canApprove={selected.onboardingStatus !== "approved"}
                onApprove={() => act({ type: "approve" })}
                onReject={(reason) => act({ type: "reject", reason })}
                onRequestDocuments={(documents, note) => act({ type: "request-documents", documents, note })}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
