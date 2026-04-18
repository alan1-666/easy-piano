import { create } from 'zustand';
import type { Course, Lesson, UserProgress } from '../types/user';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  progressMap: Record<number, UserProgress>;

  fetchCourses: () => Promise<void>;
  fetchLessons: (courseId: number) => Promise<void>;
  completeLesson: (lessonId: number, score: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  currentCourse: null,
  progressMap: {},

  fetchCourses: async () => {
    // TODO: call courses API
    set({ courses: [] });
  },

  fetchLessons: async (_courseId: number) => {
    // TODO: call lessons API
  },

  completeLesson: async (_lessonId: number, _score: number) => {
    // TODO: call complete lesson API
  },
}));
