'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import toast from 'react-hot-toast';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import parentService from '@/services/parentService';
import { ChildInfoCard } from './ChildInfoCard';
import { ParentNotificationsList } from './ParentNotificationsList';
import { ParentIncidentList } from './ParentIncidentList';

import { AttendanceHistoryTable } from './AttendanceHistoryTable';
import { BusTrackingModal } from './BusTrackingModal';
import { ReportAttendanceModal } from './ReportAttendanceModal';
import { ReportConcernModal } from './ReportConcernModal';

export const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDailyTripDetails, setChildDailyTripDetails] = useState({});
  const [childAttendanceHistory, setChildAttendanceHistory] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [busPositions, setBusPositions] = useState({});
  const [activeNotificationTab, setActiveNotificationTab] = useState('all');

  const [isBusTrackingModalOpen, setIsBusTrackingModalOpen] = useState(false);
  const [isReportAttendanceModalOpen, setIsReportAttendanceModalOpen] = useState(false);
  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
  const [trackingChildId, setTrackingChildId] = useState(null);
  const [reportAttendanceChildId, setReportAttendanceChildId] = useState(null);
  const [reportAttendanceDailyTripId, setReportAttendanceDailyTripId] = useState(null);
  const [childIncidents, setChildIncidents] = useState({});

 // Modifiez la fonction refreshParentData pour récupérer les incidents
const refreshParentData = useCallback(async () => {
  try {
    const childrenList = await parentService.getChildren();
    setChildren(childrenList);

    if (childrenList.length > 0 && !selectedChildId) {
      setSelectedChildId(childrenList[0].student.id);
    }

    const tripDetailsMap = {};
    const attendanceHistoryMap = {};
    const busPositionsMap = {};
    const incidentsMap = {};

    for (const relation of childrenList) {
      const student = relation.student;
    
      try {
        const trackingResponse = await parentService.trackChildBus(student.id);
        tripDetailsMap[student.id] = trackingResponse.hasActiveTrip ? trackingResponse.trip : null;
        busPositionsMap[student.id] = trackingResponse.lastPosition ?? null;
        
        // Récupérer les incidents pour chaque enfant
        const incidents = await parentService.getChildIncidents(student.id);
        incidentsMap[student.id] = incidents || [];
      } catch (error) {
        console.error(`Erreur lors du tracking pour l'élève ${student.id}`, error);
        tripDetailsMap[student.id] = null;
        busPositionsMap[student.id] = null;
        incidentsMap[student.id] = [];
      }
    
      try {
        const attendanceResponse = await parentService.getChildAttendance(student.id);
        attendanceHistoryMap[student.id] = attendanceResponse.attendances ?? [];
      } catch (error) {
        console.error(`Erreur lors de la récupération des présences pour l'élève ${student.id}`, error);
        attendanceHistoryMap[student.id] = [];
      }
    }

    setChildDailyTripDetails(tripDetailsMap);
    setChildAttendanceHistory(attendanceHistoryMap);
    setBusPositions(busPositionsMap);
    setChildIncidents(incidentsMap);

    const fetchedNotifications = await parentService.getNotifications();
    setNotifications(fetchedNotifications);

  } catch (error) {
    console.error("Erreur lors du chargement des données du parent:", error);
  }
}, [selectedChildId]);

  useEffect(() => {
    refreshParentData();
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

  const handleMarkNotificationAsRead = async (notificationId) => {
    await parentService.markNotificationAsRead(notificationId);
    refreshParentData();
    toast.success('Notification marquée comme lue.');
  };

  const handleMarkAllNotificationsAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      toast('Aucune notification non lue', { icon: <Icon icon="heroicons:exclamation-circle" className="h-5 w-5 text-red-500" />});
      return;
    }

    try {
      await Promise.all(unreadNotifications.map(n => 
        parentService.markNotificationAsRead(n.id)
      ));
      refreshParentData();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      toast.error("Erreur lors du marquage des notifications");
    }
  };

  const filteredNotifications = () => {
    switch (activeNotificationTab) {
      case 'incidents':
        return notifications.filter(n => n.type === 'INCIDENT');
      case 'attendance':
        return notifications.filter(n => n.type === 'ATTENDANCE');
      case 'unread':
        return notifications.filter(n => !n.read);
      default:
        return notifications;
    }
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

  if (!children) return <div>Chargement...</div>;

  const selectedChild = children.find(c => c.student.id === selectedChildId)?.student;
  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Tableau de bord Parent</h1>
        </div>
        <Button onClick={() => setIsConcernModalOpen(true)} variant="outline">
          <Icon icon="heroicons:chat-bubble-left-right" className="h-5 w-5 mr-2" />
          Signaler une préoccupation
        </Button>
      </div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
    <Icon icon="heroicons:users" className="h-5 w-5 text-blue-500" />
    <div><p className="text-sm font-medium text-muted-foreground">Enfants</p><p className="text-2xl font-bold">{children.length}</p></div>
  </div></CardContent></Card>

  <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
    <Icon icon="heroicons:bell" className="h-5 w-5 text-red-500" />
    <div><p className="text-sm font-medium text-muted-foreground">Notifications</p><p className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</p></div>
  </div></CardContent></Card>

  <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
    <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-orange-500" />
    <div>
      <p className="text-sm font-medium text-muted-foreground">Incidents</p>
      <p className="text-2xl font-bold">
        {Object.values(childIncidents).reduce((total, incidents) => total + incidents.length, 0)}
      </p>
    </div>
  </div></CardContent></Card>

  <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
    <Icon icon="heroicons:clock" className="h-5 w-5 text-green-500" />
    <div>
      <p className="text-sm font-medium text-muted-foreground">Absences</p>
      <p className="text-2xl font-bold">
        {Object.values(childAttendanceHistory).reduce((total, attendances) => 
          total + attendances.filter(a => a.status === 'ABSENT').length, 0)}
      </p>
    </div>
  </div></CardContent></Card>
</div>

      {children.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Icon icon="heroicons:information-circle" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun enfant associé</h3>
          <p className="text-muted-foreground">Aucun enfant n'est actuellement associé à votre compte.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="heroicons:users" className="h-5 w-5" /> Vue d'ensemble des enfants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={String(selectedChildId)} onValueChange={(value) => setSelectedChildId(parseInt(value))}>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="flex w-max space-x-2">
                      {children.map(childRelation => {
                        const student = childRelation.student;
                        return (
                          <TabsTrigger key={student.id} value={String(student.id)} className="flex items-center gap-2 whitespace-nowrap">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{student.fullname.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {student.fullname}
                            <Badge className={getStatusColor(getChildStatus(student.id))}>
                              {getStatusText(getChildStatus(student.id))}
                            </Badge>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  {children.map(childRelation => {
                    const student = childRelation.student;
                    return (
                      <TabsContent key={student.id} value={String(student.id)} className="mt-6">
                        <ChildInfoCard
                          child={student}
                          dailyTripDetails={childDailyTripDetails[student.id]}
                          busPosition={busPositions[student.id]}
                          onTrackBus={handleTrackBus}
                          onReportAttendance={handleReportAttendance}
                        />
                        <Separator className="my-6" />
                        <AttendanceHistoryTable
                          student={student}
                          attendanceHistory={childAttendanceHistory[student.id]}
                        />
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
  <Tabs defaultValue="notifications" className="w-full">
    <TabsList className="grid grid-cols-2 w-full">
      <TabsTrigger value="notifications">
        <Icon icon="heroicons:bell" className="h-4 w-4 mr-1" />
        Notifications
      </TabsTrigger>
      <TabsTrigger value="incidents">
        <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4 mr-1" />
        Incidents
      </TabsTrigger>
    </TabsList>

    <TabsContent value="notifications">
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllNotificationsAsRead}
              className="text-primary"
            >
              <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-1" />
              Tout marquer comme lu
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ParentNotificationsList
            notifications={filteredNotifications()}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="incidents">
      <ParentIncidentList 
        incidents={selectedChildId ? childIncidents[selectedChildId] || [] : []} 
        onMarkAsRead={handleMarkNotificationAsRead}
      />
    </TabsContent>
  </Tabs>
</div>
        </div>
      )}

      <BusTrackingModal
        isOpen={isBusTrackingModalOpen}
        setIsOpen={setIsBusTrackingModalOpen}
        childId={trackingChildId}
      />

      <ReportAttendanceModal
        isOpen={isReportAttendanceModalOpen}
        setIsOpen={setIsReportAttendanceModalOpen}
        parentId={null}
        childId={reportAttendanceChildId}
        dailyTripId={reportAttendanceDailyTripId}
        onAttendanceReported={refreshParentData}
      />

      <ReportConcernModal
        isOpen={isConcernModalOpen}
        setIsOpen={setIsConcernModalOpen}
        parentId={null}
        onConcernReported={refreshParentData}
      />
    </div>
  );
};