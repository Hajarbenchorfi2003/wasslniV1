'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import DatePickerWithRange from '@/components/date-picker-with-range';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import parentService from '@/services/parentService';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

const ParentAttendanceHistoryPage = () => {
  const [children, setChildren] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAttendance = useCallback(async () => {
    try {
      const childrenList = await parentService.getChildren();
      setChildren(childrenList);

      let allRecords = [];

      for (const relation of childrenList) {
        const student = relation.student;
        const childId = student.id;
        const history = await parentService.getChildAttendance(childId);

        const attendanceWithName = history.attendances.map((record) => ({
          ...record,
          childName: student.fullname,
          dailyTripName: record.dailyTrip?.trip?.name || 'Trajet inconnu',
        }));

        allRecords = allRecords.concat(attendanceWithName);
      }

      // Trier les enregistrements
      allRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setAllAttendance(allRecords);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Erreur lors du chargement des données de présence.");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    let filtered = [...allAttendance];

    if (selectedDateRange?.from) {
      const fromDate = new Date(selectedDateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : fromDate;
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const date = new Date(record.timestamp);
        return date >= fromDate && date <= toDate;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((record) =>
        record.childName.toLowerCase().includes(term) ||
        record.dailyTripName?.toLowerCase().includes(term) ||
        record.status.toLowerCase().includes(term) ||
        record.type.toLowerCase().includes(term)
      );
    }

    setFilteredAttendance(filtered);

    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    } else if (filtered.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [allAttendance, selectedDateRange, searchTerm, currentPage]);

  const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAttendance.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-default-900">Historique de Présence</h1>
      <p className="text-default-600">Consultez et filtrez l'historique de présence de vos enfants.</p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom, trajet ou statut..."
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
            <CardDescription>Nombre total d'entrées : {filteredAttendance.length}</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <AttendanceHistoryTable
              student={{ fullname: 'Tous les enfants' }}
              attendanceHistory={paginatedData}
            />

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
                    variant={page === currentPage ? 'default' : 'outline'}
                    className={cn(
                      'w-8 h-8',
                      page === currentPage ? 'bg-primary text-primary-foreground' : 'text-default-700'
                    )}
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
