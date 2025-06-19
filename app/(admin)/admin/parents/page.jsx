// components/ParentsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalParent } from '@/components/models/ModalParent';
import ParentCard from './ParentCard';
import { Input } from '@/components/ui/input'; // Ajout pour la recherche

const ITEMS_PER_PAGE = 3;

const ParentsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]); // Nouvel état pour les parents filtrés
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // État pour le terme de recherche

  useEffect(() => {
    console.log("currentDemoData updated, filtering parents...");
    const allParents = currentDemoData.users.filter(user => user.role === 'PARENT');

    // Enrich parents with student names they are associated with
    const enrichedParents = allParents.map(parent => {
      const associatedStudentIds = currentDemoData.parentStudents
        .filter(ps => ps.parentId === parent.id)
        .map(ps => ps.studentId);

      const studentNames = associatedStudentIds.map(studentId => {
        const student = currentDemoData.students.find(s => s.id === studentId);
        return student ? student.fullname : 'N/A';
      });

      return {
        ...parent,
        studentNames: studentNames.length > 0 ? studentNames.join(', ') : 'Aucun enfant associé',
        studentIds: associatedStudentIds // Garder les IDs pour la recherche
      };
    });

    setParents(enrichedParents);
    setFilteredParents(enrichedParents); // Initialiser les parents filtrés
  }, [currentDemoData]);

  // Effet pour filtrer les parents lorsque le terme de recherche change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredParents(parents);
      setCurrentPage(1);
    } else {
      const filtered = parents.filter(parent => {
        const searchLower = searchTerm.toLowerCase();
        return (
          parent.fullname.toLowerCase().includes(searchLower) ||
          parent.email.toLowerCase().includes(searchLower) ||
          parent.studentNames.toLowerCase().includes(searchLower)
        );
      });
      setFilteredParents(filtered);
      setCurrentPage(1); // Réinitialiser à la première page après un nouveau filtre
    }
  }, [searchTerm, parents]);

  const totalPages = Math.ceil(filteredParents.length / ITEMS_PER_PAGE);
  const paginatedParents = filteredParents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditParent = (parent) => {
    setEditingParent(parent);
    setIsModalOpen(true);
  };

  const handleDeleteParent = (id) => {
    try {
      console.log(`Attempting to delete parent with ID: ${id}`);
      const updatedUsers = currentDemoData.users.filter(user => user.id !== id);
      const updatedParentStudents = currentDemoData.parentStudents.filter(ps => ps.parentId !== id);

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsers,
        parentStudents: updatedParentStudents,
      }));

      toast.success('Parent supprimé avec succès');
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast.error('Erreur lors de la suppression du parent');
    }
  };

  const handleSaveParent = async (parentData) => {
    try {
      let message = '';
      let updatedUsersArray = [...currentDemoData.users];
      let updatedParentStudentsArray = [...currentDemoData.parentStudents];

      if (editingParent) {
        const index = updatedUsersArray.findIndex(u => u.id === editingParent.id);
        if (index !== -1) {
          const userToUpdate = updatedUsersArray[index];
          const updatedUser = {
            ...userToUpdate,
            ...parentData,
            id: editingParent.id,
            role: 'PARENT',
            password: parentData.password && parentData.password.trim() !== '' ? parentData.password : userToUpdate.password
          };
          updatedUsersArray[index] = updatedUser;
          message = 'Parent modifié avec succès';

          // Update parent-student links
          updatedParentStudentsArray = updatedParentStudentsArray.filter(ps => ps.parentId !== updatedUser.id);
          if (parentData.studentIds && parentData.studentIds.length > 0) {
            parentData.studentIds.forEach(studentId => {
              updatedParentStudentsArray.push({ parentId: updatedUser.id, studentId: parseInt(studentId) });
            });
          }
        } else {
          throw new Error("Parent à modifier non trouvé.");
        }
      } else {
        const newId = Math.max(...currentDemoData.users.map(u => u.id), 0) + 1;
        const newUser = {
          ...parentData,
          id: newId,
          createdAt: new Date().toISOString(),
          role: 'PARENT',
          isActive: true,
        };
        updatedUsersArray.push(newUser);
        message = 'Parent ajouté avec succès';

        // Add parent-student links for new parent
        if (parentData.studentIds && parentData.studentIds.length > 0) {
          parentData.studentIds.forEach(studentId => {
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
      setEditingParent(null);

    } catch (error) {
      console.error('Error saving parent:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Gestion des Parents
        </div>
        <Button onClick={() => {
          setEditingParent(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Parent
        </Button>
      </div>

      {/* Ajout de la barre de recherche */}
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Rechercher un parent ou un élève..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Icon 
          icon="heroicons:magnifying-glass" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
        />
      </div>

      <ModalParent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingParent={editingParent}
        onSave={handleSaveParent}
        students={currentDemoData.students}
        parentStudents={currentDemoData.parentStudents}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedParents.length > 0 ? (
          paginatedParents.map((parent) => (
            <ParentCard
              key={parent.id}
              parent={parent}
              onEditParent={handleEditParent}
              onDeleteParent={handleDeleteParent}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            {searchTerm ? "Aucun résultat trouvé pour votre recherche." : "Aucun parent trouvé."}
          </p>
        )}
      </div>

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