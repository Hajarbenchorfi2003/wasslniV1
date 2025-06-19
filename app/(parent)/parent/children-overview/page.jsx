// app/[lang]/(parent)/parent/children-overview/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Import useParams

import {
  demoData,
  getChildrenOfParent,
  getLastDailyTripForStudent,
} from '@/data/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const ChildrenOverviewPage = () => {
  const router = useRouter();
  const params = useParams(); // Get route parameters, including 'lang'
  const { lang } = params; // Extract lang

  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [childrenInfo, setChildrenInfo] = useState([]);

  const MOCK_PARENT_ID = 5; // Ensure this parent has children in data-donne.js

  const refreshChildrenInfo = useCallback(() => {
    const childrenList = getChildrenOfParent(MOCK_PARENT_ID);
    const enrichedChildren = childrenList.map(child => {
      const dailyTripDetails = getLastDailyTripForStudent(child.id);
      return {
        ...child,
        dailyTripDetails,
      };
    });
    setChildrenInfo(enrichedChildren);
  }, [currentDemoData]);

  useEffect(() => {
    refreshChildrenInfo();
  }, [refreshChildrenInfo]);

  const getTripStatusColor = (s) => {
    switch (s) {
      case 'PLANNED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELED': return 'red';
      default: return 'gray';
    }
  };

  const getTripStatusText = (s) => {
    switch (s) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELED': return 'Annulé';
      default: return 'N/A';
    }
  };

  const handleNavigateToBusTracking = (childId) => {
    // CORRECTED PATH: Include the 'lang' parameter explicitly
    router.push(`/${lang}/parent/bus-tracking?childId=${childId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-default-900">Vue d'ensemble de mes Enfants</h1>
      <p className="text-default-600">Retrouvez les informations clés de vos enfants et de leurs trajets.</p>

      {childrenInfo.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          Aucun enfant associé à votre compte ou aucune donnée de trajet trouvée.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {childrenInfo.map(child => (
            <Card key={child.id} className="shadow-sm border border-gray-200">
              <CardHeader className="py-4 px-6 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                  <Icon icon="heroicons:user-circle" className="h-6 w-6 text-primary" />
                  {child.fullname}
                </CardTitle>
                <CardDescription className="text-sm text-default-600">
                  <span className="font-medium">Classe:</span> {child.class} &bull; <span className="font-medium">Quartier:</span> {child.quartie}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {child.dailyTripDetails ? (
                  <div className="space-y-4">
                    <p className="text-default-600">
                      <strong className="text-default-800">Trajet:</strong> {child.dailyTripDetails.trip?.name || 'N/A'}
                    </p>
                    <p className="text-default-600">
                      <strong className="text-default-800">Bus:</strong> {child.dailyTripDetails.trip?.bus?.plateNumber || 'N/A'}
                    </p>
                    <p className="text-default-600">
                      <strong className="text-default-800">Chauffeur:</strong> {child.dailyTripDetails.trip?.driver?.fullname || 'N/A'}
                    </p>
                    <p className="text-default-600 flex items-center">
                      <strong className="text-default-800 mr-2">Statut:</strong>
                      <Badge variant="soft" color={getTripStatusColor(child.dailyTripDetails.status)} className="capitalize">
                        {getTripStatusText(child.dailyTripDetails.status)}
                      </Badge>
                    </p>
                    <div className="pt-4 flex justify-end">
                      <Button onClick={() => handleNavigateToBusTracking(child.id)} variant="default">
                        <Icon icon="heroicons:map-pin" className="h-4 w-4 mr-2" /> Suivre le Bus
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-default-500">
                    <Icon icon="heroicons:information-circle" className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm">Aucun trajet assigné trouvé pour cet enfant.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildrenOverviewPage;