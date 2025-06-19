// app/dashboard/super-admin/page.jsx
'use client';

import { useRouter } from 'next/navigation';
import { demoData } from '@/data/data'; // Corrected path to your data file
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import {
    getGridConfig,
    getXAxisConfig,
    getYAxisConfig,
} from "@/lib/appex-chart-options";

const SuperAdminDashboardPage = () => {
    const router = useRouter();
    const { theme: config } = useThemeStore();
    const { theme: mode } = useTheme();
    const theme = themes.find((t) => t.name === config);

    // --- Aggregated Data for Dashboard ---
    const totalSchools = demoData.schools.length;
    const activeSchools = demoData.schools.filter(school => school.isActive).length;
    const inactiveSchools = totalSchools - activeSchools; // More robust calculation

    const totalEstablishments = demoData.establishments.length;
    const totalStudents = demoData.students.length;
    const totalBuses = demoData.buses.length;
    const totalTrips = demoData.trips.length;
    const totalRoutes = demoData.routes.length;
    const totalUsers = demoData.users.length;
    const totalParents = demoData.users.filter(user => user.role === 'PARENT').length;
    const totalDrivers = demoData.users.filter(user => user.role === 'DRIVER').length;
    const totalAdmins = demoData.users.filter(user => user.role === 'ADMIN').length;
    const totalResponsible = demoData.users.filter(user => user.role === 'RESPONSIBLE').length;

    // --- Chart Data Preparation ---

    // Data for School Status Chart (Donut Chart)
    const schoolStatusChartData = {
        series: [activeSchools, inactiveSchools],
        options: {
            chart: {
                type: 'donut',
                height: 250,
                toolbar: { show: false },
            },
            labels: ['Actives', 'Inactives'],
            colors: [
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`,
            ],
            tooltip: {
                theme: mode === "dark" ? "dark" : "light",
            },
            stroke: {
                width: 0
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    colors: [`hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`]
                }
            },
            legend: {
                labels: {
                    colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
                }
            },
            tooltip: {
                theme: mode === "dark" ? "dark" : "light",
            },
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Écoles',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                },
                                color: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
                            },
                            value: {
                                color: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
                            }
                        }
                    }
                }
            }
        },
    };

    // Data for User Role Distribution Chart (Pie Chart)
    // Aggregate user roles
    const roleCounts = demoData.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    const roleLabels = Object.keys(roleCounts);
    const roleSeries = Object.values(roleCounts);

    const userRoleChartData = {
        series: roleSeries,
        options: {
            chart: {
                type: 'pie',
                height: 250,
                toolbar: { show: false },
            },
            labels: roleLabels,
            colors: [
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`, // SUPER_ADMIN
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`,    // ADMIN
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].secondary})`, // RESPONSIBLE
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].destructive})`, // DRIVER
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})` // PARENT
            ],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    colors: [`hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`]
                }
            },
            legend: {
                labels: {
                    colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
                }
            },
            tooltip: {
                theme: mode === "dark" ? "dark" : "light",
            },
        },
    };

    // Example of a simple line chart for growth (placeholder data)
    // This could be updated with actual data on new school sign-ups or total active users over time
    const monthlyGrowthData = {
        series: [{
            name: 'Nouvelles Écoles',
            data: [1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6] // Example: cumulative count of schools over 12 months
        }],
        options: {
            chart: {
                type: 'line',
                height: 250,
                toolbar: { show: false }
            },
            stroke: {
                curve: 'smooth',
                width: 3,
            },
            colors: [`hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`],
            tooltip: {
                theme: mode === "dark" ? "dark" : "light",
            },
            grid: getGridConfig(
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
            ),
            xaxis: {
                categories: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                labels: getXAxisConfig(
                    `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
                ),
            },
            yaxis: getYAxisConfig(
                `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
            ),
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800">
                    Tableau de Bord Super Admin
                </div>
                <Button variant="outline" onClick={() => router.push('/super-admin/schools')}>
                    <Icon icon="heroicons:building-office-2" className="h-5 w-5 mr-2" />
                    Gérer les Écoles
                </Button>
            </div>


            {/* Global Stats Section */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                    <Card>
                        <CardHeader className="border-none p-6 pt-5 mb-0">
                            <CardTitle className="text-lg font-semibold text-default-900 p-0">
                                Statistiques Globales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                {/* Total Schools */}
                                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Icon icon="heroicons:building-library" className="h-6 w-6 text-primary mb-2" />
                                      <span className="text-sm font-medium text-default-600">Écoles</span>
                                    </div>
                                    <div className="text-2xl font-bold text-default-900">{totalSchools}</div>
                                    <Link href="/super-admin/schools" className="text-xs text-primary hover:underline mt-2">Voir</Link>
                                </div>
                                {/* Total Establishments */}
                                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Icon icon="heroicons:building-office-2" className="h-6 w-6 text-orange-500 mb-2" />
                                      <span className="text-sm font-medium text-default-600">Établissements</span>
                                    </div>
                                    <div className="text-2xl font-bold text-default-900 ">{totalEstablishments}</div>
                                    <Link href="/super-admin/establishments" className="text-xs text-primary hover:underline mt-2">Voir</Link>
                                </div>
                                {/* Total Students */}
                                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center  ">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium text-default-600">Élèves</span>
                                    </div>
                                    <div className="text-2xl font-bold text-default-900">{totalStudents}</div>
                                    <Link href="/super-admin/students" className="text-xs text-primary hover:underline mt-2">Voir</Link>
                                </div>
                                {/* Total Buses */}
                                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Icon icon="heroicons:truck" className="h-6 w-6 text-info mb-2" />
                                      <span className="text-sm font-medium text-default-600">Bus</span>
                                    </div>
                                    <div className="text-2xl font-bold text-default-900 mt-1">{totalBuses}</div>
                                    <Link href="/super-admin/buses" className="text-xs text-primary hover:underline mt-2">Voir</Link>
                                </div>
                                {/* Total Trips */}
                                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Icon icon="heroicons:map" className="h-6 w-6 text-yellow-500 mb-2" />
                                      <span className="text-sm font-medium text-default-600">Routes</span>
                                    </div>
                                    <div className="text-2xl font-bold text-default-900 mt-1">{totalRoutes}</div>
                                    <Link href="/super-admin/routes" className="text-xs text-primary hover:underline mt-2">Voir</Link>
                                </div>
                                {/* Total Users */}
                                <div className="p-4 bg-default-50 rounded-lg flex flex-col items-center justify-center col-span-full md:col-span-1 lg:col-span-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Icon icon="heroicons:user-group" className="h-6 w-6 text-purple-500 mb-2" />
                                      <span className="text-sm font-medium text-default-600">Utilisateurs</span>
                                    </div>
                                    <div className="text-2xl font-bold text-default-900 mt-1">{totalUsers}</div>
                                    <Link href="/super-admin/users" className="text-xs text-primary hover:underline mt-2">Voir</Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* School Status Chart */}
                <div className="col-span-12 lg:col-span-4">
                    <Card>
                        <CardHeader className="border-none p-6 pt-5 mb-0">
                            <CardTitle className="text-lg font-semibold text-default-900 p-0">
                                État des Écoles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            {totalSchools > 0 ? (
                                <Chart
                                    options={schoolStatusChartData.options}
                                    series={schoolStatusChartData.series}
                                    type="donut"
                                    height={250}
                                    width="100%"
                                />
                            ) : (
                                <p className="text-gray-600 text-sm">Aucune école enregistrée.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Charts Section: User Roles and Growth */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <Card>
                        <CardHeader className="border-none p-6 pt-5 mb-0">
                            <CardTitle className="text-lg font-semibold text-default-900 p-0">
                                Répartition des Rôles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            {totalUsers > 0 ? (
                                <Chart
                                    options={userRoleChartData.options}
                                    series={userRoleChartData.series}
                                    type="pie"
                                    height={250}
                                    width="100%"
                                />
                            ) : (
                                <p className="text-gray-600 text-sm">Aucun utilisateur enregistré.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <Card>
                        <CardHeader className="border-none p-6 pt-5 mb-0">
                            <CardTitle className="text-lg font-semibold text-default-900 p-0">
                                Croissance Mensuelle des Écoles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Chart
                                options={monthlyGrowthData.options}
                                series={monthlyGrowthData.series}
                                type="line"
                                height={250}
                                width="100%"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>


            {/* Quick Access Section (optional, could add more specific links here) */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-default-900">Accès Rapide</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Link href="/super-admin/users?role=ADMIN" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                                    <Icon icon="heroicons:user-shield" className="h-5 w-5 text-blue-500" />
                                    <span className="font-medium text-default-700">Gérer les Admins ({totalAdmins})</span>
                                </Link>
                                <Link href="/super-admin/users?role=RESPONSIBLE" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                                    <Icon icon="heroicons:user" className="h-5 w-5 text-teal-500" />
                                    <span className="font-medium text-default-700">Gérer les Responsables ({totalResponsible})</span>
                                </Link>
                                <Link href="/super-admin/users?role=DRIVER" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                                    <Icon icon="heroicons:truck" className="h-5 w-5 text-indigo-500" />
                                    <span className="font-medium text-default-700">Gérer les Chauffeurs ({totalDrivers})</span>
                                </Link>
                                <Link href="/super-admin/users?role=PARENT" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                                    <Icon icon="heroicons:home" className="h-5 w-5 text-rose-500" />
                                    <span className="font-medium text-default-700">Gérer les Parents ({totalParents})</span>
                                </Link>
                                <Link href="/super-admin/subscriptions" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                                    <Icon icon="heroicons:currency-dollar" className="h-5 w-5 text-green-500" />
                                    <span className="font-medium text-default-700">Abonnements</span>
                                </Link>
                                <Link href="/super-admin/incidents" className="flex items-center space-x-2 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                                    <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-red-500" />
                                    <span className="font-medium text-default-700">Incidents</span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboardPage;