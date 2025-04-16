'use client';

import Image from 'next/image';

interface Contact {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface ContactsListProps {
  contacts: Contact[];
  onRemove: (id: string) => void;
}

export default function ContactsList({
  contacts,
  onRemove,
}: ContactsListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You don't have any contacts yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <div key={contact.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 relative">
                {contact.image ? (
                  <Image
                    src={contact.image}
                    alt={contact.name || 'Contact'}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {(contact.name || contact.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {contact.name || 'Unnamed User'}
                </h3>
                <p className="text-sm text-gray-500">{contact.email}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onRemove(contact.id)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 