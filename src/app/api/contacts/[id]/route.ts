import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Find and delete the connection
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: params.id },
          { senderId: params.id, receiverId: user.id },
        ],
      },
    });

    if (!connection) {
      return errorResponse('Connection not found', 404);
    }

    await prisma.connection.delete({
      where: { id: connection.id },
    });

    return successResponse({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Error removing contact:', error);
    return errorResponse('Failed to remove contact');
  }
} 