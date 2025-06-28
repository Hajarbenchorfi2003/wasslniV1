'use client';

import React, { useState, useEffect, useCallback } from 'react';
import attendanceService from '@/services/attendanceService';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import axios from 'axios';
import { getStudentsByUser} from '@/services/students';
import { ScrollArea } from "@/components/ui/scroll-area";


const ITEMS_PER_PAGE = 15;

export const AttendancePage = ({ managerEstablishmentId = 1 }) => {
    const [allAttendance, setAllAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [students, setStudents] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

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

    const refreshAttendanceData = useCallback(async () => {
        try {
            const params = {};
            if (selectedStudentId !== 'all') params.studentId = selectedStudentId;
            if (selectedDateRange?.from && selectedDateRange?.to) {
                params.startDate = selectedDateRange.from.toISOString();
                params.endDate = selectedDateRange.to.toISOString();
            }

            const data = await attendanceService.getAttendanceHistory(params);

            const formatted = data.map(record => ({
                ...record,
                childName: record.student?.fullname || 'N/A',
                dailyTripName: record.dailyTrip?.trip?.name || 'N/A',
                dailyTripDate: record.dailyTrip?.date
                    ? new Date(record.dailyTrip.date).toLocaleDateString('fr-FR')
                    : 'N/A',
                timestampFormatted: record.timestamp
                    ? new Date(record.timestamp).toLocaleString('fr-FR')
                    : 'N/A',
            }));

            formatted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAllAttendance(formatted);
            setCurrentPage(1);
        } catch (error) {
            toast.error(error.message || 'Erreur chargement présence');
        }
    }, [selectedStudentId, selectedDateRange]);

    const fetchStudents = useCallback(async () => {
        try {
            const res = await  getStudentsByUser();
            setStudents(res.data);
        } catch (error) {
            toast.error("Erreur chargement des élèves");
        }
    }, [managerEstablishmentId]);

    useEffect(() => {
        refreshAttendanceData();
    }, [refreshAttendanceData]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        let temp = [...allAttendance];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            temp = temp.filter(item =>
                item.childName.toLowerCase().includes(term) ||
                item.dailyTripName.toLowerCase().includes(term) ||
                item.status.toLowerCase().includes(term) ||
                item.type.toLowerCase().includes(term)
            );
        }

        setFilteredAttendance(temp);
    }, [searchTerm, allAttendance]);

    const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE);
    const paginatedData = filteredAttendance.slice(
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
            <h1 className="text-3xl font-bold text-default-900">Historique de Présence</h1>
            <div className="sm:grid sm:grid-cols-3 sm:gap-5 space-y-4 sm:space-y-0">
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

                <Select onValueChange={setSelectedStudentId} value={String(selectedStudentId)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrer par élève" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les élèves</SelectItem>
                        <ScrollArea className="h-[250px]">
                        {students.map(student => (
                           
                            <SelectItem key={student.id} value={String(student.id)}>
                                {student.fullname}
                            </SelectItem>
                         
                        ))}
                        </ScrollArea>
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
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Icon icon="heroicons:clipboard-document-check" className="h-6 w-6 text-green-500" />
                        Enregistrements de Présence
                    </CardTitle>
                    <CardDescription>
                        Nombre total: {filteredAttendance.length}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Élève</TableHead>
                                        <TableHead>Trajet</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Horodatage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map(record => (
                                            <TableRow key={record.id}>
                                                <TableCell>{record.childName}</TableCell>
                                                <TableCell>{record.dailyTripName}</TableCell>
                                                <TableCell>{record.dailyTripDate}</TableCell>
                                                <TableCell>{record.type === 'DEPART' ? 'Départ' : 'Retour'}</TableCell>
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
                                            <TableCell colSpan={6} className="text-center py-6">
                                                Aucun enregistrement trouvé.
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
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
                        <Icon icon="heroicons:chevron-left" className="w-5 h-5" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button key={page} onClick={() => handlePageChange(page)} variant={page === currentPage ? "default" : "outline"} className={cn("w-8 h-8", page === currentPage ? "bg-primary text-white" : "text-default-700")}>
                            {page}
                        </Button>
                    ))}
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>
                        <Icon icon="heroicons:chevron-right" className="w-5 h-5" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;
