import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function GET(
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

    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json(
        { ok: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      product: {
        ...product,
        _id: product._id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const productData = await request.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updatedProduct = {
      name: productData.name,
      price: Number(productData.price),
      description: productData.description,
      images: productData.images,
      quantityM: Number(productData.quantityM),
      quantityL: Number(productData.quantityL),
      quantityXL: Number(productData.quantityXL),
      quantityHat: Number(productData.quantityHat),
      productCode: productData.productCode,
      details: productData.details,
      category: productData.category,
      collection: productData.collection,
      colors: productData.colors || [],
      discountPercent: Number(productData.discountPercent || 0),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProduct }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProductData = await db.collection('products').findOne({ _id: new ObjectId(id) });

    if (!updatedProductData) {
      return NextResponse.json(
        { ok: false, message: 'Failed to fetch updated product' },
        { status: 500 }
      );
    }

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return NextResponse.json({
      ok: true,
      product: {
        ...updatedProductData,
        _id: updatedProductData._id.toString(),
        images: updatedProductData.images?.map((url: string) =>
          url.startsWith('http') ? url : `${DOMAIN}${url}`
        ) || []
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to update product' },
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