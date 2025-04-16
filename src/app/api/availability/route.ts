import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        availabilitySchedule: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // If no availability schedule exists, return empty array
    if (!user.availabilitySchedule) {
      return successResponse([]);
    }

    // Transform the availability schedule into time slots
    const timeSlots = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach((day, index) => {
      const daySlots = user.availabilitySchedule[day as keyof typeof user.availabilitySchedule];
      if (daySlots && Array.isArray(daySlots)) {
        daySlots.forEach((slot: any) => {
          timeSlots.push({
            id: `${day}-${index}-${slot.start}-${slot.end}`,
            day: days[index].charAt(0).toUpperCase() + days[index].slice(1),
            startTime: slot.start,
            endTime: slot.end,
          });
        });
      }
    });

    return successResponse(timeSlots);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return errorResponse('Failed to fetch availability');
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const { timeSlots } = await request.json();
    if (!Array.isArray(timeSlots)) {
      return errorResponse('Invalid time slots format');
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        availabilitySchedule: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Group time slots by day
    const slotsByDay: Record<string, any[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    timeSlots.forEach(slot => {
      const day = slot.day.toLowerCase();
      if (slotsByDay[day]) {
        slotsByDay[day].push({
          start: slot.startTime,
          end: slot.endTime,
        });
      }
    });

    // Update or create availability schedule
    if (user.availabilitySchedule) {
      await prisma.availabilitySchedule.update({
        where: { id: user.availabilitySchedule.id },
        data: slotsByDay,
      });
    } else {
      await prisma.availabilitySchedule.create({
        data: {
          userId: user.id,
          ...slotsByDay,
        },
      });
    }

    return successResponse({ message: 'Availability saved successfully' });
  } catch (error) {
    console.error('Error saving availability:', error);
    return errorResponse('Failed to save availability');
  }
} 