'use client';

import { useState } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  connectionStatus?: string;
  connectionId?: string;
}

interface UserSearchProps {
  onSelect: (userId: string) => void;
}

export default function UserSearch({ onSelect }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setSearchResults(result.data.users);
      } else {
        throw new Error(result.error || 'Failed to search users');
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search by name or email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 relative">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.name || 'Unnamed User'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => onSelect(user.id)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={user.connectionStatus === 'PENDING' || user.connectionStatus === 'ACCEPTED'}
              >
                {user.connectionStatus === 'PENDING' ? 'Request Sent' : 
                 user.connectionStatus === 'ACCEPTED' ? 'Already Connected' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 