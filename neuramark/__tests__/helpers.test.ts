import { calculateProgress, formatDate, generateId } from '@/utils/helpers';

describe('helpers', () => {
  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      expect(calculateProgress(5, 10)).toBe(50);
      expect(calculateProgress(0, 10)).toBe(0);
      expect(calculateProgress(10, 10)).toBe(100);
    });

    it('should handle zero total', () => {
      expect(calculateProgress(5, 0)).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2023-12-25';
      expect(formatDate(date)).toBe('December 25th, 2023');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('December 25th, 2023');
    });
  });

  describe('generateId', () => {
    it('should generate a string id', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});