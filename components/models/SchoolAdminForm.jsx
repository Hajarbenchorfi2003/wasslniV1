'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import FormUser from './FormUser';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { demoData } from '@/data/data'; // Remove direct import and manipulation
// import toast from 'react-hot-toast'; // Remove direct toast calls here

// Schéma pour l'école
const schoolSchema = z.object({
  name: z.string().min(2, "Nom de l'école requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro trop court"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  isActive: z.boolean().default(true),
});

// Schéma pour un nouvel admin
const newAdminSchema = z.object({
  fullname: z.string().min(2, "Le nom complet est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro trop court"),
  password: z.string().min(6, "Minimum 6 caractères"),

  isActive: z.boolean().default(true),
});

// Schéma combiné qui change selon le mode
const createSchema = (addNewAdmin) => z.object({
  school: schoolSchema,
  admin: addNewAdmin ? newAdminSchema : z.object({}).optional(),
  existingAdminId: addNewAdmin ? z.string().optional() : z.string().min(1, "Veuillez sélectionner un administrateur"),
});

export default function SchoolAdminForm({ onSubmit, defaultValues, existingAdmins = [] }) {
  // Initialize addNewAdmin based on defaultValues.addNewAdmin or default to true for new entries
  const [addNewAdmin, setAddNewAdmin] = useState(defaultValues?.addNewAdmin !== undefined ? defaultValues.addNewAdmin : true);
  const [schema, setSchema] = useState(createSchema(addNewAdmin)); // Use initial addNewAdmin state for schema
  const isEdit = !!defaultValues?.school || !!defaultValues?.adminId;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues // Pass defaultValues directly from props
  });

  // Use useEffect to reset the form when defaultValues change (e.g., when opening a new school vs editing)
  useEffect(() => {
    form.reset(defaultValues);
    // Also update addNewAdmin state based on defaultValues when the form is reset
    setAddNewAdmin(defaultValues?.addNewAdmin !== undefined ? defaultValues.addNewAdmin : true);
  }, [defaultValues, form]);


  // Mettre à jour le schéma quand addNewAdmin change
  useEffect(() => {
    const newSchema = createSchema(addNewAdmin);
    setSchema(newSchema);
    form.clearErrors(); // Clear errors when schema changes

    // When addNewAdmin changes, reset specific parts of the form
    // This is important to clear out values from the previous mode
    if (addNewAdmin) {
      // If switching to "add new admin", clear existingAdminId and potentially pre-fill admin if in defaultValues
      form.setValue('existingAdminId', '');
      // If defaultValues has admin data, set it when switching to addNewAdmin mode
      if (defaultValues?.admin) {
        form.setValue("admin.fullname", defaultValues.admin.fullname || '');
        form.setValue("admin.email", defaultValues.admin.email || '');
        form.setValue("admin.phone", defaultValues.admin.phone || '');
        form.setValue("admin.password", ''); // Always clear password
        
        form.setValue("admin.isActive", defaultValues.admin.isActive !== undefined ? defaultValues.admin.isActive : true);
      }
    } else { 
      // If switching to "existing admin", clear new admin fields
      form.setValue('admin.fullname', '');
      form.setValue('admin.email', '');
      form.setValue('admin.phone', '');
      form.setValue('admin.password', '');
     
      form.setValue('admin.isActive', true);
      // Set existingAdminId if it's available in defaultValues and we're switching to existing mode
      if (defaultValues?.existingAdminId) {
        form.setValue('existingAdminId', defaultValues.existingAdminId);
      }
    }
  }, [addNewAdmin, form, defaultValues]); // Add defaultValues to dependency array

  const handleSubmit = (data) => {
    onSubmit({
      school: data.school,
      admin: addNewAdmin ? { ...data.admin, role: 'ADMIN' } : null,
      existingAdminId: addNewAdmin ? null : data.existingAdminId,
      addNewAdmin: addNewAdmin,
    });
  };

  const schoolFields = [
    { name: "school.name", label: "Nom de l'école", placeholder: "Nom de l'école" },
    { name: "school.email", label: "Email", placeholder: "Email de l'école", type: 'email' },
    { name: "school.phone", label: "Téléphone", placeholder: "Numéro de téléphone" },
    { name: "school.address", label: "Adresse", placeholder: "Adresse de l'école" },
    { name: "school.city", label: "Ville", placeholder: "Ville" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Section École */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Informations de l'école</h3>
          <div className="sm:grid sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
            {schoolFields.map(({ name, label, placeholder, type = 'text' }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input type={type} placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name="school.isActive"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormLabel>École active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section Admin */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Administrateur de l'école</h3>

          <div className="flex items-center space-x-2">
            <Switch
              id="add-new-admin"
              checked={addNewAdmin}
              onCheckedChange={setAddNewAdmin}
              disabled={isEdit && existingAdmins.length > 0}
            />
            <FormLabel htmlFor="add-new-admin">
              {addNewAdmin ? 'Créer un nouvel admin' : 'Choisir un admin existant'}
            </FormLabel>
          </div>

          {addNewAdmin ? (
            <FormUser
              control={form.control}
              prefix="admin"
              role="ADMIN"
              showLabels={true}
            />
          ) : (
            <FormField
              control={form.control}
              name="existingAdminId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin existant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit && existingAdmins.length > 0}> {/* Use value prop */}
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un admin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent  >
                    <ScrollArea className="h-[250px]">
                      {existingAdmins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id.toString()}>
                          {admin.firstName} {admin.lastName} ({admin.email})
                        </SelectItem>
                      ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end pb-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}