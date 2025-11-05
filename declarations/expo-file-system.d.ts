// declarations/expo-file-system.d.ts
declare module 'expo-file-system' {
  export const documentDirectory: string | null;
  export function makeDirectoryAsync(path: string, options?: { intermediates?: boolean }): Promise<void>;
  export function copyAsync(options: { from: string; to: string }): Promise<void>;
  export function getInfoAsync(path: string, options?: { size?: boolean; md5?: boolean }): Promise<{ exists: boolean; isDirectory?: boolean; size?: number; md5?: string }>;
  export function readDirectoryAsync(path: string): Promise<string[]>;
  export function deleteAsync(path: string, options?: { idempotent?: boolean }): Promise<void>;
  export function writeAsStringAsync(path: string, contents: string, options?: any): Promise<void>;
  export function readAsStringAsync(path: string, options?: any): Promise<string>;
  export const cacheDirectory: string | null;
  export default {
    documentDirectory: documentDirectory,
    makeDirectoryAsync,
    copyAsync,
    getInfoAsync,
    readDirectoryAsync,
    deleteAsync,
    writeAsStringAsync,
    readAsStringAsync,
    cacheDirectory,
  };
}
