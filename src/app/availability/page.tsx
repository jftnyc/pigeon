'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchAvailability();
    }
  }, [status, router]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/availability');
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setTimeSlots(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch availability');
      }
    } catch (err) {
      setError('Failed to load availability. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { id: Date.now().toString(), day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ]);
  };

  const handleRemoveTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const handleUpdateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlots }),
      });

      if (!response.ok) {
        throw new Error('Failed to save availability');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Availability saved successfully!');
      } else {
        throw new Error(result.error || 'Failed to save availability');
      }
    } catch (err) {
      setError('Failed to save availability. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Availability</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Set your available time slots</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}
          
          <div className="space-y-4">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="flex items-center space-x-4 p-4 border rounded-md">
                <div className="flex-1">
                  <select
                    value={slot.day}
                    onChange={(e) => handleUpdateTimeSlot(slot.id, 'day', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleUpdateTimeSlot(slot.id, 'startTime', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleUpdateTimeSlot(slot.id, 'endTime', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTimeSlot(slot.id)}
                  className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleAddTimeSlot}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Time Slot
            </button>
            
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Availability'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 