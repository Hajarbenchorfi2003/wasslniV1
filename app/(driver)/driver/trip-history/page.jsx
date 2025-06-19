// pages/driver/TripHistoryPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  demoData,
  getDailyTripsForDriver,
  getStudentsByTrip,
  getTripById,
} from '@/data/data';

import { AssignedTripsList } from '../AssignedTripsList'; // Re-use this list component
import { Input } from '@/components/ui/input';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 10;
const MOCK_DRIVER_ID = 4;

export const TripHistoryPage = ({ onSelectDailyTripForDetails, onGoBack }) => {
  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [allDriverTrips, setAllDriverTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchedTrips = getDailyTripsForDriver(MOCK_DRIVER_ID, null);
    setAllDriverTrips(fetchedTrips);
    setCurrentPage(1);
  }, [currentDemoData]);

  useEffect(() => {
    let tempFilteredTrips = [...allDriverTrips];

    if (selectedDateRange?.from) {
      const fromDate = new Date(selectedDateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : fromDate;
      toDate.setHours(23, 59, 59, 999);

      tempFilteredTrips = tempFilteredTrips.filter(dTrip => {
        const tripDate = new Date(dTrip.date);
        return tripDate >= fromDate && tripDate <= toDate;
      });
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredTrips = tempFilteredTrips.filter(dTrip => {
        const trip = dTrip.trip;
        const bus = trip?.bus;
        const route = trip?.route;

        const studentsAssigned = getStudentsByTrip(trip.id);
        const studentNameMatch = studentsAssigned.some(student =>
          student.fullname.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return (
          trip?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          bus?.plateNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
          bus?.marque.toLowerCase().includes(lowerCaseSearchTerm) ||
          route?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          studentNameMatch
        );
      });
    }

    setFilteredTrips(tempFilteredTrips);
    const newTotalPages = Math.ceil(tempFilteredTrips.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredTrips.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredTrips.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }

  }, [allDriverTrips, searchTerm, selectedDateRange, currentPage]);

  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">Historique des Trajets</h1>
        {onGoBack && (
          <Button onClick={onGoBack} variant="outline">
            <Icon icon="heroicons:arrow-left" className="h-4 w-4 mr-2" /> Retour
          </Button>
        )}
      </div>
      <p className="text-default-600">Consultez et recherchez vos trajets passés.</p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par trajet, bus, élève..."
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

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:list-bullet" className="h-6 w-6 text-indigo-500" />
            Tous les trajets
          </CardTitle>
          <CardDescription>
            Nombre total de trajets filtrés: {filteredTrips.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AssignedTripsList
            dailyTrips={paginatedTrips}
            onSelectDailyTrip={onSelectDailyTripForDetails}
            selectedDailyTripId={null}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onViewDetails={onSelectDailyTripForDetails}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TripHistoryPage;