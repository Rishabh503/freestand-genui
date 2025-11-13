import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import DynamicLessonRenderer from "./DynamicLessonRenderer"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function LessonPage({ params }: { params: { id: string } }) {
  const gotId=await params
  console.log(gotId)
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", gotId.id)
    .single();

  if (error || !lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Created: {new Date(lesson.created_at).toLocaleDateString()}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <DynamicLessonRenderer code={lesson.tsx_code} lessonId={lesson.id} />
      </main>
    </div>
  );
}