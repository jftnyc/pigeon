'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Pigeon
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </Link>
                <Link href="/contacts" className="text-gray-600 hover:text-gray-800">
                  Contacts
                </Link>
                <Link href="/availability" className="text-gray-600 hover:text-gray-800">
                  Availability
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-800">
                  Login
                </Link>
                <Link href="/register" className="text-gray-600 hover:text-gray-800">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 