// app/[lang]/(admin)/admin/page.jsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Icon } from "@iconify/react"; // Import Icon for quick access links
import Link from 'next/link'; // Import Link for navigation

import {
  demoData,
  getUserCountsByRoleForAdminDashboard,
  getTotalStudents,
  getStudentCountsByGender,
  getStudentCountsByClass,
  getDailyTripStatusCounts,
  getAttendanceStatusCounts,
  getSchoolEstablishments,
  getSchoolSubscriptionStatus
} from '@/data/data';

import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems"; // Ensure this import is correct

const DashboardPageView = ({ trans }) => {
  // Example school ID (replace with dynamic retrieval based on logged-in admin)
  const currentSchoolId = 1;

  // Prepare data for cards and charts
  const userRoleCounts = getUserCountsByRoleForAdminDashboard();
  // Filter out 'SUPER_ADMIN' if it somehow still appears or if you want to be explicit
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

  // New: Get total drivers and parents for the current school
  const totalDrivers = demoData.users.filter(user => user.role === 'DRIVER' && demoData.userSchools.some(us => us.userId === user.id && us.schoolId === currentSchoolId)).length;
  const totalParents = demoData.users.filter(user => user.role === 'PARENT' && demoData.userSchools.some(us => us.userId === user.id && us.schoolId === currentSchoolId)).length;


  // Chart theme configurations
  const { theme: mode } = useTheme();
  const { theme: config } = useThemeStore();
  const theme = themes.find((t) => t.name === config); // Get the full theme object

  const getChartOptions = (seriesData, categories = [], chartType = 'donut') => {
    // Dynamically select colors from the chartFunctional array
    const currentModeCssVars = theme?.cssVars[mode === "dark" ? "dark" : "light"];
    const chartColors = currentModeCssVars?.chartFunctional || [];

    // Map labels to series data for accurate slice counting in donut/pie charts
    const seriesLabels = Object.keys(seriesData);

    return {
      chart: {
        toolbar: { show: false },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "13px",
          colors: [currentModeCssVars?.chartLabel] // Use chartLabel for data labels
        },
        formatter: function (val, opts) {
          // Display the actual count for donut/pie charts
          if (chartType === 'donut' || chartType === 'pie') {
            return opts.w.config.series[opts.seriesIndex];
          }
          return val; // For bar charts, just return the value
        }
      },
      stroke: { width: 0 },
      colors: chartColors, // Use the diverse functional chart colors
      tooltip: { theme: mode === "dark" ? "dark" : "light" },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      legend: {
        labels: {
          colors: `hsl(${currentModeCssVars?.chartLabel})`,
        },
        itemMargin: { horizontal: 5, vertical: 5 },
        markers: { width: 10, height: 10, radius: 10 },
        position: 'bottom', // Often better for responsiveness
      },
      labels: seriesLabels, // Use dynamically derived labels
      xaxis: {
        categories: categories, // For bar/column charts
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
        bar: { // Added bar specific options for clarity
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
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800 ">
          School Analytics {trans?.dashboard}
        </div>
        <DatePickerWithRange />
      </div>

      {/* Global Stats Section - Similar to Super Admin */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Statistiques Clés de l'École
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Total Students Card */}
                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center text-center">
                  <Icon icon="heroicons:academic-cap" className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium text-default-600">Élèves Totaux</span>
                  <div className="text-2xl font-bold text-default-900">{totalStudents}</div>
                </div>

                {/* Total Establishments Card */}
                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center text-center">
                  <Icon icon="heroicons:building-office-2" className="h-6 w-6 text-info mb-2" />
                  <span className="text-sm font-medium text-default-600">Établissements</span>
                  <div className="text-2xl font-bold text-default-900">{totalEstablishments}</div>
                </div>

                {/* Active Buses Card */}
                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center text-center">
                  <Icon icon="heroicons:truck" className="h-6 w-6 text-success mb-2" />
                  <span className="text-sm font-medium text-default-600">Bus Actifs</span>
                  <div className="text-2xl font-bold text-default-900">{demoData.buses.length}</div>
                </div>

                {/* Subscription Status Card */}
                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center text-center">
                  <Icon icon="heroicons:currency-dollar" className="h-6 w-6 text-warning mb-2" />
                  <span className="text-sm font-medium text-default-600">Abonnement</span>
                  <div className="text-2xl font-bold text-default-900">{subscriptionStatus}</div>
                </div>

                {/* New: Total Drivers Card */}
                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center text-center">
                  <Icon icon="heroicons:user-circle"  className="h-6 w-6 text-indigo-500 mb-2" />
                  <span className="text-sm font-medium text-default-600">Chauffeurs</span>
                  <div className="text-2xl font-bold text-default-900">{totalDrivers}</div>
                </div>

                {/* New: Total Parents Card */}
                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center text-center">
                  <Icon icon="heroicons:users" className="h-6 w-6 text-rose-500 mb-2" />
                  <span className="text-sm font-medium text-default-600">Parents</span>
                  <div className="text-2xl font-bold text-default-900">{totalParents}</div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Role Distribution Chart (Excluding Super Admin) */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Utilisateurs par Rôle
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
                <p className="text-gray-600 text-sm">Aucune donnée de rôle utilisateur disponible (hors Super Admin).</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Demographics and Transportation Charts */}
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
            <CardTitle className="text-lg font-semibold text-default-900">État des Voyages Quotidiens</CardTitle>
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

      {/* Quick Access Section */}
      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-default-900">Accès Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link href={`/admin/students?schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-primary" />
                <span className="font-medium text-default-700">Gérer les Élèves</span>
              </Link>
              <Link href={`/admin/buses?schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:truck" className="h-5 w-5 text-info" />
                <span className="font-medium text-default-700">Gérer les Bus</span>
              </Link>
              <Link href={`/admin/routes?schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:map" className="h-5 w-5 text-warning" />
                <span className="font-medium text-default-700">Gérer les Routes</span>
              </Link>
              <Link href={`/admin/trips?schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:map-pin" className="h-5 w-5 text-success" />
                <span className="font-medium text-default-700">Gérer les Voyages</span>
              </Link>
              <Link href={`/admin/attendances?schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:clipboard-document-check" className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-default-700">Suivi des Présences</span>
              </Link>
              <Link href={`/admin/incidents?schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-destructive" />
                <span className="font-medium text-default-700">Rapports d'Incidents</span>
              </Link>
              {/* Links to manage users specific to this admin's school, now including Drivers and Parents */}
              <Link href={`/admin/users?role=RESPONSIBLE&schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:user" className="h-5 w-5 text-teal-500" />
                <span className="font-medium text-default-700">Gérer les Responsables</span>
              </Link>
              <Link href={`/admin/users?role=DRIVER&schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:truck-driver" className="h-5 w-5 text-indigo-500" />
                <span className="font-medium text-default-700">Gérer les Chauffeurs</span>
              </Link>
              <Link href={`/admin/users?role=PARENT&schoolId=${currentSchoolId}`} className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                <Icon icon="heroicons:users" className="h-5 w-5 text-rose-500" />
                <span className="font-medium text-default-700">Gérer les Parents</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPageView;