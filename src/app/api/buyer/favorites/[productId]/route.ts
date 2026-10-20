import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

async function getBuyerId() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { buyer: true },
  });

  return user?.buyer?.id ?? null;
}

// POST /api/buyer/favorites/:productId - Add a product to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const buyerId = await getBuyerId();
    if (!buyerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId: productIdParam } = await params;
    const productId = parseInt(productIdParam);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { farmer: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const existingFavorite = await prisma.order.findFirst({
      where: { buyerId, productId: product.id, status: 'favorite' },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'Product already in favorites' },
        { status: 400 }
      );
    }

    const favorite = await prisma.order.create({
      data: {
        orderNumber: `FAV-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        productId: product.id,
        buyerId,
        farmerId: product.farmerId,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        status: 'favorite',
        deliveryStatus: 'none',
        paymentStatus: 'none',
      },
    });

    return NextResponse.json({ success: true, message: 'Added to favorites', data: favorite });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/buyer/favorites/:productId - Remove a product from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const buyerId = await getBuyerId();
    if (!buyerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId: productIdParam } = await params;
    const productId = parseInt(productIdParam);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    const deleted = await prisma.order.deleteMany({
      where: { buyerId, productId, status: 'favorite' },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: 'Favorite not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
