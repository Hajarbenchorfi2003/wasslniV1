//app/(super-admine)/schools/page.jsx
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
import { fetchSchools } from '@/services/school';




const ITEMS_PER_PAGE = 5;

const SchoolsPage = () => {
  // Use a state variable for demoData to ensure re-renders when it changes
  const [data, setData] = useState({ schools: [], users: [], userSchools: [] });
   const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [schoolsToDisplay, setSchoolsToDisplay] = useState([]); // This will hold the filtered and enriched schools
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Effect to filter and enrich schools whenever currentDemoData or searchQuery changes
 useEffect(() => {
  async function loadSchools() {
    try {
      const schools = await fetchSchools();
      console.log(schools)

    const formattedSchools = schools.map((school) => ({
  id: school.id,
  name: school.name,
  email: school.email,
  phone: school.phone,
  address: school.address,
  city: school.city,
  isActive: school.isActive,
  createdAt: school.createdAt,
  establishmentCount: school.establishmentCount,

  // ✅ Utilise admins directement au lieu de userSchools.map(us => us.user)
  admins: school.admins || [],

  // ✅ Récupère le fullname du premier admin
  adminName: school.admins?.[0]?.fullname ?? 'N/A',
}));
console.log("data stor dans state",formattedSchools);

      setData({ schools: formattedSchools });
      setCurrentDemoData({ 
      ...demoData, 
      schools: formattedSchools 
     });
    } catch (error) {
      toast.error("Erreur lors du chargement des écoles");
      console.error(error);
    }
  }

  loadSchools();
}, []);

  useEffect(() => {
const allSchools = data.schools;

    // 💡 Étape 1: Enrichir les écoles avec le nom de l'administrateur principal
    const enrichedSchools = allSchools.map(school => {
      const schoolAdmins = currentDemoData.userSchools
        .filter(us => us.schoolId === school.id)
        .map(us => currentDemoData.users.find(u => u.id === us.userId && u.role === 'ADMIN'))
        .filter(Boolean); // Filter out any undefined results

      // Assume the first admin found is the 'main' admin for display/search purposes
      const mainAdmin = schoolAdmins.length > 0 ? schoolAdmins[0] : null;

      return {
        ...school,
        // Add adminName property for filtering and display
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
  }, [currentDemoData, currentPage, searchQuery]); // Add searchQuery to dependency array

  const totalPages = Math.ceil(schoolsToDisplay.length / ITEMS_PER_PAGE);
  const paginatedSchools = schoolsToDisplay.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => setCurrentPage(page);

  const handleEditSchool = (school) => {
    // Find the associated admin for the school being edited
    const schoolAdmins = currentDemoData.userSchools
      .filter(us => us.schoolId === school.id)
      .map(us => currentDemoData.users.find(u => u.id === us.userId && u.role === 'ADMIN'))
      .filter(Boolean);

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
        cin: mainAdmin.cin || '',
        isActive: mainAdmin.isActive !== undefined ? mainAdmin.isActive : true
      } : undefined,
      existingAdminId: mainAdmin ? mainAdmin.id.toString() : '',
      addNewAdmin: !mainAdmin // If no admin, then it's a new admin situation
    };

    setEditingSchool(defaultValuesForForm);
    setIsAddDialogOpen(true);
  };

  const handleDeleteSchool = (id) => {
    try {
      // Filter out the school
      const updatedSchools = demoData.schools.filter(school => school.id !== id);
      // Filter out userSchool associations for this school
      const updatedUserSchools = demoData.userSchools.filter(us => us.schoolId !== id);

      // Update the demoData directly (as it's imported as a mutable object)
      demoData.schools = updatedSchools;
      demoData.userSchools = updatedUserSchools;

      // Force a state update to trigger re-render
      setCurrentDemoData({ ...demoData });

      // Adjust page if current page becomes empty
      if (paginatedSchools.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      toast.success('École supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'école');
      console.error(error);
    }
  };

  const handleSaveSchool = (updatedData) => {
    // This function will be called from ModalSchool1
    // ModalSchool1 is expected to update demoData directly, then call onSave
    setCurrentDemoData({ ...demoData }); // Force a state update to trigger re-render
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