import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/buyer/chats - Get all chat conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { buyer: true }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Get unique farmers the buyer has chatted with
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
        order: { select: { orderNumber: true } }
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId', 'receiverId']
    });

    // Group by farmer
    const groupedConversations = conversations.reduce((acc, message) => {
      const farmerId = user.id === message.senderId ? message.receiverId : message.senderId;
      const farmerName = user.id === message.senderId ? message.receiver.fullName : message.sender.fullName;
      
      if (!acc[farmerId]) {
        acc[farmerId] = {
          farmerId,
          farmerName,
          lastMessage: message.message,
          lastMessageTime: message.createdAt,
          unreadCount: 0,
          orderNumber: message.order?.orderNumber
        };
      }

      if (!message.isRead && message.senderId !== user.id) {
        acc[farmerId].unreadCount++;
      }

      return acc;
    }, {} as any);

    const unreadCount = Object.values(groupedConversations).reduce(
      (sum: number, conv: any) => sum + conv.unreadCount, 0
    );

    return NextResponse.json({
      success: true,
      data: Object.values(groupedConversations),
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/chats - Send message to farmer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { farmerId, message, orderId } = body;

    if (!farmerId || !message) {
      return NextResponse.json(
        { error: 'Farmer ID and message are required' },
        { status: 400 }
      );
    }

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify farmer exists
    const farmer = await prisma.user.findUnique({
      where: { id: parseInt(farmerId) },
      include: { farmer: true }
    });

    if (!farmer || !farmer.farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: farmer.id,
        orderId: orderId ? parseInt(orderId) : null,
        message,
        isRead: false
      },
      include: {
        sender: { select: { fullName: true } },
        receiver: { select: { fullName: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}