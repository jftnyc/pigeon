'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Availability() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availability, setAvailability] = useState({
    status: 'Available',
    schedule: {
      monday: { morning: true, afternoon: true, evening: false },
      tuesday: { morning: true, afternoon: true, evening: true },
      wednesday: { morning: true, afternoon: true, evening: true },
      thursday: { morning: true, afternoon: true, evening: true },
      friday: { morning: true, afternoon: true, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    override: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // In a real app, we would fetch availability from the API
      // For now, we'll use mock data
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [status, router]);
  
  const handleStatusChange = (e) => {
    setAvailability({
      ...availability,
      status: e.target.value,
    });
  };
  
  const handleScheduleChange = (day, timeSlot) => {
    setAvailability({
      ...availability,
      schedule: {
        ...availability.schedule,
        [day]: {
          ...availability.schedule[day],
          [timeSlot]: !availability.schedule[day][timeSlot],
        },
      },
    });
  };
  
  const handleSave = () => {
    // In a real app, we would save the availability to the API
    console.log('Saving availability:', availability);
    setIsEditing(false);
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
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeSlots = ['morning', 'afternoon', 'evening'];
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Availability</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your availability schedule
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Schedule
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="mb-6">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Current Status
          </label>
          <select
            id="status"
            name="status"
            value={availability.status}
            onChange={handleStatusChange}
            disabled={!isEditing}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Away">Away</option>
            <option value="Do Not Disturb">Do Not Disturb</option>
          </select>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Weekly Schedule</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Morning
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afternoon
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evening
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {days.map((day) => (
                  <tr key={day}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {day}
                    </td>
                    {timeSlots.map((timeSlot) => (
                      <td key={`${day}-${timeSlot}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="checkbox"
                          checked={availability.schedule[day][timeSlot]}
                          onChange={() => handleScheduleChange(day, timeSlot)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 