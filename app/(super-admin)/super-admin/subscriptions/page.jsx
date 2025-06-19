// components/SubscriptionsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { ModalSubscriptions } from '@/components/models/ModalSubscriptions'; // We will create this
import SubscriptionsTable from './SubscriptionsTable'; // We will create this

const SubscriptionsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null); // For editing/pre-filling the modal

  useEffect(() => {
    // Enrich subscriptions with school names if needed, similar to rolePermissions
    const enrichedSubscriptions = currentDemoData.subscriptions.map((sub) => {
      const school = currentDemoData.schools.find((s) => s.id === sub.schoolId);
      return {
        ...sub,
        schoolName: school ? school.name : 'École inconnue',
      };
    });
    setSubscriptions(enrichedSubscriptions);
  }, [currentDemoData]);

  const handleSaveSubscription = (subscriptionData) => {
    try {
      let updatedSubscriptions;
      let message = '';

      if (editingSubscription) {
        // Find and update the existing subscription
        updatedSubscriptions = currentDemoData.subscriptions.map((sub) =>
          sub.id === editingSubscription.id ? { ...sub, ...subscriptionData } : sub
        );
        message = 'Abonnement mis à jour avec succès !';
      } else {
        // Add a new subscription
        const newId = Math.max(...currentDemoData.subscriptions.map((s) => s.id), 0) + 1;
        const newSubscription = { id: newId, ...subscriptionData };
        updatedSubscriptions = [...currentDemoData.subscriptions, newSubscription];
        message = 'Abonnement ajouté avec succès !';
      }

      setCurrentDemoData((prevData) => ({
        ...prevData,
        subscriptions: updatedSubscriptions,
      }));

      toast.success(message);
      setIsModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleDeleteSubscription = (id) => {
    try {
      const updatedSubscriptions = currentDemoData.subscriptions.filter((sub) => sub.id !== id);
      setCurrentDemoData((prevData) => ({
        ...prevData,
        subscriptions: updatedSubscriptions,
      }));
      toast.success('Abonnement supprimé avec succès !');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Erreur lors de la suppression de l\'abonnement.');
    }
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">Gestion des Abonnements</div>
        <Button
          onClick={() => {
            setEditingSubscription(null); // Ensure no pre-fill for new add
            setIsModalOpen(true);
          }}
        >
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Abonnement
        </Button>
      </div>

      <ModalSubscriptions
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingSubscription={editingSubscription}
        onSave={handleSaveSubscription}
        schools={currentDemoData.schools} // Pass schools for selection
      />

      <SubscriptionsTable
        subscriptions={subscriptions}
        onEditSubscription={handleEditSubscription}
        onDeleteSubscription={handleDeleteSubscription}
        // Pass any other data needed for display in the table (e.g., payment status utility)
      />
    </div>
  );
};

export default SubscriptionsPage;