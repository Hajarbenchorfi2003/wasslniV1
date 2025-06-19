// components/models/ModalSubscriptions.jsx
'use client';

import { useEffect } from 'react'; // Corrected import
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ScrollArea } from "@/components/ui/scroll-area";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const subscriptionSchema = z.object({
  schoolId: z.string().min(1, { message: 'Veuillez sélectionner une école.' }).transform(Number),
  establishmentCount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, { message: 'Le nombre d\'établissements doit être au moins 1.' })
  ),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: 'Le montant doit être positif.' })
  ),
  startDate: z.string().min(1, { message: 'La date de début est requise.' }),
  endDate: z.string().min(1, { message: 'La date de fin est requise.' }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'EXPIRED'], { // Added more statuses for flexibility
    message: 'Le statut est invalide.',
  }),
});

export const ModalSubscriptions = ({ isOpen, onClose, editingSubscription, onSave, schools }) => {
  const form = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      schoolId: '',
      establishmentCount: '',
      amount: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE', // Default status for new subscriptions
    },
  });

  useEffect(() => {
    if (isOpen && editingSubscription) {
      form.reset({
        schoolId: editingSubscription.schoolId.toString(),
        establishmentCount: editingSubscription.establishmentCount.toString(),
        amount: editingSubscription.amount.toString(),
        startDate: editingSubscription.startDate.split('T')[0], // Format date for input type="date"
        endDate: editingSubscription.endDate.split('T')[0], // Format date for input type="date"
        status: editingSubscription.status,
      });
    } else if (isOpen && !editingSubscription) {
      // Reset for new entry when modal opens for adding
      form.reset({
        schoolId: '',
        establishmentCount: '',
        amount: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
      });
    }
  }, [isOpen, editingSubscription, form]);

  const onSubmit = (values) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader  className="p-2 pb-0">
          <DialogTitle className="text-base font-medium text-default-700">{editingSubscription ? 'Modifier l\'Abonnement' : 'Ajouter un Abonnement'}</DialogTitle>
          <DialogDescription>
            {editingSubscription
              ? 'Modifiez les détails de l\'abonnement existant ici.'
              : 'Ajoutez un nouvel abonnement pour une école.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] px-2">
        <Form {...form}>
        
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>École</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une école" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id.toString()}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="establishmentCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre d'établissements</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="INACTIVE">Inactif</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="EXPIRED">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {editingSubscription ? 'Sauvegarder les modifications' : 'Ajouter l\'Abonnement'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};