import { level1Lessons } from './seedData';
import { ILesson } from '../models/Lesson';

/**
 * Validation tests for seedData.ts constraints
 * Validates that the seed data meets all model requirements:
 * - Exactly 8 lessons (no Lesson 9)
 * - Each lesson has exactly 5 exercises (3-20 constraint)
 * - Each lesson has exactly 3 objectives (1-5 constraint)
 * - All lessonNumbers are 1-8
 */
describe('seedData.ts Validation', () => {
  describe('Lesson count constraints', () => {
    test('should have exactly 8 lessons for Level 1', () => {
      expect(level1Lessons).toHaveLength(8);
    });

    test('should not have a Lesson 9 (only 1-8)', () => {
      const lesson9 = level1Lessons.find((lesson: any) => lesson.lessonNumber === 9);
      expect(lesson9).toBeUndefined();
    });
  });

  describe('Lesson number constraints', () => {
    test('all lessons should have lessonNumber between 1 and 8', () => {
      level1Lessons.forEach((lesson: any) => {
        expect(lesson.lessonNumber).toBeGreaterThanOrEqual(1);
        expect(lesson.lessonNumber).toBeLessThanOrEqual(8);
      });
    });

    test('lessonNumbers should be sequential 1-8', () => {
      const lessonNumbers = level1Lessons
        .map((lesson: any) => lesson.lessonNumber)
        .sort((a, b) => a - b);
      expect(lessonNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('Exercise count constraints', () => {
    test('each lesson should have exactly 5 exercises', () => {
      level1Lessons.forEach((lesson: any, index: number) => {
        expect(lesson.exercises).toBeDefined();
        expect(lesson.exercises).toHaveLength(5);
      });
    });

    test('all exercises should be within valid range (3-20)', () => {
      level1Lessons.forEach((lesson: any) => {
        const exerciseCount = lesson.exercises.length;
        expect(exerciseCount).toBeGreaterThanOrEqual(3);
        expect(exerciseCount).toBeLessThanOrEqual(20);
      });
    });

    test('each exercise should have required fields', () => {
      level1Lessons.forEach((lesson: any) => {
        lesson.exercises.forEach((exercise: any) => {
          expect(exercise.type).toBeDefined();
          expect(['multiple-choice', 'listening', 'reading']).toContain(exercise.type);
          expect(exercise.question).toBeDefined();
          expect(exercise.question.length).toBeGreaterThan(0);
          expect(exercise.correctAnswers).toBeDefined();
          expect(Array.isArray(exercise.correctAnswers)).toBe(true);
          expect(exercise.correctAnswers.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Objectives constraints', () => {
    test('each lesson should have exactly 3 objectives', () => {
      level1Lessons.forEach((lesson: any, index: number) => {
        expect(lesson.content.objectives).toBeDefined();
        expect(lesson.content.objectives).toHaveLength(3);
      });
    });

    test('all objectives should be within valid range (1-5)', () => {
      level1Lessons.forEach((lesson: any) => {
        const objectiveCount = lesson.content.objectives.length;
        expect(objectiveCount).toBeGreaterThanOrEqual(1);
        expect(objectiveCount).toBeLessThanOrEqual(5);
      });
    });

    test('each objective should be a non-empty string', () => {
      level1Lessons.forEach((lesson: any) => {
        lesson.content.objectives.forEach((objective: string) => {
          expect(typeof objective).toBe('string');
          expect(objective.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Lesson structure validation', () => {
    test('each lesson should have all required fields', () => {
      level1Lessons.forEach((lesson: any) => {
        expect(lesson.levelId).toBe(1);
        expect(lesson.title).toBeDefined();
        expect(lesson.title.length).toBeGreaterThan(0);
        expect(lesson.description).toBeDefined();
        expect(lesson.description.length).toBeGreaterThan(0);
        expect(lesson.content).toBeDefined();
        expect(lesson.content.introduction).toBeDefined();
        expect(lesson.content.mainContent).toBeDefined();
        expect(lesson.content.summary).toBeDefined();
      });
    });

    test('each lesson content should have valid introduction and summary', () => {
      level1Lessons.forEach((lesson: any) => {
        expect(lesson.content.introduction.length).toBeGreaterThanOrEqual(10);
        expect(lesson.content.summary.length).toBeGreaterThanOrEqual(20);
        expect(lesson.content.mainContent.length).toBeGreaterThanOrEqual(50);
      });
    });
  });

  describe('Export verification', () => {
    test('level1Lessons should be an array', () => {
      expect(Array.isArray(level1Lessons)).toBe(true);
    });

    test('all lessons should have consistent structure', () => {
      const firstLesson = level1Lessons[0];
      if (firstLesson) {
        level1Lessons.forEach((lesson: any) => {
          expect(Object.keys(lesson).sort()).toEqual(Object.keys(firstLesson).sort());
        });
      }
    });
  });

  describe('Summary validation report', () => {
    test('generate validation summary', () => {
      const summary = {
        totalLessons: level1Lessons.length,
        levelId: 'All 1',
        lessonNumbers: level1Lessons.map((l: any) => l.lessonNumber).sort((a, b) => a - b),
        exerciseCounts: level1Lessons.map((l: any) => l.exercises.length),
        objectiveCounts: level1Lessons.map((l: any) => l.content.objectives.length),
        allExerciseCountsValid: level1Lessons.every((l: any) => l.exercises.length >= 3 && l.exercises.length <= 20),
        allObjectiveCountsValid: level1Lessons.every(
          (l: any) => l.content.objectives.length >= 1 && l.content.objectives.length <= 5
        ),
      };

      console.log('Validation Summary:', JSON.stringify(summary, null, 2));

      expect(summary.totalLessons).toBe(8);
      expect(summary.lessonNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(summary.exerciseCounts.every((count: number) => count === 5)).toBe(true);
      expect(summary.objectiveCounts.every((count: number) => count === 3)).toBe(true);
      expect(summary.allExerciseCountsValid).toBe(true);
      expect(summary.allObjectiveCountsValid).toBe(true);
    });
  });
});
