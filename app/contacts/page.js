'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UserSearch from '@/components/UserSearch';
import Image from 'next/image';

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [status]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends?type=friends');
      
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      
      const data = await response.json();
      setFriends(data.connections);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to fetch friends. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/friends?type=pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }
      
      const data = await response.json();
      setPendingRequests(data.connections);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to fetch pending requests. Please try again.');
    }
  };

  const handleUserSelect = (user) => {
    // Refresh the friends list or pending requests based on the action
    if (user.connectionStatus === 'ACCEPTED') {
      fetchFriends();
      fetchPendingRequests();
    } else if (user.connectionStatus === 'PENDING') {
      fetchPendingRequests();
    }
  };

  const handleRemoveFriend = async (connectionId) => {
    try {
      const response = await fetch(`/api/friends/remove?id=${connectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }
      
      // Update the friends list
      setFriends(prevFriends => 
        prevFriends.filter(friend => friend.id !== connectionId)
      );
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend. Please try again.');
    }
  };

  const handleAcceptRequest = async (connectionId) => {
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
      
      // Update the pending requests list
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== connectionId)
      );
      
      // Refresh the friends list
      fetchFriends();
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectRequest = async (connectionId) => {
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
      
      // Update the pending requests list
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== connectionId)
      );
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject friend request. Please try again.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Contacts</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('friends')}
              className={`${
                activeTab === 'friends'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Friends
              {friends.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {friends.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`${
                activeTab === 'requests'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Friend Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`${
                activeTab === 'search'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Find Friends
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don't have any friends yet.</p>
              <button
                onClick={() => setActiveTab('search')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Find Friends
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 relative">
                        {friend.friend.image ? (
                          <Image
                            src={friend.friend.image}
                            alt={friend.friend.name || 'Friend'}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {(friend.friend.name || friend.friend.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {friend.friend.name || 'Unnamed User'}
                        </h3>
                        <p className="text-sm text-gray-500">{friend.friend.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'requests' && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">You don't have any pending friend requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 relative">
                        {request.user.image ? (
                          <Image
                            src={request.user.image}
                            alt={request.user.name || 'User'}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {(request.user.name || request.user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.user.name || 'Unnamed User'}
                        </h3>
                        <p className="text-sm text-gray-500">{request.user.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Find Friends</h2>
            <p className="text-sm text-gray-500">
              Search for users by name or email to add them as friends.
            </p>
          </div>
          
          <UserSearch onUserSelect={handleUserSelect} />
        </div>
      )}
    </div>
  );
} 