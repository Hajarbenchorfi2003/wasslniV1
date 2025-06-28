// pages/manager/ReportsStatisticsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from '@iconify/react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { getStudentsByUser } from '@/services/students';
import { fetchMyBuses } from '@/services/bus';
import { getUserRoutes } from '@/services/route';
import { fetchDrivers } from '@/services/user';
import { fetchAlltrip } from '@/services/trips';
import { getAllIncidents } from '@/services/notficationicidient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Download, Calendar, Filter, TrendingUp, Users, Bus, MapPin, AlertTriangle,
  CheckCircle, XCircle, Clock,
  PieChart as PieChartIcon, BarChart as BarChartIcon
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#a4de6c', '#d0ed57', '#83a6ed'];

export const ReportsStatisticsPage = ({ managerEstablishmentId = 1 }) => {
  const defaultFromDate = new Date();
  defaultFromDate.setDate(defaultFromDate.getDate() - 30);

  const [currentDateRange, setCurrentDateRange] = useState({
    from: defaultFromDate,
    to: new Date()
  });

  const [stats, setStats] = useState({
    totalStudentsCount: 0,
    totalTripsCount: 0,
    completedTripsCount: 0,
    ongoingTripsCount: 0,
    totalIncidentsCount: 0,
    tripStatusData: [],
    incidentTypeData: [],
    attendanceData: []
  });

  const [loading, setLoading] = useState(true);

  const generateChartData = (dataArray, keyField) => {
    const counts = {};
    dataArray.forEach(item => {
      const value = item[keyField] || 'N/A';
      counts[value] = (counts[value] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        studentsResponse,
        tripsResponse,
        incidentsResponse
      ] = await Promise.all([
        getStudentsByUser(),
        fetchAlltrip(),
        getAllIncidents()
      ]);

      const studentsData = studentsResponse.data || studentsResponse;
      const tripsData = tripsResponse.data || tripsResponse;
      const incidentsData = incidentsResponse.data || incidentsResponse;

      // Filter data by date range
      const from = new Date(currentDateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(currentDateRange.to);
      to.setHours(23, 59, 59, 999);

      const filteredTrips = Array.isArray(tripsData) ? 
        tripsData.filter(trip => {
          const tripDate = new Date(trip.date || trip.createdAt);
          return tripDate >= from && tripDate <= to;
        }) : [];

      const filteredIncidents = Array.isArray(incidentsData) ? 
        incidentsData.filter(inc => {
          const incDate = new Date(inc.timestamp || inc.createdAt);
          return incDate >= from && incDate <= to;
        }) : [];

      // Calculate stats
      const totalStudentsCount = Array.isArray(studentsData) ? studentsData.length : 0;
      const totalTripsCount = filteredTrips.length;
      const completedTripsCount = filteredTrips.filter(trip => trip.status === 'COMPLETED').length;
      const ongoingTripsCount = filteredTrips.filter(trip => trip.status === 'ONGOING').length;
      const totalIncidentsCount = filteredIncidents.length;

      // Generate chart data
      const tripStatusData = generateChartData(filteredTrips, 'status');
      const incidentTypeData = generateChartData(filteredIncidents, 'type');

      // Simplified attendance data (replace with actual attendance API if available)
      const attendanceData = [
        { name: 'Présent', value: Math.floor(totalStudentsCount * 0.8), color: COLORS[1] },
        { name: 'Absent', value: Math.floor(totalStudentsCount * 0.1), color: COLORS[3] },
        { name: 'En Retard', value: Math.floor(totalStudentsCount * 0.1), color: COLORS[2] },
      ].filter(data => data.value > 0);

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

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [currentDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement des données...</p>
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

      {/* Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudentsCount}</div>
            <p className="text-xs text-muted-foreground">inscrits dans l'établissement</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trajets</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTripsCount}</div>
            <p className="text-xs text-muted-foreground">dans la période sélectionnée</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trajets Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTripsCount}</div>
            <p className="text-xs text-muted-foreground">terminés avec succès</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents Signalés</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
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
                  <Bar dataKey="value" fill={COLORS[0]} radius={[5, 5, 0, 0]} />
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
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
                <Bar dataKey="value" fill={COLORS[4]} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">Aucun incident signalé pour cette période.</p>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end mt-8">
        <Button variant="outline" onClick={() => toast.info("Fonctionnalité d'exportation à implémenter.")}>
          <Download className="h-4 w-4 mr-2" /> Exporter les données
        </Button>
      </div>
    </div>
  );
};

export default ReportsStatisticsPage;