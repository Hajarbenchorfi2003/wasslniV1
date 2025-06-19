'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data'; // Adjust path as needed
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// Import shadcn/ui Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Import shadcn/ui Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from '@/components/ui/input'; // Import Input component

const ITEMS_PER_PAGE = 5; // Adjust as needed for incidents

const IncidentsPage = () => {
  // We'll still use currentDemoData but it won't be modified
  const [currentDemoData] = useState(initialDemoData);
  const [incidents, setIncidents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDailyTripId, setFilterDailyTripId] = useState('all'); // Filter by daily trip

  // Effect to filter and set incidents based on currentDemoData, filters
  useEffect(() => {
    let filteredIncidents = [...currentDemoData.incidents];

    // Apply daily trip filter
    if (filterDailyTripId !== 'all') {
      const selectedTripId = parseInt(filterDailyTripId);
      filteredIncidents = filteredIncidents.filter(incident =>
        incident.dailyTripId === selectedTripId
      );
    }

    // Apply search term filter (on description or reported by user's name/email)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredIncidents = filteredIncidents.filter(incident => {
        const reportedByUser = currentDemoData.users.find(user => user.id === incident.reportedById);
        const reporterName = reportedByUser ? reportedByUser.fullname.toLowerCase() : '';
        const reporterEmail = reportedByUser ? reportedByUser.email.toLowerCase() : '';

        return (
          incident.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          reporterName.includes(lowerCaseSearchTerm) ||
          reporterEmail.includes(lowerCaseSearchTerm)
        );
      });
    }

    // Enrich incidents with additional data for display
    const enrichedIncidents = filteredIncidents.map(incident => {
      const dailyTrip = currentDemoData.dailyTrips.find(dt => dt.id === incident.dailyTripId);
      const trip = dailyTrip ? currentDemoData.trips.find(t => t.id === dailyTrip.tripId) : null;
      const reportedByUser = currentDemoData.users.find(user => user.id === incident.reportedById);

      return {
        ...incident,
        dailyTripName: dailyTrip ? `Trajet: ${trip?.name || 'N/A'} (Date: ${new Date(dailyTrip.date).toLocaleDateString()})` : 'N/A',
        reportedByName: reportedByUser ? reportedByUser.fullname : 'Utilisateur Inconnu',
        timestampFormatted: new Date(incident.timestamp).toLocaleString(),
      };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent

    setIncidents(enrichedIncidents);

    // Adjust currentPage if filtering leads to fewer pages
    const newTotalPages = Math.ceil(enrichedIncidents.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && enrichedIncidents.length > 0) {
      setCurrentPage(1);
    } else if (enrichedIncidents.length === 0 && currentPage !== 1) {
        setCurrentPage(1);
    }
  }, [currentDemoData, currentPage, searchTerm, filterDailyTripId]);

  const totalPages = Math.ceil(incidents.length / ITEMS_PER_PAGE);
  const paginatedIncidents = incidents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Prepare options for daily trip filter select
  const dailyTripOptions = currentDemoData.dailyTrips.map(dt => {
    const trip = currentDemoData.trips.find(t => t.id === dt.tripId);
    return {
      id: dt.id,
      name: `${trip?.name || 'Trajet Inconnu'} (Date: ${new Date(dt.date).toLocaleDateString()}) - ID: ${dt.id}`
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Liste des Incidents
        </h2>
      </div>

      <div className="flex items-center justify-start flex-wrap gap-4"> {/* Changed to justify-start as there's no "Add" button */}
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Rechercher par description ou rapporteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm"
        />

        {/* Filter by Daily Trip */}
        <Select onValueChange={setFilterDailyTripId} value={filterDailyTripId}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Filtrer par trajet quotidien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les trajets quotidiens</SelectItem>
            {dailyTripOptions.map((trip) => (
              <SelectItem key={trip.id} value={String(trip.id)}>
                {trip.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Incident List Table */}
    
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Trajet Quotidien</TableHead>
              <TableHead>Rapporté par</TableHead>
              <TableHead>Date/Heure</TableHead>
              {/* Removed Actions column header */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedIncidents.length > 0 ? (
              paginatedIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{incident.description}</TableCell>
                  <TableCell>{incident.dailyTripName}</TableCell>
                  <TableCell>{incident.reportedByName}</TableCell>
                  <TableCell>{incident.timestampFormatted}</TableCell>
                  {/* Removed Actions buttons */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center"> {/* Adjusted colspan */}
                  Aucun incident trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center mt-4 justify-center">
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

export default IncidentsPage;