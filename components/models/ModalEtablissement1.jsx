//models/modaletablissement
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
import { createEstablishments, updateEstablishments } from '@/services/etablissements';
import { fetchSchools } from '@/services/school';
import { register,fetchResponsibles } from '@/services/user'; 


const ModalEtablissement = ({
  isOpen,
  setIsOpen,
  onSave, // Fonction de rappel pour mettre à jour l'état dans le composant parent
  editingEtablissement, // L'objet établissement à modifier (ou null si ajout)
  allSchools, // Liste de toutes les écoles pour le sélecteur
  fixedSchoolId, // ID de l'école si l'établissement est lié à une école spécifique
}) => {
  const [existingResponsables, setExistingResponsables] = useState([]);
  const [loadingResponsables, setLoadingResponsables] = useState(false);
const [errorResponsables, setErrorResponsables] = useState(null);

  // Récupérer tous les responsables existants (rôle 'RESPONSIBLE')
  const loadResponsables = async () => {
  setLoadingResponsables(true);
  setErrorResponsables(null);

  try {
    const responsables = await fetchResponsibles();
    setExistingResponsables(responsables);
  } catch (error) {
    setErrorResponsables(error);
  } finally {
    setLoadingResponsables(false);
  }
};

// Appel initial
useEffect(() => {
  loadResponsables();
}, []);

  // Fonction pour déterminer les valeurs par défaut initiales pour EtablissementResponsableForm
  const getInitialDefaultValues = () => {
    if (!editingEtablissement|| Object.keys(editingEtablissement).length === 0) {
      // Si ajout d'un nouvel établissement, retourne des valeurs par défaut vides
      return {
        etablissement: {
          id:'',name: '', email: '', phone: '', address: '', quartie: '', city: '', isActive: true
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
    
      name: editingEtablissement.name || '',
      email: editingEtablissement.email || '',
      phone:editingEtablissement.phone || '',
      address: editingEtablissement.address || '',
      quartie: editingEtablissement.quartie || '', // N'oubliez pas 'quartie'
      city: editingEtablissement.city || '',
      isActive: editingEtablissement.isActive !== undefined ? editingEtablissement.isActive : true,
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
    onSave(formData); // Envoie au parent qui gère l'appel API
    console.log("data from modal",formData)
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