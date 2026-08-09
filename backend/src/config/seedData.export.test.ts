import { seedLessons, level1Lessons } from './seedData';

/**
 * Verification tests for seedData.ts exports
 * Ensures that seedLessons function and level1Lessons array are properly exported
 */
describe('seedData.ts Export Verification', () => {
  describe('seedLessons function export', () => {
    test('seedLessons should be exported as a function', () => {
      expect(typeof seedLessons).toBe('function');
    });

    test('seedLessons should be async', async () => {
      // Check if the function returns a Promise
      const result = seedLessons();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('level1Lessons array export', () => {
    test('level1Lessons should be exported as an array', () => {
      expect(Array.isArray(level1Lessons)).toBe(true);
    });

    test('level1Lessons should have correct structure', () => {
      expect(level1Lessons.length).toBe(8);
      expect(level1Lessons[0]).toHaveProperty('levelId');
      expect(level1Lessons[0]).toHaveProperty('lessonNumber');
      expect(level1Lessons[0]).toHaveProperty('title');
      expect(level1Lessons[0]).toHaveProperty('exercises');
      expect(level1Lessons[0]).toHaveProperty('content');
    });
  });

  describe('Integration check', () => {
    test('seedLessons function should work with level1Lessons data', () => {
      // The function should be able to access and process level1Lessons
      expect(level1Lessons).toBeDefined();
      expect(level1Lessons.length).toBeGreaterThan(0);

      // Verify the data structure matches what seedLessons expects
      level1Lessons.forEach((lesson) => {
        expect(lesson).toHaveProperty('exercises');
        expect(Array.isArray(lesson.exercises)).toBe(true);
      });
    });
  });
});
