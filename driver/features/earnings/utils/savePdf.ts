import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const FOLDER_KEY = "statement_save_folder";

export type SaveOutcome =
  /** Written into the folder the driver chose (Android). */
  | { kind: "saved"; fileUri: string }
  /** Handed to the share sheet (iOS has no downloads folder; "Save to Files" is how it is kept). */
  | { kind: "shared" }
  /** The driver backed out of choosing a folder. */
  | { kind: "cancelled" };

/** Android: has the driver already chosen where statements go? */
export async function hasSaveFolder(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  return !!(await AsyncStorage.getItem(FOLDER_KEY).catch(() => null));
}

export async function shareFile(uri: string, dialogTitle: string) {
  if (!(await Sharing.isAvailableAsync())) throw new Error("sharing unavailable");
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle });
}

/**
 * Keeps a generated PDF on the phone.
 *
 * Android: written straight into a folder the driver picks once (remembered after that), so
 * "Download" saves without more taps. Android 11+ won't let an app be given the Downloads folder
 * itself, so the driver chooses (or makes) any other folder, e.g. Documents.
 * iOS: the share sheet, whose "Save to Files" is the only way to keep a file.
 *
 * `name` has no extension; the system adds ".pdf".
 */
export async function savePdf(tempUri: string, name: string, shareTitle: string): Promise<SaveOutcome> {
  if (Platform.OS !== "android") {
    await shareFile(tempUri, shareTitle);
    return { kind: "shared" };
  }

  const saf = FileSystem.StorageAccessFramework;
  const base64 = await FileSystem.readAsStringAsync(tempUri, { encoding: FileSystem.EncodingType.Base64 });
  const writeInto = async (folderUri: string) => {
    const fileUri = await saf.createFileAsync(folderUri, name, "application/pdf");
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
    return fileUri;
  };

  const remembered = await AsyncStorage.getItem(FOLDER_KEY).catch(() => null);
  if (remembered) {
    try {
      return { kind: "saved", fileUri: await writeInto(remembered) };
    } catch {
      // The folder was deleted or its permission was taken back: choose again below.
      await AsyncStorage.removeItem(FOLDER_KEY).catch(() => {});
    }
  }

  const permission = await saf.requestDirectoryPermissionsAsync(saf.getUriForDirectoryInRoot("Documents"));
  if (!permission.granted) return { kind: "cancelled" };
  await AsyncStorage.setItem(FOLDER_KEY, permission.directoryUri).catch(() => {});
  return { kind: "saved", fileUri: await writeInto(permission.directoryUri) };
}
