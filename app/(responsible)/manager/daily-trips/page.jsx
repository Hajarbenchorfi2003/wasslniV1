// pages/manager/DailyTripsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    demoData,
    getDailyTripsByEstablishment,
    getStudentsByTrip, // Still needed for filtering logic
    getTripById,
} from '@/data/data';

// Import the new DailyTripCard
import DailyTripCard from './DailyTripCard'; // Adjust path

import { Input } from '@/components/ui/input';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import toast from 'react-hot-toast'; // Ensure toast is imported

const ITEMS_PER_PAGE = 6; // Affichera 6 cartes par page (ex: 2 lignes de 3 cartes)

export const DailyTripsPage = ({ managerEstablishmentId =1}) => {
    const [currentDemoData, setCurrentDemoData] = useState(demoData);
    const [dailyTrips, setDailyTrips] = useState([]); // Daily trips after initial fetch and enrichment
    const [filteredDailyTrips, setFilteredDailyTrips] = useState([]); // Daily trips after applying filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const establishmentName = currentDemoData.establishments.find(e => e.id === managerEstablishmentId)?.name || 'Votre Établissement';

    const refreshDailyTrips = useCallback(() => {
        if (!managerEstablishmentId) return;
        const fetchedTrips = getDailyTripsByEstablishment(managerEstablishmentId, null); // Get all daily trips for establishment
        setDailyTrips(fetchedTrips); // This now holds all enriched daily trips for the establishment
        setCurrentPage(1); // Reset page on data refresh
    }, [managerEstablishmentId, currentDemoData]);

    useEffect(() => {
        refreshDailyTrips();
    }, [refreshDailyTrips]);

    useEffect(() => {
        let tempFiltered = [...dailyTrips]; // Start with all daily trips for the establishment

        if (selectedDateRange?.from) {
            const fromDate = new Date(selectedDateRange.from);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : fromDate;
            toDate.setHours(23, 59, 59, 999);

            tempFiltered = tempFiltered.filter(dTrip => {
                const tripDate = new Date(dTrip.date);
                return tripDate >= fromDate && tripDate <= toDate;
            });
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            tempFiltered = tempFiltered.filter(dTrip => {
                const trip = dTrip.trip;
                const bus = trip?.bus;
                const route = trip?.route;
                const driver = trip?.driver;

                // Ensure getStudentsByTrip is called for the correct trip
                // Note: dailyTrip.trip.id is the master trip ID
                const studentsAssigned = getStudentsByTrip(dTrip.trip.id);
                const studentNameMatch = studentsAssigned.some(student =>
                    student.fullname.toLowerCase().includes(lowerCaseSearchTerm)
                );

                return (
                    trip?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    bus?.plateNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
                    bus?.marque.toLowerCase().includes(lowerCaseSearchTerm) ||
                    route?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    driver?.fullname.toLowerCase().includes(lowerCaseSearchTerm) ||
                    studentNameMatch
                );
            });
        }

        setFilteredDailyTrips(tempFiltered);
        const newTotalPages = Math.ceil(tempFiltered.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0 && tempFiltered.length > 0) {
            setCurrentPage(1);
        } else if (tempFiltered.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [dailyTrips, searchTerm, selectedDateRange, currentPage]); // Depend on dailyTrips (already establishment-filtered)

    const totalPages = Math.ceil(filteredDailyTrips.length / ITEMS_PER_PAGE);
    const paginatedDailyTrips = filteredDailyTrips.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleViewDailyTripDetails = (dailyTrip) => {
        toast.info(`Afficher les détails du trajet quotidien ${dailyTrip.trip?.name} (ID: ${dailyTrip.id})`);
        // In a real app, this would navigate to a specific daily trip detail page,
        // potentially like the driver's DailyTripDetailsPage, passing dailyTrip.id
    };

    if (!managerEstablishmentId) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-default-600">
                Chargement de l'établissement...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-default-900">Gestion des Trajets Quotidiens</h1>
            <p className="text-default-600">Trajets quotidiens de l'établissement **{establishmentName}**.</p>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Input
                        type="text"
                        placeholder="Rechercher un trajet quotidien..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md w-full"
                    />
                    <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                        <Icon icon="heroicons:calendar-days" className="h-6 w-6 text-primary" />
                        Liste des Trajets Quotidiens
                    </CardTitle>
                    <CardDescription>
                        Nombre total de trajets quotidiens filtrés: {filteredDailyTrips.length}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {paginatedDailyTrips.length > 0 ? (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {paginatedDailyTrips.map((dailyTrip) => (
                                <DailyTripCard
                                    key={dailyTrip.id}
                                    dailyTrip={dailyTrip}
                                    onSelectDailyTripForDetails={handleViewDailyTripDetails} // Pass details handler
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="col-span-full text-center text-gray-500 py-10">Aucun Trajet Quotidien trouvé.</p>
                    )}
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex gap-2 items-center justify-center p-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8"
                    >
                        <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={`page-${page}`}
                            onClick={() => handlePageChange(page)}
                            variant={page === currentPage ? "default" : "outline"}
                            className={cn("w-8 h-8")}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                    >
                        <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DailyTripsPage;