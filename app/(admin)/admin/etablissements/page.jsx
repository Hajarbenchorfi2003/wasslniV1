'use client';

import { useState, useEffect } from 'react';
import { demoData, getSchoolEstablishments, getUserById } from '@/data/data'; // Import getUserById
import EtablissementResponsibleFormModal from '@/components/models/ModalEtablissement1'; // Adjust path and renamed for clarity
import TableEtablissement from './tableEtablissement'; // Create this component as shown below
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 5;
const FIXED_SCHOOL_ID = 1; // Assuming you want to manage establishments for a fixed school (e.g., School ID 1)

const EtablissementsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(demoData); // Keep demoData in state if it's mutable
  const [etablissements, setEtablissements] = useState([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingEtablissement, setEditingEtablissement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Use useEffect to fetch and filter data when dependencies change
  useEffect(() => {
    // 1. Get all establishments for the fixed school (or adjust based on your logic)
    let initialEtbs = getSchoolEstablishments(FIXED_SCHOOL_ID);

    // 2. Enrich establishments with responsible name for display and search
    initialEtbs = initialEtbs.map(etab => {
      const responsible = currentDemoData.users.find(user => user.id === etab.responsableId);
      return {
        ...etab,
        responsableName: responsible ? responsible.fullname : 'N/A',
      };
    });

    // 3. Apply search filter
    let filtered = initialEtbs;
    if (searchQuery) {
      const lowerCaseSearch = searchQuery.toLowerCase();
      filtered = initialEtbs.filter(etab =>
        etab.name.toLowerCase().includes(lowerCaseSearch) ||
        etab.email.toLowerCase().includes(lowerCaseSearch) ||
        etab.city.toLowerCase().includes(lowerCaseSearch) ||
        (etab.responsableName && etab.responsableName.toLowerCase().includes(lowerCaseSearch))
      );
    }

    setEtablissements(filtered);

    // Reset pagination to 1 if the filter changes significantly
    // Only reset if the current page is out of bounds or there are results but currentPage is 0
    const newTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
    } else if (filtered.length > 0 && currentPage === 0) { // This might happen if initial load is empty then data arrives
        setCurrentPage(1);
    } else if (filtered.length === 0 && currentPage !== 1) { // If no results, go to page 1
        setCurrentPage(1);
    }

  }, [currentDemoData.establishments, currentDemoData.users, searchQuery, currentPage]); // Re-run when demoData or search query changes

  const totalPages = Math.ceil(etablissements.length / ITEMS_PER_PAGE);
  const paginatedEtablissements = etablissements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleEditEtablissement = (etablissementToEdit) => {
    // Find the associated responsible from demoData.users
    const associatedResponsable = currentDemoData.users.find(u => u.id === etablissementToEdit.responsableId);

    // Structure the default values for the EtablissementResponsibleFormModal
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
        password: '', // Always keep password empty for security on edit
        cin: associatedResponsable.cin || '',
        isActive: associatedResponsable.isActive !== undefined ? associatedResponsable.isActive : true
      } : undefined,

      // Set the ID of the existing responsible if found
      existingResponsableId: associatedResponsable ? associatedResponsable.id.toString() : '',

      // Set the initial state of the 'addNewResponsable' toggle
      addNewResponsable: !associatedResponsable,

      // Pass the schoolId of the establishment
      schoolId: etablissementToEdit.schoolId ? etablissementToEdit.schoolId.toString() : '',
    };

    setEditingEtablissement(defaultValuesForForm);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteEtablissement = (id) => {
    try {
      // Find the establishment to be deleted to get its responsibleId
      const etablissementToDelete = currentDemoData.establishments.find(etb => etb.id === id);
      const responsibleIdToDelete = etablissementToDelete?.responsableId;

      // 1. Remove establishment from demoData
      const updatedEstablishments = currentDemoData.establishments.filter(etab => etab.id !== id);

      // 2. Potentially remove the responsible user if they are no longer linked to ANY establishment
      let updatedUsers = [...currentDemoData.users];
      if (responsibleIdToDelete) {
        const isResponsibleStillLinked = updatedEstablishments.some(etab => etab.responsableId === responsibleIdToDelete);
        if (!isResponsibleStillLinked) {
          // If the responsible is not linked to any other establishment, remove them
          updatedUsers = updatedUsers.filter(user => user.id !== responsibleIdToDelete);
          toast('Responsable également supprimé car non lié à d\'autres établissements.', { icon: 'ℹ️' });
        }
      }

      // Update the main demoData object
      setCurrentDemoData(prevData => ({
        ...prevData,
        establishments: updatedEstablishments,
        users: updatedUsers, // Update users as well
      }));

      toast.success('Établissement supprimé avec succès');
      // No need to setEtablissements here, useEffect will react to currentDemoData change
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'établissement');
      console.error(error);
    }
  };

  const handleSaveEtablissement = (updatedDemoData) => {
    // This function is now called by the modal with the new demoData after a save
    setCurrentDemoData(updatedDemoData); // Update the main data state
    setIsAddEditDialogOpen(false);
    setEditingEtablissement(null); // Clear editing state after save
    toast.success('Établissement sauvegardé avec succès');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // setCurrentPage will be handled by useEffect's logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Établissements
        </h2>
      </div>

      {/* Search & Add Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Rechercher un établissement..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon
            icon="heroicons:magnifying-glass"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </div>

        {/* Add Establishment Button */}
        <Button onClick={() => {
          setEditingEtablissement(null); // Ensure no previous editing state
          setIsAddEditDialogOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un établissement
        </Button>
      </div>

      <EtablissementResponsibleFormModal
        isOpen={isAddEditDialogOpen}
        setIsOpen={setIsAddEditDialogOpen}
        editingEtablissement={editingEtablissement}
        onSave={handleSaveEtablissement} // Pass the handler
        initialDemoData={currentDemoData} // Pass the mutable demoData
        fixedSchoolId={FIXED_SCHOOL_ID} // Pass the fixed school ID for new establishments
      />

      <TableEtablissement
        etablissements={paginatedEtablissements}
        onEditEtablissement={handleEditEtablissement}
        onDeleteEtablissement={handleDeleteEtablissement}
      />

      {/* Pagination Controls */}
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

export default EtablissementsPage;