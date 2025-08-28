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
import {fetchUserEstablishments} from '@/services/etablissements';
import {fetchParents,register,updateUser,deleteUser} from '@/services/user';
const ITEMS_PER_PAGE = 9;

const ParentsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [parents, setParents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
   const [establishments, setEstablishments] = useState([]);
   const [establishmentsLoading, setEstablishmentsLoading] = useState(false); 
    const [loading, setLoading] = useState(false);
    
  
    useEffect(() => {
      let isMounted = true;
    
      async function loadEstablishments() {
        setEstablishmentsLoading(true);
        try {
          const data = await fetchUserEstablishments();
          if (isMounted && data && Array.isArray(data)) {
            setEstablishments(data);
          }
        } catch (error) {
          toast.error("Impossible de charger les établissements");
        } finally {
          if (isMounted) setEstablishmentsLoading(false);
        }
      }
    
      // Charger seulement si non encore chargés
      if (establishments.length === 0) {
        loadEstablishments();
      }
    
      return () => {
        isMounted = false;
      };
    }, []); // ← tableau vide ici
     // ✅ seulement au montage du composant
// 👈 pas `loading` global ici

 const loadParents = async () => {
    setLoading(true);
    try {
      const data = await fetchParents(); // Récupère les données depuis l'API
      const safePrents = Array.isArray(data) ? data : [];

      setParents(afePrents); // Met à jour l'état local
    } catch (error) {
      console.error('Erreur lors du chargement des parents', error);
      toast.error("Impossible de charger les parents");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
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

  const handleDeleteParent =async (id) => {
    try {
     await deleteUser(id);

      await loadParents();
      

      toast.success('Parent supprimé avec succès');
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast.error('Erreur lors de la suppression du parent');
       const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Erreur inconnue, veuillez réessayer.';

       toast.error(`Erreur : ${errorMessage}`, {
       position: 'bottom-right',
       });

    }
  };

 const handleSaveParent = async (parentData) => {
  try {
    let message = '';
    
    if (editingParent) {
      await updateUser(editingParent.id, parentData);
      message = 'Parent modifié avec succès';
    } else {
      await register(parentData);
      message = 'Parent ajouté avec succès';
    }

    // ✅ Recharge les parents depuis l'API
    await loadParents();

    // ✅ Ferme la modal et remet à zéro
    toast.success(message);
    setIsModalOpen(false);
    setEditingParent(null);

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du parent:', error);

    // ✅ Gestion intelligente du message d’erreur
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Erreur inconnue, veuillez réessayer.';

    toast.error(`Erreur : ${errorMessage}`, {
  position: 'bottom-right',
});

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