// pages/parent/ParentDashboardPage.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';

import dynamic from 'next/dynamic';


import { ParentDashboard} from './components/ParentDashboard';



// Import the ReportAttendanceModal


// BusTrackingMap is imported dynamically within BusTrackingModal, not here directly
const BusTrackingMap = dynamic(
  () => import('./components/BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false }
);



// ParentDashboardPage now expects 'onNavigate' prop from its layout
 const ParentDashboardPage = () => {
  
  return (
    
    <div className="space-y-6">
       <ParentDashboard /> 
    </div>
  );
};

export default ParentDashboardPage;