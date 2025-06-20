// app/(super-admine)/schools/page.jsx
'use client';
import { useState, useEffect } from 'react';
import ModalSchool from '@/components/models/ModalSchool1';
import TableSchool from './tadelschool';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { fetchSchools,createSchool,deleteSchool,updateSchool } from '@/services/school';

const ITEMS_PER_PAGE = 5;

const SchoolsPage = () => {
  const [allSchools, setAllSchools] = useState([]);
  const [schoolsToDisplay, setSchoolsToDisplay] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les écoles depuis l'API
  useEffect(() => {
    async function loadSchools() {
      try {
        const schools = await fetchSchools();

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
          admins: school.admins || [],
          adminName: school.admins?.[0]?.fullname ?? 'N/A',
        }));

        setAllSchools(formattedSchools);
        setSchoolsToDisplay(formattedSchools);
      } catch (error) {
        toast.error("Erreur lors du chargement des écoles");
        console.error(error);
      }
    }

    loadSchools();
  }, []);

  // Filtrer et paginer les écoles
  useEffect(() => {
    const filteredSchools = allSchools.filter((school) => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      return (
        school.name.toLowerCase().includes(lowerCaseSearchQuery) ||
        school.city.toLowerCase().includes(lowerCaseSearchQuery) ||
        school.email.toLowerCase().includes(lowerCaseSearchQuery) ||
        school.adminName.toLowerCase().includes(lowerCaseSearchQuery)
      );
    });

    setSchoolsToDisplay(filteredSchools);

    const newTotalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [allSchools, currentPage, searchQuery]);

  const totalPages = Math.ceil(schoolsToDisplay.length / ITEMS_PER_PAGE);
  const paginatedSchools = schoolsToDisplay.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => setCurrentPage(page);

const handleEditSchool = (school) => {
  if (!school || !school.id) return;

  // ✅ Les admins sont directement disponibles dans school.admins
  const mainAdmin = school.admins?.[0] || null;

  const defaultValuesForForm = {
    id: school.id,
    school: {
      name: school.name || '',
      email: school.email || '',
      phone: school.phone || '',
      address: school.address || '',
      city: school.city || '',
      isActive: school.isActive !== undefined ? school.isActive : true,
    },
    admin: mainAdmin
      ? {
          fullname: mainAdmin.fullname || '',
          email: mainAdmin.email || '',
          phone: mainAdmin.phone || '',
          password: '',
          cin: mainAdmin.cin || '',
          isActive: mainAdmin.isActive !== undefined ? mainAdmin.isActive : true,
        }
      : undefined,
    existingAdminId: mainAdmin ? mainAdmin.id.toString() : '',
    addNewAdmin: !mainAdmin,
  };

  setEditingSchool(defaultValuesForForm);
  setIsAddDialogOpen(true);
};

   const handleDeleteSchool = async (id) => {
    try {
      await deleteSchool(id);
      const updatedSchools = schools.filter((school) => school.id !== id);
      setSchools(updatedSchools);
      toast.success('École supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l’école', error);
      toast.error('Impossible de supprimer cette école');
    }
  };

  const handleSaveSchool = (updatedData) => {
    // Met à jour l'état global des écoles après sauvegarde
    const updatedSchools = [...allSchools];

    const index = updatedSchools.findIndex((s) => s.id === updatedData.id);
    if (index > -1) {
      updatedSchools[index] = {
        ...updatedSchools[index],
        name: updatedData.school.name,
        email: updatedData.school.email,
        phone: updatedData.school.phone,
        address: updatedData.school.address,
        city: updatedData.school.city,
        isActive: updatedData.school.isActive,
        admins: [
          {
            fullname: updatedData.admin?.fullname || '',
            email: updatedData.admin?.email || '',
            phone: updatedData.admin?.phone || '',
            cin: updatedData.admin?.cin || '',
            isActive: updatedData.admin?.isActive || true,
          },
        ],
      };
    } else {
      updatedSchools.push({
        id: updatedData.id,
        ...updatedData.school,
        admins: updatedData.admin ? [updatedData.admin] : [],
        adminName: updatedData.admin?.fullname ?? 'N/A',
      });
    }

    setAllSchools(updatedSchools);
    setIsAddDialogOpen(false);
    setEditingSchool(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Barre de recherche */}
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

      {/* Modale */}
      <ModalSchool
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        editingSchool={editingSchool}
        onSave={handleSaveSchool}
        schools={allSchools}
        users={[]} // À adapter si besoin d'utilisateurs pour le formulaire
        userSchools={[]}
      />

      {/* Tableau */}
      <TableSchool
        schools={paginatedSchools}
        onEditSchool={handleEditSchool}
        onDeleteSchool={handleDeleteSchool}
      />

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

export default SchoolsPage;