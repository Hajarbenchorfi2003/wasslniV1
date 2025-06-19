// pages/manager/ManagerDashboardPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from '@iconify/react'; // For general Heroicons icons
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import {
    demoData,
    getUsersByRoleAndEstablishment,
    getDailyTripsByEstablishment,
    getIncidentsByEstablishment,
    getStudentsByEstablishment,
    getNotificationsForUser,
    getBusesByEstablishment, // Assurez-vous d'importer ceci
    getTripsByEstablishment, // Assurez-vous d'importer ceci pour le décompte des master trips
    getRoutesByEstablishment, // Assurez-vous d'importer ceci
} from '@/data/data';

// MOCK_MANAGER_ID is typically passed as a prop from the layout
const MOCK_MANAGER_ID = 3; // Example: "Responsable Établissement 1"

export const ManagerDashboardPage = ({ managerEstablishmentId, managerId }) => {
    const effectiveManagerId = managerId || MOCK_MANAGER_ID;
    const effectiveManagerEstablishmentId = managerEstablishmentId || 1;

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalDrivers: 0,
        totalBuses: 0, // Nouveau KPI
        totalRoutes: 0, // Nouveau KPI
        totalTrips: 0, // Nouveau KPI (pour les master trips)
        ongoingDailyTrips: 0, // Renommé pour clarté
        newIncidentsToday: 0,
        establishmentName: 'Chargement...'
    });
    const [recentActivities, setRecentActivities] = useState([]);


    const calculateDashboardData = useCallback(() => {
        if (!effectiveManagerEstablishmentId || !effectiveManagerId) {
            setStats(null);
            setRecentActivities([]);
            return;
        }

        const students = getStudentsByEstablishment(effectiveManagerEstablishmentId);
        const drivers = getUsersByRoleAndEstablishment('DRIVER', effectiveManagerEstablishmentId);
        const buses = demoData.buses.filter(b => b.establishmentId === effectiveManagerEstablishmentId); // Directement depuis demoData
        const routes = demoData.routes.filter(r => r.establishmentId === effectiveManagerEstablishmentId); // Directement depuis demoData
        const trips = demoData.trips.filter(t => t.establishmentId === effectiveManagerEstablishmentId); // Directement depuis demoData (master trips)

        const todayDailyTrips = getDailyTripsByEstablishment(effectiveManagerEstablishmentId, new Date().toISOString().split('T')[0]);
        const incidentsToday = getIncidentsByEstablishment(effectiveManagerEstablishmentId).filter(inc =>
            new Date(inc.timestamp).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
        );
        const establishment = demoData.establishments.find(e => e.id === effectiveManagerEstablishmentId);

        setStats({
            totalStudents: students.length,
            totalDrivers: drivers.length,
            totalBuses: buses.length,
            totalRoutes: routes.length,
            totalTrips: trips.length,
            ongoingDailyTrips: todayDailyTrips.filter(dt => dt.status === 'ONGOING').length,
            newIncidentsToday: incidentsToday.length,
            establishmentName: establishment ? establishment.name : 'Inconnu'
        });

        // --- Collect Recent Activities (unchanged from previous version) ---
        const activities = [];
        const recentIncidents = getIncidentsByEstablishment(effectiveManagerEstablishmentId)
            .slice(0, 5)
            .map(inc => ({
                id: `incident-${inc.id}`, type: 'INCIDENT', title: `Incident: ${inc.description.substring(0, 30)}...`,
                message: `Signalé par ${inc.reportedByName} pour le trajet ${inc.dailyTripName}.`, timestamp: inc.timestamp, status: inc.status,
            }));
        activities.push(...recentIncidents);

        const recentAttendances = demoData.attendances
            .filter(att => {
                const student = demoData.students.find(s => s.id === att.studentId);
                const dailyTrip = demoData.dailyTrips.find(dt => dt.id === att.dailyTripId);
                const trip = dailyTrip ? demoData.trips.find(t => t.id === dailyTrip.tripId) : null;
                return student && student.establishmentId === effectiveManagerEstablishmentId && trip && trip.establishmentId === effectiveManagerEstablishmentId;
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .map(att => ({
                id: `attendance-${att.id}`, type: 'ATTENDANCE', title: `Présence: ${demoData.students.find(s => s.id === att.studentId)?.fullname}`,
                message: `Statut: <span class="math-inline">\{att\.status\} \(</span>{att.type === 'DEPART' ? 'Départ' : 'Retour'}) pour le trajet ${demoData.trips.find(t => t.id === demoData.dailyTrips.find(dt => dt.id === att.dailyTripId)?.tripId)?.name}.`,
                timestamp: att.timestamp, status: att.status,
            }));
        activities.push(...recentAttendances);

        const receivedNotifications = getNotificationsForUser(effectiveManagerId)
            .slice(0, 5)
            .map(notif => ({
                id: `notif-${notif.id}`, type: notif.type, title: notif.title,
                message: notif.message, timestamp: notif.timestamp, read: notif.read,
            }));
        activities.push(...receivedNotifications);

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentActivities(activities.slice(0, 10));
    }, [effectiveManagerEstablishmentId, effectiveManagerId, demoData.incidents.length, demoData.attendances.length, demoData.notifications.length]);

    useEffect(() => {
        calculateDashboardData();
    }, [calculateDashboardData]);


    // Helper for styling activity badges (unchanged)
    const getActivityBadgeColor = (type, status = null) => {
        if (type === 'INCIDENT') return 'red';
        if (type === 'ATTENDANCE') return status === 'PRESENT' ? 'green' : (status === 'ABSENT' ? 'red' : 'yellow');
        if (type === 'CONCERN') return 'purple';
        if (type === 'ALERT') return 'yellow';
        return 'gray';
    };

    const getActivityIcon = (type) => {
        if (type === 'INCIDENT') return 'heroicons:exclamation-circle';
        if (type === 'ATTENDANCE') return 'heroicons:user-check';
        if (type === 'CONCERN') return 'heroicons:chat-bubble-left-right';
        if (type === 'ALERT') return 'heroicons:bell-alert';
        return 'heroicons:information-circle';
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-default-900">Tableau de Bord de l'Établissement</h1>
            <p className="text-default-600">Vue d'ensemble pour **{stats.establishmentName}**.</p>

            {/* Nouveau Design pour la Card "Vue d'ensemble" */}
            <Card className="col-span-12 lg:col-span-8">
                <CardHeader className="border-none p-6 pt-5 mb-0">
                    <CardTitle className="text-lg font-semibold text-default-900 p-0">
                        Vue d'ensemble
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI Block: Élèves */}
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-default-600">Élèves</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalStudents}</div>
                        </div>
                        {/* KPI Block: Bus */}
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:truck" className="h-5 w-5 text-green-500" /> {/* Changed to green for success/bus */}
                                <span className="text-sm font-medium text-default-600">Bus</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalBuses}</div>
                        </div>
                        {/* KPI Block: Routes */}
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:map" className="h-5 w-5 text-blue-500" /> {/* Changed to blue for info */}
                                <span className="text-sm font-medium text-default-600">Routes</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalRoutes}</div>
                        </div>
                        {/* KPI Block: Trajets (Master Trips) */}
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:calendar-days" className="h-5 w-5 text-orange-500" /> {/* Changed to orange for warning/attention */}
                                <span className="text-sm font-medium text-default-600">Trajets</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalTrips}</div>
                        </div>
                        {/* KPI Block: Conducteurs (add if desired, similar style) */}
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:steering-wheel" className="h-5 w-5 text-purple-500" />
                                <span className="text-sm font-medium text-default-600">Conducteurs</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalDrivers}</div>
                        </div> 
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:arrow-path" className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium text-default-600">Trajets en Cours (Aujourd'hui)</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.ongoingDailyTrips}</div>
                        </div> 
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-red-500" />
                                <span className="text-sm font-medium text-default-600">Nouveaux Incidents (Aujourd'hui)</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.newIncidentsToday}</div>
                        </div> 
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-6" />
            {/* Recent Activities Feed */}
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="py-4 px-6 border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold text-default-800">Activités Récentes</CardTitle>
                    <CardDescription>Dernières mises à jour et événements importants de votre établissement.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[300px]"> {/* Fixed height for scrollable feed */}
                        {recentActivities.length > 0 ? (
                            recentActivities.map(activity => (
                                <div key={activity.id} className="p-4 border-b last:border-b-0 flex items-start gap-3">
                                    <Icon icon={getActivityIcon(activity.type)} className={cn("h-6 w-6 flex-shrink-0", activity.type === 'INCIDENT' ? 'text-red-500' : (activity.type === 'CONCERN' ? 'text-purple-500' : 'text-blue-500'))} />
                                    <div>
                                        <div className="font-semibold text-default-800 leading-tight">
                                            {activity.title}
                                            {activity.status && (
                                                <Badge
                                                    variant="soft"
                                                    color={getActivityBadgeColor(activity.type, activity.status)}
                                                    className="ml-2 capitalize text-xs"
                                                >
                                                    {activity.status}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">{activity.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(activity.timestamp).toLocaleString('fr-FR', {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-muted-foreground">Aucune activité récente pour le moment.</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

        </div>
    );
};

export default ManagerDashboardPage;