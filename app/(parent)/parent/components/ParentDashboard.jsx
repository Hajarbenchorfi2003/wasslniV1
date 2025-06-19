'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getUserById,
  getChildrenOfParent,
  getLastDailyTripForStudent,
  getAttendanceHistoryForStudent,
  getNotificationsForUser,
  markNotificationAsRead,
  getLatestBusPosition,
} from '@/data/data';
import { ChildInfoCard } from './ChildInfoCard';
import { ParentNotificationsList } from './ParentNotificationsList';
import { AttendanceHistoryTable } from './AttendanceHistoryTable';
import { BusTrackingModal } from './BusTrackingModal';
import { ReportAttendanceModal } from './ReportAttendanceModal';
import { ReportConcernModal } from './ReportConcernModal';
import toast from 'react-hot-toast';

const MOCK_PARENT_ID = 5;

export const ParentDashboard = () => {
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDailyTripDetails, setChildDailyTripDetails] = useState({});
  const [childAttendanceHistory, setChildAttendanceHistory] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [busPositions, setBusPositions] = useState({});

  // Modal states
  const [isBusTrackingModalOpen, setIsBusTrackingModalOpen] = useState(false);
  const [isReportAttendanceModalOpen, setIsReportAttendanceModalOpen] = useState(false);
  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
  const [trackingChildId, setTrackingChildId] = useState(null);
  const [reportAttendanceChildId, setReportAttendanceChildId] = useState(null);
  const [reportAttendanceDailyTripId, setReportAttendanceDailyTripId] = useState(null);

  const refreshParentData = useCallback(() => {
    const parentUser = getUserById(MOCK_PARENT_ID);
    setParent(parentUser);

    const childrenList = getChildrenOfParent(MOCK_PARENT_ID);
    setChildren(childrenList);

    const tripDetailsMap = {};
    const attendanceHistoryMap = {};
    const busPositionsMap = {};

    childrenList.forEach(child => {
      const dailyTrip = getLastDailyTripForStudent(child.id);
      tripDetailsMap[child.id] = dailyTrip;
      attendanceHistoryMap[child.id] = getAttendanceHistoryForStudent(child.id);
      
      // Get bus position for each child
      if (dailyTrip) {
        const busPosition = getLatestBusPosition(dailyTrip.id);
        busPositionsMap[child.id] = busPosition;
      }
    });

    setChildDailyTripDetails(tripDetailsMap);
    setChildAttendanceHistory(attendanceHistoryMap);
    setBusPositions(busPositionsMap);

    const fetchedNotifications = getNotificationsForUser(MOCK_PARENT_ID);
    setNotifications(fetchedNotifications);

    if (childrenList.length > 0 && !selectedChildId) {
      setSelectedChildId(childrenList[0].id);
    }
  }, [selectedChildId]);

  useEffect(() => {
    refreshParentData();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(refreshParentData, 30000);
    return () => clearInterval(interval);
  }, [refreshParentData]);

  const handleTrackBus = (childId) => {
    setTrackingChildId(childId);
    setIsBusTrackingModalOpen(true);
  };

  const handleReportAttendance = (childId, dailyTripId) => {
    if (!dailyTripId) {
      toast.error("Aucun trajet quotidien disponible pour signaler l'absence/retard.");
      return;
    }
    setReportAttendanceChildId(childId);
    setReportAttendanceDailyTripId(dailyTripId);
    setIsReportAttendanceModalOpen(true);
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
    refreshParentData();
    toast.success('Notification marquée comme lue.');
  };

  const getNotificationCount = (type) => {
    return notifications.filter(n => n.type === type && !n.read).length;
  };

  const getChildStatus = (childId) => {
    const dailyTrip = childDailyTripDetails[childId];
    if (!dailyTrip) return 'NO_TRIP';
    
    switch (dailyTrip.status) {
      case 'ONGOING': return 'ON_BUS';
      case 'COMPLETED': return 'ARRIVED';
      case 'PLANNED': return 'WAITING';
      default: return 'UNKNOWN';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ON_BUS': return 'bg-green-100 text-green-800';
      case 'ARRIVED': return 'bg-blue-100 text-blue-800';
      case 'WAITING': return 'bg-yellow-100 text-yellow-800';
      case 'NO_TRIP': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ON_BUS': return 'Dans le bus';
      case 'ARRIVED': return 'Arrivé';
      case 'WAITING': return 'En attente';
      case 'NO_TRIP': return 'Pas de trajet';
      default: return 'Inconnu';
    }
  };

  if (!parent) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Tableau de bord Parent</h1>
          <p className="text-default-600">Bienvenue, {parent.fullname}</p>
        </div>
        <Button onClick={() => setIsConcernModalOpen(true)} variant="outline">
          <Icon icon="heroicons:chat-bubble-left-right" className="h-5 w-5 mr-2" />
          Signaler une préoccupation
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:users" className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enfants</p>
                <p className="text-2xl font-bold">{children.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:bell" className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nouvelles notifications</p>
                <p className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incidents</p>
                <p className="text-2xl font-bold">{getNotificationCount('INCIDENT')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:clock" className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absences</p>
                <p className="text-2xl font-bold">{getNotificationCount('ATTENDANCE')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon icon="heroicons:information-circle" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun enfant associé</h3>
            <p className="text-muted-foreground">Aucun enfant n'est actuellement associé à votre compte.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Children Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="heroicons:users" className="h-5 w-5" />
                  Vue d'ensemble des enfants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={String(selectedChildId)} onValueChange={(value) => setSelectedChildId(parseInt(value))}>
                  <TabsList className="grid w-full grid-cols-2">
                    {children.map(child => (
                      <TabsTrigger key={child.id} value={String(child.id)} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{child.fullname.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {child.fullname}
                        <Badge className={getStatusColor(getChildStatus(child.id))}>
                          {getStatusText(getChildStatus(child.id))}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {children.map(child => (
                    <TabsContent key={child.id} value={String(child.id)} className="mt-6">
                      <ChildInfoCard
                        child={child}
                        dailyTripDetails={childDailyTripDetails[child.id]}
                        busPosition={busPositions[child.id]}
                        onTrackBus={handleTrackBus}
                        onReportAttendance={handleReportAttendance}
                      />
                      
                      <Separator className="my-6" />
                      
                      <AttendanceHistoryTable
                        student={child}
                        attendanceHistory={childAttendanceHistory[child.id]}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Sidebar */}
          <div className="lg:col-span-1">
            <ParentNotificationsList
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <BusTrackingModal
        isOpen={isBusTrackingModalOpen}
        setIsOpen={setIsBusTrackingModalOpen}
        childId={trackingChildId}
      />

      <ReportAttendanceModal
        isOpen={isReportAttendanceModalOpen}
        setIsOpen={setIsReportAttendanceModalOpen}
        parentId={MOCK_PARENT_ID}
        childId={reportAttendanceChildId}
        dailyTripId={reportAttendanceDailyTripId}
        onAttendanceReported={refreshParentData}
      />

      <ReportConcernModal
        isOpen={isConcernModalOpen}
        setIsOpen={setIsConcernModalOpen}
        parentId={MOCK_PARENT_ID}
        onConcernReported={refreshParentData}
      />
    </div>
  );
}; 