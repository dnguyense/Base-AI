import { v4 as uuidv4 } from 'uuid';

export const seedTestId = (prefix: string = 'test'): string => {
  return `${prefix}-${uuidv4()}`;
};

export const defaultCompressionOptions = {
  quality: 'medium',
  removeMetadata: true,
  removeAnnotations: false,
  optimizeImages: true,
};

export const testUsers = {
  basic: {
    email: 'basic-user@example.com',
    password: 'Password123!',
    firstName: 'Basic',
    lastName: 'User',
  },
  pro: {
    email: 'pro-user@example.com',
    password: 'Password123!',
    firstName: 'Pro',
    lastName: 'User',
  },
};

export const createMockUpload = (overrides: Partial<{ id: string; name: string; size: number }> = {}) => ({
  id: overrides.id ?? seedTestId('file'),
  originalName: overrides.name ?? 'sample.pdf',
  name: overrides.name ?? 'sample.pdf',
  size: overrides.size ?? 1024,
  storageName: `${overrides.id ?? seedTestId('file')}.pdf`,
});
