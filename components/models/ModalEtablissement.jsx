'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
 
import toast from 'react-hot-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import   FormUser from './FormUser';
const SchoolSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  phone: z.string().regex(/^\+\d{1,3} ?\d{6,9}$/, {
    message: "Le numéro doit commencer par un indicatif (ex: +212) suivi du numéro.",
  }),
  email: z.string().email(),
  active: z.enum(["true", "false"]),
  schoolId: z.string().min(1),
  type: z.string(),
  useExistingDirector: z.boolean(),
  selectedDirectorId: z.string().optional(),
});

const fakeSchools = [
  { id: "1", name: "École A" },
  { id: "2", name: "École B" },
];

const fakeDirectors = [
  { id: "1", firstName: "Ahmed", lastName: "Ben Ali", phone: "0601010101" },
  { id: "2", firstName: "Fatima", lastName: "El Ghazali", phone: "0602020202" },
];

export default function ModalEtablissement({
  isOpen,
  setIsOpen,
  onSave,
  editingEtablissement,
  schoolId,  
  school,
}) {
  const defaultValues = {
    name: "",
    address: "",
    phone: "",
    email: "",
    schoolId: schoolId || "",
    type: "Privé",
    city: "",
    active: "true",
    director: {
      firstName: "",
      lastName: "",
      phone: "",
    },
    useExistingDirector: true,
    selectedDirectorId: "",
  };

  const form = useForm({
    resolver: zodResolver(SchoolSchema),
    defaultValues,
  });

  const useExistingDirector = form.watch("useExistingDirector");

  useEffect(() => {
    if (isOpen) {
      if (editingEtablissement) {
        const hasExistingDirector = !!editingEtablissement.director?.id;
        
        form.reset({
          ...editingEtablissement,
          active: editingEtablissement.isActive ? "true" : "false",
          useExistingDirector: hasExistingDirector,
          selectedDirectorId: hasExistingDirector ? editingEtablissement.director.id : "",
          director: hasExistingDirector 
            ? editingEtablissement.director 
            : { firstName: "", lastName: "", phone: "" },
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [editingEtablissement, form, isOpen, schoolId]);

  const onSubmit = (data) => {
    const directorData = data.useExistingDirector
      ? fakeDirectors.find(d => d.id === data.selectedDirectorId)
      : data.director;
  
    onSave({
      ...data,
      schoolId: schoolId || data.schoolId,
      isActive: data.active === "true",
      director: directorData,
    });
  
  
    toast.success(
      `${editingEtablissement ? "Établissement modifié" : "Établissement ajouté"}: ${data.name}`,
      {
        duration: 4000,
        position: 'top-center',
      }
    );
    
    setIsOpen(false);
    form.reset(defaultValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent size="2xl" className="p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-base font-medium text-default-700">
            {editingEtablissement ? "Modifier l'établissement" : "Ajouter un établissement"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[290px] px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="sm:grid sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
              {/* Section Établissement */}
              <div className="col-span-2">
                <h3 className="text-sm font-medium mb-3">Informations de l&apos;établissement</h3>
                <div className="sm:grid  sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
                  {[
                    { name: "name", label: "Nom", placeholder: "Entrez le nom" },
                    { name: "address", label: "Adresse", placeholder: "Entrez l'adresse" },
                    { name: "city", label: "Ville", placeholder: "Entrez la ville" },
                    { name: "phone", label: "Téléphone", placeholder: "Ex: +212 601010101" },
                    { name: "email", label: "Email", placeholder: "exemple@email.com", type: "email" },
                  ].map((field) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name}
                      render={({ field: f }) => (
                        <FormItem className="flex flex-col gap-2">
                          <FormLabel>{field.label} <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type={field.type || "text"} placeholder={field.placeholder} {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {/* École */}
                  <FormField
                    control={form.control}
                    name="schoolId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>École <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <select {...field} disabled={!!schoolId} className="input w-full bg-background border border-default-200 focus:border-primary focus:outline-none h-10 rounded-md px-2 placeholder:text-default-600">
                            {!schoolId && <option value="">Sélectionnez une école</option>}
                            {schoolId && school ? (
                              <option value={schoolId}>{school.name}</option>
                            ) : (
                              fakeSchools.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))
                            )}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <select {...field} className="input w-full bg-background border border-default-200 focus:border-primary focus:outline-none h-10 rounded-md px-2 placeholder:text-default-600">
                            <option value="Privé">Privé</option>
                            <option value="Public">Public</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Statut */}
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Statut</FormLabel>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex space-x-6">
                          <FormItem className="flex items-center gap-2">
                            <FormControl><RadioGroupItem value="true" /></FormControl>
                            <FormLabel>Actif</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-2">
                            <FormControl><RadioGroupItem value="false" /></FormControl>
                            <FormLabel>Inactif</FormLabel>
                          </FormItem>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section Directeur */}
              <div className="col-span-2 mt-4">
                <h3 className="text-sm font-medium mb-3">Directeur</h3>
                
                <FormField
                  control={form.control}
                  name="useExistingDirector"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 mb-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Utiliser un directeur existant</FormLabel>
                    </FormItem>
                  )}
                />

                {useExistingDirector ? (
                  <FormField
                    control={form.control}
                    name="selectedDirectorId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Sélectionner un directeur</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="input w-full bg-background border border-default-200 focus:border-primary focus:outline-none h-10 rounded-md px-2 placeholder:text-default-600"
                          >
                            <option value="">Choisissez un directeur</option>
                            {fakeDirectors.map(d => (
                              <option key={d.id} value={d.id}>
                                {`${d.firstName} ${d.lastName} (${d.phone})`}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormUser control={form.control} role={'RESPONSIBLE'} />
                )}
              </div>
            </form>
          </Form>
        </ScrollArea>

        <div className="flex justify-center gap-3 p-6 pt-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            {editingEtablissement ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}