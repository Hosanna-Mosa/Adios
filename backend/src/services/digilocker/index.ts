import { digilockerConfig, isDigilockerConfigured, logDigilockerConfig } from "./digilocker.config";
import { DigiLockerLiveProvider } from "./digilocker.live.provider";
import { DigiLockerSandboxProvider } from "./digilocker.sandbox.provider";
import { IDigiLockerProvider } from "./digilocker.types";

/**
 * Provider factory.
 *
 * Everything above this file talks to `digilockerProvider` and never learns
 * whether it is hitting the real DigiLocker or the sandbox — switching is one
 * env var (DIGILOCKER_MODE) plus real credentials.
 */

const sandboxProvider = new DigiLockerSandboxProvider();

export const digilockerProvider: IDigiLockerProvider = digilockerConfig.isSandbox
  ? sandboxProvider
  : new DigiLockerLiveProvider();

/**
 * The sandbox provider, for the sandbox consent routes only.
 * Returns null in live mode so those routes stay unmounted in production.
 */
export const digilockerSandbox: DigiLockerSandboxProvider | null = digilockerConfig.isSandbox
  ? sandboxProvider
  : null;

export { digilockerConfig, isDigilockerConfigured, logDigilockerConfig };
export * from "./digilocker.types";
export * from "./digilocker.errors";
export * from "./digilocker.parsers";
export { renderCallbackPage, setDigilockerPageCsp } from "./digilocker.pages";
export { SANDBOX_PERSONAS, getPersona } from "./digilocker.personas";
