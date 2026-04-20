import client from './client';
import type { Course, Lesson } from '../types/user';

interface ServerCourse {
  id: number;
  title: string;
  description: string;
  level: number;
  order_index: number;
  is_free: boolean;
  created_at?: string;
}

interface ServerLesson {
  id: number;
  course_id: number;
  song_id?: number | null;
  title: string;
  description: string;
  order_index: number;
  type: string;
  content?: string;
  created_at?: string;
}

function toCourse(raw: ServerCourse): Course {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    level: raw.level,
    orderIndex: raw.order_index,
    isFree: raw.is_free,
    lessons: [], // populated separately via getLessons(course.id)
  };
}

function toLesson(raw: ServerLesson): Lesson {
  return {
    id: raw.id,
    courseId: raw.course_id,
    title: raw.title,
    description: raw.description,
    orderIndex: raw.order_index,
    type: (raw.type as Lesson['type']) ?? 'practice',
    songId: raw.song_id ?? undefined,
  };
}

export async function getCourses(): Promise<Course[]> {
  const { data } = await client.get<{ data: ServerCourse[] }>('/courses');
  return data.data.map(toCourse);
}

export async function getLessons(courseId: number): Promise<Lesson[]> {
  const { data } = await client.get<{ data: ServerLesson[] }>(
    `/courses/${courseId}/lessons`,
  );
  return data.data.map(toLesson);
}

export async function getLesson(lessonId: number): Promise<Lesson> {
  // Server returns { lesson, song? } — extract just the lesson.
  const { data } = await client.get<{ data: { lesson: ServerLesson } }>(
    `/lessons/${lessonId}`,
  );
  return toLesson(data.data.lesson);
}

export async function completeLesson(
  lessonId: number,
  score: number,
): Promise<{ stars: number; xp: number } | null> {
  const { data } = await client.post<{
    data: { progress: { stars: number }; xp: number };
  }>(`/lessons/${lessonId}/complete`, { score });
  return {
    stars: data.data.progress.stars,
    xp: data.data.xp,
  };
}
