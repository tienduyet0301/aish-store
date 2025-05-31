import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// GET all banners
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const banners = await db.collection("banners").find({}).toArray();
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST new banner
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const data = await request.json();
    
    // Validate image URL format
    if (!data.imageUrl || !data.imageUrl.startsWith('https://res.cloudinary.com/')) {
      return NextResponse.json(
        { error: "Invalid image URL format. Must be a Cloudinary URL" },
        { status: 400 }
      );
    }
    
    const banner = {
      imageUrl: data.imageUrl,
      mobileImageUrl: data.mobileImageUrl || "",
      title: data.title || "",
      description: data.description || "",
      link: data.link || "",
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection("banners").insertOne(banner);
    
    return NextResponse.json({ 
      success: true,
      banner: { ...banner, _id: result.insertedId }
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}

// PUT update banner
export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const data = await request.json();
    
    if (!data._id) {
      return NextResponse.json(
        { error: "Banner ID is required" },
        { status: 400 }
      );
    }

    // Validate image URL format if provided
    if (data.imageUrl && !data.imageUrl.startsWith('https://res.cloudinary.com/')) {
      return NextResponse.json(
        { error: "Invalid image URL format. Must be a Cloudinary URL" },
        { status: 400 }
      );
    }
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    delete updateData._id; // Remove _id from update data
    
    const result = await db.collection("banners").updateOne(
      { _id: new ObjectId(data._id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Banner updated successfully"
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// DELETE banner
export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const data = await request.json();
    
    if (!data._id) {
      return NextResponse.json(
        { error: "Banner ID is required" },
        { status: 400 }
      );
    }
    
    const result = await db.collection("banners").deleteOne({
      _id: new ObjectId(data._id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Banner deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
} 