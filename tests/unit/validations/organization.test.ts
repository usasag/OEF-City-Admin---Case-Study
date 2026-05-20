import { describe, it, expect } from 'vitest';
import { organizationSchema } from '@/lib/validations';

describe('organizationSchema boundary tests', () => {
  describe('name field', () => {
    it('accepts a 1-character name (minimum boundary)', () => {
      const result = organizationSchema.safeParse({ name: 'A', slug: 'a' });
      expect(result.success).toBe(true);
    });

    it('accepts a 100-character name (maximum boundary)', () => {
      const name = 'a'.repeat(100);
      const result = organizationSchema.safeParse({ name, slug: 'valid-slug' });
      expect(result.success).toBe(true);
    });

    it('rejects an empty name', () => {
      const result = organizationSchema.safeParse({ name: '', slug: 'valid-slug' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameIssue = result.error.issues.find((i) => i.path[0] === 'name');
        expect(nameIssue).toBeDefined();
      }
    });

    it('rejects a 101-character name (exceeds maximum)', () => {
      const name = 'a'.repeat(101);
      const result = organizationSchema.safeParse({ name, slug: 'valid-slug' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameIssue = result.error.issues.find((i) => i.path[0] === 'name');
        expect(nameIssue).toBeDefined();
      }
    });
  });

  describe('slug field', () => {
    it('accepts a 1-character slug (minimum boundary)', () => {
      const result = organizationSchema.safeParse({ name: 'Org', slug: 'a' });
      expect(result.success).toBe(true);
    });

    it('accepts a 50-character slug (maximum boundary)', () => {
      const slug = 'a'.repeat(50);
      const result = organizationSchema.safeParse({ name: 'Org', slug });
      expect(result.success).toBe(true);
    });

    it('accepts a slug with hyphens and numbers', () => {
      const result = organizationSchema.safeParse({ name: 'Org', slug: 'my-org-123' });
      expect(result.success).toBe(true);
    });

    it('rejects an empty slug', () => {
      const result = organizationSchema.safeParse({ name: 'Org', slug: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const slugIssue = result.error.issues.find((i) => i.path[0] === 'slug');
        expect(slugIssue).toBeDefined();
      }
    });

    it('rejects a 51-character slug (exceeds maximum)', () => {
      const slug = 'a'.repeat(51);
      const result = organizationSchema.safeParse({ name: 'Org', slug });
      expect(result.success).toBe(false);
      if (!result.success) {
        const slugIssue = result.error.issues.find((i) => i.path[0] === 'slug');
        expect(slugIssue).toBeDefined();
      }
    });

    it('rejects a slug with uppercase letters', () => {
      const result = organizationSchema.safeParse({ name: 'Org', slug: 'My-Org' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const slugIssue = result.error.issues.find((i) => i.path[0] === 'slug');
        expect(slugIssue).toBeDefined();
      }
    });

    it('rejects a slug with spaces', () => {
      const result = organizationSchema.safeParse({ name: 'Org', slug: 'my org' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const slugIssue = result.error.issues.find((i) => i.path[0] === 'slug');
        expect(slugIssue).toBeDefined();
      }
    });

    it('rejects a slug with special characters', () => {
      const result = organizationSchema.safeParse({ name: 'Org', slug: 'my_org!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const slugIssue = result.error.issues.find((i) => i.path[0] === 'slug');
        expect(slugIssue).toBeDefined();
      }
    });
  });
});
