'use client';

import { notFound } from 'next/navigation';
// Directly import demoData and getSchoolEstablishments
import { demoData, getSchoolEstablishments } from '@/data/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Fragment, useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation'; // Combined imports
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ModalEtablissement from '@/components/models/ModalEtablissement1';
import ModalSuppression from '@/components/models/ModalSuppression';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input'; // Import the Input component

export default function SchoolDetailsPage({ params }) {
  const { id } = params;
  const schoolId = parseInt(id);
  const router = useRouter();
  const pathname = usePathname();
  const paramsr = useParams(); // Using useParams for 'lang'
  const locale = paramsr.lang;

  // Find the school directly from demoData.schools
  const school = demoData.schools.find((s) => s.id === schoolId);

  if (!school) return notFound();

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [establishments, setEstablishments] = useState([]);
  const [collapsedRows, setCollapsedRows] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEstablishmentDataForModal, setCurrentEstablishmentDataForModal] = useState(null);
  const [establishmentToDelete, setEstablishmentToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  // Use useEffect to keep establishments state in sync with demoData and apply filter
  useEffect(() => {
    // Get all establishments for this school
    const allSchoolEstablishments = getSchoolEstablishments(schoolId);

    // Apply search filter
    const filteredEstablishments = allSchoolEstablishments.filter(etab => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      const responsable = demoData.users.find(u => u.id === etab.responsableId);
      const responsableFullName = responsable ? responsable.fullname.toLowerCase() : '';

      return (
        etab.name.toLowerCase().includes(lowerCaseSearchQuery) ||
        etab.email.toLowerCase().includes(lowerCaseSearchQuery) ||
        (etab.phone && etab.phone.toLowerCase().includes(lowerCaseSearchQuery)) ||
        etab.address.toLowerCase().includes(lowerCaseSearchQuery) ||
        etab.quartie.toLowerCase().includes(lowerCaseSearchQuery) ||
        etab.city.toLowerCase().includes(lowerCaseSearchQuery) ||
        responsableFullName.includes(lowerCaseSearchQuery) // Filter by responsible's full name
      );
    });

    setEstablishments(filteredEstablishments || []); // Set filtered establishments

    // Reset page to 1 if the current page no longer exists after data refresh or filter
    const newTotalPages = Math.ceil(filteredEstablishments.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && filteredEstablishments.length > 0) {
      setCurrentPage(1);
    } else if (filteredEstablishments.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
    setCollapsedRows([]); // Collapse all rows on data refresh/filter change
  }, [schoolId, demoData.establishments, demoData.users, searchQuery, currentPage]); // Added demoData.users and searchQuery to dependencies

  const totalPages = Math.ceil(establishments.length / ITEMS_PER_PAGE);
  const paginatedEstablishments = establishments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleRow = (id) => {
    setCollapsedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setCollapsedRows([]);
    }
  };

  const handleSaveEstablishment = (updatedDataFromModal) => {
    // Force a re-sync of the establishments state with the global demoData
    // The ModalEtablissement is expected to update demoData.establishments directly
    const schoolEstablishments = getSchoolEstablishments(schoolId);
    setEstablishments(schoolEstablishments || []); // Re-set based on updated demoData
    // We also need to trigger the useEffect if demoData.users changes (e.g., if a new responsible is created)
    // A simple way to do this is to update a dummy state or ensure demoData is deeply reactive (which it is here)
    // Forcing a full demoData re-render in parent if necessary
    // setCurrentDemoData({ ...demoData }); // If this page had its own demoData state

    setIsEditModalOpen(false);
    setCurrentEstablishmentDataForModal(null);
    toast.success("Établissement enregistré avec succès!");
  };

  const handleDeleteEstablishment = () => {
    if (establishmentToDelete !== null) {
      // Perform the actual deletion in demoData
      demoData.establishments = demoData.establishments.filter(
        (e) => e.id !== establishmentToDelete
      );
      // Also, if any responsable was tied *only* to this establishment and is now orphaned, handle that.
      // For simplicity here, we just remove the establishment.

      // Re-sync local state from updated demoData
      const schoolEstablishments = getSchoolEstablishments(schoolId);
      setEstablishments(schoolEstablishments || []);

      // Adjust current page if needed after deletion
      const newTotalAfterDelete = schoolEstablishments.length;
      const newTotalPagesAfterDelete = Math.ceil(newTotalAfterDelete / ITEMS_PER_PAGE);

      if (currentPage > newTotalPagesAfterDelete && newTotalPagesAfterDelete > 0) {
        setCurrentPage(newTotalPagesAfterDelete);
      } else if (newTotalPagesAfterDelete === 0) {
        setCurrentPage(1); // Reset to page 1 if all items are deleted
      }

      toast.success('Établissement supprimé avec succès!');
    }
    setIsDeleteModalOpen(false);
    setEstablishmentToDelete(null);
  };

  const handleEditEstablishment = (etablissementToEdit) => {
    const associatedResponsable = demoData.users.find(u => u.id === etablissementToEdit.responsableId);

    const defaultValuesForForm = {
      id: etablissementToEdit.id,
      etablissement: {
        name: etablissementToEdit.name || '',
        email: etablissementToEdit.email || '',
        phone: etablissementToEdit.phone || '',
        address: etablissementToEdit.address || '',
        quartie: etablissementToEdit.quartie || '',
        city: etablissementToEdit.city || '',
        isActive: etablissementToEdit.isActive !== undefined ? etablissementToEdit.isActive : true
      },
      responsable: associatedResponsable ? {
        fullname: associatedResponsable.fullname || '',
        email: associatedResponsable.email || '',
        phone: associatedResponsable.phone || '',
        password: '',
        cin: associatedResponsable.cin || '',
        isActive: associatedResponsable.isActive !== undefined ? associatedResponsable.isActive : true
      } : undefined,
      existingResponsableId: associatedResponsable ? associatedResponsable.id.toString() : '',
      addNewResponsable: !associatedResponsable,
      schoolId: etablissementToEdit.schoolId ? etablissementToEdit.schoolId.toString() : '',
    };
    setCurrentEstablishmentDataForModal(defaultValuesForForm);
    setIsEditModalOpen(true);
  };

  const handleAddEstablishment = () => {
    setCurrentEstablishmentDataForModal(null);
    setIsEditModalOpen(true);
  };

  const openDeleteEstablishmentModal = (id) => {
    setEstablishmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Helper to get responsible details
  const getResponsibleDetails = (etablissementId) => {
    const etablissement = demoData.establishments.find(
      (etab) => etab.id === etablissementId
    );
    if (!etablissement || !etablissement.responsableId) return null;

    const responsible = demoData.users.find(
      (user) => user.id === etablissement.responsableId
    );
    return responsible || null;
  };

  return (
    <div className="space-y-6">
      {/* Header and Back Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-default-800 mb-2">
            Établissements de : {school.name}
          </h1>
          <p className="text-muted-foreground mb-4">
            Téléphone : {school.phone} — Email : {school.email}
          </p>
        </div>
        <Link href={`/${locale}/super-admin/schools`}>
          <Button variant="outline">← Retour</Button>
        </Link>
      </div>

      {/* Search Input and Add Establishment Button */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Rechercher un établissement par nom, ville, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <Button onClick={handleAddEstablishment}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un établissement
        </Button>
      </div>


      {establishments.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Quartie</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEstablishments.map((item) => {
                const directeur = getResponsibleDetails(item.id);
                return (
                  <Fragment key={item.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => toggleRow(item.id)}
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-none rounded-full"
                          >
                            <Icon
                              icon="heroicons:chevron-down"
                              className={cn("h-5 w-5 transition-all duration-300", {
                                "rotate-180": collapsedRows.includes(item.id),
                              })}
                            />
                          </Button>
                          <div className="flex gap-3 items-center">
                            <Avatar>
                              <AvatarImage src="/placeholder-avatar.png" />
                              <AvatarFallback>
                                {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm block text-card-foreground">
                                {item.name}
                              </span>
                              <span className="text-xs mt-1 block font-normal">
                                {item.email}
                              </span>
                              <span className="text-xs mt-1 block font-normal">
                                {item.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quartie}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell className="text-right flex gap-2 justify-start">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none"
                          onClick={() => handleEditEstablishment(item)}
                        >
                          <Icon icon="heroicons:pencil" className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none text-destructive hover:text-destructive"
                          onClick={() => openDeleteEstablishmentModal(item.id)}
                        >
                          <Icon icon="heroicons:trash" className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => router.push(`/${locale}/super-admin/etablissements/${item.id}`)}
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none"
                        >
                          <Icon icon="heroicons:eye" className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {collapsedRows.includes(item.id) && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5}>
                          <div className="ltr:pl-12 rtl:pr-12 flex flex-col items-start gap-1 py-3">
                            <p className="flex items-center gap-2">
                              <Icon icon="heroicons:user" className="w-4 h-4 opacity-50" />
                              <span>
                                Directeur : {directeur?.fullname || "Non renseigné"}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Icon icon="heroicons:at-symbol" className="w-4 h-4 opacity-50" />
                              <span>
                                Email Directeur : {directeur?.email || "Non renseigné"}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Icon icon="heroicons:phone" className="w-4 h-4 opacity-50" />
                              <span>Téléphone Directeur : {directeur?.phone || "Non renseigné"}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              {/* You'll need to calculate number of buses per establishment */}
                              <Icon icon="heroicons:truck" className="w-4 h-4 opacity-50" />
                              <span>Nombre de bus : {demoData.buses.filter(bus => bus.establishmentId === item.id).length || 0}</span>
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 items-center mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
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
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              ))}

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">Aucun établissement trouvé pour cette école.</p>
      )}

      {/* Modal for adding/editing establishments */}
      <ModalEtablissement
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        onSave={handleSaveEstablishment}
        editingEtablissement={currentEstablishmentDataForModal}
        schoolId={schoolId.toString()}
        school={school}
        allSchools={demoData.schools}
        users={demoData.users} // Pass users for responsible selection/creation
        establishments={demoData.establishments} // Pass establishments to modal for checking uniqueness or other needs
      />

      {/* Modal for confirming deletion */}
      <ModalSuppression
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEstablishment}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}