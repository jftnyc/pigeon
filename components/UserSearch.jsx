'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function UserSearch({ onUserSelect }) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    setDebounceTimer(timer);
  };

  // Perform the actual search
  const performSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      
      const data = await response.json();
      setSearchResults(data.users);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending friend request
  const handleSendFriendRequest = async (userId) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }
      
      // Update the search results to reflect the new connection status
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.id === userId 
            ? { ...user, connectionStatus: 'PENDING', connectionId: null } 
            : user
        )
      );
      
      // If onUserSelect is provided, call it with the updated user
      if (onUserSelect) {
        const updatedUser = searchResults.find(user => user.id === userId);
        if (updatedUser) {
          onUserSelect({ ...updatedUser, connectionStatus: 'PENDING' });
        }
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request. Please try again.');
    }
  };

  // Handle accepting friend request
  const handleAcceptFriendRequest = async (connectionId) => {
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId, action: 'accept' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }
      
      // Update the search results to reflect the new connection status
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.connectionId === connectionId 
            ? { ...user, connectionStatus: 'ACCEPTED' } 
            : user
        )
      );
      
      // If onUserSelect is provided, call it with the updated user
      if (onUserSelect) {
        const updatedUser = searchResults.find(user => user.connectionId === connectionId);
        if (updatedUser) {
          onUserSelect({ ...updatedUser, connectionStatus: 'ACCEPTED' });
        }
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request. Please try again.');
    }
  };

  // Handle rejecting friend request
  const handleRejectFriendRequest = async (connectionId) => {
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId, action: 'reject' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject friend request');
      }
      
      // Update the search results to reflect the new connection status
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.connectionId === connectionId 
            ? { ...user, connectionStatus: 'REJECTED', connectionId: null } 
            : user
        )
      );
      
      // If onUserSelect is provided, call it with the updated user
      if (onUserSelect) {
        const updatedUser = searchResults.find(user => user.connectionId === connectionId);
        if (updatedUser) {
          onUserSelect({ ...updatedUser, connectionStatus: 'REJECTED', connectionId: null });
        }
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject friend request. Please try again.');
    }
  };

  // Handle removing friend
  const handleRemoveFriend = async (connectionId) => {
    try {
      const response = await fetch(`/api/friends/remove?id=${connectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }
      
      // Update the search results to reflect the new connection status
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.connectionId === connectionId 
            ? { ...user, connectionStatus: null, connectionId: null } 
            : user
        )
      );
      
      // If onUserSelect is provided, call it with the updated user
      if (onUserSelect) {
        const updatedUser = searchResults.find(user => user.connectionId === connectionId);
        if (updatedUser) {
          onUserSelect({ ...updatedUser, connectionStatus: null, connectionId: null });
        }
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {searchResults.map((user) => (
              <li key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
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
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  
                  <div>
                    {user.connectionStatus === 'ACCEPTED' && (
                      <button
                        onClick={() => handleRemoveFriend(user.connectionId)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Remove
                      </button>
                    )}
                    
                    {user.connectionStatus === 'PENDING' && user.connectionId && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptFriendRequest(user.connectionId)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectFriendRequest(user.connectionId)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {user.connectionStatus === 'PENDING' && !user.connectionId && (
                      <span className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100">
                        Request Sent
                      </span>
                    )}
                    
                    {!user.connectionStatus && (
                      <button
                        onClick={() => handleSendFriendRequest(user.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {searchQuery.length > 0 && searchResults.length === 0 && !isLoading && (
        <div className="mt-4 text-center text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
} 