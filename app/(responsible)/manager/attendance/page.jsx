// pages/manager/AttendancePage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    demoData,
    getStudentsByEstablishment, // To get students for filtering
    getAttendanceHistoryForStudent, // To get individual student history
    getDailyTripsByEstablishment, // To get trips to filter attendance by
} from '@/data/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"; // For scrollable table content

const ITEMS_PER_PAGE = 15; // Records per page

// IMPORTANT: This component now requires managerEstablishmentId as a prop
export const AttendancePage = ({ managerEstablishmentId = 1 }) => {
    const [currentDemoData, setCurrentDemoData] = useState(demoData);
    const [allEstablishmentAttendance, setAllEstablishmentAttendance] = useState([]); // All attendance records for establishment
    const [filteredAttendance, setFilteredAttendance] = useState([]); // Filtered history
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [selectedDateRange, setSelectedDateRange] = useState(null); // State for date range filter
    const [selectedStudentId, setSelectedStudentId] = useState('all'); // Filter by specific student
    const [currentPage, setCurrentPage] = useState(1); // State for pagination

    const [studentsInEstablishment, setStudentsInEstablishment] = useState([]); // For student filter dropdown

    const establishmentName = currentDemoData.establishments.find(e => e.id === managerEstablishmentId)?.name || 'Votre Établissement';


    const getAttendanceColor = (status) => {
        switch (status) {
            case 'PRESENT': return 'green';
            case 'ABSENT': return 'red';
            case 'LATE': return 'yellow';
            default: return 'gray';
        }
    };

    const getAttendanceText = (status) => {
        switch (status) {
            case 'PRESENT': return 'Présent';
            case 'ABSENT': return 'Absent';
            case 'LATE': return 'En Retard';
            default: return 'Non marqué';
        }
    };

    const refreshAttendanceData = useCallback(() => {
        if (!managerEstablishmentId) {
            setAllEstablishmentAttendance([]);
            setStudentsInEstablishment([]);
            return;
        }

        const students = getStudentsByEstablishment(managerEstablishmentId);
        setStudentsInEstablishment(students);

        let consolidatedHistory = [];
        const establishmentDailyTrips = getDailyTripsByEstablishment(managerEstablishmentId);
        const relevantDailyTripIds = new Set(establishmentDailyTrips.map(dt => dt.id));

        demoData.attendances.forEach(record => {
            if (relevantDailyTripIds.has(record.dailyTripId)) {
                const student = students.find(s => s.id === record.studentId);
                const dailyTrip = demoData.dailyTrips.find(dt => dt.id === record.dailyTripId);
                const trip = dailyTrip ? demoData.trips.find(t => t.id === dailyTrip.tripId) : null;

                consolidatedHistory.push({
                    ...record,
                    childName: student ? student.fullname : 'N/A',
                    dailyTripName: dailyTrip ? (trip?.name || 'N/A') : 'N/A',
                    dailyTripDate: dailyTrip ? new Date(dailyTrip.date).toLocaleDateString('fr-FR') : 'N/A',
                    timestampFormatted: new Date(record.timestamp).toLocaleString('fr-FR'),
                });
            }
        });

        consolidatedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAllEstablishmentAttendance(consolidatedHistory);
        setCurrentPage(1); // Reset page on data refresh
    }, [managerEstablishmentId, currentDemoData]); // Depend on managerEstablishmentId and currentDemoData

    useEffect(() => {
        refreshAttendanceData();
    }, [refreshAttendanceData]);

    useEffect(() => {
        let tempFiltered = [...allEstablishmentAttendance];

        // Filter by student
        if (selectedStudentId !== 'all') {
            const id = parseInt(selectedStudentId);
            tempFiltered = tempFiltered.filter(record => record.studentId === id);
        }

        // Filter by date range
        if (selectedDateRange?.from) {
            const fromDate = new Date(selectedDateRange.from);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : fromDate;
            toDate.setHours(23, 59, 59, 999);

            tempFiltered = tempFiltered.filter(record => {
                const recordDate = new Date(record.timestamp);
                return recordDate >= fromDate && recordDate <= toDate;
            });
        }

        // Filter by search term
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            tempFiltered = tempFiltered.filter(record =>
                record.childName.toLowerCase().includes(lowerCaseSearchTerm) ||
                (record.dailyTripName && record.dailyTripName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                record.status.toLowerCase().includes(lowerCaseSearchTerm) ||
                record.type.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        setFilteredAttendance(tempFiltered);
        const newTotalPages = Math.ceil(tempFiltered.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0 && tempFiltered.length > 0) {
            setCurrentPage(1);
        } else if (tempFiltered.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [allEstablishmentAttendance, searchTerm, selectedDateRange, selectedStudentId, currentPage]);

    const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE);
    const paginatedAttendance = filteredAttendance.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => setCurrentPage(page);

    if (!managerEstablishmentId) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-default-600">
                Chargement de l'établissement...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-default-900">Données de Présence</h1>
            <p className="text-default-600">Historique de présence des élèves de l'établissement **{establishmentName}**.</p>

            <div className="sm:grid  sm:grid-cols-3 sm:gap-5 space-y-4 sm:space-y-0 items-center justify-between gap-2">
                <div className="relative w-full max-w-xs">
                    <Input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md w-full"
                    />
                    <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <Select onValueChange={setSelectedStudentId} value={String(selectedStudentId)} className="w-full max-w-xs">
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrer par élève" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les élèves</SelectItem>
                        {studentsInEstablishment.map(student => (
                            <SelectItem key={student.id} value={String(student.id)}>
                                {student.fullname}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <DatePickerWithRange
                    date={selectedDateRange}
                    setDate={setSelectedDateRange}
                    placeholder="Filtrer par date"
                />
            </div>

            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="py-4 px-6 border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                        <Icon icon="heroicons:clipboard-document-check" className="h-6 w-6 text-green-500" />
                        Enregistrements de Présence
                    </CardTitle>
                    <CardDescription>
                        Nombre total d'enregistrements filtrés: {filteredAttendance.length}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px]"> {/* Fixed height for scrollable table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[120px]">Élève</TableHead>
                                        <TableHead className="min-w-[150px]">Trajet Quotidien</TableHead>
                                        <TableHead className="min-w-[120px]">Date Trajet</TableHead>
                                        <TableHead className="min-w-[80px]">Type</TableHead>
                                        <TableHead className="min-w-[100px]">Statut</TableHead>
                                        <TableHead className="min-w-[140px]">Heure Marquage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedAttendance.length > 0 ? (
                                        paginatedAttendance.map(record => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium text-default-800">{record.childName}</TableCell>
                                                <TableCell>{record.dailyTripName}</TableCell>
                                                <TableCell>{record.dailyTripDate}</TableCell>
                                                <TableCell className="capitalize">{record.type === 'DEPART' ? 'Départ' : 'Retour'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="soft" color={getAttendanceColor(record.status)} className="capitalize">
                                                        {getAttendanceText(record.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{record.timestampFormatted}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Aucun enregistrement de présence trouvé.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex gap-2 items-center justify-center p-4">
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="h-8 w-8">
                        <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button key={`page-${page}`} onClick={() => handlePageChange(page)} variant={page === currentPage ? "default" : "outline"} className={cn("w-8 h-8", page === currentPage ? "bg-primary text-primary-foreground" : "text-default-700")}>
                            {page}
                        </Button>
                    ))}
                    <Button onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} variant="outline" size="icon" className="h-8 w-8">
                        <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;