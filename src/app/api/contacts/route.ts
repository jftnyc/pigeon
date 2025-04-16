import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Get accepted connections (friends)
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: user.id, status: 'ACCEPTED' },
          { receiverId: user.id, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    // Transform connections to contacts format
    const contacts = connections.map(connection => {
      // Determine which user is the friend (not the current user)
      const friend = connection.senderId === user.id ? connection.receiver : connection.sender;
      
      return {
        id: friend.id,
        name: friend.name || 'Unnamed User',
        email: friend.email,
        image: friend.image,
      };
    });

    return successResponse(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return errorResponse('Failed to fetch contacts');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const { userId } = await request.json();
    if (!userId) {
      return errorResponse('User ID is required');
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: userId },
          { senderId: userId, receiverId: user.id },
        ],
      },
    });

    if (existingConnection) {
      return errorResponse('Connection already exists');
    }

    // Create connection (as pending)
    await prisma.connection.create({
      data: {
        senderId: user.id,
        receiverId: userId,
        status: 'PENDING',
      },
    });

    return successResponse({ message: 'Contact request sent successfully' });
  } catch (error) {
    console.error('Error adding contact:', error);
    return errorResponse('Failed to add contact');
  }
} 