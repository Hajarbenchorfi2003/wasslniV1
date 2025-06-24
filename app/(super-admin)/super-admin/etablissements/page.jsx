'use client';

import React, { useState, useEffect } from 'react';
import ModalEtablissement from '@/components/models/ModalEtablissement1';
import TableEtablissement from './tableEtablissement';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { fetchAllEstablishments, createEstablishments,deletePremently, updateEstablishments } from '@/services/etablissements';
import { fetchSchools } from '@/services/school';
import { register } from '@/services/user'; // Service pour créer un responsable

const ITEMS_PER_PAGE = 5;

export default function EtablissementsPage() {
  const [allSchools, setAllSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etablissements, setEtablissements] = useState([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingEtablissement, setEditingEtablissement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les écoles depuis l'API
  useEffect(() => {
    async function loadSchools() {
      try {
        const schools = await fetchSchools();
        setAllSchools(schools);
      } catch (error) {
        toast.error("Erreur lors du chargement des écoles");
        console.error(error);
      }
    }

    loadSchools();
  }, []);

  // Charger les établissements depuis l'API
  useEffect(() => {
    let isMounted = true;

    async function loadEstablishments() {
      try {
        setLoading(true);
        const data = await fetchAllEstablishments();
  console.log("data",data)
        if (isMounted) {
          setEtablissements(data);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des établissements");
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEstablishments();

    return () => {
      isMounted = false;
    };
  }, []);


  // Filtrer les établissements selon la recherche
  const filteredEtablissements = etablissements.filter((etab) =>
    etab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etab.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etab.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (etab.responsable && etab.responsable.fullname?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredEtablissements.length / ITEMS_PER_PAGE);

  const paginatedEtablissements = filteredEtablissements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Ouvrir le modal pour modification ou ajout
  const handleEditEtablissement = (etablissementToEdit) => {
    console.log("edit function",etablissementToEdit)
    const associatedResponsable = etablissementToEdit?.responsable|| null;


    const defaultValuesForForm = {
      id: etablissementToEdit.id,
      name: etablissementToEdit.name,
      email: etablissementToEdit.email,
      phone: etablissementToEdit.phone,
      address: etablissementToEdit.address,
      quartie: etablissementToEdit.quartie,
      city: etablissementToEdit.city,
      isActive: etablissementToEdit.isActive !== undefined ? etablissementToEdit.isActive : true,
      responsable: associatedResponsable ? {
        fullname: associatedResponsable.fullname || '',
        email: associatedResponsable.email || '',
        phone: associatedResponsable.phone || '',
        password: '', // Toujours vide pour la sécurité
        isActive: associatedResponsable.isActive !== undefined ? associatedResponsable.isActive : true,
      } : undefined,
      schoolId: etablissementToEdit.schoolId?.toString() || '',
      existingResponsableId: associatedResponsable ? String(associatedResponsable.id) : '',
      addNewResponsable: !associatedResponsable,
    };


    setEditingEtablissement(defaultValuesForForm);
    console.log("editingEtablissement",editingEtablissement)
    setIsAddEditDialogOpen(true);
  };

  // Supprimer un établissement (via API)
  const handleDeleteEtablissement = async (id) => {
    try {
      // Si tu as une API DELETE
      // await deleteEstablishment(id); // Exemple
      setEtablissements(etablissements.filter((e) => e.id !== id));
      toast.success('Établissement supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  // Créer un responsable avec ecoleId obligatoire
  const handleCreateResponsable = async (userData, schoolId) => {
    try {
      // Ajouter `schoolId` dans les données utilisateur
      const newUser = {
        ...userData,
        role: 'RESPONSIBLE',
        echoleId: Number(schoolId), // Obligatoire
      };

      // Appel au service `register`
      const createdUser = await register(newUser);

      toast.success('Responsable créé avec succès');
      return createdUser;
    } catch (error) {
      toast.error("Erreur lors de la création du responsable");
      console.error(error);
      throw error;
    }
  };

  // Gérer l’enregistrement d’un établissement
 const handleSaveEtablissement = async (formData) => {
  try {
    let result;

    if (formData.addNewResponsable) {
      // ✅ CAS 1 : Création d'un responsable + établissement
      const userData = {
        fullname: formData.etablissement.fullname,
        email: formData.etablissement.email,
        phone: formData.etablissement.phone,
        password: formData.responsable.password,
        address: formData.etablissement.address,
        role: 'RESPONSIBLE',
        schoolId: Number(formData.schoolId),
      };

      const newResponsable = await register(userData);

      const newEtablissementData = {
        name: formData.etablissement.name,
        email: formData.etablissement.email,
        phone: formData.etablissement.phone,
        address: formData.etablissement.address,
        quartie: formData.etablissement.quartie,
        city: formData.etablissement.city,
        isActive: formData.etablissement.isActive,
        responsableId: newResponsable.id,
        schoolId: Number(formData.schoolId),
      };

      const newEtablissement = await createEstablishments(newEtablissementData);
      setEtablissements((prev) => [...prev, newEtablissement]);

    } else if (!formData.addNewResponsable && formData.existingResponsableId) {
      // ✅ CAS 2 : Création d’un établissement lié à un responsable existant
      const newEtablissementData = {
        name: formData.etablissement.name,
        email: formData.etablissement.email,
        phone: formData.etablissement.phone,
        address: formData.etablissement.address,
        quartie: formData.etablissement.quartie,
        city: formData.etablissement.city,
        isActive: formData.etablissement.isActive,
        responsableId: Number(formData.existingResponsableId),
        schoolId: Number(formData.schoolId),
      };

      const newEtablissement = await createEstablishments(newEtablissementData);
      setEtablissements((prev) => [...prev, newEtablissement]);

    } else if (!formData.addNewResponsable && editingEtablissement && formData.etablissement.id) {
      // ✅ CAS 3 : Modification d’un établissement existant
      const updateData = {
        id: formData.etablissement.id,
        name: formData.etablissement.name,
        email: formData.etablissement.email,
        phone: formData.etablissement.phone,
        address: formData.etablissement.address,
        quartie: formData.etablissement.quartie,
        city: formData.etablissement.city,
        isActive: formData.etablissement.isActive,
        responsableId: formData.existingResponsableId ? Number(formData.existingResponsableId) : undefined,
        schoolId: Number(formData.schoolId),
      };

      const updatedEtablissement = await updateEstablishments(updateData);
      setEtablissements((prev) =>
        prev.map((e) => (e.id === updatedEtablissement.id ? updatedEtablissement : e))
      );

    }

    await loadEstablishments(); // Recharger depuis l'API
    toast.success(
      formData.addNewResponsable
        ? 'Responsable et établissement créés'
        : editingEtablissement
        ? 'Établissement modifié'
        : 'Établissement créé et lié à un responsable existant'
    );

    setIsAddEditDialogOpen(false);
    setEditingEtablissement(null);

  } catch (error) {
    console.error("Erreur lors de l'enregistrement", error);
    toast.error("Erreur lors de l'enregistrement");
  }
};

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Recherche & Bouton d'ajout */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">Gestion des Établissements</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Input
            placeholder="Rechercher un établissement..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full sm:w-72"
          />
          <Button onClick={() => {
            setEditingEtablissement(null);
            setIsAddEditDialogOpen(true);
          }}>
            <Icon icon="heroicons:plus" className="mr-2 h-5 w-5" />
            Ajouter un établissement
          </Button>
        </div>
      </div>

      {/* Tableau des établissements */}
      <TableEtablissement
        etablissements={paginatedEtablissements}
        onEditEtablissement={handleEditEtablissement}
        onDeleteEtablissement={handleDeleteEtablissement}
      />

      {/* Modal */}
      <ModalEtablissement
        isOpen={isAddEditDialogOpen}
        setIsOpen={setIsAddEditDialogOpen}
        editingEtablissement={editingEtablissement}
        onSave={handleSaveEtablissement}
        allSchools={allSchools}
        fixedSchoolId={null}
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
              className="w-8 h-8"
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
}