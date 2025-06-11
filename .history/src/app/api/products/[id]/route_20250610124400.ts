import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if discount code is valid
    if (product.discountCode && product.discountExpiry) {
      const now = new Date();
      if (now > product.discountExpiry) {
        // Reset discount if expired
        product.discountCode = undefined;
        product.discountPercentage = 0;
        product.discountExpiry = undefined;
        await product.save();
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Handle discount code update
    if (body.discountCode) {
      const product = await Product.findById(params.id);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Set discount code and expiry (e.g., 7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      product.discountCode = body.discountCode;
      product.discountPercentage = body.discountPercentage || 0;
      product.discountExpiry = expiryDate;

      const updatedProduct = await product.save();
      return NextResponse.json(updatedProduct);
    }

    // Handle regular product update
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { ok: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      const checkExist = await db.collection('products').findOne({ _id: new ObjectId(id) });
      if (!checkExist) {
        return NextResponse.json(
          { ok: false, message: 'Product not found' },
          { status: 404 }
        );
      } else {
        console.error(`Delete failed for product ${id} but it still exists.`);
        return NextResponse.json(
          { ok: false, message: 'Failed to delete product' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 