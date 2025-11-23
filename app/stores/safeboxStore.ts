import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Types
 */
export type EvidenceFile = { uri: string; name?: string; size: number }; // size is now required
// types.ts or interfaces.ts

export interface DraftReport {
  id: string;
  title: string;
  crimeType: string;
  dateSaved: string;
  details: string;
  files: { uri: string; name: string; size: number }[];
  status: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  date: string;
}

/**
 * Storage keys
 */
const APP_DIR = `${FileSystem.documentDirectory}yckf_files/`;
const DRAFTS_KEY = "@yckf_safebox_drafts_v2";
const QUEUE_KEY = "upload_queue";

/**
 * Ensure SafeBox directory exists
 */
export async function ensureAppDir() {
  try {
    const info = await FileSystem.getInfoAsync(APP_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(APP_DIR, { intermediates: true });
      console.log("✅ Created SafeBox directory:", APP_DIR);
    }
  } catch (error) {
    console.error("Error creating app directory:", error);
  }
}

/**
 * Copy a file into the SafeBox folder
 */
export async function copyFileToAppDir(
  uri: string,
  filename?: string
): Promise<EvidenceFile> {
    if (!uri) throw new Error("Missing file URI");

  const name = filename ?? uri.split("/").pop() ?? `file-${Date.now()}`;
  const dest = `${APP_DIR}${Date.now()}-${name}`;

  try {
    await ensureAppDir();
    await FileSystem.copyAsync({ from: uri, to: dest });
    const info = await FileSystem.getInfoAsync(dest, { md5: false }); 

    if (!info.exists) {
      console.error("❌ File does not exist after copying:", dest);
      throw new Error("File does not exist after copying");
    }

    console.log("✅ File copied to SafeBox:", dest);
    return { uri: dest, name, size: info.size ?? 0 }; // 'size' is part of the info object returned
  } catch (err) {
    console.error("❌ Error copying file:", err);
    throw err;
  }

}


/**
 * List all locally stored evidence files
 */


export async function listEvidenceFiles(): Promise<EvidenceFile[]> {
  try {
    await ensureAppDir();
    const files = await FileSystem.readDirectoryAsync(APP_DIR);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const path = `${APP_DIR}${file}`;
        const info = await FileSystem.getInfoAsync(path); // Removed { size: true }
        // Check if the file exists before accessing the size property
        return { name: file, uri: path, size: info.exists ? info.size ?? 0 : 0 };
      })
    );
    return fileDetails;
  } catch (err) {
    console.error("Error listing evidence files:", err);
    return [];
  }
}



/**
 * Delete a specific file from the SafeBox
 */
export async function deleteEvidenceFile(uri: string) {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    console.log("🗑️ Deleted file:", uri);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

/**
 * AsyncStorage JSON helpers
 */
async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error reading JSON:", error);
    return null;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing JSON:", error);
  }
}

/**
 * Draft management
 */
export async function getAllDrafts(): Promise<DraftReport[]> {
  return (await readJson<DraftReport[]>(DRAFTS_KEY)) ?? [];
}

export async function saveDraft(draft: DraftReport) {
  const drafts = (await getAllDrafts()).filter((d) => d.id !== draft.id);
  drafts.unshift(draft);
  await writeJson(DRAFTS_KEY, drafts);
  console.log("💾 Draft saved:", draft.id);
}

export async function deleteDraft(id: string) {
  const drafts = (await getAllDrafts()).filter((d) => d.id !== id);
  await writeJson(DRAFTS_KEY, drafts);
  console.log("🗑️ Draft deleted:", id);
}

/**
 * Queue management
 */
export async function getQueue(): Promise<string[]> {
  return (await readJson<string[]>(QUEUE_KEY)) ?? [];
}

export async function enqueueReport(id: string) {
  const queue = await getQueue();
  if (!queue.includes(id)) {
    queue.push(id);
    await writeJson(QUEUE_KEY, queue);
    console.log(`📥 Queued report ${id}`);
  }
}

export async function dequeueReport(id: string) {
  const queue = await getQueue();
  const newQueue = queue.filter((x) => x !== id);
  await writeJson(QUEUE_KEY, newQueue);
  console.log(`📤 Report ${id} removed from queue`);
}
