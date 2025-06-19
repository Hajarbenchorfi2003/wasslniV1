// pages/parent/ParentAttendanceHistoryPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  demoData,
  getChildrenOfParent,
  getAttendanceHistoryForStudent,
} from '@/data/data';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable'; // Re-use the table component

import { Card, CardContent, CardHeader, CardTitle,CardDescription  } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input'; // Import Input
import DatePickerWithRange from "@/components/date-picker-with-range"; // Import DatePickerWithRange
import { cn } from '@/lib/utils'; // For pagination button styling
import { Button } from '@/components/ui/button'; // For pagination buttons

const MOCK_PARENT_ID = 5; // Use the connected parent ID
const ITEMS_PER_PAGE = 10; // Number of attendance records per page

export const ParentAttendanceHistoryPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [children, setChildren] = useState([]);
  const [allChildrenAttendanceHistory, setAllChildrenAttendanceHistory] = useState([]); // Consolidated history
  const [filteredAttendanceHistory, setFilteredAttendanceHistory] = useState([]); // Filtered history
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [selectedDateRange, setSelectedDateRange] = useState(null); // State for date range filter
  const [currentPage, setCurrentPage] = useState(1); // State for pagination

  const refreshAttendanceHistory = useCallback(() => {
    const childrenList = getChildrenOfParent(MOCK_PARENT_ID);
    setChildren(childrenList);

    let consolidatedHistory = [];
    childrenList.forEach(child => {
      const historyForChild = getAttendanceHistoryForStudent(child.id).map(record => ({
        ...record,
        childName: child.fullname, // Add child's name for easier filtering/display
      }));
      consolidatedHistory = consolidatedHistory.concat(historyForChild);
    });

    // Sort all records by timestamp, newest first
    consolidatedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setAllChildrenAttendanceHistory(consolidatedHistory);
    setCurrentPage(1); // Reset page on data refresh
  }, [currentDemoData]);

  useEffect(() => {
    refreshAttendanceHistory();
  }, [refreshAttendanceHistory]);

  // Effect to apply filters and update pagination whenever filters or base data change
  useEffect(() => {
    let tempFilteredHistory = [...allChildrenAttendanceHistory];

    // Apply date range filter
    if (selectedDateRange?.from) {
      const fromDate = new Date(selectedDateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : fromDate;
      toDate.setHours(23, 59, 59, 999);

      tempFilteredHistory = tempFilteredHistory.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= fromDate && recordDate <= toDate;
      });
    }

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredHistory = tempFilteredHistory.filter(record =>
        record.childName.toLowerCase().includes(lowerCaseSearchTerm) ||
        (record.dailyTripName && record.dailyTripName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        record.status.toLowerCase().includes(lowerCaseSearchTerm) ||
        record.type.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredAttendanceHistory(tempFilteredHistory);

    // Adjust current page if filters reduce the total pages
    const newTotalPages = Math.ceil(tempFilteredHistory.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (tempFilteredHistory.length === 0 && currentPage !== 1) {
        setCurrentPage(1); // If no results, reset to page 1
    } else if (newTotalPages === 0 && tempFilteredHistory.length > 0) {
        // This case handles when totalPages becomes 0 but there are still items (e.g., ITEMS_PER_PAGE changed)
        setCurrentPage(1);
    }

  }, [allChildrenAttendanceHistory, searchTerm, selectedDateRange, currentPage]);


  const totalPages = Math.ceil(filteredAttendanceHistory.length / ITEMS_PER_PAGE);
  const paginatedAttendanceHistory = filteredAttendanceHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  // Render loading state if no children found yet (initial load)
  if (children.length === 0 && allChildrenAttendanceHistory.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-default-900">Historique de Présence</h1>
        <div className="flex justify-center items-center h-[calc(100vh-250px)] text-xl text-default-600">
            <Icon icon="heroicons:arrow-path" className="h-6 w-6 animate-spin mr-2" /> Chargement de l'historique de présence...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-default-900">Historique de Présence</h1>
      <p className="text-default-600">Consultez et filtrez l'historique de présence de vos enfants.</p>

      {/* Filter and Search Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom d'enfant, trajet, ou statut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon
            icon="heroicons:magnifying-glass"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </div>
        <DatePickerWithRange
          date={selectedDateRange}
          setDate={setSelectedDateRange}
          placeholder="Filtrer par date"
        />
      </div>

      {children.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          Aucun enfant associé à votre compte.
        </div>
      ) : (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="py-4 px-6 border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
              <Icon icon="heroicons:list-bullet" className="h-6 w-6 text-indigo-500" />
              Toutes les entrées de présence
             </CardTitle>
             <CardDescription>Nombre total d'entrées: {filteredAttendanceHistory.length}.</CardDescription>

          </CardHeader>
          <CardContent className="p-0"> {/* p-0 because table has its own padding */}
            {/* Attendance History Table - Pass paginated data */}
            <AttendanceHistoryTable
              student={{ fullname: "Tous les enfants" }} // Placeholder student for generic header if table uses it
              attendanceHistory={paginatedAttendanceHistory}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex gap-2 items-center justify-center p-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    variant={page === currentPage ? "default" : "outline"}
                    className={cn("w-8 h-8", page === currentPage ? "bg-primary text-primary-foreground" : "text-default-700")}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentAttendanceHistoryPage;