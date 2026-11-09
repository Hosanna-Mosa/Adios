import { useCallback, useEffect, useState } from "react";
import type { ExpoSpeechRecognitionModule as SpeechModule, useSpeechRecognitionEvent as UseSpeechEvent } from "expo-speech-recognition";
import i18n from "i18next";

// The package needs its native module, which Expo Go and builds made before it was added do not
// contain; importing it there throws at load. Load it defensively so the app still starts and
// the mic is simply hidden (isVoiceSearchAvailable is false) until the dev build is rebuilt.
let ExpoSpeechRecognitionModule: typeof SpeechModule | null = null;
let useSpeechRecognitionEvent: typeof UseSpeechEvent = (() => {}) as unknown as typeof UseSpeechEvent;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch {
  /* native module missing in this build */
}

// Speech to text through the recognizer already on the phone (Google's on
// Android, Apple's on iOS). Nothing is uploaded to our backend.

export type VoiceStatus = "idle" | "listening" | "error";
export type VoiceError = "permission" | "noSpeech" | "network" | "unavailable" | "other";

const LOCALES: Record<string, string> = { en: "en-IN", hi: "hi-IN", te: "te-IN" };

/** False on phones with no recognizer (e.g. no Google services): hide the mic there. */
export function isVoiceSearchAvailable(): boolean {
  try {
    return !!ExpoSpeechRecognitionModule && ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

function toError(code: string): VoiceError {
  switch (code) {
    case "not-allowed":
      return "permission";
    case "no-speech":
    case "speech-timeout":
      return "noSpeech";
    case "network":
      return "network";
    case "service-not-allowed":
    case "language-not-supported":
      return "unavailable";
    default:
      return "other";
  }
}

export function useVoiceRecognition(onFinal: (text: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<VoiceError | null>(null);

  useSpeechRecognitionEvent("start", () => setStatus("listening"));
  useSpeechRecognitionEvent("result", (e) => {
    const text = e.results?.[0]?.transcript ?? "";
    setTranscript(text);
    if (e.isFinal && text.trim()) onFinal(text);
  });
  useSpeechRecognitionEvent("error", (e) => {
    // "aborted" is our own cancel, not a failure.
    if (e.error === "aborted") return;
    setError(toError(e.error));
    setStatus("error");
  });
  useSpeechRecognitionEvent("end", () => setStatus((s) => (s === "error" ? s : "idle")));

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    try {
      const perm = await ExpoSpeechRecognitionModule!.requestPermissionsAsync();
      if (!perm.granted) {
        setError("permission");
        setStatus("error");
        return;
      }
      if (!isVoiceSearchAvailable()) {
        setError("unavailable");
        setStatus("error");
        return;
      }
      setStatus("listening");
      ExpoSpeechRecognitionModule!.start({
        lang: LOCALES[i18n.language] ?? "en-IN",
        interimResults: true,
        continuous: false,
      });
    } catch {
      setError("other");
      setStatus("error");
    }
  }, []);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule?.stop();
    } catch {
      /* nothing running */
    }
  }, []);

  const cancel = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule?.abort();
    } catch {
      /* nothing running */
    }
    setStatus("idle");
    setTranscript("");
    setError(null);
  }, []);

  // Never leave the microphone open if the screen goes away mid-listen.
  useEffect(() => cancel, [cancel]);

  return { status, transcript, error, start, stop, cancel };
}
