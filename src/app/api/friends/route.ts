import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
    let whereClause = {};
    
    if (type === 'friends') {
      whereClause = {
        OR: [
          { userId: session.user.id, status: 'ACCEPTED' },
          { friendId: session.user.id, status: 'ACCEPTED' },
        ],
      };
    } else if (type === 'pending') {
      whereClause = {
        friendId: session.user.id,
        status: 'PENDING',
      };
    } else if (type === 'sent') {
      whereClause = {
        userId: session.user.id,
        status: 'PENDING',
      };
    } else {
      // 'all' - get all connections
      whereClause = {
        OR: [
          { userId: session.user.id },
          { friendId: session.user.id },
        ],
      };
    }
    
    const connections = await prisma.connection.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    // Format the response to include friend information
    const formattedConnections = connections.map(connection => {
      const isUser = connection.userId === session.user.id;
      const friend = isUser ? connection.friend : connection.user;
      
      return {
        id: connection.id,
        status: connection.status,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        friend: {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          image: friend.image,
        },
        isIncoming: !isUser && connection.status === 'PENDING',
      };
    });
    
    return NextResponse.json(
      { connections: formattedConnections },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
} 