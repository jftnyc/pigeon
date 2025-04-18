import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return errorResponse('Search query is required');
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
          { senderId: session.user.id, receiverId: { in: userIds } },
          { senderId: { in: userIds }, receiverId: session.user.id },
        ],
      },
    });
    
    // Map connection status to users
    const usersWithConnectionStatus = users.map(user => {
      const connection = existingConnections.find(
        conn => 
          (conn.senderId === session.user.id && conn.receiverId === user.id) ||
          (conn.senderId === user.id && conn.receiverId === session.user.id)
      );
      
      return {
        ...user,
        connectionStatus: connection ? connection.status : null,
        connectionId: connection ? connection.id : null,
      };
    });
    
    return successResponse({ users: usersWithConnectionStatus });
  } catch (error) {
    console.error('Error searching users:', error);
    return errorResponse('Failed to search users');
  }
} 