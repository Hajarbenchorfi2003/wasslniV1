// components/TableRolePermissions.jsx
'use client';

import { Fragment, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ModalSuppression from '@/components/models/ModalSuppression'; // Reusing your ModalSuppression

const TableRolePermissions = ({ rolePermissions, roles, permissions, onDeleteRolePermission }) => {
  const [collapsedRows, setCollapsedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rolePermissionToDelete, setRolePermissionToDelete] = useState(null);

  const toggleRow = (role) => {
    if (collapsedRows.includes(role)) {
      setCollapsedRows(collapsedRows.filter((rowRole) => rowRole !== role));
    } else {
      setCollapsedRows([...collapsedRows, role]);
    }
  };

  const openDeleteModal = (role, permissionId) => {
    setRolePermissionToDelete({ role, permissionId });
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (rolePermissionToDelete) {
      onDeleteRolePermission?.(rolePermissionToDelete.role, rolePermissionToDelete.permissionId);
    }
    setModalOpen(false);
    setRolePermissionToDelete(null);
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setRolePermissionToDelete(null);
  };

  // Group permissions by role
  const groupedRolePermissions = useMemo(() => {
    const grouped = {};
    rolePermissions.forEach((rp) => {
      if (!grouped[rp.role]) {
        grouped[rp.role] = [];
      }
      grouped[rp.role].push(rp);
    });
    return grouped;
  }, [rolePermissions]);

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return roles.filter((role) => {
      const roleNameMatches = role.toLowerCase().includes(lowerCaseSearchTerm);
      const permissionsMatch = groupedRolePermissions[role]?.some(rp =>
        rp.permissionName.toLowerCase().includes(lowerCaseSearchTerm) ||
        rp.permissionDescription.toLowerCase().includes(lowerCaseSearchTerm)
      );
      return roleNameMatches || permissionsMatch;
    });
  }, [roles, searchTerm, groupedRolePermissions]);

  const columns = [
    { key: 'role' , label: 'Rôle'},
    { key: 'permissions', label: 'Permissions Associées' },
    { key: 'action', label: 'Action' },
  ];

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Filtrer par rôle ou permission..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => {
              const permissionsForRole = groupedRolePermissions[role] || [];
              return (
                <Fragment key={role}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => toggleRow(role)}
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none rounded-full"
                        >
                          <Icon
                            icon="heroicons:chevron-down"
                            className={cn('h-5 w-5 transition-all duration-300', {
                              'rotate-180': collapsedRows.includes(role),
                            })}
                          />
                        </Button>
                        <span className="text-sm font-medium">{role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {permissionsForRole.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {permissionsForRole.slice(0, 3).map((rp) => (
                            <span key={rp.permissionId} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {rp.permissionName}
                            </span>
                          ))}
                          {permissionsForRole.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{permissionsForRole.length - 3} plus
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Aucune permission</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-start">
                      {/* Add/Remove buttons for role permissions */}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-none"
                        onClick={() => toggleRow(role)} // You could repurpose this to open an "edit permissions for role" modal
                      >
                        <Icon icon="heroicons:pencil" className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {collapsedRows.includes(role) && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <div className="ltr:pl-12 rtl:pr-12 flex flex-col items-start gap-4">
                          <h4 className="font-medium mb-2">Détails des Permissions pour &quot;{role}&quot;</h4>
                          {permissionsForRole.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                              {permissionsForRole.map((rp) => (
                                <div key={`${rp.role}-${rp.permissionId}`} className="border rounded-md p-3 flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-sm">{rp.permissionName}</p>
                                    <p className="text-xs text-muted-foreground">{rp.permissionDescription}</p>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 border-none text-destructive hover:text-destructive"
                                    onClick={() => openDeleteModal(rp.role, rp.permissionId)}
                                  >
                                    <Icon icon="heroicons:trash" className="h-5 w-5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Aucune permission associée à ce rôle.</p>
                          )}
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
                Aucun rôle ou permission trouvé avec le terme de recherche.
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
        description="Êtes-vous sûr de vouloir supprimer ce lien rôle-permission ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default TableRolePermissions;