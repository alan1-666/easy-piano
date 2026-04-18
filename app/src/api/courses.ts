import client from './client';
import type { Course, Lesson } from '../types/user';

export async function getCourses(): Promise<Course[]> {
  const { data } = await client.get('/courses');
  return data.data;
}

export async function getLessons(courseId: number): Promise<Lesson[]> {
  const { data } = await client.get(`/courses/${courseId}/lessons`);
  return data.data;
}

export async function getLesson(lessonId: number): Promise<Lesson> {
  const { data } = await client.get(`/lessons/${lessonId}`);
  return data.data;
}

export async function completeLesson(lessonId: number, score: number): Promise<void> {
  await client.post(`/lessons/${lessonId}/complete`, { score });
}
