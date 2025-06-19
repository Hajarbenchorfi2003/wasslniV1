// app/[lang]/(admin)/admin/page.jsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Icon } from "@iconify/react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  demoData,
  getUserCountsByRoleForAdminDashboard,
  getTotalStudents,
  getStudentCountsByGender,
  getStudentCountsByClass,
  getDailyTripStatusCounts,
  getAttendanceStatusCounts,
  getSchoolEstablishments,
  getSchoolSubscriptionStatus,
  getAllIncidents,
  getIncidentsByEstablishment,
  getStudentsByEstablishment,
  getBusesByEstablishment,
  getRoutesByEstablishment,
  getTripsByEstablishment
} from '@/data/data';

import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";

const AdminDashboardPage = ({ trans }) => {
  // Example school ID (replace with dynamic retrieval based on logged-in admin)
  const currentSchoolId = 1;

  // Prepare data for cards and charts
  const userRoleCounts = getUserCountsByRoleForAdminDashboard();
  const filteredUserRoleCounts = Object.fromEntries(
    Object.entries(userRoleCounts).filter(([role]) => role !== 'SUPER_ADMIN')
  );

  const totalStudents = getTotalStudents();
  const studentGenderCounts = getStudentCountsByGender();
  const studentClassCounts = getStudentCountsByClass();
  const dailyTripStatus = getDailyTripStatusCounts();
  const attendanceSummary = getAttendanceStatusCounts();
  const totalEstablishments = getSchoolEstablishments(currentSchoolId).length;
  const subscriptionStatus = getSchoolSubscriptionStatus(currentSchoolId);

  // Enhanced statistics for school admin
  const totalDrivers = demoData.users.filter(user => user.role === 'DRIVER' && demoData.userSchools.some(us => us.userId === user.id && us.schoolId === currentSchoolId)).length;
  const totalParents = demoData.users.filter(user => user.role === 'PARENT' && demoData.userSchools.some(us => us.userId === user.id && us.schoolId === currentSchoolId)).length;
  const totalBuses = demoData.buses.length;
  const totalRoutes = demoData.routes.length;
  const totalTrips = demoData.trips.length;
  const totalIncidents = getAllIncidents().length;
  const activeUsers = demoData.users.filter(user => user.isActive && user.role !== 'SUPER_ADMIN').length;
  const inactiveUsers = demoData.users.filter(user => !user.isActive && user.role !== 'SUPER_ADMIN').length;

  // Get establishments for this school
  const schoolEstablishments = getSchoolEstablishments(currentSchoolId);
  
  // Calculate total students across all establishments
  const totalStudentsInSchool = schoolEstablishments.reduce((total, establishment) => {
    return total + getStudentsByEstablishment(establishment.id).length;
  }, 0);

  // Calculate total buses across all establishments
  const totalBusesInSchool = schoolEstablishments.reduce((total, establishment) => {
    return total + getBusesByEstablishment(establishment.id).length;
  }, 0);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-default-800">
            Tableau de Bord - Administration Scolaire
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion de l'école et de ses établissements
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
                <p className="text-xs text-green-600 mt-1">+1 ce mois</p>
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
                <p className="text-3xl font-bold text-default-900">{totalStudentsInSchool}</p>
                <p className="text-xs text-green-600 mt-1">+8 cette semaine</p>
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
                <p className="text-3xl font-bold text-default-900">{totalBusesInSchool}</p>
                <p className="text-xs text-green-600 mt-1">100% opérationnels</p>
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
                <p className="text-sm font-medium text-muted-foreground">Présence Aujourd'hui</p>
                <p className="text-3xl font-bold text-default-900">95%</p>
                <p className="text-xs text-green-600 mt-1">+2% vs hier</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons:clipboard-document-check" className="h-6 w-6 text-orange-600" />
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
            <Link href="/admin/users?role=DRIVER" className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Icon icon="heroicons:user" className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Ajouter Chauffeur</span>
            </Link>
            <Link href="/admin/students" className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Ajouter Élève</span>
            </Link>
            <Link href="/admin/routes" className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Icon icon="heroicons:map" className="h-5 w-5 text-indigo-600" />
              <span className="font-medium text-indigo-800">Créer Trajet</span>
            </Link>
            <Link href="/admin/users?role=PARENT" className="flex items-center space-x-2 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
              <Icon icon="heroicons:users" className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-pink-800">Ajouter Parent</span>
            </Link>
            <Link href="/admin/incidents" className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Voir Incidents</span>
            </Link>
            <Link href="/admin/reports" className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Icon icon="heroicons:chart-bar" className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-800">Générer Rapport</span>
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
                      <span className="font-semibold text-blue-900">{totalBusesInSchool}</span>
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
                      <span className="font-semibold text-green-900">{userRoleCounts.RESPONSIBLE || 0}</span>
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
                        {activeUsers}/{activeUsers + inactiveUsers}
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
            <Chart
              options={getChartOptions(studentGenderCounts)}
              series={Object.values(studentGenderCounts)}
              type="pie"
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-default-900">Élèves par Classe</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <Chart
              options={getChartOptions(studentClassCounts, Object.keys(studentClassCounts), 'bar')}
              series={[{ name: 'Nombre d\'Élèves', data: Object.values(studentClassCounts) }]}
              type="bar"
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-default-900">État des Voyages</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <Chart
              options={getChartOptions(dailyTripStatus, Object.keys(dailyTripStatus), 'bar')}
              series={[{ name: 'Nombre de Voyages', data: Object.values(dailyTripStatus) }]}
              type="bar"
              height={250}
            />
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
              {getAllIncidents().slice(0, 3).map((incident) => (
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
              <Link href="/admin/incidents" className="block text-center text-sm text-blue-600 hover:text-blue-800">
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
              <Link href="/admin/users?role=RESPONSIBLE" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon icon="heroicons:user" className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Gérer les Responsables</span>
                </div>
                <Badge variant="secondary">{userRoleCounts.RESPONSIBLE || 0}</Badge>
              </Link>
              <Link href="/admin/users?role=DRIVER" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon icon="heroicons:truck" className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">Gérer les Chauffeurs</span>
                </div>
                <Badge variant="secondary">{totalDrivers}</Badge>
              </Link>
              <Link href="/admin/users?role=PARENT" className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
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

      {/* System Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-default-900">Gestion du Système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/admin/students" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-primary" />
              <span className="font-medium text-default-700">Élèves</span>
            </Link>
            <Link href="/admin/buses" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:truck" className="h-5 w-5 text-info" />
              <span className="font-medium text-default-700">Bus</span>
            </Link>
            <Link href="/admin/routes" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:map" className="h-5 w-5 text-warning" />
              <span className="font-medium text-default-700">Routes</span>
            </Link>
            <Link href="/admin/trips" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:map-pin" className="h-5 w-5 text-success" />
              <span className="font-medium text-default-700">Trajets</span>
            </Link>
            <Link href="/admin/attendance" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:clipboard-document-check" className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-default-700">Présences</span>
            </Link>
            <Link href="/admin/incidents" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-destructive" />
              <span className="font-medium text-default-700">Incidents</span>
            </Link>
            <Link href="/admin/notifications" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:bell" className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-default-700">Notifications</span>
            </Link>
            <Link href="/admin/reports" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
              <Icon icon="heroicons:chart-bar" className="h-5 w-5 text-indigo-500" />
              <span className="font-medium text-default-700">Rapports</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;