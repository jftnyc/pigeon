import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('id');
    
    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }
    
    // Find the connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is part of the connection
    if (connection.userId !== session.user.id && connection.friendId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to remove this connection' },
        { status: 403 }
      );
    }
    
    // Delete the connection
    await prisma.connection.delete({
      where: { id: connectionId },
    });
    
    return NextResponse.json(
      { message: 'Friend removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
} 