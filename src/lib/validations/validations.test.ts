import { describe, it, expect } from 'vitest';
import { citySchema } from './city';
import { climateActionSchema } from './climate-action';
import { importTextSchema } from './import';

const currentYear = new Date().getFullYear();

describe('citySchema', () => {
  it('accepts valid city data', () => {
    const result = citySchema.safeParse({
      name: 'Portland',
      baselineEmissions: 5000,
      targetYear: currentYear + 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = citySchema.safeParse({
      name: '',
      baselineEmissions: 5000,
      targetYear: currentYear + 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects name over 100 characters', () => {
    const result = citySchema.safeParse({
      name: 'a'.repeat(101),
      baselineEmissions: 5000,
      targetYear: currentYear + 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects baselineEmissions below 0.01', () => {
    const result = citySchema.safeParse({
      name: 'Test',
      baselineEmissions: 0,
      targetYear: currentYear + 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects baselineEmissions above max', () => {
    const result = citySchema.safeParse({
      name: 'Test',
      baselineEmissions: 1_000_000_000,
      targetYear: currentYear + 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects targetYear equal to current year', () => {
    const result = citySchema.safeParse({
      name: 'Test',
      baselineEmissions: 100,
      targetYear: currentYear,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer targetYear', () => {
    const result = citySchema.safeParse({
      name: 'Test',
      baselineEmissions: 100,
      targetYear: currentYear + 1.5,
    });
    expect(result.success).toBe(false);
  });
});

describe('climateActionSchema', () => {
  it('accepts valid climate action data', () => {
    const result = climateActionSchema.safeParse({
      title: 'Electric bus fleet',
      sector: 'transport',
      annualReduction: 500,
      status: 'planned',
      startYear: 2025,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = climateActionSchema.safeParse({
      title: '',
      sector: 'transport',
      annualReduction: 500,
      status: 'planned',
      startYear: 2025,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sector', () => {
    const result = climateActionSchema.safeParse({
      title: 'Test',
      sector: 'invalid_sector',
      annualReduction: 500,
      status: 'planned',
      startYear: 2025,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = climateActionSchema.safeParse({
      title: 'Test',
      sector: 'energy',
      annualReduction: 500,
      status: 'cancelled',
      startYear: 2025,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative annualReduction', () => {
    const result = climateActionSchema.safeParse({
      title: 'Test',
      sector: 'energy',
      annualReduction: -1,
      status: 'planned',
      startYear: 2025,
    });
    expect(result.success).toBe(false);
  });

  it('rejects startYear below 2000', () => {
    const result = climateActionSchema.safeParse({
      title: 'Test',
      sector: 'energy',
      annualReduction: 100,
      status: 'planned',
      startYear: 1999,
    });
    expect(result.success).toBe(false);
  });

  it('rejects startYear above 2100', () => {
    const result = climateActionSchema.safeParse({
      title: 'Test',
      sector: 'energy',
      annualReduction: 100,
      status: 'planned',
      startYear: 2101,
    });
    expect(result.success).toBe(false);
  });
});

describe('importTextSchema', () => {
  it('accepts valid import text', () => {
    const result = importTextSchema.safeParse({
      text: 'Some climate action description',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty text', () => {
    const result = importTextSchema.safeParse({ text: '' });
    expect(result.success).toBe(false);
  });

  it('rejects text over 10000 characters', () => {
    const result = importTextSchema.safeParse({ text: 'a'.repeat(10001) });
    expect(result.success).toBe(false);
  });

  it('accepts text at exactly 10000 characters', () => {
    const result = importTextSchema.safeParse({ text: 'a'.repeat(10000) });
    expect(result.success).toBe(true);
  });
});
