// app/[lang]/(responsible)/manager/user-profile/settings/page.jsx (or similar)
// If userId is coming from URL, it's typically received via `params` in Next.js App Router
// Example: app/[lang]/(responsible)/manager/user-profile/[userId]/page.jsx
// In that case, userId would be `params.userId`

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserMeta from "./user-meta"; // Adjusted path if necessary
import PersonalDetails from "./personal-details"; // Adjusted path if necessary
import ChangePassword from "./change-password"; // Adjusted path if necessary
import { Icon } from '@iconify/react'; // Assuming you have Iconify for icons

 

// Assuming userId is passed as a prop from the parent route (e.g., from `params` in Next.js)
const Settings = ({ userId = 1 }) => { // Default to ID 1 for demonstration if no userId is provided
  const tabs = [
    {
      label: "Personal Details",
      value: "personal"
    },
    {
      label: "Change Password",
      value: "password"
    },
  ];

  return (
    <div className='grid grid-cols-12 gap-6 mt-6'>
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Pass userId to UserMeta */}
        <UserMeta userId={userId} />
      </div>
      <div className="col-span-12 lg:col-span-8">
        <Tabs defaultValue="personal" className="p-0 px-1" >
          <TabsList className="bg-card flex-1 overflow-x-auto md:overflow-hidden w-full px-5 pt-6 pb-2.5 h-fit border-b border-default-200 rounded-none justify-start gap-12 rounded-t-md">
            {
              tabs.map((tab, index) => (
                <TabsTrigger
                  className="capitalize px-0 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
                  before:left-1/2 before:-bottom-[11px] before:h-[2px]
                  before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full"
                  value={tab.value}
                  key={`tab-${index}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))
            }
          </TabsList>
          <TabsContent value="personal" className="mt-0">
            {/* Pass userId to PersonalDetails */}
            <PersonalDetails userId={userId} />
          </TabsContent>
          <TabsContent value="password" className="mt-0">
            {/* Pass userId to ChangePassword */}
            <ChangePassword userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;