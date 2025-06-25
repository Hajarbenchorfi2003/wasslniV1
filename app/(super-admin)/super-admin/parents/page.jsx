// components/ParentsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalParent } from '@/components/models/ModalParent'; // Create this
import ParentCard from './ParentCard'; // Create this
import {fetchAllEstablishments} from '@/services/etablissements';
import {fetchParents} from '@/services/user';
const ITEMS_PER_PAGE = 3;

const ParentsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [parents, setParents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
   const [establishments, setEstablishments] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
  
    let isMounted = true; // 🔥 Pour éviter les fuites de mémoire si le composant se démonte
  
    async function Establishments() {
      if (loading || establishments.length > 0) {
        // 🚫 Évite de recharger si déjà en cours ou déjà chargé
        return;
      }
  
      setLoading(true);
      try {
        const data = await fetchAllEstablishments(); // Assurez-vous que cette fonction renvoie bien un tableau
        console.log("Données reçues depuis l'API:", data);
  
       
          // Met à jour la liste des responsables
          setEstablishments(data);
  
         
      } catch (error) {
        console.error('Erreur lors du chargement des etablisments', error);
        toast.error("Impossible de charger les etablisments");
      } finally {
        if (isMounted) {
          setLoading(false); // 🔄 Fin du chargement
        }
      }
    }
  
    Establishments();
  
    // Nettoyage pour éviter les mises à jour sur un composant non monté
    return () => {
      isMounted = false;
    };
  }, [loading]); 

useEffect(() => {
  const loadParents = async () => {
    setLoading(true);
    try {
      const data = await fetchParents(); // Récupère les données depuis l'API
      setParents(data || []); // Met à jour l'état local
      console.log("Données reçues depuis l'API :", data); // ✅ Affiche directement les données
    } catch (error) {
      console.error('Erreur lors du chargement des parents', error);
      toast.error("Impossible de charger les parents");
    } finally {
      setLoading(false);
    }
  };

  loadParents();
}, []);

  const totalPages = Math.ceil(parents.length / ITEMS_PER_PAGE);
  const paginatedParents = parents.slice(
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

      <ModalParent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingParent={editingParent}
        onSave={handleSaveParent}
        students={currentDemoData.students} // Pass students for selection
        parentStudents={currentDemoData.parentStudents} // Pass current links to pre-select
        establishments={establishments}
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
          <p className="col-span-full text-center text-gray-500">Aucun parent trouvé.</p>
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