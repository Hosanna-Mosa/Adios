import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVerificationQueue, type ReviewAction } from "@/features/verification/hooks/useVerificationQueue";
import {
  DetailRow,
  DetailSection,
  DocumentImage,
  ReviewActions,
  ReviewHistory,
  StatusPill,
  StatusTabs,
} from "@/features/verification/components/VerificationParts";
import { formatDate } from "@/features/verification/format";
import type { DocumentOption, DriverApplication } from "@/features/verification/types";

/**
 * Drivers who finished onboarding in the driver app and are waiting for an
 * admin. Approving is what lets a driver go online; requesting documents
 * clears those documents in the app so the driver uploads them again.
 */
export default function DriverVerification() {
  const { t } = useTranslation();
  const queue = useVerificationQueue<DriverApplication>("drivers", "pending_approval");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.items.find((driver) => driver._id === selectedId) || null;

  const statusOptions = [
    { value: "pending_approval", label: t("verification.status.pending", "Pending review") },
    { value: "resubmission_required", label: t("verification.status.resubmission", "Documents requested") },
    { value: "rejected", label: t("verification.status.rejected", "Rejected") },
    { value: "completed", label: t("verification.status.approved", "Approved") },
    { value: "in_progress", label: t("verification.status.inProgress", "Onboarding in progress") },
  ];

  const documentOptions: DocumentOption[] = [
    { value: "aadhaar", label: t("verification.docs.aadhaar", "Aadhaar") },
    { value: "pan", label: t("verification.docs.pan", "PAN card") },
    { value: "license", label: t("verification.docs.license", "Driving licence") },
    { value: "bank", label: t("verification.docs.bank", "Bank account") },
    { value: "selfie", label: t("verification.docs.selfie", "Selfie") },
  ];

  const act = (action: ReviewAction) => {
    if (!selected) return;
    queue.review.mutate({ id: selected._id, action }, { onSuccess: () => setSelectedId(null) });
  };

  const zoneName = (zone: DriverApplication["preferredZone"]) => (zone && typeof zone === "object" ? zone.name : undefined);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("verification.drivers.title", "Driver Verification")}</h1>
          <p className="page-subtitle">
            {t(
              "verification.drivers.subtitle",
              "Review new driver applications. Drivers can only go online after you approve them.",
            )}
          </p>
        </div>

        <StatusTabs options={statusOptions} value={queue.status} onChange={queue.setStatus} counts={queue.counts} />

        <div className="section-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("verification.columns.driver", "Driver")}</TableHead>
                <TableHead>{t("verification.columns.vehicle", "Vehicle")}</TableHead>
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
                queue.items.map((driver) => (
                  <TableRow key={driver._id}>
                    <TableCell>
                      <div className="font-semibold">{driver.user?.name || t("verification.unnamed", "Unnamed")}</div>
                      <div className="text-xs text-muted-foreground">{driver.user?.phone}</div>
                    </TableCell>
                    <TableCell className="uppercase">{driver.vehicleType || "—"}</TableCell>
                    <TableCell>
                      {driver.digilockerVerified ? (
                        <span className="text-xs font-semibold text-emerald-700">{t("verification.viaDigilocker", "DigiLocker verified")}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("verification.selfDeclared", "Self-declared")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(driver.submittedForReviewAt)}</TableCell>
                    <TableCell>
                      <StatusPill status={driver.onboardingStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedId(driver._id)}>
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
        <DialogContent className="sm:max-w-[640px] rounded-3xl max-h-[88vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                  {selected.user?.name || t("verification.unnamed", "Unnamed")}
                  <StatusPill status={selected.onboardingStatus} />
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <ReviewHistory review={selected.verificationReview} documentOptions={documentOptions} />

                <DetailSection title={t("verification.sections.profile", "Profile")}>
                  <DetailRow label={t("verification.fields.phone", "Phone")} value={selected.user?.phone} />
                  <DetailRow label={t("verification.fields.email", "Email")} value={selected.user?.email} />
                  <DetailRow label={t("verification.fields.gender", "Gender")} value={selected.gender} />
                  <DetailRow label={t("verification.fields.vehicle", "Vehicle")} value={selected.vehicleType?.toUpperCase()} />
                  <DetailRow label={t("verification.fields.zone", "Preferred zone")} value={zoneName(selected.preferredZone)} />
                  <DetailRow label={t("verification.fields.submitted", "Submitted")} value={formatDate(selected.submittedForReviewAt)} />
                </DetailSection>

                <DetailSection title={t("verification.sections.identity", "Identity")}>
                  <DetailRow
                    label={t("verification.fields.kycSource", "KYC source")}
                    value={
                      selected.digilockerVerified
                        ? `${t("verification.viaDigilocker", "DigiLocker verified")} · ${formatDate(selected.digilockerVerifiedAt)}`
                        : selected.kycSource || t("verification.selfDeclared", "Self-declared")
                    }
                  />
                  <DetailRow label={t("verification.docs.aadhaar", "Aadhaar")} value={selected.aadhaarNumber} verified={Boolean(selected.aadhaarVerified)} />
                  <DetailRow label={t("verification.docs.pan", "PAN card")} value={selected.panNumber} verified={Boolean(selected.panVerified)} />
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <DocumentImage label={t("verification.docs.pan", "PAN card")} url={selected.panImage} />
                    <DocumentImage label={t("verification.docs.selfie", "Selfie")} url={selected.selfieImage} />
                  </div>
                </DetailSection>

                <DetailSection title={t("verification.docs.license", "Driving licence")}>
                  <DetailRow label={t("verification.fields.number", "Number")} value={selected.dlNumber} verified={Boolean(selected.dlVerified)} />
                  <DetailRow label={t("verification.fields.expiry", "Valid till")} value={selected.dlExpiry ? new Date(selected.dlExpiry).toLocaleDateString() : undefined} />
                  <DetailRow label={t("verification.fields.vehicleClass", "Vehicle classes")} value={selected.dlVehicleClass} />
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <DocumentImage label={t("verification.fields.front", "Front")} url={selected.dlFrontImage} />
                    <DocumentImage label={t("verification.fields.back", "Back")} url={selected.dlBackImage} />
                  </div>
                </DetailSection>

                <DetailSection title={t("verification.docs.bank", "Bank account")}>
                  <DetailRow label={t("verification.fields.accountNumber", "Account number")} value={selected.bankAccountNumber} verified={Boolean(selected.bankVerified)} />
                  <DetailRow label={t("verification.fields.ifsc", "IFSC")} value={selected.bankIfsc} />
                </DetailSection>
              </div>

              <ReviewActions
                documentOptions={documentOptions}
                isPending={queue.review.isPending}
                canApprove={selected.onboardingStatus !== "completed"}
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
