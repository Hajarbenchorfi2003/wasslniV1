// app/etablissements/[id]/page.jsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import {
  getGridConfig,
  getXAxisConfig,
  getYAxisConfig,
} from "@/lib/appex-chart-options";
import { detailsEstablishments } from '@/services/etablissements'; // Service API
import { useEffect, useState } from 'react';

export default function EstablishmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const establishmentId = parseInt(params.id, 10); // ID de l'établissement

  const { theme: config } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((th) => th.name === config);

  // États pour gérer les données, loading et erreur
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des données
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await detailsEstablishments(establishmentId);
        console.log('Données reçues:', data);

        // Mise en forme des données si nécessaire
        const school = data.school || {};
        const responsible = data.responsable || {};

        setDetails({
          ...data,
          schoolName: school.name || 'N/A',
          schoolEmail: school.email || 'N/A',
          schoolPhone: school.phone || 'N/A',
          schoolAddress: school.address || 'N/A',
          schoolCity: school.city || 'N/A',
          schoolIsActive: school.isActive || false,
          responsible: responsible || null,
        });

        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement de l'établissement", err);
        setError("Impossible de charger les détails de l'établissement.");
        setLoading(false);
      }
    };

    if (establishmentId) {
      fetchDetails();
    }
  }, [establishmentId]);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Chargement...</p>
      </div>
    );
  }

  // Si erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center text-destructive">
        <p>{error}</p>
        <Button onClick={() => router.back()} variant="outline" className="ml-4">Retour</Button>
      </div>
    );
  }

  // Si pas de données trouvées
  if (!details) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center text-muted-foreground">
        <p>Établissement non trouvé.</p>
        <Button onClick={() => router.back()} variant="outline" className="ml-4">Retour</Button>
      </div>
    );
  }

  const {
    name,
    email,
    phone,
    address,
    quartie,
    city,
    schoolName,
    schoolEmail,
    schoolPhone,
    schoolAddress,
    schoolCity,
    schoolIsActive,
    responsible,
    students = [],
    buses = [],
    trips = [],
    routes = [],
  } = details;

  // Préparation des données pour les graphiques
  const studentDistributionData = {
    series: [{
      name: 'Élèves',
      data: [students.length]
    }],
    options: {
      chart: {
        type: 'area',
        height: 200,
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 4,
      },
      colors: [`hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`],
      tooltip: { theme: mode === "dark" ? "dark" : "light" },
      grid: getGridConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
      ),
      fill: {
        type: "gradient",
        colors: [`hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`],
        gradient: {
          shadeIntensity: 0.1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [50, 100, 0],
        },
      },
      yaxis: getYAxisConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
      ),
      xaxis: getXAxisConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
      ),
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    }
  };

  const busUtilizationData = {
    series: [{
      name: 'Utilisation',
      data: buses.map(bus => Math.floor(Math.random() * 100))
    }],
    options: {
      chart: {
        type: 'bar',
        height: 200,
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 4,
      },
      colors: [`hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`],
      tooltip: { theme: mode === "dark" ? "dark" : "light" },
      grid: getGridConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
      ),
      fill: {
        type: "gradient",
        colors: [`hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`],
        gradient: {
          shadeIntensity: 0.1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [50, 100, 0],
        },
      },
      yaxis: getYAxisConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
      ),
      xaxis: {
        categories: buses.map(bus => bus.plateNumber),
        labels: getXAxisConfig(
          `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
        ),
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">{name}</div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Vue d'ensemble
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="heroicons:academic-cap" className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-default-600">Élèves</span>
                  </div>
                  <div className="text-2xl font-bold text-default-900">{students.length}</div>
                </div>
                <div className="p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="heroicons:truck" className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium text-default-600">Bus</span>
                  </div>
                  <div className="text-2xl font-bold text-default-900">{buses.length}</div>
                </div>
                <div className="p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="heroicons:map" className="h-5 w-5 text-info" />
                    <span className="text-sm font-medium text-default-600">Routes</span>
                  </div>
                  <div className="text-2xl font-bold text-default-900">{routes.length}</div>
                </div>
                <div className="p-4 bg-default-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="heroicons:calendar-days" className="h-5 w-5 text-warning" />
                    <span className="text-sm font-medium text-default-600">Trajet</span>
                  </div>
                  <div className="text-2xl font-bold text-default-900">{trips.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Responsable Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {responsible ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:user" className="h-5 w-5 text-default-500" />
                    <span className="text-default-600">{responsible.fullname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:at-symbol" className="h-5 w-5 text-default-500" />
                    <span className="text-default-600">{responsible.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:phone" className="h-5 w-5 text-default-500" />
                    <span className="text-default-600">{responsible.phone || 'Non renseigné'}</span>
                  </div>
                  
                </div>
              ) : (
                <p className="text-gray-600">Aucun responsable assigné.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Graphique Bus */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Utilisation des Bus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={busUtilizationData.options}
                series={busUtilizationData.series}
                type="area"
                height={200}
                width="100%"
              />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Informations de l'École
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:building-library" className="h-5 w-5 text-default-500" />
                  <span className="font-medium text-default-600">{schoolName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:at-symbol" className="h-5 w-5 text-default-500" />
                  <span className="text-default-600">{schoolEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:phone" className="h-5 w-5 text-default-500" />
                  <span className="text-default-600">{schoolPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:map-pin" className="h-5 w-5 text-default-500" />
                  <span className="text-default-600">{schoolAddress}, {schoolCity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:check-circle" className="h-5 w-5 text-default-500" />
                  <Badge variant={schoolIsActive ? "default" : "destructive"}>
                    {schoolIsActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribution élèves */}
      <Card>
        <CardHeader className="border-none p-6 pt-5 mb-0">
          <CardTitle className="text-lg font-semibold text-default-900 p-0">
            Distribution des Élèves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={studentDistributionData.options}
            series={studentDistributionData.series}
            type="area"
            height={200}
            width="100%"
          />
        </CardContent>
      </Card>

      {/* Liste élèves, bus, etc. */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Élèves ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {students.map(student => (
                    <li key={student.id} className="flex items-center gap-2 p-2 hover:bg-default-50 rounded">
                      <Icon icon="heroicons:user" className="h-4 w-4 text-gray-400" />
                      <span>{student.fullname} (<span className="font-mono text-sm">{student.class}</span>)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">Aucun élève associé.</p>
              )}
              <Link href="/super-admin/students" className="text-primary hover:underline text-sm mt-3 block">
                Voir tous les élèves
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Bus Affectés ({buses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {buses.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {buses.map(bus => (
                    <li key={bus.id} className="flex items-center gap-2 p-2 hover:bg-default-50 rounded">
                      <Icon icon="heroicons:truck" className="h-4 w-4 text-gray-400" />
                      <span>{bus.plateNumber} ({bus.marque})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">Aucun bus affecté.</p>
              )}
              <Link href="/super-admin/buses" className="text-primary hover:underline text-sm mt-3 block">
                Voir tous les bus
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Routes ({routes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {routes.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {routes.map(route => (
                    <li key={route.id} className="flex items-center gap-2 p-2 hover:bg-default-50 rounded">
                      <Icon icon="heroicons:map" className="h-4 w-4 text-gray-400" />
                      <span>{route.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">Aucune route trouvée.</p>
              )}
              <Link href="/super-admin/routes" className="text-primary hover:underline text-sm mt-3 block">
                Voir toutes les routes
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader className="border-none p-6 pt-5 mb-0">
              <CardTitle className="text-lg font-semibold text-default-900 p-0">
                Trajets ({trips.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trips.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {trips.map(trip => (
                    <li key={trip.id} className="flex items-center gap-2 p-2 hover:bg-default-50 rounded">
                      <Icon icon="heroicons:calendar-days" className="h-4 w-4 text-gray-400" />
                      <span>{trip.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">Aucun trajet planifié.</p>
              )}
              <Link href="/super-admin/trips" className="text-primary hover:underline text-sm mt-3 block">
                Voir tous les trajets
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}