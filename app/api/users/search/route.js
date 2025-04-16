import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Search for users by name or email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        NOT: {
          id: session.user.id, // Exclude the current user
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10, // Limit results to 10 users
    });
    
    // Check if there are existing connections with these users
    const userIds = users.map(user => user.id);
    
    const existingConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: session.user.id, friendId: { in: userIds } },
          { userId: { in: userIds }, friendId: session.user.id },
        ],
      },
    });
    
    // Map connection status to users
    const usersWithConnectionStatus = users.map(user => {
      const connection = existingConnections.find(
        conn => 
          (conn.userId === session.user.id && conn.friendId === user.id) ||
          (conn.userId === user.id && conn.friendId === session.user.id)
      );
      
      return {
        ...user,
        connectionStatus: connection ? connection.status : null,
        connectionId: connection ? connection.id : null,
      };
    });
    
    return NextResponse.json(
      { users: usersWithConnectionStatus },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
} 