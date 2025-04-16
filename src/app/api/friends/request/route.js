import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { targetUserId } = await request.json();
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }
    
    // Check if a connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: targetUserId },
          { userId: targetUserId, friendId: session.user.id },
        ],
      },
    });
    
    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      );
    }
    
    // Create a new connection request
    const connection = await prisma.connection.create({
      data: {
        userId: session.user.id,
        friendId: targetUserId,
        status: 'PENDING',
      },
    });
    
    return NextResponse.json(
      { message: 'Friend request sent successfully', connection },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
} 