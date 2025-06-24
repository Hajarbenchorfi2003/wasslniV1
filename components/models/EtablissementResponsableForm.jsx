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

// Updated Zod Schema for Etablissement (quartie already added)
const etablissementSchema = z.object({
  name: z.string().min(2, "Nom de l'établissement requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro trop court"),
  address: z.string().min(5, "Adresse requise"),
  quartie: z.string().min(2, "Quartier requis"),
  city: z.string().min(2, "Ville requise"),
  isActive: z.boolean().default(true),
});

const newResponsableSchema = z.object({
  fullname: z.string().min(2, "Le nom complet est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro trop court"),
  password: z.string().min(6, "Minimum 6 caractères"),
  cin: z.string().min(4, "CIN requis"),
  isActive: z.boolean().default(true),
});

// Combined schema now includes schoolId conditionally if not fixed
const createEtablissementResponsableSchema = (addNewResponsable, isSchoolSelectRequired) => z.object({
  etablissement: etablissementSchema,
  responsable: addNewResponsable ? newResponsableSchema : z.object({}).optional(),
  existingResponsableId: addNewResponsable ? z.string().optional() : z.string().min(1, "Veuillez sélectionner un responsable"),
  // Conditionally add schoolId validation if it's required in the form
  schoolId: isSchoolSelectRequired ? z.string().min(1, "Veuillez sélectionner une école") : z.string().optional(),
});


export default function EtablissementResponsableForm({ 
  onSubmit, 
  defaultValues, 
  existingResponsables = [],
  // NEW PROP: List of all schools for the dropdown
  allSchools = [], 
  // NEW PROP: If schoolId is fixed and shouldn't be chosen by the user
  fixedSchoolId = null 
}) {
  console.log(defaultValues)
  const [addNewResponsable, setAddNewResponsable] = useState(defaultValues?.addNewResponsable !== undefined ? defaultValues.addNewResponsable : true);
  
  // Determine if school selection is required
  const isSchoolSelectRequired = fixedSchoolId === null;

  const [schema, setSchema] = useState(createEtablissementResponsableSchema(addNewResponsable, isSchoolSelectRequired));

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
        ...defaultValues,
        // Ensure schoolId default is set if it's fixed
        schoolId: fixedSchoolId ? fixedSchoolId.toString() : defaultValues?.schoolId || ''
    }
  });

  useEffect(() => {
    form.reset({
        ...defaultValues,
        // Ensure schoolId default is set if it's fixed or from defaultValues
        schoolId: fixedSchoolId ? fixedSchoolId.toString() : defaultValues?.schoolId || ''
    });
    setAddNewResponsable(defaultValues?.addNewResponsable !== undefined ? defaultValues.addNewResponsable : true);
  }, [defaultValues, form, fixedSchoolId]); // Add fixedSchoolId to dependency array


  useEffect(() => {
    const newSchema = createEtablissementResponsableSchema(addNewResponsable, isSchoolSelectRequired);
    setSchema(newSchema);
    form.clearErrors(); 

    if (addNewResponsable) {
      form.setValue('existingResponsableId', '');
      if (defaultValues?.responsable) {
        form.setValue("responsable.fullname", defaultValues.responsable.fullname || '');
        form.setValue("responsable.email", defaultValues.responsable.email || '');
        form.setValue("responsable.phone", defaultValues.responsable.phone || '');
        form.setValue("responsable.password", ''); 
        form.setValue("responsable.cin", defaultValues.responsable.cin || '');
        form.setValue("responsable.isActive", defaultValues.responsable.isActive !== undefined ? defaultValues.responsable.isActive : true);
      }
    } else {
      form.setValue('responsable.fullname', '');
      form.setValue('responsable.email', '');
      form.setValue('responsable.phone', '');
      form.setValue('responsable.password', '');
      form.setValue('responsable.cin', '');
      form.setValue('responsable.isActive', true);
      if (defaultValues?.existingResponsableId) {
        form.setValue('existingResponsableId', defaultValues.existingResponsableId);
      }
    }
    // Also, if fixedSchoolId is provided, ensure the form field for schoolId is updated/set
    if (fixedSchoolId) {
        form.setValue('schoolId', fixedSchoolId.toString());
    } else if (!isSchoolSelectRequired && !defaultValues?.schoolId) {
        // If not fixed, and no default schoolId, ensure it's cleared if it existed before.
        form.setValue('schoolId', '');
    }

  }, [addNewResponsable, form, defaultValues, fixedSchoolId, isSchoolSelectRequired]); // Add new dependencies


  const handleSubmit = (data) => {
    const errors = form.formState.errors;
  if (Object.keys(errors).length > 0) {
    console.error("Erreurs de validation", errors); // ✅ Affiche les erreurs
  }
    onSubmit({
      etablissement: data.etablissement,
      responsable: addNewResponsable ? { ...data.responsable, role: 'RESPONSIBLE' } : null,
      existingResponsableId: addNewResponsable ? null : data.existingResponsableId,
      addNewResponsable: addNewResponsable,
      // Pass the schoolId from the form's data, or the fixedSchoolId if available
      schoolId: fixedSchoolId ? fixedSchoolId : (data.schoolId ? parseInt(data.schoolId) : null),
    });
    console.log(data);
  };

  const etablissementFields = [
    { name: "etablissement.name", label: "Nom de l'établissement", placeholder: "Nom de l'établissement" },
    { name: "etablissement.email", label: "Email", placeholder: "Email de l'établissement", type: 'email' },
    { name: "etablissement.phone", label: "Téléphone", placeholder: "Numéro de téléphone" },
    { name: "etablissement.address", label: "Adresse", placeholder: "Adresse de l'établissement" },
    { name: "etablissement.quartie", label: "Quartier", placeholder: "Quartier de l'établissement" },
    { name: "etablissement.city", label: "Ville", placeholder: "Ville" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Section Établissement */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Informations de l'établissement</h3>
          <div className="sm:grid sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
            {etablissementFields.map(({ name, label, placeholder, type = 'text' }) => (
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
            {/* Conditional School ID Field */}
            {isSchoolSelectRequired && ( // Only show if school selection is required
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>École affiliée</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une école" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allSchools.map((school) => (
                          <SelectItem key={school.id} value={school.id.toString()}>
                            {school.name} ({school.city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Section Responsable (remains the same) */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Responsable de l'établissement</h3>
          <div className="flex items-center space-x-2">
            <Switch
              id="add-new-responsable"
              checked={addNewResponsable}
              onCheckedChange={setAddNewResponsable}
            />
            <FormLabel htmlFor="add-new-responsable">
              {addNewResponsable ? 'Choisir un responsable existant' : 'Créer un nouveau responsable'}
            </FormLabel>
          </div>
          {addNewResponsable ? (
            <FormUser
              control={form.control}
              prefix="responsable"
              role="RESPONSIBLE"
              showLabels={true}
            />
          ) : (
            <FormField
              control={form.control}
              name="existingResponsableId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable existant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un responsable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {existingResponsables.map((responsable) => (
                        <SelectItem key={responsable.id} value={responsable.id.toString()}>
                          {responsable.firstName} {responsable.lastName} ({responsable.email})
                        </SelectItem>
                      ))}
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