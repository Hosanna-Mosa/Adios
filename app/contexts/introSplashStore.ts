import { create } from 'zustand';

interface IntroSplashState {
  /**
   * True once the existing brand-coloured "ADIOS" arrival-animation splash inside
   * app/index.tsx (features/home/useAuth.ts) has played out. In-memory only —
   * intentionally not persisted, since the splash is meant to play once per
   * cold start. app/_layout.tsx's routing gate waits for this before doing
   * any redirect (to select-language, login, or tabs), so that splash is
   * never cut short by an immediate navigation away from "/".
   */
  introSplashDone: boolean;
  setIntroSplashDone: () => void;
}

export const useIntroSplashStore = create<IntroSplashState>((set) => ({
  introSplashDone: false,
  setIntroSplashDone: () => set({ introSplashDone: true }),
}));
