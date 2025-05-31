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
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

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

    if (collection) updateData.collection = collection;
    if (productCode) updateData.productCode = productCode;
    if (details) updateData.details = details;
    if (sizeGuideImage) updateData.sizeGuideImage = sizeGuideImage;
    if (colors) updateData.colors = colors;

    const product = await prisma.product.update({
      where: { id: params.id },
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
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      console.error('Prisma error P2025: Record to update not found.');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
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
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    console.log('Prisma delete successful for id:', params.id);

    return NextResponse.json({ ok: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      console.error('Prisma error P2025: Product to delete not found.');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 