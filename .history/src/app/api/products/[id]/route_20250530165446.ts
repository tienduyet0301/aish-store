import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'bson';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: new ObjectId(params.id).toString() },
      include: {
        category: true,
        images: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      collection,
      productCode,
      details,
      images,
      quantityM,
      quantityL,
      quantityXL,
      quantityHat,
      sizeGuideImage,
      colors
    } = body;

    console.log('Received update body:', body);

    const updateData: any = {
      name,
      description,
      price: Number(price),
      categoryId: category,
      images: {
        deleteMany: {},
        create: images.map((url: string) => ({ url }))
      },
      quantityM: Number(quantityM),
      quantityL: Number(quantityL),
      quantityXL: Number(quantityXL),
      quantityHat: Number(quantityHat),
    };

    // Add optional fields only if they exist
    if (collection) updateData.collection = collection;
    if (productCode) updateData.productCode = productCode;
    if (details) updateData.details = details;
    if (sizeGuideImage) updateData.sizeGuideImage = sizeGuideImage;
    if (colors) updateData.colors = colors;

    const product = await prisma.product.update({
      where: { id: new ObjectId(params.id).toString() },
      data: updateData,
      include: {
        category: true,
        images: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    console.log('Prisma update result:', product);

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Attempting to delete product with ID: ${params.id}`);
    console.log(`Prisma DATABASE_URL: ${process.env.DATABASE_URL}`);
    await prisma.product.delete({
      where: { id: new ObjectId(params.id).toString() },
    });

    console.log('Prisma delete successful for id:', params.id);

    return NextResponse.json({ ok: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma Client Known Request Error:', error.code, error.message, error.meta);
      if (error.code === 'P2025') {
        console.error('Prisma error P2025: Product not found.');
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    } else {
      console.error('Non-Prisma error during delete:', error);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 