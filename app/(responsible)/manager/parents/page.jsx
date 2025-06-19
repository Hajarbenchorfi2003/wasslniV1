// pages/manager/ParentsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { demoData as initialDemoData, getUsersByRoleAndEstablishment, getChildrenOfParent } from '@/data/data'; // Ensure getChildrenOfParent is imported
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser } from '@/components/models/ModalUser'; // Assuming a generic ModalUser or ModalParent
import ParentCard from './ParentCard'; // Le nouveau composant ParentCard

// Shadcn/ui components for filters and layout
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6; // Affichera 6 parents par page (ex: 2 lignes de 3 cartes)

// Ce composant est conçu pour être utilisé par un gestionnaire d'établissement,
// il attend donc `managerEstablishmentId` comme prop.
export const ParentsPage = ({ managerEstablishmentId }) => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [parents, setParents] = useState([]); // Liste des parents après enrichissement et filtrage
  const [filteredParents, setFilteredParents] = useState([]); // Liste des parents après application du filtre de recherche
  const [isModalOpen, setIsModalOpen] = useState(false); // État de visibilité de la modale d'ajout/modification
  const [editingUser, setEditingUser] = useState(null); // Utilisateur en cours d'édition (null si ajout)
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche

  // Utilise l'ID de l'établissement du gestionnaire. Si non fourni, simule avec l'ID 1.
  const effectiveManagerEstablishmentId = managerEstablishmentId || 1;
  const establishmentName = currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)?.name || 'Votre Établissement';


  // Effet pour enrichir les parents et les filtrer par établissement
  useEffect(() => {
    if (!effectiveManagerEstablishmentId) {
      setParents([]);
      return;
    }

    // Récupère les parents qui ont des enfants dans cet établissement
    const fetchedParents = getUsersByRoleAndEstablishment('PARENT', effectiveManagerEstablishmentId);

    let enrichedParents = fetchedParents.map(parent => {
      const children = getChildrenOfParent(parent.id); // Get children for each parent
      return {
        ...parent,
        childrenNames: children.map(c => c.fullname).filter(Boolean).join(', ') || 'Aucun enfant', // Join multiple child names
      };
    });

    setParents(enrichedParents); // Store the fully enriched and establishment-filtered list
    setCurrentPage(1); // Reset pagination on data change
  }, [currentDemoData, effectiveManagerEstablishmentId]);

  // Effet pour appliquer le filtre de recherche et gérer la pagination.
  useEffect(() => {
    let tempFilteredParents = [...parents]; // Commence avec la liste déjà filtrée par établissement

    // Applique le filtre de recherche (par nom, email, téléphone, noms d'enfants)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredParents = tempFilteredParents.filter(parent =>
        parent.fullname.toLowerCase().includes(lowerCaseSearchTerm) ||
        parent.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (parent.phone && parent.phone.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (parent.childrenNames && parent.childrenNames.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredParents(tempFilteredParents); // Met à jour la liste filtrée finale

    const newTotalPages = Math.ceil(tempFilteredParents.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredParents.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredParents.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [parents, searchTerm, currentPage]); // Dépendencies

  const totalPages = Math.ceil(filteredParents.length / ITEMS_PER_PAGE);
  const paginatedParents = filteredParents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditParent = (parent) => {
    // Note: You might need to adapt ModalUser to handle 'PARENT' role data (e.g., studentIds)
    setEditingUser(parent);
    setIsModalOpen(true);
  };

  const handleDeleteParent = (id) => {
    try {
      const parentToDelete = currentDemoData.users.find(u => u.id === id && u.role === 'PARENT');
      if (!parentToDelete) {
        toast.error("Parent non trouvé pour suppression.");
        return;
      }

      // Soft delete: set isActive to false or set a deletedAt timestamp
      // For demo, we'll remove it from the array for simplicity, but a real app would soft delete.
      const updatedUsers = currentDemoData.users.filter(user => user.id !== id);
      const updatedParentStudents = currentDemoData.parentStudents.filter(ps => ps.parentId !== id);

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsers,
        parentStudents: updatedParentStudents,
      }));

      toast.success(`Parent ${parentToDelete.fullname} supprimé avec succès.`);
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast.error('Erreur lors de la suppression du parent.');
    }
  };


  const handleSaveParent = async (userData) => {
    try {
      let message = '';
      let updatedUsersArray = [...currentDemoData.users];
      let updatedParentStudentsArray = [...currentDemoData.parentStudents];

      if (editingUser) { // Mode édition
        const index = updatedUsersArray.findIndex(u => u.id === editingUser.id);
        if (index !== -1) {
          const userToUpdate = updatedUsersArray[index];
          const updatedUser = {
            ...userToUpdate,
            ...userData,
            id: editingUser.id,
            role: 'PARENT',
            password: userData.password && userData.password.trim() !== '' ? userData.password : userToUpdate.password
          };
          updatedUsersArray[index] = updatedUser;
          message = 'Parent modifié avec succès';

          // Update parent-student link: assuming userData.studentIds is an array of selected student IDs
          updatedParentStudentsArray = updatedParentStudentsArray.filter(ps => ps.parentId !== updatedUser.id);
          if (userData.studentIds && Array.isArray(userData.studentIds)) {
              userData.studentIds.forEach(studentId => {
                  updatedParentStudentsArray.push({ parentId: updatedUser.id, studentId: parseInt(studentId) });
              });
          }

        } else {
          throw new Error("Parent à modifier non trouvé.");
        }
      } else { // Mode ajout
        const newId = Math.max(...currentDemoData.users.map(u => u.id), 0) + 1;
        const newUser = {
          ...userData,
          id: newId,
          createdAt: new Date().toISOString(),
          role: 'PARENT',
          isActive: true,
        };
        updatedUsersArray.push(newUser);
        message = 'Parent ajouté avec succès';

        // Add parent-student link for new parent
        if (userData.studentIds && Array.isArray(userData.studentIds)) {
            userData.studentIds.forEach(studentId => {
                updatedParentStudentsArray.push({ parentId: newId, studentId: parseInt(studentId) });
            });
        }
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsersArray,
        parentStudents: updatedParentStudentsArray,
      }));

      toast.success(message);
      setIsModalOpen(false);
      setEditingUser(null);

    } catch (error) {
      console.error('Error saving parent:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Helper for ModalUser to filter students for parent linking (students from manager's establishment)
  const studentsInManagerEstablishment = currentDemoData.students.filter(
      student => student.establishmentId === effectiveManagerEstablishmentId && !student.deletedAt
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Parents de {establishmentName}
        </h2>
        {/* Add Parent Button */}
        <Button onClick={() => {
          setEditingUser(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Parent
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou enfants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Modal for adding/editing a parent. You might need a specific ModalParent component */}
      {/* For now, assuming ModalUser can be adapted or you'll create ModalParent later */}
      <ModalUser
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveParent}
        role="PARENT" // Specify role
        // Pass students from this establishment for parent linking in the modal
        students={studentsInManagerEstablishment}
        // If editing, pass current associated student IDs
        associatedStudentIds={editingUser ? currentDemoData.parentStudents.filter(ps => ps.parentId === editingUser.id).map(ps => ps.studentId) : []}
      />


      {/* Main content area: Grid of Parent Cards */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:users" className="h-6 w-6 text-primary" />
            Liste des Parents
          </CardTitle>
          <CardDescription>
            Nombre total de parents filtrés: {filteredParents.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paginatedParents.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedParents.map((parent) => (
                <ParentCard
                  key={parent.id}
                  parent={parent}
                  onEditParent={handleEditParent}
                  onDeleteParent={handleDeleteParent}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Aucun Parent trouvé.</p>
          )}
        </CardContent>
      </Card>

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

export default ParentsPage;