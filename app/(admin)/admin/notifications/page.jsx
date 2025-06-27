'use client';

import React from 'react';
import NotificationInbox from '@/app/notfication/NotificationInbox';

export default function AdminNotificationsPage({ params }) {
    // Pour les admins, on peut passer null pour managerEstablishmentId 
    // pour qu'ils voient tous les incidents/notifications
    const adminId = params.adminId || 1; // À remplacer par l'ID réel de l'admin connecté
    const adminEstablishmentId = params.adminEstablishmentId || null; // null pour voir tout

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-default-900">Notifications & Incidents</h1>
                    <p className="text-default-600">Gérez toutes les notifications et incidents du système.</p>
                </div>
            </div>

            <NotificationInbox
                managerId={adminId}
                managerEstablishmentId={adminEstablishmentId}
            />
        </div>
    );
} 