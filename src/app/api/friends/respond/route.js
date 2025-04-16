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
    
    const { connectionId, action } = await request.json();
    
    if (!connectionId || !action) {
      return NextResponse.json(
        { error: 'Connection ID and action are required' },
        { status: 400 }
      );
    }
    
    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be either "accept" or "reject"' },
        { status: 400 }
      );
    }
    
    // Find the connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        user: true,
        friend: true,
      },
    });
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the recipient of the request
    if (connection.friendId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to respond to this request' },
        { status: 403 }
      );
    }
    
    // Check if the connection is pending
    if (connection.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This request has already been responded to' },
        { status: 400 }
      );
    }
    
    // Update the connection status
    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      },
    });
    
    return NextResponse.json(
      { 
        message: `Friend request ${action}ed successfully`, 
        connection: updatedConnection 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return NextResponse.json(
      { error: 'Failed to respond to friend request' },
      { status: 500 }
    );
  }
} 