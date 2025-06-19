'use client';

import { Fragment, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import ModalSuppression from '@/components/models/ModalSuppression';
import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { demoData, getSchoolAdmins ,getSchoolEstablishments } from '@/data/data';

const TableSchool = ({ schools, onEditSchool, onDeleteSchool }) => {
  const [collapsedRows, setCollapsedRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  const toggleRow = (id) => {
    if (collapsedRows.includes(id)) {
      setCollapsedRows(collapsedRows.filter((rowId) => rowId !== id));
    } else {
      setCollapsedRows([...collapsedRows, id]);
    }
  };

  const openDeleteModal = (id) => {
    setSchoolToDelete(id);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (schoolToDelete !== null) {
      onDeleteSchool?.(schoolToDelete);
    }
    setModalOpen(false);
    setSchoolToDelete(null);
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setSchoolToDelete(null);
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'admin', label: 'Administrateur' },
    { key: 'address', label: 'Adresse' },
    { key: 'city', label: 'Ville' },
    { key: 'active', label: 'Active' },
    { key: 'action', label: 'Action' },
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
          {schools && schools.length > 0 ? (
            schools.map((item) => {
              const admins = getSchoolAdmins(item.id);
              const mainAdmin = admins[0];
              const establishments=getSchoolEstablishments(item.id);
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
                            <span className="text-sm block text-card-foreground">{item.name}</span>
                            <span className="text-xs mt-1 block font-normal">{item.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mainAdmin ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-avatar.png" />
                            <AvatarFallback>
                            {mainAdmin.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm block">
                              {mainAdmin.fullname}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {mainAdmin.role}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Aucun admin
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{item.address}</TableCell>
                    <TableCell>{item.city}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("capitalize", {
                          "bg-green-100 text-green-800": item.isActive,
                          "bg-red-100 text-red-800": !item.isActive,
                        })}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-start">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-none"
                        onClick={() => onEditSchool?.(item)}
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

                  {collapsedRows.includes(item.id) && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <div className="ltr:pl-12 rtl:pr-12 flex flex-col items-start gap-4">
                          <div className="grid grid-cols-2 gap-4 w-full">
                            <div>
                              <h4 className="font-medium mb-2">Détails de l'école</h4>
                              <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                  <Icon icon="heroicons:calendar" className="w-4 h-4 opacity-50" />
                                  <span>Créée le: {new Date(item.createdAt).toLocaleDateString()}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Icon icon="heroicons:building-office-2" className="w-4 h-4 opacity-50" />
                                  <span>Établissements: {establishments?.length || 0}</span>
                                </p>
                              </div>
                            </div>

                            <div>
                              <div className="space-y-3">
                                {admins.length > 0 ? (
                                  admins.map(admin => (
                                    <div key={admin.id} className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder-avatar.png" />
                                        <AvatarFallback>
                                        {admin.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm">
                                          {admin.firstName} {admin.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {admin.email} • {admin.phone || 'Pas de téléphone'}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Aucun administrateur assigné
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
                Aucune école trouvée
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
        description="Êtes-vous sûr de vouloir supprimer cette école ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default TableSchool;