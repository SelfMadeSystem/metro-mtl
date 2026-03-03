import { promises as fs } from "fs";
import path from "path";

/**
 * Checks if a file exists in the given directory.
 * @param dir - The directory to check in.
 * @param filename - The name of the file to check for.
 * @returns A promise that resolves to true if the file exists, false otherwise.
 */

export async function fileExists(
  dir: string,
  filename: string,
): Promise<boolean> {
  try {
    const filePath = path.join(dir, filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
