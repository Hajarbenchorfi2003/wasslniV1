'use client';

import { Fragment, useState } from "react";
import { useRouter, usePathname } from 'next/navigation'; // Only if you plan to navigate to establishment details pages
import ModalSuppression from '@/components/models/ModalSuppression'; // Assuming you have this modal
import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { demoData } from '@/data/data'; // Ensure demoData contains establishments, users, and schools

const TableEtablissement = ({ etablissements, onEditEtablissement, onDeleteEtablissement }) => {
  const [collapsedRows, setCollapsedRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [etablissementToDelete, setEtablissementToDelete] = useState(null);

  const router = useRouter(); // Initialize useRouter
  const pathname = usePathname(); // Initialize usePathname

  const toggleRow = (id) => {
    if (collapsedRows.includes(id)) {
      setCollapsedRows(collapsedRows.filter((rowId) => rowId !== id));
    } else {
      setCollapsedRows([...collapsedRows, id]);
    }
  };

  const openDeleteModal = (id) => {
    setEtablissementToDelete(id);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (etablissementToDelete !== null) {
      onDeleteEtablissement?.(etablissementToDelete);
    }
    setModalOpen(false);
    setEtablissementToDelete(null);
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setEtablissementToDelete(null);
  };

  // Helper function to get school name by ID
  const getSchoolDetails = (schoolId) => {
    const school = demoData.schools.find(s => s.id === schoolId);
    return school || { name: 'N/A', city: 'N/A' };
  };

  // Helper function to get responsible details by ID
  const getResponsibleDetails = (responsibleId) => {
    const responsible = demoData.users.find(u => u.id === responsibleId && u.role === 'RESPONSIBLE');
    // Updated to use 'fullname' directly from the data
    return responsible || { fullname: 'Non Assigné', email: 'N/A', phone: 'N/A', cin: 'N/A', isActive: false };
  };

  const columns = [
    { key: 'name', label: 'Nom Établissement' },
    { key: 'city', label: 'Ville' },
    { key: 'school', label: 'École' },
    { key: 'responsible', label: 'Responsable Principal' },
    { key: 'action', label: 'Actions' },
  ];

  return (
    <>
         <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {etablissements && etablissements.length > 0 ? (
              etablissements.map((item) => {
                const responsible = item.responsable;
                const school = item.school;

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
                              <AvatarImage src="/placeholder-avatar.png" /> {/* Consider dynamic avatar for establishments */}
                              <AvatarFallback>
                                {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm block text-card-foreground">{item.name}</span>
                              <span className="text-xs mt-1 block font-normal text-muted-foreground">{item.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>
                        {responsible.fullname !== 'Non Assigné' ? ( // Check if a responsible is assigned
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder-avatar.png" /> {/* Consider dynamic avatar for users */}
                              <AvatarFallback>
                                {/* Use fullname for avatar fallback */}
                                {responsible.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm block">
                                {responsible.fullname}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {responsible.email}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Non assigné
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none"
                          onClick={() => onEditEtablissement?.(item)}
                        >
                          <Icon icon="heroicons:pencil" className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none text-destructive hover:text-destructive"
                          onClick={() => openDeleteModal(item.id)}
                        >
                          <Icon icon="heroicons:trash" className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => router.push(`${pathname}/${item.id}`)}
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none"
                        >
                          <Icon icon="heroicons:eye" className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Collapsible Row for more details */}
                    {collapsedRows.includes(item.id) && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={columns.length}>
                          <div className="ltr:pl-12 rtl:pr-12 flex flex-col items-start gap-4 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                              {/* Establishment Details */}
                              <div>
                                <h4 className="font-medium mb-2">Détails de l'établissement</h4>
                                <div className="space-y-2 text-sm">
                                  <p className="flex items-center gap-2">
                                    <Icon icon="heroicons:phone" className="w-4 h-4 opacity-50" />
                                    <span>Téléphone: {item.phone}</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Icon icon="heroicons:map-pin" className="w-4 h-4 opacity-50" />
                                    <span>Adresse: {item.address}, {item.quartie}, {item.city}</span>
                                  </p>
                                  {/* You can add more establishment-specific details here if needed */}
                                </div>
                              </div>

                              {/* Responsible Details */}
                              <div>
                                <h4 className="font-medium mb-2">Informations du responsable</h4>
                                <div className="space-y-2 text-sm">
                                  {responsible.fullname !== 'Non Assigné' ? (
                                    <>
                                      <p className="flex items-center gap-2">
                                        <Icon icon="heroicons:user" className="w-4 h-4 opacity-50" />
                                        <span>Nom Complet: {responsible.fullname} </span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Icon icon="heroicons:at-symbol" className="w-4 h-4 opacity-50" />
                                        <span>Email: {responsible.email}</span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Icon icon="heroicons:phone" className="w-4 h-4 opacity-50" />
                                        <span>Téléphone: {responsible.phone || 'Non renseigné'}</span>
                                      </p>
                                      
                                      <p className="flex items-center gap-2">
                                        <Icon icon="heroicons:check-circle" className="w-4 h-4 opacity-50" />
                                        <span>Statut: {responsible.isActive ? 'Actif' : 'Inactif'}</span>
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">
                                      Aucun responsable assigné
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  Aucun établissement trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      

      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default TableEtablissement;