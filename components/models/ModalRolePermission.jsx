// components/models/ModalRolePermission.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ModalRolePermission = ({ isOpen, onClose, editingRolePermission, onSave, roles, permissions }) => {
  const [formData, setFormData] = useState({
    role: '',
    permissionId: null,
  });

  useEffect(() => {
    if (editingRolePermission) {
      setFormData({
        role: editingRolePermission.role || '',
        permissionId: editingRolePermission.permissionId || null,
      });
    } else {
      setFormData({
        role: '',
        permissionId: null,
      });
    }
  }, [editingRolePermission]);

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: name === 'permissionId' ? parseInt(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role || !formData.permissionId) {
        alert("Veuillez sélectionner un rôle et une permission.");
        return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">{editingRolePermission ? 'Modifier le Lien Rôle-Permission' : 'Ajouter un nouveau Lien Rôle-Permission'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Role Selection */}
          {roles && roles.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Rôle</Label>
              <Select onValueChange={(value) => handleSelectChange('role', value)} value={formData.role} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Permission Selection */}
          {permissions && permissions.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permission" className="text-right">Permission</Label>
              <Select onValueChange={(value) => handleSelectChange('permissionId', value)} value={formData.permissionId ? String(formData.permissionId) : ''} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une permission" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map(permission => (
                    <SelectItem key={permission.id} value={String(permission.id)}>
                      {permission.name} ({permission.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit">Sauvegarder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};