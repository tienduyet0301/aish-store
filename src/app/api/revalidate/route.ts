import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    
    if (!path) {
      return NextResponse.json(
        { message: "Missing path parameter" },
        { status: 400 }
      );
    }

    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
} 