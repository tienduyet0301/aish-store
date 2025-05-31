import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";
import cloudinary from '@/lib/cloudinary';

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'aishh',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

// API để lấy hình ảnh
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { ok: false, error: "Image ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Convert string ID to ObjectId
    const image = await db.collection("images").findOne({ 
      _id: new ObjectId(imageId) 
    });

    if (!image) {
      return NextResponse.json(
        { ok: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return new NextResponse(image.data, {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": image.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error getting image:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to get image: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 