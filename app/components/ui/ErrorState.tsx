import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "./EmptyState";

interface Props {
  /** Omit where the screen has nothing to re-run; the button is then left out. */
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * "Couldn't load, tap to retry" — the shared state for a list or screen whose
 * request failed and has nothing cached to show. Same layout as EmptyState, so
 * it sits in any spot an empty list would; without it a failed load read as an
 * empty one ("No orders yet", "Services aren't available here").
 */
export function ErrorState({ onRetry, title, subtitle }: Props) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title={title ?? t("app.ErrorState.title")}
      subtitle={subtitle ?? t("app.ErrorState.subtitle")}
      actionLabel={t("app.ErrorState.retry")}
      onAction={onRetry}
    />
  );
}
