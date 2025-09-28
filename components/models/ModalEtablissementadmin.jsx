'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import EtablissementResponsableForm from "./EtablissementResponsableFormAdmin"; // Assurez-vous du chemin correct
import { demoData } from '@/data/data'; // Importez vos données de démonstration
import toast from 'react-hot-toast'; // Pour les notifications
  import {fetchResponsibles,register} from '@/services/user';
  import {createEstablishments,updateEstablishments} from '@/services/etablissements';

const ModalEtablissement = ({
  isOpen,
  setIsOpen,
  onSave, // Fonction de rappel pour mettre à jour l'état dans le composant parent
  editingEtablissement, // L'objet établissement à modifier (ou null si ajout)
  allSchools, // Liste de toutes les écoles pour le sélecteur
  fixedSchoolId, // ID de l'école si l'établissement est lié à une école spécifique
}) => {
  const [existingResponsables, setExistingResponsables] = useState([]);
   const[loading,setLoading] = useState(false);
useEffect(() => {
  let isMounted = true; // 🔥 Pour éviter les fuites de mémoire si le composant se démonte

  async function loadResponsibles() {
    if (loading || existingResponsables.length > 0) {
      // 🚫 Évite de recharger si déjà en cours ou déjà chargé
      return;
    }

    setLoading(true);
    try {
      const data = await fetchResponsibles(); // Assurez-vous que cette fonction renvoie bien un tableau
      console.log("Données reçues depuis l'API:", data);

     
        // Met à jour la liste des responsables
        setExistingResponsables(data);

      
    } catch (error) {
      console.error('Erreur lors du chargement des responsables', error);
      toast.error("Impossible de charger les responsables");
    } finally {
      if (isMounted) {
        setLoading(false); // 🔄 Fin du chargement
      }
    }
  }

  loadResponsibles();
 
  // Nettoyage pour éviter les mises à jour sur un composant non monté
  return () => {
    isMounted = false;
  };
}, [loading,existingResponsables]);
console.log("responsable",existingResponsables)
  // Récupérer tous les responsables existants (rôle 'RESPONSIBLE')


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

  const handleSave = async (formData) => {
     console.log("formData",formData)
    try {
      let responsableId=null;
      console.log(!formData.existingResponsableId);
          if (!formData.existingResponsableId) {
            
               const responsableAdd={...formData.responsable,
                    role: 'RESPONSIBLE',
                  ecolId:formData.schoolId}
                  console.log("usrs",responsableAdd)
                 const addNewResponsable=await register(responsableAdd)
                 responsableId=addNewResponsable.id
            }else{
             responsableId = formData.existingResponsableId;
            }
             const updatedata = {
             ...formData.etablissement,
               ecoleId: formData.schoolId,
              responsableId,
    }; 
    console.log("data updated",updatedata);

        if (editingEtablissement) {
          
            await updateEstablishments(editingEtablissement.id,updatedata)

            toast.success('Établissement modifié avec succès');

        } else {

            
            // --- AJOUT D'UN NOUVEL ÉTABLISSEMENT ---
           
            
            await createEstablishments(updatedata)
           
            toast.success('Établissement ajouté avec succès');
        }

        onSave(updatedata); // Notifie le parent que la sauvegarde est terminée
        setIsOpen(false); // Ferme le modal

    } catch (error) {
  console.error('Erreur lors de la sauvegarde:', error);
  toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
  toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');

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