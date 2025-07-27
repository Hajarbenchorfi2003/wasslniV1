// pages/manager/ManagerDashboardPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from '@iconify/react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getStudentsByUser } from '@/services/students';
import { fetchMyBuses } from '@/services/bus';
import { getUserRoutes } from '@/services/route';
import { fetchDrivers } from '@/services/user';
import { fetchAlltrip } from '@/services/trips';
import { getAllIncidents, getNotfication, markNotificationAsRead } from '@/services/notficationicidient';

const ManagerDashboardPage = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalDrivers: 0,
        totalBuses: 0,
        totalRoutes: 0,
        totalTrips: 0,
        ongoingDailyTrips: 0,
        newIncidentsToday: 0,
        establishmentName: 'Chargement...'
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Fetch all data in parallel
            const [
                studentsResponse,
                driversResponse,
                busesResponse,
                routesResponse,
                tripsResponse,
                incidentsResponse,
                notificationsResponse
            ] = await Promise.all([
                getStudentsByUser(),
                fetchDrivers(),
                fetchMyBuses(),
                getUserRoutes(),
                fetchAlltrip(),
                getAllIncidents(),
                getNotfication()
            ]);

            // Extract data from responses
            const studentsData = studentsResponse.data || studentsResponse;
            const driversData = driversResponse.data || driversResponse;
            const busesData = busesResponse.data || busesResponse;
            const routesData = routesResponse.data || routesResponse;
            const tripsData = tripsResponse.data || tripsResponse;
            const incidentsData = incidentsResponse.data || incidentsResponse;
            const notificationsData = notificationsResponse.data || notificationsResponse;

            // Calculate today's date for filtering
            const today = new Date().toISOString().split('T')[0];
            
            // Process incidents
            const incidentsToday = Array.isArray(incidentsData) ? 
                incidentsData.filter(inc => 
                    new Date(inc.timestamp).toISOString().split('T')[0] === today
                ) : [];

            // Process ongoing trips (assuming trips have a status field)
            const ongoingTrips = Array.isArray(tripsData) ? 
                tripsData.filter(trip => trip.status === 'ONGOING') : [];

            // Set stats
            setStats({
                totalStudents: Array.isArray(studentsData) ? studentsData.length : 0,
                totalDrivers: Array.isArray(driversData) ? driversData.length : 0,
                totalBuses: Array.isArray(busesData) ? busesData.length : 0,
                totalRoutes: Array.isArray(routesData) ? routesData.length : 0,
                totalTrips: Array.isArray(tripsData) ? tripsData.length : 0,
                ongoingDailyTrips: ongoingTrips.length,
                newIncidentsToday: incidentsToday.length,
                establishmentName: 'Votre Établissement'
            });

            // Process recent activities
            const activities = [];
            
            // Add incidents as activities
            if (Array.isArray(incidentsData)) {
                const recentIncidents = incidentsData
                    .slice(0, 5)
                    .map(inc => ({
                        id: `incident-${inc.id}`,
                        type: 'INCIDENT',
                        title: `Incident: ${inc.description?.substring(0, 30) || 'Sans description'}...`,
                        message: `Signalé par ${inc.reportedBy.fullname || 'inconnu'}`,
                        timestamp: inc.timestamp,
                        status: inc.status
                    }));
                activities.push(...recentIncidents);
            }

            // Add notifications as activities
            if (Array.isArray(notificationsData)) {
                const recentNotifications = notificationsData
                    .slice(0, 5)
                    .map(notif => ({
                        id: `notif-${notif.id}`,
                        type: notif.type || 'NOTIFICATION',
                        title: notif.title,
                        message: notif.message,
                        timestamp: notif.timestamp,
                        read: notif.read
                    }));
                activities.push(...recentNotifications);
            }

            // Sort activities by timestamp
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setRecentActivities(activities.slice(0, 10));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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
        return 'heroicons:bell-alert';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Chargement des données...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-default-900">Tableau de Bord de l&apos;Établissement</h1>
            <p className="text-default-600">Vue d&apos;ensemble pour <strong>{stats.establishmentName}</strong>.</p>

            <Card className="col-span-12 lg:col-span-8">
                <CardHeader className="border-none p-6 pt-5 mb-0">
                    <CardTitle className="text-lg font-semibold text-default-900 p-0">
                        Vue d&apos;ensemble
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-default-600">Élèves</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalStudents}</div>
                        </div>
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:truck" className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-medium text-default-600">Bus</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalBuses}</div>
                        </div>
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:map" className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium text-default-600">Routes</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalRoutes}</div>
                        </div>
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:calendar-days" className="h-5 w-5 text-orange-500" />
                                <span className="text-sm font-medium text-default-600">Trajets</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.totalTrips}</div>
                        </div>
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
                                <span className="text-sm font-medium text-default-600">Trajets en Cours</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.ongoingDailyTrips}</div>
                        </div> 
                        <div className="p-4 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-red-500" />
                                <span className="text-sm font-medium text-default-600">Nouveaux Incidents</span>
                            </div>
                            <div className="text-2xl font-bold text-default-900">{stats.newIncidentsToday}</div>
                        </div> 
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-6" />
            
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="py-4 px-6 border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold text-default-800">Activités Récentes</CardTitle>
                    <CardDescription>Dernières mises à jour et événements importants de votre établissement.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
                        {recentActivities.length > 0 ? (
                            recentActivities.map(activity => (
                                <div key={activity.id} className="p-4 border-b last:border-b-0 flex items-start gap-3">
                                    <Icon icon={getActivityIcon(activity.type)} className={cn(
                                        "h-6 w-6 flex-shrink-0", 
                                        activity.type === 'INCIDENT' ? 'text-red-500' : 
                                        (activity.type === 'CONCERN' ? 'text-purple-500' : 'text-blue-500')
                                    )} />
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
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit'
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