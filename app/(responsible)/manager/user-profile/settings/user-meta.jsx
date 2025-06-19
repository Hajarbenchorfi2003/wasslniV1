// components/user-profile/UserMeta.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { getUserById } from '@/data/data'; // Adjust path as needed

const UserMeta = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // In a real app, this would be an async fetch call
    const fetchedUser = getUserById(userId);
    if (fetchedUser) {
      setUser(fetchedUser);
    } else {
      console.error(`User with ID ${userId} not found for UserMeta.`);
      setUser(null);
    }
    setLoading(false);
  }, [userId]);

  // Function to get initials from fullname
  const getInitials = (fullname) => {
    if (!fullname) return 'N/A';
    const parts = fullname.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <Card className="shadow-md p-6 text-center">
        <p>Loading user details...</p>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="shadow-md p-6 text-center text-red-500">
        <p>User not found.</p>
      </Card>
    );
  }

  return (
    <Card>
       <CardContent className="p-6 flex flex-col items-center">
       <div className="mt-4 text-xl font-semibold text-default-900">{user.fullname}</div>
       <div className="mt-1.5 text-sm font-medium text-default-500">{user.role}</div>
       <div className="mt-4 items-center flex flex-col items-center  w-full space-y-2">
          <div className="flex items-center gap-2 text-sm text-default-600">
            <Icon icon="heroicons:envelope" className="w-5 h-5" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-default-600">
            <Icon icon="heroicons:phone" className="w-5 h-5" />
            <span>{user.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-default-600">
            <Icon icon="heroicons:identification" className="w-5 h-5" /> {/* Icon for CIN */}
            <span>{user.cin || 'N/A'}</span>
          </div>
          {/* You might also want to display isActive status */}
          <div className="flex items-center gap-2 text-sm text-default-600">
            <Icon icon={user.isActive ? "heroicons:check-circle" : "heroicons:x-circle"} className={`w-5 h-5 ${user.isActive ? 'text-green-500' : 'text-red-500'}`} />
            <span>{user.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

       </CardContent>
    </Card>
  );
};

export default UserMeta;
