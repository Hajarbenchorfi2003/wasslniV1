'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import parentService from '@/services/parentService';

const ITEMS_PER_PAGE = 3;

 const ChildrenOverviewPage = () => {
  const router = useRouter();
  const [childrenInfo, setChildrenInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchChildrenInfo = async () => {
    setLoading(true);
    try {
      const children = await parentService.getChildren();
      
      const enrichedChildren = await Promise.all(
        children.map(async (child) => {
          try {
            const childDetails = await parentService.getChildDetails(child.student.id);
            // Ensure we have a valid trip object
            const tripDetails = childDetails.dailyTripsToday?.[0] || null;
            return { 
              ...child, 
              tripDetails: tripDetails && tripDetails.trip ? tripDetails : null
            };
          } catch (error) {
            console.error("Error fetching child details:", error);
            return { ...child, tripDetails: null };
          }
        })
      );

      setChildrenInfo(enrichedChildren);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error("Erreur lors du chargement des enfants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildrenInfo();
  }, []);

  // Gestion de pagination
  const totalPages = Math.ceil(childrenInfo.length / ITEMS_PER_PAGE);
  const paginatedChildren = childrenInfo.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [childrenInfo, totalPages , currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getTripStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELED': return 'red';
      default: return 'gray';
    }
  };

  const getTripStatusText = (status) => {
    switch (status) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELED': return 'Annulé';
      default: return 'N/A';
    }
  };

  const handleNavigateToBusTracking = (childId) => {
    router.push(`/parent/bus-tracking?childId=${childId}`);
  };

  if (loading) {
    return <div className="text-center py-10 text-default-600">Chargement des données...</div>;
  }

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold text-default-900">Vue d&apos;ensemble de mes Enfants</h1>
       <p className="text-default-600">Retrouvez les informations clés de vos enfants et de leurs trajets.</p>

      {childrenInfo.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          Aucun enfant associé à votre compte ou aucune donnée de trajet trouvée.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedChildren.map((child) => {
              const student = child.student;
              const tripData = child.tripDetails;
              
              // Safely extract all trip information
              const tripName = tripData?.trip?.name || 'N/A';
              const busPlate = tripData?.trip?.bus?.plateNumber || 'N/A';
              const busBrand = tripData?.trip?.bus?.marque || 'N/A';
              const driverName = tripData?.trip?.driver?.fullname || 'N/A';
              const timeSlot = tripData?.timeSlot === 'MATIN' ? 'Matin' : 'Soir';
              const tripStatus = tripData?.status || 'UNKNOWN';

              return (
                <Card key={student.id} className="shadow-sm border border-gray-200">
                  <CardHeader className="py-4 px-6 border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                      <Icon icon="heroicons:user-circle" className="h-6 w-6 text-primary" />
                      {student.fullname}
                    </CardTitle>
                    <CardDescription className="text-sm text-default-600">
                      <span className="font-medium">Classe:</span> {student.class} &bull; <span className="font-medium">Quartier:</span> {student.quartie}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {tripData ? (
                      <div className="space-y-4">
                        <div>
                          <strong>Trajet:</strong> {tripName}
                        </div>
                        <div>
                          <strong>Bus:</strong> {busPlate} ({busBrand})
                        </div>
                        <div>
                          <strong>Chauffeur:</strong> {driverName}
                        </div>
                        <div>
                          <strong>Horaire:</strong> {timeSlot}
                        </div>
                        <div className="flex items-center">
                          <strong className="mr-2">Statut:</strong>
                          <Badge 
                            variant="soft" 
                            color={getTripStatusColor(tripStatus)} 
                            className="capitalize"
                          >
                            {getTripStatusText(tripStatus)}
                          </Badge>
                        </div>
                        <div className="pt-4 flex justify-end">
                          <Button 
                            onClick={() => handleNavigateToBusTracking(student.id)} 
                            variant="default"
                          >
                            <Icon icon="heroicons:map-pin" className="h-4 w-4 mr-2" /> 
                            Suivre le Bus
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
              );
            })}
          </div>
{/* Pagination remains the same */}
{totalPages > 1 && (
            <div className="flex gap-2 items-center mt-8 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={page === currentPage ? "default" : "outline"}
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              ))}

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChildrenOverviewPage;