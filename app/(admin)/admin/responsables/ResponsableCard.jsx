'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ModalSuppression from '@/components/models/ModalSuppression';
import { useState, useEffect } from 'react';
import { demoData } from '@/data/data'; // Ensure this path is correct
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { useParams } from 'next/navigation';
 

// This component now receives a single 'responsable' object
const ResponsableCard = ({ responsable, onEditResponsable, onDeleteResponsable }) => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [establishments, setEstablishments] = useState([]);
  const paramsr = useParams();
  const locale = paramsr.lang;
  // Function to get establishments related to a responsible from demoData
  const getResponsibleEstablishments = (responsibleId) => {
    return demoData.establishments.filter(etb => etb.responsableId === responsibleId);
  };

  useEffect(() => {
    // Fetch establishments when the responsible's ID changes
    setEstablishments(getResponsibleEstablishments(responsable.id));
  }, [responsable.id]); // Dependency on responsable.id ensures re-fetch if responsible prop changes

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteResponsable?.(responsable.id); // Call delete handler with the specific responsible's ID
    setModalOpen(false);
  };

  const cancelDelete = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-0">

              <div className="flex gap-2.5 px-4 pt-4">
                <div className="flex-none w-12 h-12 rounded-full">
                  <div className="relative inline-block">
                    <Avatar>
                      <AvatarFallback>
                        {responsable.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge color={responsable.isActive ? 'success' : 'destructive'}className=" h-2 w-2  p-0  items-center justify-center absolute left-[calc(100%-8px)] bottom-[calc(100%-8px)]">
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-default-900"> {responsable.fullname}</h3>
                  <h5 className="text-sm text-default-600"> {establishments[0]?.name || ''}</h5>
                </div>
              </div>
              <div className="mt-3 flex justify-between flex-col px-4">
                <p className="flex items-center gap-2 text-sm  text-default-600">
                  <Icon icon="heroicons:envelope" className="w-4 h-4 opacity-70" />
                  {responsable.email}
                </p>
                <p className="flex items-center gap-2 text-sm  text-default-600">
                  <Icon icon="heroicons:phone" className="w-4 h-4 opacity-70" />
                  {responsable.phone}
                </p>
                <p className="flex items-center gap-2 text-sm  text-default-600">
                  <Icon icon="heroicons:identification" className="w-4 h-4 opacity-70" />
                  {responsable.cin}
                </p>
                {establishments.length > 0 && (
                  <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Établissements associés:</h4>
                  <ul className="space-y-1">
                    {establishments.map(establishment => (
                       <li key={establishment.id} className="flex items-center justify-between text-sm text-gray-700">
                       <span>{establishment.name}</span>
                       <Link
                          href={`/${locale}/super-admin/etablissements/${establishment.id}`}
                          className="text-primary inline-flex font-medium text-sm items-center"
                        >
                          Voir details
                        <Icon icon="heroicons:arrow-right" className="ml-1 w-4 h-4" />
                        </Link>
                    </li>
                ))}
              </ul>
            </div>
          )}
          {establishments.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">Aucun établissement associé.</p>
          )}
              </div>
          
              <div className="border border-dashed border-default-200 my-5"></div>
              <div className="flex justify-center gap-3 pb-2.5">
                <Button variant="ghost" size="icon" onClick={() => onEditResponsable(responsable)}>
                 <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={openDeleteModal}>
                  <Icon icon="heroicons:trash" className="w-5 h-5 text-red-500" />
                 </Button>
              </div>
          </CardContent>
        </Card>

      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le responsable ${responsable.fullname}? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default ResponsableCard;