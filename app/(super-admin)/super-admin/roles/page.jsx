// components/RolePermissionsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { ModalRolePermission } from '@/components/models/ModalRolePermission';
import TableRolePermissions from './TableRolePermissions'; // Import the new table component

const RolePermissionsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRolePermission, setEditingRolePermission] = useState(null); // Keep for potential pre-filling for 'add'

  useEffect(() => {
    console.log('currentDemoData updated, filtering role permissions...');
    const allRolePermissions = currentDemoData.rolePermissions;

    // Enrich with permission name and description
    const enrichedRolePermissions = allRolePermissions.map((rp) => {
      const permission = currentDemoData.permissions.find((p) => p.id === rp.permissionId);
      return {
        ...rp,
        permissionName: permission ? permission.name : 'Inconnu',
        permissionDescription: permission ? permission.description : 'Description non disponible',
      };
    });

    setRolePermissions(enrichedRolePermissions);
  }, [currentDemoData]);

  const handleDeleteRolePermission = (role, permissionId) => {
    try {
      console.log(`Attempting to delete role-permission: Role ${role}, Permission ${permissionId}`);
      const updatedRolePermissions = currentDemoData.rolePermissions.filter(
        (rp) => !(rp.role === role && rp.permissionId === permissionId)
      );

      setCurrentDemoData((prevData) => ({
        ...prevData,
        rolePermissions: updatedRolePermissions,
      }));

      toast.success('Lien rôle-permission supprimé avec succès');
    } catch (error) {
      console.error('Error deleting role-permission:', error);
      toast.error('Erreur lors de la suppression du lien rôle-permission');
    }
  };

  const handleSaveRolePermission = async (rpData) => {
    try {
      let updatedRolePermissionsArray = [...currentDemoData.rolePermissions];

      // Check if this specific role-permission link already exists
      const exists = updatedRolePermissionsArray.some(
        (rp) => rp.role === rpData.role && rp.permissionId === parseInt(rpData.permissionId)
      );

      if (exists) {
        toast.error('Ce lien rôle-permission existe déjà.');
        return;
      }

      const newRolePermission = {
        role: rpData.role,
        permissionId: parseInt(rpData.permissionId),
      };
      updatedRolePermissionsArray.push(newRolePermission);

      setCurrentDemoData((prevData) => ({
        ...prevData,
        rolePermissions: updatedRolePermissionsArray,
      }));

      toast.success('Lien rôle-permission ajouté avec succès');
      setIsModalOpen(false);
      setEditingRolePermission(null); // Clear editing state
    } catch (error) {
      console.error('Error saving role-permission:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRolePermission(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">Gestion des Rôles & Permissions</div>
        <Button
          onClick={() => {
            setEditingRolePermission(null); // Ensure no pre-fill for new add
            setIsModalOpen(true);
          }}
        >
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Lien Rôle-Permission
        </Button>
      </div>

      <ModalRolePermission
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingRolePermission={editingRolePermission}
        onSave={handleSaveRolePermission}
        roles={currentDemoData.enums.Role}
        permissions={currentDemoData.permissions}
      />

      <TableRolePermissions
        rolePermissions={rolePermissions}
        roles={Object.values(currentDemoData.enums.Role)} // Pass the available roles
        permissions={currentDemoData.permissions}
        onDeleteRolePermission={handleDeleteRolePermission}
      />
    </div>
  );
};

export default RolePermissionsPage;