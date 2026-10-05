import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import type { PartnerApplication } from "../types";

const TONE_CLASSES = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
};

/** Where an application stands, for an applicant with no documents to resubmit. */
export function ApplicationStatusCard({
  application,
}: {
  application: PartnerApplication;
}) {
  const { t } = useTranslation();
  const reason = application.verificationReview.rejectionReason;

  const message = (() => {
    switch (application.onboardingStatus) {
      case "submitted":
        return {
          icon: "hourglass_top",
          tone: "blue" as const,
          text: t(
            "resubmit.status.submitted",
            "Your application is under review. We'll email you once it's approved.",
          ),
        };
      case "approved":
        return {
          icon: "check_circle",
          tone: "green" as const,
          text: t(
            "resubmit.status.approved",
            "Your application is approved. You can sign in to the vendor portal.",
          ),
        };
      case "rejected":
        return {
          icon: "cancel",
          tone: "red" as const,
          text: reason
            ? t("resubmit.status.rejectedWithReason", {
                reason,
                defaultValue: "Your application was not approved: {{reason}}",
              })
            : t(
                "resubmit.status.rejected",
                "Your application was not approved. Please contact support.",
              ),
        };
      default:
        return {
          icon: "edit_note",
          tone: "blue" as const,
          text: t(
            "resubmit.status.draft",
            "Your application hasn't been submitted yet. Please complete onboarding.",
          ),
        };
    }
  })();

  return (
    <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
      <h1 className="font-display text-2xl font-bold mb-4">
        {application.name}
      </h1>
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${TONE_CLASSES[message.tone]}`}
      >
        <Icon name={message.icon} className="text-xl" />
        <p className="text-sm font-medium">{message.text}</p>
      </div>
    </div>
  );
}
