import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();

    // Kiểm tra xem người dùng có tồn tại không
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Xóa người dùng
    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { message: "Xóa người dùng thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi xóa người dùng" },
      { status: 500 }
    );
  }
} 