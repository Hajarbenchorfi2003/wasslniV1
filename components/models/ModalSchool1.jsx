'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import SchoolAdminForm from './SchoolAdminForm';
import toast from 'react-hot-toast';
// Services
import { fetchAdmins } from '@/services/user';
import { createSchool, updateSchool } from '@/services/school';

const ModalSchool = ({
  isOpen,
  setIsOpen,
  onSave,
  editingSchool, // Contient school + admin info
}) => {
  const [existingAdmins, setExistingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les admins depuis l'API
  useEffect(() => {
    async function loadAdmins() {
      try {
        const data = await fetchAdmins();
        setExistingAdmins(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des administrateurs');
        console.error(error);
      }
    }

    if (isOpen) {
      loadAdmins();
    }
  }, [isOpen]);

  // Préparer les valeurs initiales pour le formulaire
  const getInitialDefaultValues = () => {
    console.log("edting data",editingSchool);
    if (!editingSchool) {
      return {
        school: {
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          isActive: true,
        },
        admin: {
          fullname: '',
          email: '',
          phone: '',
          password: '',
          cin: '',
          isActive: true,
        },
        existingAdminId: '',
        addNewAdmin: true,
      };
    }

    const schoolDefaults = {
      id: editingSchool.id,
      name: editingSchool.school.name || '',
      email: editingSchool.school.email || '',
      phone: editingSchool.school.phone || '',
      address: editingSchool.school.address || '',
      city: editingSchool.school.city || '',
      isActive:
        editingSchool.school.isActive !== undefined
          ? editingSchool.school.isActive
          : true,
    };
     console.log("school coming",schoolDefaults)

    let adminDefaults = {
      fullname: '',
      email: '',
      phone: '',
      password: '',
      cin: '',
      isActive: true,
    };
    let existingAdminIdDefault = '';
    let addNewAdminDefault = true;

    if (editingSchool.existingAdminId) {
      existingAdminIdDefault = editingSchool.existingAdminId;
      addNewAdminDefault = false;
    } else if (editingSchool.admin) {
      adminDefaults = {
        fullname: editingSchool.admin.fullname || '',
        email: editingSchool.admin.email || '',
        phone: editingSchool.admin.phone || '',
        password: '',
        cin: editingSchool.admin.cin || '',
        isActive:
          editingSchool.admin.isActive !== undefined
            ? editingSchool.admin.isActive
            : true,
      };
      addNewAdminDefault = true;
    }

    addNewAdminDefault = editingSchool.addNewAdmin;
    console.log(addNewAdminDefault)

    return {
      school: schoolDefaults,
      admin: adminDefaults,
      existingAdminId: existingAdminIdDefault,
      addNewAdmin: addNewAdminDefault,
    };
  };

  const handleSave = async (formData) => {
    setLoading(true);
     console.log("Données reçues dans handleSave:", formData);
    try {
      let updatedSchool;
  console.log("edit school:",editingSchool);
  console.log("id school",editingSchool.id)
  
      if (editingSchool?.id) {
        console.log("data school update",formData.school);
        console.log("je suis dans  modfication ")
        // Modification d'une école existante
        updatedSchool = await updateSchool(editingSchool.id, formData.school);
        console.log("id",editingSchool.school.id,"data:",formData.school)
        toast.success('École mise à jour avec succès');
      } else {
        console.log ("je suis dans creation ");
        // Création d'une nouvelle école
        updatedSchool = await createSchool(formData.school);
        toast.success('École ajoutée avec succès');
      }

      onSave(updatedSchool); // Met à jour l’UI
      setIsOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentDefaultValues = getInitialDefaultValues();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent modal={false} className="p-0 max-w-2xl" size="2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-base font-medium text-default-700">
            {editingSchool ? 'Modifier l’école' : 'Ajouter une école'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6">
          <SchoolAdminForm
            onSubmit={handleSave}
            defaultValues={currentDefaultValues}
            existingAdmins={existingAdmins}
            loading={loading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSchool;