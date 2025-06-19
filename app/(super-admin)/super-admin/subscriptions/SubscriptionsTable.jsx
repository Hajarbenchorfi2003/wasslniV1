// components/SubscriptionsTable.jsx
'use client';

import { Fragment, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ModalSuppression from '@/components/models/ModalSuppression'; // Reusing your ModalSuppression
import { getSubscriptionPaymentStatus } from '@/data/data'; // Import the utility function

const SubscriptionsTable = ({ subscriptions, onEditSubscription, onDeleteSubscription }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

  const openDeleteModal = (id) => {
    setSubscriptionToDelete(id);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (subscriptionToDelete !== null) {
      onDeleteSubscription?.(subscriptionToDelete);
    }
    setModalOpen(false);
    setSubscriptionToDelete(null);
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setSubscriptionToDelete(null);
  };

  const filteredSubscriptions = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.schoolName.toLowerCase().includes(lowerCaseSearchTerm) ||
        sub.status.toLowerCase().includes(lowerCaseSearchTerm) ||
        sub.amount.toString().includes(lowerCaseSearchTerm)
    );
  }, [subscriptions, searchTerm]);

  const columns = [
    { key: 'schoolName', label: 'École' },
    { key: 'establishmentCount', label: 'Nb. Établissements' },
    { key: 'amount', label: 'Montant' },
    { key: 'startDate', label: 'Date Début' },
    { key: 'endDate', label: 'Date Fin' },
    { key: 'status', label: 'Statut' },
    { key: 'action', label: 'Action' },
  ];

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Filtrer par école, montant, ou statut..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.schoolName}</TableCell>
                <TableCell>{item.establishmentCount}</TableCell>
                <TableCell>{item.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}</TableCell>
                <TableCell>{new Date(item.startDate).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>{new Date(item.endDate).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn('capitalize', {
                      'bg-green-100 text-green-800': item.status === 'ACTIVE',
                      'bg-red-100 text-red-800': item.status === 'EXPIRED' || item.status === 'INACTIVE',
                      'bg-yellow-100 text-yellow-800': item.status === 'PENDING',
                    })}
                  >
                    {getSubscriptionPaymentStatus(item)} {/* Using the utility function */}
                  </Badge>
                </TableCell>
                <TableCell className="text-right flex gap-2 justify-start">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-none"
                    onClick={() => onEditSubscription?.(item)}
                  >
                    <Icon icon="heroicons:pencil" className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-none text-destructive hover:text-destructive"
                    onClick={() => openDeleteModal(item.id)}
                  >
                    <Icon icon="heroicons:trash" className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                Aucun abonnement trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet abonnement ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default SubscriptionsTable;