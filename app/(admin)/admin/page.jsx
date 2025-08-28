// app/[lang]/(admin)/admin/page.jsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Icon } from "@iconify/react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from 'react';

// Import services
import { fetchParents, fetchDrivers, fetchResponsibles } from '@/services/user';
import { fetchUserEstablishments } from '@/services/etablissements';
import { studentbyetablishment } from '@/services/students';
import { fetchMyBuses } from '@/services/bus';
import { fetchroute } from '@/services/route';
import { getAllIncidents } from "@/services/notficationicidient";
import { fetchAlltrip } from '@/services/trips';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    establishments: [],
    students: [],
    buses: [],
    routes: [],
    trips: [],
    incidents: [],
    users: {
      parents: [],
      drivers: [],
      responsibles: []
    }
  });

  // Load all data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      
      // Fetch all data in parallel
      const [
        establishmentsData,
        busesData,
        routesData,
        tripsData,
        incidentsData,
        parentsData,
        driversData,
        responsiblesData
      ] = await Promise.all([
        fetchUserEstablishments(),
        fetchMyBuses(),
        fetchroute(),
        fetchAlltrip(),
        getAllIncidents(),
        fetchParents(),
        fetchDrivers(),
        fetchResponsibles()
      ]);
       


      // Get students for all establishments
      let allStudents = [];
      if (Array.isArray(establishmentsData) && establishmentsData.length > 0) {
        const studentsPromises = establishmentsData.map(establishment => 
          studentbyetablishment(establishment.id)
        );
        const studentsResults = await Promise.all(studentsPromises);
        allStudents = studentsResults
          .map(r => (Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []))
          .flat();
      }


      setDashboardData({
        establishments: Array.isArray(establishmentsData) ? establishmentsData : [],
        students: Array.isArray(allStudents) ? allStudents : [],
        buses: Array.isArray(busesData) ? busesData : [],
        routes: Array.isArray(routesData) ? routesData : [],
        trips: Array.isArray(tripsData?.data) ? tripsData.data : (Array.isArray(tripsData) ? tripsData : []),
        incidents: Array.isArray(incidentsData) ? incidentsData : [],
        users: {
          parents: Array.isArray(parentsData) ? parentsData : [],
          drivers: Array.isArray(driversData) ? driversData : [],
          responsibles: Array.isArray(responsiblesData) ? responsiblesData : []
        }
      });


    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);

    }
  };

  // Calculate statistics from real data with proper fallbacks
  const totalEstablishments = Array.isArray(dashboardData.establishments) ? dashboardData.establishments.length : 0;
  const totalStudents = Array.isArray(dashboardData.students) ? dashboardData.students.length : 0;
  const totalBuses = Array.isArray(dashboardData.buses) ? dashboardData.buses.length : 0;
  const totalRoutes = Array.isArray(dashboardData.routes) ? dashboardData.routes.length : 0;
  const totalTrips = Array.isArray(dashboardData.trips) ? dashboardData.trips.length : 0;
  const totalIncidents = Array.isArray(dashboardData.incidents) ? dashboardData.incidents.length : 0;
  const totalDrivers = Array.isArray(dashboardData.users.drivers) ? dashboardData.users.drivers.length : 0;
  const totalParents = Array.isArray(dashboardData.users.parents) ? dashboardData.users.parents.length : 0;
  const totalResponsibles = Array.isArray(dashboardData.users.responsibles) ? dashboardData.users.responsibles.length : 0;

  // Calculate student gender distribution with fallback
  const studentGenderCounts = Array.isArray(dashboardData.students) ? 
    dashboardData.students.reduce((acc, student) => {
      const gender = student.gender || 'Non spécifié';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {}) : {};

  // Calculate student class distribution with fallback
  const studentClassCounts = Array.isArray(dashboardData.students) ? 
    dashboardData.students.reduce((acc, student) => {
      const className = student.className || 'Non spécifié';
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {}) : {};

  // Calculate trip status distribution with fallback
  const dailyTripStatus = Array.isArray(dashboardData.trips) ? 
    dashboardData.trips.reduce((acc, trip) => {
      const status = trip.status || 'Non spécifié';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) : {};

  // User role distribution
  const userRoleCounts = {
    PARENT: totalParents,
    DRIVER: totalDrivers,
    RESPONSIBLE: totalResponsibles
  };

  // Filter out SUPER_ADMIN (not applicable here)
  const filteredUserRoleCounts = Object.fromEntries(
    Object.entries(userRoleCounts).filter(([role]) => role !== 'SUPER_ADMIN')
  );

  // Active users count (assuming all users are active unless specified otherwise)
  const activeUsers = totalParents + totalDrivers + totalResponsibles;
  
  // Subscription status (placeholder - you might want to fetch this from your subscription service)
  const subscriptionStatus = 'Actif';

  // Chart theme configurations
  const { theme: mode } = useTheme();
  const { theme: config } = useThemeStore();
  const theme = themes.find((t) => t.name === config);

  const getChartOptions = (seriesData, categories = [], chartType = 'donut') => {
    const currentModeCssVars = theme?.cssVars[mode === "dark" ? "dark" : "light"];
    const chartColors = currentModeCssVars?.chartFunctional || [];
    const seriesLabels = Object.keys(seriesData);

    return {
      chart: {
        toolbar: { show: false },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "13px",
          colors: [currentModeCssVars?.chartLabel]
        },
        formatter: function (val, opts) {
          if (chartType === 'donut' || chartType === 'pie') {
            return opts.w.config.series[opts.seriesIndex];
          }
          return val;
        }
      },
      stroke: { width: 0 },
      colors: chartColors,
      tooltip: { theme: mode === "dark" ? "dark" : "light" },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      legend: {
        labels: {
          colors: `hsl(${currentModeCssVars?.chartLabel})`,
        },
        itemMargin: { horizontal: 5, vertical: 5 },
        markers: { width: 10, height: 10, radius: 10 },
        position: 'bottom',
      },
      labels: seriesLabels,
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: `hsl(${currentModeCssVars?.chartLabel})`
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: `hsl(${currentModeCssVars?.chartLabel})`
          }
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '50%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                },
                color: `hsl(${currentModeCssVars?.chartLabel})`
              },
              value: {
                color: `hsl(${currentModeCssVars?.chartLabel})`
              }
            }
          },
        },
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }]
    };
  };

 

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-default-800">
            Tableau de Bord - Administration Scolaire
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion de l&apos;école et de ses établissements
          </p>
        </div>
        <DatePickerWithRange />
      </div>

      {/* Key Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Establishments */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Établissements</p>
                <p className="text-3xl font-bold text-default-900">{totalEstablishments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons:building-office-2" className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Élèves</p>
                <p className="text-3xl font-bold text-default-900">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons:academic-cap" className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Buses */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bus Actifs</p>
                <p className="text-3xl font-bold text-default-900">{totalBuses}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons:truck" className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incidents</p>
                <p className="text-3xl font-bold text-default-900">{totalIncidents}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-default-900 flex items-center gap-2">
            <Icon icon="heroicons:bolt" className="h-5 w-5 text-yellow-600" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/admin/etablissements" className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Icon icon="heroicons:building-office-2" className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Ajouter Établissement</span>
            </Link>
            <Link href="/admin/buses" className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Icon icon="heroicons:truck" className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Ajouter Bus</span>
            </Link>
            <Link href="/admin/drivers" className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Icon icon="heroicons:user" className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Ajouter Chauffeur</span>
            </Link>
            <Link href="/admin/students" className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Ajouter Élève</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Statistics */}
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Statistiques Détaillées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Transport Statistics */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon icon="heroicons:truck" className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Transport</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Bus</span>
                      <span className="font-semibold text-blue-900">{totalBuses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Routes</span>
                      <span className="font-semibold text-blue-900">{totalRoutes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Trajets</span>
                      <span className="font-semibold text-blue-900">{totalTrips}</span>
                    </div>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon icon="heroicons:user-group" className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Utilisateurs</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Chauffeurs</span>
                      <span className="font-semibold text-green-900">{totalDrivers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Parents</span>
                      <span className="font-semibold text-green-900">{totalParents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Responsables</span>
                      <span className="font-semibold text-green-900">{totalResponsibles}</span>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon icon="heroicons:shield-check" className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Système</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">Abonnement</span>
                      <Badge variant={subscriptionStatus === 'Actif' ? 'default' : 'destructive'} className="text-xs">
                        {subscriptionStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">Utilisateurs</span>
                      <Badge variant="outline" className="text-xs">
                        {activeUsers} actifs
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">Incidents</span>
                      <Badge variant={totalIncidents > 5 ? 'destructive' : 'secondary'} className="text-xs">
                        {totalIncidents}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Role Distribution Chart */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Répartition des Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {Object.keys(filteredUserRoleCounts).length > 0 ? (
                <Chart
                  options={getChartOptions(filteredUserRoleCounts)}
                  series={Object.values(filteredUserRoleCounts)}
                  type="donut"
                  height={250}
                  width="100%"
                />
              ) : (
                <p className="text-gray-600 text-sm">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-default-900">Élèves par Sexe</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            {Object.keys(studentGenderCounts).length > 0 ? (
              <Chart
                options={getChartOptions(studentGenderCounts)}
                series={Object.values(studentGenderCounts)}
                type="pie"
                height={250}
              />
            ) : (
              <p className="text-gray-600 text-sm">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-default-900">Élèves par Classe</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            {Object.keys(studentClassCounts).length > 0 ? (
              <Chart
                options={getChartOptions(studentClassCounts, Object.keys(studentClassCounts), 'bar')}
                series={[{ name: 'Nombre d\'Élèves', data: Object.values(studentClassCounts) }]}
                type="bar"
                height={250}
              />
            ) : (
              <p className="text-gray-600 text-sm">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-default-900">État des Voyages</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            {Object.keys(dailyTripStatus).length > 0 ? (
              <Chart
                options={getChartOptions(dailyTripStatus, Object.keys(dailyTripStatus), 'bar')}
                series={[{ name: 'Nombre de Voyages', data: Object.values(dailyTripStatus) }]}
                type="bar"
                height={250}
              />
            ) : (
              <p className="text-gray-600 text-sm">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-default-900 flex items-center gap-2">
              <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-red-600" />
              Incidents Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(dashboardData.incidents) && dashboardData.incidents.slice(0, 3).map((incident) => (
                <div key={incident.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <Icon icon="heroicons:exclamation-circle" className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{incident.description}</p>
                    <p className="text-xs text-red-600">
                      {new Date(incident.timestamp).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
              {(!Array.isArray(dashboardData.incidents) || dashboardData.incidents.length === 0) && (
                <p className="text-gray-600 text-sm text-center">Aucun incident récent</p>
              )}
              <Link href="/admin/notifications" className="block text-center text-sm text-blue-600 hover:text-blue-800">
                Voir tous les incidents →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-default-900 flex items-center gap-2">
              <Icon icon="heroicons:squares-2x2" className="h-5 w-5 text-blue-600" />
              Navigation Rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/etablissements" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon icon="heroicons:building-office-2" className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Gérer les Établissements</span>
                </div>
                <Badge variant="secondary">{totalEstablishments}</Badge>
              </Link>
              <Link href="/admin/responsables" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon icon="heroicons:user" className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Gérer les Responsables</span>
                </div>
                <Badge variant="secondary">{totalResponsibles}</Badge>
              </Link>
              <Link href="/admin/drivers" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon icon="heroicons:truck" className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">Gérer les Chauffeurs</span>
                </div>
                <Badge variant="secondary">{totalDrivers}</Badge>
              </Link>
              <Link href="/admin/parents" className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon icon="heroicons:users" className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Gérer les Parents</span>
                </div>
                <Badge variant="secondary">{totalParents}</Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;