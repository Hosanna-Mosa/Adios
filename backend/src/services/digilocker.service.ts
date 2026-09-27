/**
 * @deprecated Kept as a compatibility shim.
 *
 * The DigiLocker integration now lives in `src/services/digilocker/` (provider
 * layer: OAuth2 + PKCE, live and sandbox) and `src/modules/digilocker/`
 * (routes, middleware-guarded controllers, session persistence).
 *
 * Import from `../services/digilocker` instead. This file only re-exports, so
 * older imports of `digilockerService` keep resolving.
 */

export {
  digilockerProvider,
  digilockerSandbox,
  digilockerConfig,
  isDigilockerConfigured,
  logDigilockerConfig,
} from "./digilocker";

export * from "./digilocker/digilocker.types";

import { digilockerProvider } from "./digilocker";

/** @deprecated Use `digilockerProvider` (or the DigiLocker module service). */
export const digilockerService = digilockerProvider;
