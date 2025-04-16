'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserSearch from '@/components/UserSearch';
import ContactsList from '@/components/ContactsList';
import Image from 'next/image';

interface Contact {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchContacts();
    }
  }, [status, router]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setContacts(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('Failed to load contacts. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async (userId: string) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add contact');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to add contact');
      }

      // Refresh contacts list
      fetchContacts();
    } catch (err) {
      setError('Failed to add contact. Please try again.');
      console.error(err);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove contact');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove contact');
      }

      // Refresh contacts list
      fetchContacts();
    } catch (err) {
      setError('Failed to remove contact. Please try again.');
      console.error(err);
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Contacts</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your contacts</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Contact</h4>
            <UserSearch onSelect={handleAddContact} />
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Your Contacts</h4>
            {contacts.length === 0 ? (
              <p className="text-gray-500">You don't have any contacts yet.</p>
            ) : (
              <ContactsList 
                contacts={contacts} 
                onRemove={handleRemoveContact} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 