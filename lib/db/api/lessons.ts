import { sql } from '../neonClient';

export interface LessonCreateInput {
  title: string;
  prompt: string;
  tsxCode: string;
  clerkId: string | null;
  tone: string | null;
  audience: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  prompt: string;
  tsx_code: string;
  clerk_id: string;
  created_at: string;
  tone: string | null;
  audience: string | null;
}

export async function saveLesson(input: LessonCreateInput): Promise<Lesson> {
  const rows = await sql`
    INSERT INTO lessons (title, prompt, tsx_code, clerk_id, tone, audience)
    VALUES (${input.title}, ${input.prompt}, ${input.tsxCode}, ${input.clerkId || ''}, ${input.tone || ''}, ${input.audience || ''})
    RETURNING id, title, prompt, tsx_code, clerk_id, created_at, tone, audience
  `;
  return rows[0] as Lesson;
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const rows = await sql`
    SELECT id, title, prompt, tsx_code, clerk_id, created_at, tone, audience
    FROM lessons
    WHERE id = ${id}
  `;
  if (rows.length === 0) return null;
  return rows[0] as Lesson;
}

export async function getLessonsByUser(clerkId: string): Promise<Lesson[]> {
  const rows = await sql`
    SELECT id, title, prompt, tsx_code, clerk_id, created_at, tone, audience
    FROM lessons
    WHERE clerk_id = ${clerkId}
    ORDER BY created_at DESC
  `;
  return rows as Lesson[];
}

export async function deleteLesson(id: string): Promise<void> {
  await sql`
    DELETE FROM lessons
    WHERE id = ${id}
  `;
}
