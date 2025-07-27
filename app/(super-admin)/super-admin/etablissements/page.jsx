'use client';

import { useState, useEffect } from 'react';
import { demoData } from '@/data/data'; // Make sure this path is correct
import ModalEtablissement from '@/components/models/ModalEtablissement1'; // Adjust path if necessary
import TableEtablissement from './tableEtablissement'; // You'll need to create this component
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input'; // Import Input component
import {fetchAllEstablishments,deletePremently} from '@/services/etablissements';
import{fetchSchools}from '@/services/school';

const ITEMS_PER_PAGE = 5;

const EtablissementsPage = () => {
  const[establishments,setEstablishments]= useState([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingEtablissement, setEditingEtablissement] = useState(null); // Holds data for editing
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
   const [establishmentsLoading, setEstablishmentsLoading] = useState(false);
    const [schoolsLoading, setSchoolsLoading] = useState(false);
       const [schools, setSchools] = useState([]);
   
     useEffect(() => {
     let isMounted = true; // Variable locale pour suivre le statut de montage
   
     async function loadschools() {
       setSchoolsLoading(true);
       try {
         const data = await fetchSchools();
       
   
         if (isMounted) {
           setSchools(data); // Mise à jour conditionnelle si le composant est toujours monté
           
         }
       } catch (error) {
         console.error('Erreur lors du chargement des établissements', error);
         toast.error("Impossible de charger les établissements");
       } finally {
         if (isMounted) {
           setSchoolsLoading(false);
         }
       }
     }
   
     // Charger seulement si non encore chargés
     if (schools.length === 0) {
       loadschools();
     }
   
     return () => {
       isMounted = false; // Nettoyage : indique que le composant n'est plus monté
     };
   }, [schools]);

 const loadEstablishments = async () => {
    setEstablishmentsLoading(true);
    try {
      const data = await fetchAllEstablishments();
      
      setEstablishments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des établissements', error);
      toast.error("Impossible de charger les établissements");
    } finally {
      setEstablishmentsLoading(false);
    }
  };

  // Utiliser useEffect pour charger initialement si nécessaire
  useEffect(() => {
    let isMounted = true;

    const loadIfNotLoaded = async () => {
      if (!isMounted) return;
      if (establishments.length === 0) {
        await loadEstablishments();
      }
    };

    loadIfNotLoaded();

    return () => {
      isMounted = false;
    };
  }, [establishments]); // ⚠️ Attention ici, voir plus bas
  console.log("etablisment",establishments)
  // Filter establishments based on search query
  const filteredEtablissements = establishments.filter(etablissement =>
    etablissement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etablissement.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etablissement.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etablissement.responsable.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEtablissements.length / ITEMS_PER_PAGE);
  const paginatedEtablissements = filteredEtablissements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Function to handle opening the modal for editing
  const handleEditEtablissement = (etablissementToEdit) => {
    // Find the associated responsible from demoData.users
    const associatedResponsable = demoData.users.find(u => u.id === etablissementToEdit.responsableId);

    // Structure the default values for the EtablissementResponsableForm
    const defaultValuesForForm = {
      id: etablissementToEdit.id, // Keep the ID for modification lookup
      etablissement: {
        name: etablissementToEdit.name || '',
        email: etablissementToEdit.email || '',
        phone: etablissementToEdit.phone || '',
        address: etablissementToEdit.address || '',
        quartie: etablissementToEdit.quartie || '', // Include quartie
        city: etablissementToEdit.city || '',
        isActive: etablissementToEdit.isActive !== undefined ? etablissementToEdit.isActive : true
      },
      // If a responsible is associated, pre-fill their details for the 'new responsible' section
      // and set 'existing' mode. Otherwise, it will default to 'new responsible' empty fields.
      responsable: associatedResponsable ? {
        fullname: associatedResponsable.fullname || '',
        email: associatedResponsable.email || '',
        phone: associatedResponsable.phone || '',
        password: '', // Always keep password empty for security
        cin: associatedResponsable.cin || '',
        isActive: associatedResponsable.isActive !== undefined ? associatedResponsable.isActive : true
      } : undefined, // Undefined means it won't pre-fill the 'new responsible' fields initially

      // Set the ID of the existing responsible if found
      existingResponsableId: associatedResponsable ? associatedResponsable.id.toString() : '',

      // Set the initial state of the 'addNewResponsable' toggle
      // If there's an associated responsible, we default to 'false' (select existing)
      // Otherwise, default to 'true' (add new)
      addNewResponsable: !associatedResponsable,

      // Pass the schoolId of the establishment
      schoolId: etablissementToEdit.schoolId ? etablissementToEdit.schoolId.toString() : '',
    };

    setEditingEtablissement(defaultValuesForForm);
    setIsAddEditDialogOpen(true);
  };

  // Function to handle deleting an establishment
  const handleDeleteEtablissement = async(id) => {
    try {
      await deletePremently(id)
     loadEstablishments();
     

      toast.success('Établissement supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'établissement');
      console.error(error);
    }
  };

  // Function to handle saving (add or edit) an establishment
  const handleSaveEtablissement = (updatedata) => {
    consol.log("data frome save",updatedata)
    
     loadEstablishments();
    setIsAddEditDialogOpen(false);
    setEditingEtablissement(null); // Clear editing state after save
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
console.log(editingEtablissement)
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-md w-full"
        />
        <Icon
          icon="heroicons:magnifying-glass"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />
      </div>

        {/* Add Admin Button */}
        <Button onClick={() => {
            setEditingEtablissement(null); // Ensure no previous editing state
            setIsAddEditDialogOpen(true);
          }}>
            <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
            Ajouter un établissement
          </Button>
     </div>
{/*       <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Gestion des Établissements
        </div>
        <div className="flex items-center gap-4">
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher un établissement..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              />
            <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <Button onClick={() => {
            setEditingEtablissement(null); // Ensure no previous editing state
            setIsAddEditDialogOpen(true);
          }}>
            <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
            Ajouter un établissement
          </Button>
        </div>
      </div> */}

      <ModalEtablissement
        isOpen={isAddEditDialogOpen}
        setIsOpen={setIsAddEditDialogOpen}
        editingEtablissement={editingEtablissement} // Pass the structured editing data
        onSave={handleSaveEtablissement} // This handles refreshing the list
        allSchools={schools} // Pass all schools for the dropdown
        fixedSchoolId={null} // Set to a specific ID (e.g., 1) if you want to fix the school, otherwise null
      />

      <TableEtablissement
        etablissements={paginatedEtablissements}
        onEditEtablissement={handleEditEtablissement}
        onDeleteEtablissement={handleDeleteEtablissement}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && ( // Only show pagination if there&apos;s more than one page
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