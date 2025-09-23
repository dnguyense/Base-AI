import type { Express } from 'express';
import fs from 'fs-extra';

export const cleanupUploadedFiles = async (files: Express.Multer.File[] = []): Promise<void> => {
  await Promise.all(
    files.map(async (file) => {
      if (!file?.path) {
        return;
      }

      try {
        await fs.remove(file.path);
      } catch {
        // Ignore cleanup errors to avoid masking the original issue
      }
    })
  );
};

export const calculateTotalUploadSize = (files: Express.Multer.File[] = []): number => {
  return files.reduce((total, file) => total + (file?.size ?? 0), 0);
};
