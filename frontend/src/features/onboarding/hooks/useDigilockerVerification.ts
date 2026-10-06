import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../lib/api-client";
import type { DigilockerKyc } from "../types";

type Status = "idle" | "starting" | "pending" | "linked" | "failed";

interface StartResponse {
  sessionId: string;
  accessKey: string;
  authUrl: string;
  sandbox: boolean;
}

interface ResultResponse {
  status: "pending" | "linked" | "failed" | "expired" | "revoked";
  sandbox: boolean;
  kyc?: DigilockerKyc;
  error?: string;
}

const POLL_INTERVAL_MS = 3000;
const POPUP_FEATURES = "width=520,height=720,menubar=no,toolbar=no";

/**
 * Owner KYC through DigiLocker for the partner website.
 *
 * Consent runs in a popup on the backend's DigiLocker pages; this hook polls
 * the backend until the consent is linked and the owner's Aadhaar/PAN have
 * been read. The session's access key never leaves memory — it is what the
 * final submission uses to prove this browser ran the consent.
 */
export function useDigilockerVerification(
  onVerified?: (kyc: DigilockerKyc) => void,
) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("idle");
  const [kyc, setKyc] = useState<DigilockerKyc | null>(null);
  const [error, setError] = useState("");
  const [sandbox, setSandbox] = useState(false);
  const sessionRef = useRef<{ id: string; key: string } | null>(null);
  const popupRef = useRef<Window | null>(null);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;

  const start = useCallback(
    async (verifiedMobile?: string) => {
      // Opened synchronously inside the click handler so popup blockers allow it.
      const popup = window.open("", "adios-digilocker", POPUP_FEATURES);
      popupRef.current = popup;
      setStatus("starting");
      setError("");
      setKyc(null);
      sessionRef.current = null;

      try {
        const res = await apiFetch<StartResponse>(
          "/vendors/onboarding/digilocker/session",
          {
            method: "POST",
            body: JSON.stringify(
              /^\d{10}$/.test(verifiedMobile || "") ? { verifiedMobile } : {},
            ),
          },
        );
        sessionRef.current = { id: res.sessionId, key: res.accessKey };
        setSandbox(res.sandbox);

        if (popup && !popup.closed) {
          popup.location.href = res.authUrl;
        } else {
          // Blocked popup: fall back to a tab. Polling still picks the result up.
          popupRef.current = window.open(res.authUrl, "_blank");
        }
        setStatus("pending");
      } catch (err) {
        popup?.close();
        setStatus("failed");
        setError(
          (err as Error)?.message ||
            t(
              "onboarding.digilocker.startFailed",
              "Could not start DigiLocker verification. Please try again.",
            ),
        );
      }
    },
    [t],
  );

  const reset = useCallback(() => {
    popupRef.current?.close();
    sessionRef.current = null;
    setStatus("idle");
    setKyc(null);
    setError("");
  }, []);

  useEffect(() => {
    if (status !== "pending") return;

    let cancelled = false;
    const poll = async () => {
      const session = sessionRef.current;
      if (!session) return;
      // Read before the request: the callback page links the session before it
      // closes itself, so a window closed by then with no result was abandoned.
      const popupClosed = Boolean(popupRef.current?.closed);

      try {
        const res = await apiFetch<ResultResponse>(
          `/vendors/onboarding/digilocker/session/${encodeURIComponent(session.id)}`,
          { headers: { "X-DigiLocker-Key": session.key } },
        );
        if (cancelled) return;

        if (res.status === "linked" && res.kyc) {
          setKyc(res.kyc);
          setStatus("linked");
          onVerifiedRef.current?.(res.kyc);
        } else if (res.status !== "pending") {
          setStatus("failed");
          setError(
            res.error ||
              t(
                "onboarding.digilocker.notCompleted",
                "DigiLocker verification did not complete. Please try again.",
              ),
          );
        } else if (popupClosed) {
          setStatus("failed");
          setError(
            t(
              "onboarding.digilocker.windowClosed",
              "The DigiLocker window was closed before verification finished.",
            ),
          );
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("failed");
        setError(
          (err as Error)?.message ||
            t(
              "onboarding.digilocker.notCompleted",
              "DigiLocker verification did not complete. Please try again.",
            ),
        );
      }
    };

    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [status, t]);

  /** Sent with a submission so the backend can attach the verified identity. */
  const credentials =
    status === "linked" && sessionRef.current
      ? {
          digilockerSessionId: sessionRef.current.id,
          digilockerKey: sessionRef.current.key,
        }
      : null;

  return { status, kyc, error, sandbox, start, reset, credentials };
}

export type DigilockerVerification = ReturnType<
  typeof useDigilockerVerification
>;
