'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from 'lucide-react';
// import Select from 'react-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ModalParent = ({ isOpen, onClose, editingParent, onSave,establishments }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    role:'PARENT',
    isActive: true,
    establishmentId:null,
  });

  // Custom styles for react-select
  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      minHeight: '40px',
      borderColor: isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
      borderRadius: '0.5rem',
      boxShadow: isFocused ? '0 0 0 1px hsl(var(--primary))' : 'none',
      backgroundColor: 'hsl(var(--background))',
      '&:hover': {
        borderColor: 'hsl(var(--primary))'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: '0.5rem',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      backgroundColor: 'hsl(var(--popover))',
      color: 'hsl(var(--popover-foreground))'
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused 
        ? 'hsl(var(--accent))' 
        : isSelected 
          ? 'hsl(var(--primary))' 
          : 'transparent',
      color: isFocused 
        ? 'hsl(var(--accent-foreground))' 
        : isSelected 
          ? 'hsl(var(--primary-foreground))' 
          : 'hsl(var(--foreground))',
      '&:active': {
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))'
      },
      fontSize: '0.875rem',
      padding: '0.375rem 0.5rem'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '0.375rem'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'hsl(var(--primary-foreground))',
      padding: '0.125rem 0.375rem'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'hsl(var(--primary-foreground))',
      ':hover': {
        backgroundColor: 'hsl(var(--primary)/0.8)',
        color: 'hsl(var(--primary-foreground))'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
      padding: '0.5rem'
    }),
    clearIndicator: (base) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
      padding: '0.5rem'
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: 'hsl(var(--border))'
    }),
    input: (base) => ({
      ...base,
      color: 'hsl(var(--foreground))'
    })
  };

  useEffect(() => {
    if (editingParent) {
      console.log("edit student",editingParent)
     


      setFormData({
        fullname: editingParent.fullname || '',
        email: editingParent.email || '',
        phone: editingParent.phone || '',
        password: '',
         role:'PARENT',
        isActive: editingParent.isActive !== undefined ? editingParent.isActive : true,
      
        
      });
    } else {
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        password: '',
         role:'PARENT',
        isActive: true,
        
        establishmentId:null
      });
    }
  }, [editingParent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  
  const handleSelectChange = (name, value) => {
  setFormData(prev => ({
    ...prev,
    [name]: name === 'establishmentId' ? parseInt(value, 10) : value
  }));
};

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

 


  console.log("data fourni",establishments)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="p-2">
          <DialogTitle className="text-base font-medium text-default-700">
            {editingParent ? 'Modifier le Parent' : 'Ajouter un nouveau Parent'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] px-2">
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="fullname" className="text-right">Nom Complet</Label>
              <Input id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} className="col-span-3" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
            </div>
            <div>
              <Label htmlFor="phone" className="text-right">Téléphone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="col-span-3" />
            </div>
           
            <div>
              <Label htmlFor="password" className="text-right">Mot de passe</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="col-span-3"
                placeholder={editingParent ? "Laisser vide pour ne pas changer" : "Saisir un mot de passe"} 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Actif</Label>
            </div>
             {/* Establishment Selection */}
                      {!editingParent && establishments && establishments.length > 0 && (
                        <div>
                          <Label htmlFor="establishment" className="text-right">Établissement</Label>
                          <Select onValueChange={(value) => handleSelectChange('establishmentId', value)} value={formData.establishmentId ? String(formData.establishmentId) : ''}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Sélectionner un établissement" />
                            </SelectTrigger>
                            <SelectContent>
                            <ScrollArea className="h-[100px]">
                              {establishments.map(est => (
                                <SelectItem key={est.id} value={String(est.id)}>
                                  {est.name}
                                </SelectItem>
                              ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

           

            <DialogFooter>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};