// ./app/[lang]/notifications/page.jsx
'use client';

import React from 'react';
import NotificationInbox from './NotificationInbox'; // Changed from named import to default import

// We no longer need other imports like Card, Tabs, Table, Input, etc. here,
// as NotificationInbox encapsulates the entire UI for notifications.
// We also no longer need incident-related states or functions.

export default function NotificationsPage({ params }) {
    // Assuming managerId comes from auth context or URL params if not hardcoded
    // For this example, let's assume `managerId` comes from params for consistency with `[lang]`
    // Or you might fetch it from an auth system.
    const managerId = params.managerId || 3; // Replace 3 with dynamic manager ID if available
    const managerEstablishmentId = params.managerEstablishmentId || 1; // Replace 1 with dynamic ID if available


    if (!managerId) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-default-600">
                Chargement de l'utilisateur...
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6"> {/* Added padding to the page container */}
            <h1 className="text-3xl font-bold text-default-900">Mes Notifications</h1>
            <p className="text-default-600">Gérez toutes vos notifications ici.</p>

            {/* NotificationInbox handles everything for notifications */}
            <NotificationInbox
                managerId={managerId}
                managerEstablishmentId={managerEstablishmentId} // Optional, if NotificationInbox needs it
            />
        </div>
    );
}