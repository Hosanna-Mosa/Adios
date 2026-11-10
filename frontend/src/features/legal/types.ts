/** A run of text inside a block; `bold` mirrors bold text in the source PDF. */
export type LegalRun = [text: string, bold: boolean];

export type LegalBlock = {
  type: "p" | "li" | "h3";
  runs: LegalRun[];
};

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalAudience = "customers" | "partners" | "restaurants";
export type LegalKind = "terms" | "terms-of-use" | "privacy" | "cookies";
export type LegalType = "terms" | "privacy" | "cookies";

/** One legal document, parsed from the official Adios PDFs. */
export type LegalDoc = {
  id: string;
  title: string;
  audience: LegalAudience;
  kind: LegalKind;
  meta: string[];
  intro: LegalBlock[];
  sections: LegalSection[];
};

export const LEGAL_TYPES: LegalType[] = ["terms", "privacy", "cookies"];
export const LEGAL_AUDIENCES: LegalAudience[] = [
  "customers",
  "partners",
  "restaurants",
];

/** Each content file is loaded only when its page is opened. */
export const LEGAL_LOADERS: Record<LegalType, () => Promise<LegalDoc[]>> = {
  terms: () =>
    import("./content/terms.json").then(
      (m) => m.default as unknown as LegalDoc[],
    ),
  privacy: () =>
    import("./content/privacy.json").then(
      (m) => m.default as unknown as LegalDoc[],
    ),
  cookies: () =>
    import("./content/cookies.json").then(
      (m) => m.default as unknown as LegalDoc[],
    ),
};
