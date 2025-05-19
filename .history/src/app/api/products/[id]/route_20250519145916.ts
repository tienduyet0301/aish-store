import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Props = {
  params: {
    id: string;
  };
};

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function GET(
  request: NextRequest,
  props: Props
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: props.params.id },
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
  props: Props
) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, images, variants } = body;

    const product = await prisma.product.update({
      where: { id: props.params.id },
      data: {
        name,
        description,
        price,
        categoryId,
        images: {
          deleteMany: {},
          create: images.map((url: string) => ({ url })),
        },
        variants: {
          deleteMany: {},
          create: variants.map((variant: any) => ({
            name: variant.name,
            options: {
              create: variant.options.map((option: any) => ({
                name: option.name,
                price: option.price,
              })),
            },
          })),
        },
      },
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

    return NextResponse.json(product);
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
  props: Props
) {
  try {
    await prisma.product.delete({
      where: { id: props.params.id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 