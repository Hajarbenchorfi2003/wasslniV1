'use client';
import { io } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import parentService from '@/services/parentService';
import { getToken } from '@/utils/auth';

// Import dynamique du composant Map
const BusTrackingMap = dynamic(
  () => import('../components/BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false }
);

const BusTrackingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChildInfo = async () => {
      if (!childId || isNaN(parseInt(childId))) {
        setError("ID d'enfant invalide ou manquant dans l'URL.");
        setLoading(false);
        return;
      }

      try {
        const children = await parentService.getChildren();
        const allStudents = children.map(c => c.student);
        const found = allStudents.find(s => s.id === parseInt(childId));

        if (!found) {
          setError("Enfant non trouvé avec l'ID fourni.");
        } else {
          setChild(found);
          console.log('child',child)
        }
      } catch (err) {
        console.error(err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchChildInfo();
  }, [childId]);
console.log('child',child)
  const handleGoBackToOverview = () => {
    router.push('/parent/children-overview');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-180px)] text-xl text-default-600">
        <Icon icon="heroicons:arrow-path" className="h-6 w-6 animate-spin mr-2" />
        Chargement des données de suivi...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-default-900">Suivi du Bus</h1>
          <Button onClick={handleGoBackToOverview} variant="outline">
            <Icon icon="heroicons:arrow-left" className="h-4 w-4 mr-2" /> Retour
          </Button>
        </div>
        <Card className="shadow-sm border border-red-400">
          <CardContent className="p-6 text-center text-red-700">
            <Icon icon="heroicons:exclamation-triangle" className="h-10 w-10 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm mt-2">Veuillez retourner à la vue d'ensemble des enfants et sélectionner un enfant valide pour le suivi.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">
          Suivi du Bus pour {child?.fullname || 'Enfant Inconnu'}
        </h1>
        <Button onClick={handleGoBackToOverview} variant="outline">
          <Icon icon="heroicons:arrow-left" className="h-4 w-4 mr-2" /> Retour à la vue d'ensemble
        </Button>
      </div>

      <BusTrackingMap childId={parseInt(childId)} />
    </div>
  );
};

export default BusTrackingPage;
