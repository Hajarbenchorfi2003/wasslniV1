// pages/parent/ParentReportConcernPage.jsx
'use client';

import React, { useState } from 'react';
import { ReportConcernModal } from '../components/ReportConcernModal';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const MOCK_PARENT_ID = 5;

const ParentReportConcernPage = () => {
  const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);

  const handleConcernReported = () => {
    // Logique après l&apos;envoi du message, par exemple, rafraîchir une liste de &quot;mes messages&quot; si elle existait
    toast.success('Votre message a été envoyé avec succès !');
  };

  return (
    <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
      <h1 className="text-3xl font-bold text-default-900 mb-4">Signaler une Préoccupation</h1>
      <p className="text-default-600 text-center max-w-lg mb-8">
        Envoyez un message direct à l&apos;administration de l&apos;école pour toute question, problème ou commentaire.
      </p>
      <Button onClick={() => setIsConcernModalOpen(true)} className="px-8 py-4 text-lg">
        <Icon icon="heroicons:chat-bubble-left-right" className="h-6 w-6 mr-3" />
        Ouvrir le formulaire de signalement
      </Button>

      {isConcernModalOpen && (
        <ReportConcernModal
          isOpen={isConcernModalOpen}
          setIsOpen={setIsConcernModalOpen}
          parentId={MOCK_PARENT_ID}
          onConcernReported={handleConcernReported}
        />
      )}
    </div>
  );
};

export default ParentReportConcernPage;