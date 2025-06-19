// pages/parent/ParentDashboardPage.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  demoData,
  getUserById,
  getChildrenOfParent,
  getLastDailyTripForStudent,
  getAttendanceHistoryForStudent,
  getNotificationsForUser,
  markNotificationAsRead,
} from '@/data/data';
import dynamic from 'next/dynamic';

import { ChildInfoCard } from './components/ChildInfoCard';
import { ParentNotificationsList } from './components/ParentNotificationsList';
import { AttendanceHistoryTable } from './components/AttendanceHistoryTable';
import { ReportConcernModal } from './components/ReportConcernModal';
import { ParentDashboard} from './components/ParentDashboard';



// Import the ReportAttendanceModal
import { ReportAttendanceModal } from './components/ReportAttendanceModal'; // <-- Ensure this path is correct

import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// BusTrackingMap is imported dynamically within BusTrackingModal, not here directly
const BusTrackingMap = dynamic(
  () => import('./components/BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false }
);

const MOCK_PARENT_ID = 5;

// ParentDashboardPage now expects 'onNavigate' prop from its layout
export const ParentDashboardPage = ({ onNavigate }) => {
  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDailyTripDetails, setChildDailyTripDetails] = useState({});
  const [childAttendanceHistory, setChildAttendanceHistory] = useState({});
  const [notifications, setNotifications] = useState([]);

  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);

  // State for Bus Tracking Modal
  const [isBusTrackingModalOpen, setIsBusTrackingModalOpen] = useState(false);
  const [trackingChildId, setTrackingChildId] = useState(null);

  // State for Report Attendance Modal
  const [isReportAttendanceModalOpen, setIsReportAttendanceModalOpen] = useState(false);
  const [reportAttendanceChildId, setReportAttendanceChildId] = useState(null);
  const [reportAttendanceDailyTripId, setReportAttendanceDailyTripId] = useState(null);

  const refreshParentData = useCallback(() => {
    const parentUser = getUserById(MOCK_PARENT_ID);
    setParent(parentUser);

    const childrenList = getChildrenOfParent(MOCK_PARENT_ID);
    setChildren(childrenList);

    const tripDetailsMap = {};
    const attendanceHistoryMap = {};

    childrenList.forEach(child => {
      tripDetailsMap[child.id] = getLastDailyTripForStudent(child.id);
      attendanceHistoryMap[child.id] = getAttendanceHistoryForStudent(child.id);
    });
    setChildDailyTripDetails(tripDetailsMap);
    setChildAttendanceHistory(attendanceHistoryMap);

    const fetchedNotifications = getNotificationsForUser(MOCK_PARENT_ID);
    setNotifications(fetchedNotifications);

    if (childrenList.length > 0 && !selectedChildId) {
      setSelectedChildId(childrenList[0].id);
    }
  }, [selectedChildId]);


  useEffect(() => {
    refreshParentData();
  }, [currentDemoData, refreshParentData]);

  // handleTrackBus opens the bus tracking modal
  const handleTrackBus = (childId) => {
    setTrackingChildId(childId);
    setIsBusTrackingModalOpen(true);
  };

  // CORRECTED: handleReportAttendance opens the attendance report modal
  const handleReportAttendance = (childId, dailyTripId) => {
    if (!dailyTripId) {
        toast.error("Aucun trajet quotidien disponible pour signaler l'absence/retard.");
        return;
    }
    setReportAttendanceChildId(childId);
    setReportAttendanceDailyTripId(dailyTripId);
    setIsReportAttendanceModalOpen(true);
  };

  const handleAttendanceReported = () => {
    // Refresh parent data (especially attendance history or notifications) after a report
    refreshParentData();
    toast.success('Rapport d\'absence/retard envoyé !');
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
    setCurrentDemoData({ ...currentDemoData });
    toast.success('Notification marquée comme lue.');
  };

  const handleConcernReported = () => {
    setCurrentDemoData({ ...currentDemoData });
    toast.success('Votre message a été envoyé !');
  };


  if (!parent) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-default-600">
        Chargement des informations du parent...
      </div>
    );
  }

  const selectedChild = children.find(child => child.id === selectedChildId);
  const selectedChildDailyTripDetails = selectedChildId ? childDailyTripDetails[selectedChildId] : null;
  const selectedChildAttendanceHistory = selectedChildId ? childAttendanceHistory[selectedChildId] : [];


  return (
    
    <div className="space-y-6">
       <ParentDashboard /> 
    </div>
  );
};

export default ParentDashboardPage;