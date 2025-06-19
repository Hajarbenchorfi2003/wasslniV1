// components/models/FormUser.jsx
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Assuming shadcn/ui Form components
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui Input
import { Switch } from "@/components/ui/switch"; // Assuming shadcn/ui Switch
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui Button
import toast from 'react-hot-toast'; // Assuming react-hot-toast

// Define the Zod schema for validation
const formSchema = z.object({
  fullname: z.string().min(3, "Le nom complet est requis et doit contenir au moins 3 caractères."),
  email: z.string().email("L'email doit être une adresse email valide."),
  phone: z.string().regex(/^\+?[0-9\s-]+$/, "Le numéro de téléphone n'est pas valide.").min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres."),
  cin: z.string().min(6, "Le CIN est requis et doit contenir au moins 6 caractères."),
  isActive: z.boolean(),
  password: z.string().optional() // Optional for editing, required for adding
    .refine((val) => val === undefined || val.length === 0 || val.length >= 6, {
      message: "Le mot de passe doit contenir au moins 6 caractères."
    }),
});

export function FormUser({ initialData, onSubmit, onCancel, role }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      cin: '',
      isActive: true,
      password: '',
    },
  });

  // Populate form fields when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        fullname: initialData.fullname || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        cin: initialData.cin || '',
        isActive: initialData.isActive,
        password: '', // Never pre-fill password for security
      });
    } else {
      // Reset to default values for adding a new user
      form.reset({
        fullname: '',
        email: '',
        phone: '',
        cin: '',
        isActive: true,
        password: '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values) => {
    try {
      // If adding a new user, password is required
      if (!initialData && (!values.password || values.password.trim() === '')) {
        form.setError("password", { message: "Le mot de passe est requis pour un nouvel utilisateur." });
        return;
      }
      
      await onSubmit(values); // Call the onSave prop from ModalUser/ResponsablesPage
      form.reset(); // Reset form after successful submission
    } catch (error) {
      // onSubmit (handleSaveUser) in ResponsablesPage will handle toast for errors
      console.error("Form submission error:", error);
    }
  };

  return (
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem className='pr-4'> 
              <FormLabel>Nom Complet</FormLabel>
              <FormControl>
                <Input placeholder="Nom Complet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className='pr-4'>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className='pr-4'>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input placeholder="Téléphone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cin"
          render={({ field }) => (
            <FormItem className='pr-4'>
              <FormLabel>CIN</FormLabel>
              <FormControl>
                <Input placeholder="CIN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!initialData && ( // Password field is only visible for adding new users
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className='pr-4'>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input placeholder="Mot de passe" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mr-4">
              <div className="space-y-0.5">
                <FormLabel>Actif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Indique si l'utilisateur est actif dans le système.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 mt-6  pr-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {initialData ? "Sauvegarder les modifications" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}