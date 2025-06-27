// components/models/ModalStudent.jsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {getparentsEtablismente} from '@/services/etablissements';

export const ModalStudent = ({ isOpen, onClose, editingStudent, onSave, establishments, parentStudents }) => {
  const [filteredParents, setFilteredParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    dateOfBirth: '',
    gender: 'MALE', // Default
    class: '',
    quartie: '',
    address: '',
    establishmentId: null,
    parentIds: [], // Array to hold IDs of associated parents
  });
  console.log("edit students",editingStudent)
  useEffect(() => {
    if (editingStudent) {
     
      const dob = editingStudent.dateOfBirth ? new Date(editingStudent.dateOfBirth).toISOString().split('T')[0] : '';
       const linkedParentIds = editingStudent.parentLinks.map((link) => link.parent.id);

      setFormData({
        fullname: editingStudent.fullname || '',
        dateOfBirth: dob,
        gender: editingStudent.gender || 'MALE',
        class: editingStudent.class || '',
        quartie: editingStudent.quartie || '',
        address: editingStudent.address || '',
        establishmentId: editingStudent.establishmentId || null,
        parentIds: linkedParentIds,
      });
    } else {
      setFormData({
        fullname: '',
        dateOfBirth: '',
        gender: 'MALE',
        class: '',
        quartie: '',
        address: '',
        establishmentId: null,
        parentIds: [],
      });
    }
  }, [editingStudent, parentStudents]);
  // Charger les parents quand l'établissement change
// Chargement des parents quand l'établissement change
useEffect(() => {
  const loadParents = async () => {
    if (!formData.establishmentId) {
      setFilteredParents([]);
      return;
    }

    setLoadingParents(true);
    try {
      const response = await getparentsEtablismente(formData.establishmentId);
      const parentsData = Array.isArray(response?.data) ? response.data : [];

      setFilteredParents(parentsData);
      console.log("Parents chargés :", parentsData); // ✅ Vérifie ici
    } catch (error) {
      console.error("Erreur lors du chargement des parents", error);
      setFilteredParents([]);
    } finally {
      setLoadingParents(false);
    }
  };

  loadParents();
}, [formData.establishmentId]); // ⚠️ Ne charge que si establishmentId change

// Afficher les parents
useEffect(() => {
  console.log("filteredParents mis à jour :", filteredParents);
}, [filteredParents]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: name === 'establishmentId' ? parseInt(value) : value }));
  };

  const handleParentCheckboxChange = (id, checked) => {
    setFormData(prev => {
      const newParentIds = checked
        ? [...prev.parentIds, id]
        : prev.parentIds.filter(parentId => parentId !== id);
      return { ...prev, parentIds: newParentIds };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader  className="p-2 pb-0" >
          <DialogTitle className="text-base font-medium text-default-700">{editingStudent ? 'Modifier l\'Élève' : 'Ajouter un nouvel Élève'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] px-2">
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="fullname" className="text-right">Nom Complet</Label>
            <Input id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} className="col-span-3" required />
          </div>
          <div>
            <Label htmlFor="dateOfBirth" className="text-right">Date de Naissance</Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className="col-span-3" />
          </div>
          <div>
            <Label className="text-right">Genre</Label>
            <RadioGroup onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender} className="col-span-3 flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MALE" id="male" />
                <Label htmlFor="male">Masculin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FEMALE" id="female" />
                <Label htmlFor="female">Féminin</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="class" className="text-right">Classe</Label>
            <Input id="class" name="class" value={formData.class} onChange={handleChange} className="col-span-3" />
          </div>
          <div>
            <Label htmlFor="quartie" className="text-right">Quartier</Label>
            <Input id="quartie" name="quartie" value={formData.quartie} onChange={handleChange} className="col-span-3" />
          </div>
          <div>
            <Label htmlFor="address" className="text-right">Adresse</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} className="col-span-3" />
          </div>

          {/* Establishment Selection */}
          {establishments && establishments.length > 0 && (
            <div>
              <Label htmlFor="establishment" className="text-right">Établissement</Label>
              <Select onValueChange={(value) => handleSelectChange('establishmentId', value)} value={formData.establishmentId ? String(formData.establishmentId) : ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un établissement" />
                </SelectTrigger>
                <SelectContent>
                  {establishments.map(est => (
                    <SelectItem key={est.id} value={String(est.id)}>
                      {est.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {filteredParents?.length === 0 && formData.establishmentId && !loadingParents && (
           <p className="text-sm text-gray-500 mt-2">Aucun parent trouvé pour cet établissement.</p>
           )}

          {/* Parents Multi-Selection */}
       {filteredParents?.length > 0 && formData.establishmentId && (
  <div>
    <Label className="text-right mt-2">Parents</Label>
    <div className="col-span-3 space-y-2 max-h-48 overflow-y-auto border p-2 rounded">
      {filteredParents.map((parent) => (
        <div key={parent.id} className="flex items-center space-x-2">
          <Checkbox
            id={`parent-${parent.id}`}
            checked={formData.parentIds.includes(parent.id)} // ✅ Bonne vérification
            onCheckedChange={(checked) =>
              handleParentCheckboxChange(parent.id, checked)
            }
          />
          <Label htmlFor={`parent-${parent.id}`}>{parent.fullname}</Label>
        </div>
      ))}
    </div>
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