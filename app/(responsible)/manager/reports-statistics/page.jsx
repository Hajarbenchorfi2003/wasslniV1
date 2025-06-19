// pages/manager/ReportsStatisticsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from '@iconify/react'; // For Iconify icons (e.g., heroicons)
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DatePickerWithRange from "@/components/date-picker-with-range"; // Assuming this component is available
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast'; // For notifications
import { cn } from '@/lib/utils'; // For conditional class styling

// --- Recharts Imports (Ensure you have 'recharts' installed: npm install recharts) ---
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- Lucide React Icons (Ensure you have 'lucide-react' installed: npm install lucide-react) ---
import {
  Download, Calendar, Filter, TrendingUp, Users, Bus, MapPin, AlertTriangle,
  CheckCircle, XCircle, Clock,
  PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon // Aliases for clarity
} from 'lucide-react';


import {
    demoData,
    getStudentsByEstablishment,
    getDailyTripsByEstablishment,
    getIncidentsByEstablishment, // Make sure this function is implemented in data-donne.js
    getStudentsByTrip, // For attendance calculation
} from '@/data/data';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#a4de6c', '#d0ed57', '#83a6ed']; // Colors for charts

export const ReportsStatisticsPage = ({ managerEstablishmentId =1}) => {
    // Set default date range to last 30 days
    const defaultFromDate = new Date();
    defaultFromDate.setDate(defaultFromDate.getDate() - 30);

    const [currentDateRange, setCurrentDateRange] = useState({
        from: defaultFromDate,
        to: new Date()
    });
    const [stats, setStats] = useState(null); // Stores calculated statistics

    // --- Helper for generating example chart data from counts ---
    const generateChartData = (dataArray, keyField) => {
        const counts = {};
        dataArray.forEach(item => {
            const value = item[keyField] || 'N/A';
            counts[value] = (counts[value] || 0) + 1;
        });
        return Object.keys(counts).map(name => ({ name, value: counts[name] }));
    };

    // --- Function to calculate statistics for the establishment ---
    const calculateStats = useCallback(() => {
        if (!managerEstablishmentId) {
             setStats(null);
             return;
        }

        const allStudents = getStudentsByEstablishment(managerEstablishmentId);
        const allDailyTrips = getDailyTripsByEstablishment(managerEstablishmentId, null); // Get all daily trips
        const allIncidents = getIncidentsByEstablishment(managerEstablishmentId); // Get all incidents

        // Filter data by selected date range
        let filteredDailyTrips = allDailyTrips;
        let filteredIncidents = allIncidents;

        if (currentDateRange?.from && currentDateRange.to) {
            const from = new Date(currentDateRange.from);
            from.setHours(0, 0, 0, 0);
            const to = new Date(currentDateRange.to);
            to.setHours(23, 59, 59, 999);

            filteredDailyTrips = filteredDailyTrips.filter(dt => {
                const dtDate = new Date(dt.date);
                return dtDate >= from && dtDate <= to;
            });
            filteredIncidents = filteredIncidents.filter(inc => {
                const incDate = new Date(inc.timestamp);
                return incDate >= from && incDate <= to;
            });
        }

        // --- KPIs ---
        const totalStudentsCount = allStudents.length;
        const totalTripsCount = filteredDailyTrips.length;
        const completedTripsCount = filteredDailyTrips.filter(dt => dt.status === 'COMPLETED').length;
        const ongoingTripsCount = filteredDailyTrips.filter(dt => dt.status === 'ONGOING').length;
        const totalIncidentsCount = filteredIncidents.length;

        // --- Charts Data ---
        // Daily Trip Status Distribution
        const tripStatusData = generateChartData(filteredDailyTrips, 'status');
        
        // Incident Type Distribution (using description as placeholder for 'type' field)
        // In a real app, incidents would have a 'type' enum (e.g., 'TECHNICAL', 'TRAFFIC')
        const incidentTypeData = generateChartData(filteredIncidents, 'description'); 

        // Attendance Overview (complex: sum up attendance for each student across filtered daily trips)
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;

        filteredDailyTrips.forEach(dt => {
            const studentsForThisTrip = getStudentsByTrip(dt.trip.id);
            studentsForThisTrip.forEach(student => {
                // Get the last attendance status for this student for this daily trip
                const attendanceRecords = demoData.attendances.filter(att =>
                    att.dailyTripId === dt.id && att.studentId === student.id && att.type === 'DEPART'
                );
                const lastStatus = attendanceRecords.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.status;

                if (lastStatus === 'PRESENT') totalPresent++;
                else if (lastStatus === 'ABSENT') totalAbsent++;
                else if (lastStatus === 'LATE') totalLate++;
            });
        });

        // Ensure at least one value if all are zero, so PieChart can render
        const attendanceData = [
            { name: 'Présent', value: totalPresent, color: COLORS[1] }, // Green
            { name: 'Absent', value: totalAbsent, color: COLORS[3] },  // Orange-ish
            { name: 'En Retard', value: totalLate, color: COLORS[2] }, // Yellow
        ].filter(data => data.value > 0); // Only show segments with values


        setStats({
            totalStudentsCount,
            totalTripsCount,
            completedTripsCount,
            ongoingTripsCount,
            totalIncidentsCount,
            tripStatusData,
            incidentTypeData,
            attendanceData
        });

    }, [managerEstablishmentId, currentDateRange, demoData.attendances.length, demoData.dailyTrips.length, demoData.incidents.length]); // Depend on relevant data.demoData arrays to trigger recalculation

    useEffect(() => {
        calculateStats();
    }, [calculateStats]);

    if (!managerEstablishmentId) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-default-600">
                Chargement de l'établissement...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-default-900">Rapports & Statistiques</h1>
            <p className="text-default-600">Consultez les données analytiques pour votre établissement.</p>

            {/* Date Range Filter */}
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="py-4 px-6 border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                        <Icon icon="heroicons:calendar" className="h-6 w-6 text-blue-500" />
                        Période des Rapports
                    </CardTitle>
                    <CardDescription>Sélectionnez la période pour les données affichées.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex justify-center">
                    <DatePickerWithRange
                        date={currentDateRange}
                        setDate={setCurrentDateRange}
                        placeholder="Sélectionner une période"
                    />
                </CardContent>
            </Card>

            {stats && (
                <>
                    {/* Key Performance Indicators (KPIs) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" /> {/* Lucide Icon */}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalStudentsCount}</div>
                                <p className="text-xs text-muted-foreground">inscrits dans l'établissement</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Trajets</CardTitle>
                                <Bus className="h-4 w-4 text-muted-foreground" /> {/* Lucide Icon */}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalTripsCount}</div>
                                <p className="text-xs text-muted-foreground">dans la période sélectionnée</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Trajets Terminés</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" /> {/* Lucide Icon */}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completedTripsCount}</div>
                                <p className="text-xs text-muted-foreground">terminés avec succès</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Incidents Signalés</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" /> {/* Lucide Icon */}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalIncidentsCount}</div>
                                <p className="text-xs text-muted-foreground">dans la période sélectionnée</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator className="my-6" />

                    {/* Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChartIcon className="h-5 w-5 text-indigo-500" />
                                    Statut des Trajets
                                </CardTitle>
                                <CardDescription>Répartition des statuts de trajets.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.tripStatusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={stats.tripStatusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} style={{ fontSize: '12px' }} />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill={COLORS[0]} radius={[5, 5, 0, 0]} /> {/* Primary color */}
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-10">Aucune donnée de statut de trajet pour cette période.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-purple-500" />
                                    Présence des Élèves
                                </CardTitle>
                                <CardDescription>Résumé des statuts de présence.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.attendanceData.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={stats.attendanceData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} // Show name and percentage
                                            >
                                                {stats.attendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend align="right" verticalAlign="middle" layout="vertical" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-10">Aucune donnée de présence pour cette période.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-sm border border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Types d'Incidents
                            </CardTitle>
                            <CardDescription>Répartition des incidents par type.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.incidentTypeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={stats.incidentTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} style={{ fontSize: '12px' }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill={COLORS[4]} radius={[5, 5, 0, 0]} /> {/* Another color */}
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-10">Aucun incident signalé pour cette période.</p>
                            )}
                        </CardContent>
                    </Card>

                </>
            )}

            {/* Optional: Export Data Button */}
            <div className="flex justify-end mt-8">
                <Button variant="outline" onClick={() => toast.info("Fonctionnalité d'exportation à implémenter.")}>
                    <Download className="h-4 w-4 mr-2" /> Exporter les données
                </Button>
            </div>
        </div>
    );
};

export default ReportsStatisticsPage;