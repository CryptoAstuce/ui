import { describe, expect, it } from 'vitest';

import { formatAmount, shortAddress } from './format';

describe('shortAddress', () => {
  it('abbreviates a full address', () => {
    expect(shortAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234…5678');
  });

  it('leaves values that already fit untouched', () => {
    expect(shortAddress('0x1234')).toBe('0x1234');
  });

  it('never throws on missing values', () => {
    expect(shortAddress(null)).toBe('—');
    expect(shortAddress(undefined)).toBe('—');
    expect(shortAddress('')).toBe('—');
  });

  it('honours custom lead/tail', () => {
    expect(shortAddress('0x1234567890abcdef', 4, 2)).toBe('0x12…ef');
  });
});

describe('formatAmount', () => {
  it('formats positive amounts', () => {
    expect(formatAmount('0', 18)).toBe('0');
    expect(formatAmount('1000000000000000000', 18)).toBe('1');
    expect(formatAmount('1500000000000000000', 18)).toBe('1.5');
    expect(formatAmount('123456', 6)).toBe('0.1234');
  });

  it('keeps the sign on the fractional part of a negative amount', () => {
    // Regression: BigInt `%` keeps the dividend's sign, which used to leak a second
    // `-` into the fraction and render '-1.-5'.
    expect(formatAmount('-1500000000000000000', 18)).toBe('-1.5');
    expect(formatAmount('-1234567000000000000000', 18)).toBe('-1,234.567');
  });

  it('keeps the sign when the magnitude is below one unit', () => {
    // Regression: integer division truncates toward zero, so the whole part alone
    // dropped the sign and this used to render '0.-5'.
    expect(formatAmount('-500000000000000000', 18)).toBe('-0.5');
    expect(formatAmount('-123456', 6)).toBe('-0.1234');
  });

  it('formats whole negative amounts', () => {
    expect(formatAmount('-1000000000000000000', 18)).toBe('-1');
    expect(formatAmount('-1', 0)).toBe('-1');
  });

  it('does not render a negative zero', () => {
    // Too small to survive maxFractionDigits, so it collapses to '0' like the
    // positive side does for '1'.
    expect(formatAmount('1', 18)).toBe('0');
    expect(formatAmount('-1', 18)).toBe('0');
  });

  it('returns the input unchanged when it is not an integer string', () => {
    expect(formatAmount('not-a-number', 18)).toBe('not-a-number');
  });
});
