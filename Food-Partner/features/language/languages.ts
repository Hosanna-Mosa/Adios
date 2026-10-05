import type { SupportedLanguage } from "@/contexts/languageStore";

// Native names are not translated: a partner looks for their own script.
export const LANGUAGES: { code: SupportedLanguage; native: string; english: string; glyph: string }[] = [
  { code: "en", native: "English", english: "English", glyph: "Aa" },
  { code: "te", native: "తెలుగు", english: "Telugu", glyph: "అ" },
  { code: "hi", native: "हिन्दी", english: "Hindi", glyph: "अ" },
];
