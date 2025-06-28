'use client';
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import SchoolAdminForm from "./SchoolAdminForm"; 
import { demoData } from '@/data/data';
import toast from 'react-hot-toast';

const ModalSchool = ({
  isOpen,
  setIsOpen,
  onSave,
  editingSchool, // This prop now holds the full school object and associated admin info
  schools, 
}) => {
  const [existingAdmins, setExistingAdmins] = useState([]);

  useEffect(() => {
    // Récupérer tous les admins existants
    const admins = demoData.users.filter(u => u.role === 'ADMIN');
    setExistingAdmins(admins);
  }, [demoData.users]); 

  // Function to determine initial defaultValues for SchoolAdminForm
  const getInitialDefaultValues = () => {
    if (!editingSchool) {
      // If adding a new school, return empty defaults
      return {
        school: {
          name: '', email: '', phone: '', address: '', city: '', isActive: true
        },
        admin: {
          fullname: '', email: '', phone: '', password: '', cin: '', isActive: true
        },
        existingAdminId: '',
      };
    }

    // When editing, populate with current school data
    // FIX: Access nested 'school' properties from editingSchool
    const schoolDefaults = {
      name: editingSchool.school.name || '',
      email: editingSchool.school.email || '',
      phone: editingSchool.school.phone || '',
      address: editingSchool.school.address || '',
      city: editingSchool.school.city || '',
      isActive: editingSchool.school.isActive !== undefined ? editingSchool.school.isActive : true,
    };

    let adminDefaults = { // Default empty for new admin
      fullname: '', email: '', phone: '', password: '', cin: '', isActive: true
    };
    let existingAdminIdDefault = '';
    let addNewAdminDefault = true; // Assume adding new admin by default unless an existing one is linked

    // Try to find the associated admin for the editing school
    // The editingSchool itself now contains 'existingAdminId' and 'admin' properties
    if (editingSchool.existingAdminId) {
        existingAdminIdDefault = editingSchool.existingAdminId;
        addNewAdminDefault = false; // Switch to existing admin mode
    } else if (editingSchool.admin) { // If there's an admin object provided in editingSchool (meaning we're editing that admin)
        adminDefaults = {
            fullname: editingSchool.admin.fullname || '',
            email: editingSchool.admin.email || '',
            phone: editingSchool.admin.phone || '',
            password: '', // Never pre-fill password for security
            cin: editingSchool.admin.cin || '',
            isActive: editingSchool.admin.isActive !== undefined ? editingSchool.admin.isActive : true,
        };
        addNewAdminDefault = true; // Keep it in 'add new admin' mode, but pre-filled
    }
    // The initial addNewAdmin state for the form is correctly derived from `editingSchool.addNewAdmin`
    // which is set in SchoolsPage. We pass this directly.
    addNewAdminDefault = editingSchool.addNewAdmin;


    return {
      school: schoolDefaults,
      admin: adminDefaults,
      existingAdminId: existingAdminIdDefault,
      addNewAdmin: addNewAdminDefault, // Pass this to help SchoolAdminForm determine initial toggle state
    };
  };

  const handleSave = (formData) => {
    try {
        let updatedSchool = { ...formData.school };
        let updatedAdmin = formData.admin; 
        let linkedAdminId = formData.existingAdminId; 

        if (editingSchool) {
            // --- EDITING SCHOOL ---
            const schoolIndex = demoData.schools.findIndex(s => s.id === editingSchool.id);
            if (schoolIndex !== -1) {
                updatedSchool = {
                    ...demoData.schools[schoolIndex], 
                    ...formData.school 
                };
                demoData.schools[schoolIndex] = updatedSchool;
            } else {
                console.warn("Editing school but ID not found:", editingSchool.id);
                toast.error("Erreur: École à modifier non trouvée.");
                return;
            }

            // Remove all previous associations for this school
            demoData.userSchools = demoData.userSchools.filter(us => us.schoolId !== updatedSchool.id);
            
            if (formData.addNewAdmin) {
                const newAdminId = Math.max(...demoData.users.map(u => u.id), 0) + 1;
                updatedAdmin = { 
                    id: newAdminId,
                    ...formData.admin, 
                    role: 'ADMIN',
                    // Ensure firstName and lastName are extracted from fullname for consistency
                    firstName: formData.admin.fullname.split(' ')[0] || '',
                    lastName: formData.admin.fullname.split(' ').slice(1).join(' ') || '',
                };
                demoData.users.push(updatedAdmin);
                linkedAdminId = newAdminId;
            } else if (formData.existingAdminId) {
                linkedAdminId = parseInt(formData.existingAdminId);
            }

            if (linkedAdminId) {
                demoData.userSchools.push({
                    userId: linkedAdminId,
                    schoolId: updatedSchool.id
                });
            }
            toast.success('École modifiée avec succès');

        } else {
            // --- ADDING NEW SCHOOL ---
            const newSchoolId = Math.max(...demoData.schools.map(s => s.id), 0) + 1;
            updatedSchool = {
                id: newSchoolId,
                ...formData.school,
                isActive: true 
            };
            demoData.schools.push(updatedSchool);

            if (formData.addNewAdmin) {
                const newAdminId = Math.max(...demoData.users.map(u => u.id), 0) + 1;
                updatedAdmin = {
                    id: newAdminId,
                    ...formData.admin,
                    role: 'ADMIN',
                    // Ensure firstName and lastName are extracted from fullname for consistency
                    firstName: formData.admin.fullname.split(' ')[0] || '',
                    lastName: formData.admin.fullname.split(' ').slice(1).join(' ') || '',
                };
                demoData.users.push(updatedAdmin);
                linkedAdminId = newAdminId;
            } else if (formData.existingAdminId) {
                linkedAdminId = parseInt(formData.existingAdminId);
            }
            
            if (linkedAdminId) {
                demoData.userSchools.push({
                    userId: linkedAdminId,
                    schoolId: updatedSchool.id
                });
            }
            toast.success('École ajoutée avec succès');
        }

        onSave(updatedSchool); 
        setIsOpen(false);

    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast.error('Erreur lors de la sauvegarde');
    }
  };

  const currentDefaultValues = getInitialDefaultValues();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent modal={false} className="p-0 max-w-2xl" size="2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-base font-medium text-default-700">
            {editingSchool ? "Modifier l'école" : "Ajouter une école"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6">
          <SchoolAdminForm
            onSubmit={handleSave}
            // Pass the generated default values to the form
            defaultValues={currentDefaultValues}
            existingAdmins={existingAdmins}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSchool;