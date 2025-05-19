import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    console.log("Starting file upload...");
    const formData = await request.formData();
    console.log("FormData received:", formData);
    
    const files = formData.getAll("files");
    console.log("Files from formData:", files);
    
    if (!files || files.length === 0) {
      console.log("No files found in request");
      return NextResponse.json(
        { success: false, error: "No files uploaded" },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      console.log("Creating uploads directory:", uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create a .gitkeep file to ensure the directory is tracked by git
    const gitkeepPath = path.join(uploadDir, ".gitkeep");
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, "");
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        console.log("Processing file:", file);
        
        if (!(file instanceof File)) {
          console.error("Invalid file object:", file);
          return null;
        }

        console.log("File details:", {
          name: file.name,
          type: file.type,
          size: file.size
        });

        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          console.error(`Invalid file type: ${file.type}`);
          return null;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          console.error(`File too large: ${file.size} bytes`);
          return null;
        }
        
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate a unique filename with timestamp and original extension
          const timestamp = Date.now();
          const originalName = file.name;
          const extension = path.extname(originalName);
          const fileName = `${timestamp}-${originalName}`;
          const filePath = path.join(uploadDir, fileName);
          
          console.log("Saving file to:", filePath);
          await fs.promises.writeFile(filePath, buffer);
          console.log("File saved successfully");
          
          return `/uploads/${fileName}`;
        } catch (error) {
          console.error("Error saving file:", error);
          return null;
        }
      })
    );

    // Filter out any null values
    const validUrls = urls.filter((url): url is string => url !== null);
    console.log("Valid URLs:", validUrls);

    if (validUrls.length === 0) {
      console.log("No valid files were uploaded");
      return NextResponse.json(
        { success: false, error: "No valid files were uploaded. Please ensure files are images (JPEG, PNG, WebP) and under 5MB." },
        { status: 400 }
      );
    }

    console.log("Upload completed successfully");
    return NextResponse.json({ 
      success: true,
      urls: validUrls
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload files: " + (error instanceof Error ? error.message : String(error)) },
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