'use client';

import { Fragment, useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ModalEtablissement from '@/components/models/ModalEtablissement1';
import ModalSuppression from '@/components/models/ModalSuppression';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';

// Service API
import { getSchool } from '@/services/school';

const ITEMS_PER_PAGE = 5;

export default function SchoolDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = parseInt(params.id);

  // États locaux
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedRows, setCollapsedRows] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEstablishmentDataForModal, setCurrentEstablishmentDataForModal] = useState(null);
  const [establishmentToDelete, setEstablishmentToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    async function loadSchool() {
      try {
        const data = await getSchool(schoolId);
        setSchoolData(data);
      } catch (error) {
        console.error('Erreur lors du chargement de l’école', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadSchool();
  }, [schoolId]);

  // Filtrer les établissements en fonction de la recherche
  const filteredEstablishments = schoolData?.establishments?.filter(etab => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    const responsableFullName = etab.responsable?.fullname?.toLowerCase() || '';
    return (
      etab.name.toLowerCase().includes(lowerCaseSearchQuery) ||
      etab.email.toLowerCase().includes(lowerCaseSearchQuery) ||
      (etab.phone && etab.phone.toLowerCase().includes(lowerCaseSearchQuery)) ||
      etab.address.toLowerCase().includes(lowerCaseSearchQuery) ||
      etab.quartie.toLowerCase().includes(lowerCaseSearchQuery) ||
      etab.city.toLowerCase().includes(lowerCaseSearchQuery) ||
      responsableFullName.includes(lowerCaseSearchQuery)
    );
  }) || [];

  const totalPages = Math.ceil(filteredEstablishments.length / ITEMS_PER_PAGE);
  const paginatedEstablishments = filteredEstablishments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Pagination handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setCollapsedRows([]);
    }
  };

  // Gestion des lignes étendues
  const toggleRow = (id) => {
    setCollapsedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // Ouvrir modal création/modification établissement
  const handleAddEstablishment = () => {
    setCurrentEstablishmentDataForModal(null);
    setIsEditModalOpen(true);
  };

  const handleEditEstablishment = (etablissementToEdit) => {
    const associatedResponsable = etablissementToEdit.responsable || null;
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
        password: '',
        cin: associatedResponsable.cin || '',
        isActive: associatedResponsable.isActive !== undefined ? associatedResponsable.isActive : true
      } : undefined,
      existingResponsableId: associatedResponsable ? associatedResponsable.id.toString() : '',
      addNewResponsable: !associatedResponsable,
      schoolId: etablissementToEdit.schoolId ? etablissementToEdit.schoolId.toString() : '',
    };
    setCurrentEstablishmentDataForModal(defaultValuesForForm);
    setIsEditModalOpen(true);
  };

  const openDeleteEstablishmentModal = (id) => {
    setEstablishmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Gérer suppression établissement (à adapter selon ton API)
  const handleDeleteEstablishment = () => {
    toast.success("Établissement supprimé avec succès !");
    setIsDeleteModalOpen(false);
    setEstablishmentToDelete(null);
  };

  // Gérer sauvegarde établissement
  const handleSaveEstablishment = () => {
    toast.success("Établissement enregistré !");
    setIsEditModalOpen(false);
    setCurrentEstablishmentDataForModal(null);
  };

  if (loading) {
    return <p>Chargement en cours...</p>;
  }

  if (!schoolData) {
    return notFound();
  }

  const { school, admins, establishmentCount, establishments } = schoolData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-default-800 mb-2">
            Établissements de : {school.name}
          </h1>
          <p className="text-muted-foreground mb-4">
            Téléphone : {school.phone} — Email : {school.email}
          </p>
        </div>
        <Link href={`/super-admin/schools`}>
          <Button variant="outline">← Retour</Button>
        </Link>
      </div>

      {/* Recherche + Bouton ajout */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Rechercher un établissement par nom, ville, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <Button onClick={handleAddEstablishment}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un établissement
        </Button>
      </div>

      {/* Tableau */}
      {paginatedEstablishments.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Quartie</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEstablishments.map((item) => {
                const responsable = item.responsable || null;
                return (
                  <Fragment key={item.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => toggleRow(item.id)}
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-none rounded-full"
                          >
                            <Icon
                              icon="heroicons:chevron-down"
                              className={cn("h-5 w-5 transition-all duration-300", {
                                "rotate-180": collapsedRows.includes(item.id),
                              })}
                            />
                          </Button>
                          <div className="flex gap-3 items-center">
                            <Avatar>
                              <AvatarImage src="/placeholder-avatar.png" />
                              <AvatarFallback>
                                {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm block text-card-foreground">
                                {item.name}
                              </span>
                              <span className="text-xs mt-1 block font-normal">
                                {item.email}
                              </span>
                              <span className="text-xs mt-1 block font-normal">
                                {item.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quartie}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell className="text-right flex gap-2 justify-start">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none"
                          onClick={() => handleEditEstablishment(item)}
                        >
                          <Icon icon="heroicons:pencil" className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none text-destructive hover:text-destructive"
                          onClick={() => openDeleteEstablishmentModal(item.id)}
                        >
                          <Icon icon="heroicons:trash" className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => router.push(`/fr/super-admin/etablissements/${item.id}`)}
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none"
                        >
                          <Icon icon="heroicons:eye" className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {collapsedRows.includes(item.id) && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5}>
                          <div className="ltr:pl-12 rtl:pr-12 flex flex-col items-start gap-1 py-3">
                            <p className="flex items-center gap-2">
                              <Icon icon="heroicons:user" className="w-4 h-4 opacity-50" />
                              <span>
                                Directeur : {responsable?.fullname || "Non renseigné"}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Icon icon="heroicons:at-symbol" className="w-4 h-4 opacity-50" />
                              <span>
                                Email Directeur : {responsable?.email || "Non renseigné"}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Icon icon="heroicons:phone" className="w-4 h-4 opacity-50" />
                              <span>Téléphone Directeur : {responsable?.phone || "Non renseigné"}</span>
                            </p>
                           
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 items-center mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">Aucun établissement trouvé pour cette école.</p>
      )}

      {/* Modale établissement */}
      <ModalEtablissement
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        onSave={handleSaveEstablishment}
        editingEtablissement={currentEstablishmentDataForModal}
        schoolId={school.id.toString()}
        school={school}
        allSchools={[school]} // Peut être utilisé pour liste déroulante si nécessaire
        users={[]} // À remplir si besoin de sélectionner des responsables existants
        establishments={establishments}
      />

      {/* Modale suppression */}
      <ModalSuppression
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEstablishment}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}