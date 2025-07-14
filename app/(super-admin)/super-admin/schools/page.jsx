'use client';

import { useState, useEffect } from 'react'; // Import useEffect for data fetching/filtering
import ModalSchool from '@/components/models/ModalSchool1';
import TableSchool from './tadelschool';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { demoData } from '@/data/data'; // Ensure demoData is mutable for local state management
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import{fetchSchools,createSchool,updateSchool,deleteSchool}from '@/services/school';


const ITEMS_PER_PAGE = 5;

const SchoolsPage = () => {
  // Use a state variable for demoData to ensure re-renders when it changes
  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  
  const [schoolsToDisplay, setSchoolsToDisplay] = useState([]); // This will hold the filtered and enriched schools
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schools, setSchools] = useState([]);

const loadschools = async () => {
  setSchoolsLoading(true);
  try {
    const data = await fetchSchools();
    setSchools(data);
  } catch (error) {
    console.error('Erreur lors du chargement des établissements', error);
    toast.error("Impossible de charger les établissements");
  } finally {
    setSchoolsLoading(false);
  }
};

useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    if (schools.length === 0) {
      setSchoolsLoading(true);
      try {
        const data = await fetchSchools();
        if (isMounted) {
          setSchools(data);
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
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);

     

  console.log("school",schools);
  // Effect to filter and enrich schools whenever currentDemoData or searchQuery changes
  useEffect(() => {
    const allSchools =schools;

    // 💡 Étape 1: Enrichir les écoles avec le nom de l'administrateur principal
   const enrichedSchools = schools.map(school => {
    // Récupérer le premier admin
    const mainAdmin = school.admins && school.admins.length > 0 ? school.admins[0] : null;

    return {
      ...school,
      adminName: mainAdmin ? mainAdmin.fullname : 'N/A'
    };
  });

    // 💡 Étape 2: Filtrage basé sur le nom, la ville, l'email ou le nom de l'administrateur
    const filteredAndEnrichedSchools = enrichedSchools.filter((school) => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      return (
        school.name.toLowerCase().includes(lowerCaseSearchQuery) ||
        school.city.toLowerCase().includes(lowerCaseSearchQuery) ||
        school.email.toLowerCase().includes(lowerCaseSearchQuery) ||
        // NEW: Filter by adminName
        school.adminName.toLowerCase().includes(lowerCaseSearchQuery)
      );
    });

    setSchoolsToDisplay(filteredAndEnrichedSchools);

    // 💡 Étape 3: Ajuster la pagination en fonction du filtre
    const newTotalPages = Math.ceil(filteredAndEnrichedSchools.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && filteredAndEnrichedSchools.length > 0) {
      // If there are schools but somehow currentPage is 0, reset to 1
      setCurrentPage(1);
    } else if (filteredAndEnrichedSchools.length === 0 && currentPage !== 1) { // Only reset if no schools and not already on page 1
      setCurrentPage(1);
    }
  }, [schools, currentPage, searchQuery]); // Add searchQuery to dependency array

  const totalPages = Math.ceil(schoolsToDisplay.length / ITEMS_PER_PAGE);
  const paginatedSchools = schoolsToDisplay.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => setCurrentPage(page);

  const handleEditSchool = (school) => {
    // Find the associated admin for the school being edited
    const schoolAdmins =school.admins

    const mainAdmin = schoolAdmins[0]; // Assuming the first found admin is the one to edit

    const defaultValuesForForm = {
      id: school.id,
      school: {
        name: school.name || '',
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        city: school.city || '',
        isActive: school.isActive !== undefined ? school.isActive : true
      },
      admin: mainAdmin ? {
        fullname: mainAdmin.fullname || '', // Use fullname directly if available
        email: mainAdmin.email || '',
        phone: mainAdmin.phone || '',
        password: '', // Password is not retrieved for security
       
        isActive: mainAdmin.isActive !== undefined ? mainAdmin.isActive : true
      } : undefined,
      existingAdminId: mainAdmin ? mainAdmin.id.toString() : '',
      addNewAdmin: !mainAdmin // If no admin, then it's a new admin situation
    };

    setEditingSchool(defaultValuesForForm);
    setIsAddDialogOpen(true);
  };

  const handleDeleteSchool =async (id) => {
    try {
      await deleteSchool(id)
      loadschools();
      toast.success('École supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'école');
      console.error(error);
    }
  };

  const handleSaveSchool =async (updatedata) => {
    loadschools();
    setIsAddDialogOpen(false);
    setEditingSchool(null);
  };

  return (
    <div className="space-y-6">
      {/* Header + Bouton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">Gestion des Écoles</h2>
        <Button onClick={() => {
          setEditingSchool(null);
          setIsAddDialogOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter une école
        </Button>
      </div>

      {/* 🔍 Barre de recherche */}
      <div className="relative max-w-md w-full">
        <Input
          type="text"
          placeholder="Rechercher par nom, ville, email ou admin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-md w-full"
        />
        <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {/* 🧾 Modale */}
      <ModalSchool
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        editingSchool={editingSchool}
        onSave={handleSaveSchool}
        schools={currentDemoData.schools} // Pass all schools
        users={currentDemoData.users} // Pass all users
        userSchools={currentDemoData.userSchools} // Pass userSchools for linking
        setCurrentDemoData={setCurrentDemoData} // Pass setter for demoData if ModalSchool updates it
      />

      {/* 📋 Tableau */}
      <TableSchool
        schools={paginatedSchools}
        onEditSchool={handleEditSchool}
        onDeleteSchool={handleDeleteSchool}
      />

      {/* 🔢 Pagination */}
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

export default SchoolsPage;