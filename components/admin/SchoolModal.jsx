'use client';

import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from '@/components/ui/use-toast';

const SchoolSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  address: z.string().min(5, { message: "L'adresse doit contenir au moins 5 caractères." }),
  city: z.string().min(2, { message: "La ville doit contenir au moins 2 caractères." }),
  phone: z
  .string()
  .min(4, { message: "Numéro de téléphone invalide." })
  .regex(/^\+\d{1,3} ?\d{6,9}$/, {
    message: "Le numéro doit commencer par un indicatif (ex: +212) suivi du numéro.",
  }),

email: z
  .string()
  .min(5, { message: "Adresse email invalide." })
  .email({ message: "Adresse email invalide." }),
  active: z.enum(["true", "false"], { required_error: "Sélectionnez un statut." }),
});

export default function SchoolModal({ isOpen, onClose, school, onSave }) {
  const form = useForm({
    resolver: zodResolver(SchoolSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      active: 'true',
    },
  });

  useEffect(() => {
    if (school) {
      form.reset({
        name: school.name || '',
        address: school.address || '',
        city: school?.city || '',
        phone: school.phone || '',
        email: school.email || '',
        active: school.isActive ? 'true' : 'false', // convertit booléen en string
      });
    } else {
      form.reset({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        active: 'true',
      });
    }
  }, [school, form]);
  

  function onSubmit(data) {
    const payload = {
      name: data.name,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      isActive: data.active === 'true', // convertit string en booléen
    };
  
    onSave(payload);
  
    toast({
      title: school ? "École modifiée" : "École ajoutée",
      description: `Nom : ${data.name}`,
    });
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-xl transition-all">
          
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <Dialog.Close className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Fermer</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
                </div>

          <Dialog.Title className="text-lg font-semibold text-gray-900">
          {school ? "Modifier l'école" : "Nouvelle école"}
                    </Dialog.Title>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">

              {/* Nom */}
              <FormField
                control={form.control}
                          name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom <span className="text-warning">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le nom"
                        {...field}
                        className={cn({
                          "border-destructive focus:border-destructive": form.formState.errors.name,
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Adresse */}
              <FormField
                control={form.control}
                          name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse <span className="text-warning">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez l'adresse"
                        {...field}
                        className={cn({
                          "border-destructive focus:border-destructive": form.formState.errors.address,
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ville */}
              <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville <span className="text-warning">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Entrez la ville"
                      {...field}
                      className={cn({
                        "border-destructive focus:border-destructive": form.formState.errors.city,
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
  
              />


              {/* Téléphone */}
              <FormField
                control={form.control}
                          name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone <span className="text-warning">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le téléphone"
                        {...field}
                        className={cn({
                          "border-destructive focus:border-destructive": form.formState.errors.phone,
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-warning">*</span></FormLabel>
                    <FormControl>
                      <Input
                          type="email"
                        placeholder="Entrez l'email"
                        {...field}
                        className={cn({
                          "border-destructive focus:border-destructive": form.formState.errors.email,
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statut actif */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Statut actif <span className="text-warning">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Oui</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">Non</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Boutons */}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <Button type="submit" disabled={Object.keys(form.formState.errors).length > 0}>
                          {school ? 'Modifier' : 'Ajouter'}
                </Button>
                <Dialog.Close asChild>
                  <Button variant="outline" type="button">
                          Annuler
                  </Button>
                </Dialog.Close>
                      </div>
                    </form>
          </Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
