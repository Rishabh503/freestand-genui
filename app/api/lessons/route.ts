import { getLessonsByUser, deleteLesson, getLessonById } from "@/lib/db/api/lessons";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessons = await getLessonsByUser(userId);
    return NextResponse.json(lessons);
  } catch (error: any) {
    console.error("Failed to fetch lessons:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing lesson ID" }, { status: 400 });
    }

    // Verify ownership before deleting
    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.clerk_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteLesson(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete lesson:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
