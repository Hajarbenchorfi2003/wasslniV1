'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import EtablissementResponsableForm from "./EtablissementResponsableForm"; // Assurez-vous du chemin correct
import { demoData } from '@/data/data'; // Importez vos données de démonstration
import toast from 'react-hot-toast'; // Pour les notifications

const ModalEtablissement = ({
  isOpen,
  setIsOpen,
  onSave, // Fonction de rappel pour mettre à jour l'état dans le composant parent
  editingEtablissement, // L'objet établissement à modifier (ou null si ajout)
  allSchools, // Liste de toutes les écoles pour le sélecteur
  fixedSchoolId, // ID de l'école si l'établissement est lié à une école spécifique
}) => {
  const [existingResponsables, setExistingResponsables] = useState([]);

  // Récupérer tous les responsables existants (rôle 'RESPONSIBLE')
  useEffect(() => {
    const responsables = demoData.users.filter(u => u.role === 'RESPONSIBLE');
    setExistingResponsables(responsables);
  }, [demoData.users]); 

  // Fonction pour déterminer les valeurs par défaut initiales pour EtablissementResponsableForm
  const getInitialDefaultValues = () => {
    if (!editingEtablissement) {
      // Si ajout d'un nouvel établissement, retourne des valeurs par défaut vides
      return {
        etablissement: {
          name: '', email: '', phone: '', address: '', quartie: '', city: '', isActive: true
        },
        responsable: {
          fullname: '', email: '', phone: '', password: '', cin: '', isActive: true
        },
        existingResponsableId: '',
        addNewResponsable: true, // Par défaut, on propose de créer un nouveau responsable
        schoolId: fixedSchoolId ? fixedSchoolId.toString() : '', // Pré-remplit si schoolId est fixe
      };
    }

    // Lorsque l'on modifie, pré-remplit avec les données de l'établissement actuel
    const etablissementDefaults = {
      name: editingEtablissement.etablissement.name || '',
      email: editingEtablissement.etablissement.email || '',
      phone: editingEtablissement.etablissement.phone || '',
      address: editingEtablissement.etablissement.address || '',
      quartie: editingEtablissement.etablissement.quartie || '', // N'oubliez pas 'quartie'
      city: editingEtablissement.etablissement.city || '',
      isActive: editingEtablissement.etablissement.isActive !== undefined ? editingEtablissement.etablissement.isActive : true,
    };

    let responsableDefaults = { 
      fullname: '', email: '', phone: '', password: '', cin: '', isActive: true
    };
    let existingResponsableIdDefault = '';
    let addNewResponsableDefault = true; 

    // Détermine le responsable associé et l'état initial du switch
    if (editingEtablissement.existingResponsableId) {
        existingResponsableIdDefault = editingEtablissement.existingResponsableId;
        addNewResponsableDefault = false; // Passe en mode "choisir existant"
    } else if (editingEtablissement.responsable) { 
        // Si des données de responsable sont fournies pour un "nouveau" responsable lié à l'édition
        responsableDefaults = {
            fullname: editingEtablissement.responsable.fullname || '',
            email: editingEtablissement.responsable.email || '',
            phone: editingEtablissement.responsable.phone || '',
            password: '', 
            cin: editingEtablissement.responsable.cin || '',
            isActive: editingEtablissement.responsable.isActive !== undefined ? editingEtablissement.responsable.isActive : true,
        };
        addNewResponsableDefault = true; // Reste en mode "créer nouveau" mais pré-rempli
    }
    
    // Le schoolId provient directement de l'objet editingEtablissement
    const schoolIdDefault = editingEtablissement.schoolId ? editingEtablissement.schoolId.toString() : '';

    return {
      etablissement: etablissementDefaults,
      responsable: responsableDefaults,
      existingResponsableId: existingResponsableIdDefault,
      addNewResponsable: addNewResponsableDefault, 
      schoolId: schoolIdDefault,
    };
  };

  const handleSave = (formData) => {
    try {
        let updatedEtablissement = { ...formData.etablissement };
        let linkedResponsableId = null; // Sera mis à jour en fonction du choix
        let etablissementSchoolId = formData.schoolId; // ID de l'école choisi dans le formulaire ou fixe

        if (editingEtablissement) {
            // --- MODIFICATION D'UN ÉTABLISSEMENT EXISTANT ---
            const etablissementIndex = demoData.establishments.findIndex(e => e.id === editingEtablissement.id);
            if (etablissementIndex !== -1) {
                updatedEtablissement = {
                    ...demoData.establishments[etablissementIndex], // Garde l'ID existant
                    ...formData.etablissement, // Met à jour les champs du formulaire
                    schoolId: etablissementSchoolId ? parseInt(etablissementSchoolId) : null, // Assurez-vous que c'est un nombre ou null
                };
            } else {
                console.warn("Établissement à modifier non trouvé:", editingEtablissement.id);
                toast.error("Erreur: Établissement à modifier non trouvé.");
                return;
            }

            // Gère le responsable : création ou lien existant
            if (formData.addNewResponsable) {
                // Créer un nouveau responsable
                const newResponsableId = Math.max(...demoData.users.map(u => u.id), 0) + 1;
                const newResponsable = { 
                    id: newResponsableId,
                    ...formData.responsable, 
                    role: 'RESPONSIBLE',
                    firstName: formData.responsable.fullname.split(' ')[0] || '',
                    lastName: formData.responsable.fullname.split(' ').slice(1).join(' ') || '',
                    // Ajoutez d'autres champs par défaut si nécessaire (e.g., isActive)
                    isActive: formData.responsable.isActive !== undefined ? formData.responsable.isActive : true,
                };
                demoData.users.push(newResponsable);
                linkedResponsableId = newResponsableId;
            } else if (formData.existingResponsableId) {
                // Lier à un responsable existant
                linkedResponsableId = parseInt(formData.existingResponsableId);
            }
            updatedEtablissement.responsableId = linkedResponsableId;
            demoData.establishments[etablissementIndex] = updatedEtablissement; // Met à jour l'objet dans demoData

            toast.success('Établissement modifié avec succès');

        } else {
            // --- AJOUT D'UN NOUVEL ÉTABLISSEMENT ---
            const newEtablissementId = Math.max(...demoData.establishments.map(e => e.id), 0) + 1;
            updatedEtablissement = {
                id: newEtablissementId,
                ...formData.etablissement,
                isActive: true, // Par défaut, actif pour un nouvel établissement
                schoolId: etablissementSchoolId ? parseInt(etablissementSchoolId) : null,
            };
            
            // Gère le responsable pour le nouvel établissement
            if (formData.addNewResponsable) {
                const newResponsableId = Math.max(...demoData.users.map(u => u.id), 0) + 1;
                const newResponsable = {
                    id: newResponsableId,
                    ...formData.responsable,
                    role: 'RESPONSIBLE',
                    firstName: formData.responsable.fullname.split(' ')[0] || '',
                    lastName: formData.responsable.fullname.split(' ').slice(1).join(' ') || '',
                    isActive: formData.responsable.isActive !== undefined ? formData.responsable.isActive : true,
                };
                demoData.users.push(newResponsable);
                linkedResponsableId = newResponsableId;
            } else if (formData.existingResponsableId) {
                linkedResponsableId = parseInt(formData.existingResponsableId);
            }
            updatedEtablissement.responsableId = linkedResponsableId;
            
            demoData.establishments.push(updatedEtablissement); // Ajoute le nouvel établissement à demoData
            toast.success('Établissement ajouté avec succès');
        }

        onSave(updatedEtablissement); // Notifie le parent que la sauvegarde est terminée
        setIsOpen(false); // Ferme le modal

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
            {editingEtablissement ? "Modifier l'établissement" : "Ajouter un établissement"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6">
          <EtablissementResponsableForm
            onSubmit={handleSave}
            defaultValues={currentDefaultValues}
            existingResponsables={existingResponsables}
            allSchools={allSchools} // Passe la liste de toutes les écoles
            fixedSchoolId={fixedSchoolId} // Passe l'ID de l'école fixe si applicable
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEtablissement;