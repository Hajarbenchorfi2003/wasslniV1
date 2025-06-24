'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Schema without `role` visible
export const userSchema = z.object({
  fullname: z.string().min(2, "Le nom complet est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro trop court").regex(/^\+?\d+$/, "Numéro invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
 
  isActive: z.boolean(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'RESPONSIBLE', 'DRIVER', 'PARENT']), // important pour envoi
});

export default function FormUser({
  control,
  setValue,
  prefix = "user",
  className = "sm:grid  sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0" ,
  disabled = false,
  showLabels = true,
  requiredIndicator = true,
  role = 'ADMIN', // Rôle passé par props
}) {
  // Inject role dans le formulaire
  useEffect(() => {
    if (setValue) {
      setValue(`${prefix}.role`, role);
    }
  }, [setValue, prefix, role]);

  const fields = [
    { name: "fullname", label: "Nom Complet", placeholder: "Entrez le nom complet" },
    { name: "email", label: "Email", placeholder: "Entrez l'email" },
    { name: "phone", label: "Téléphone", placeholder: "Ex: +212601010101" },
    { name: "password", label: "Mot de passe", placeholder: "Entrez le mot de passe" },
    
  ];

  return (
    <div className={className}>
      {fields.map((field) => (
        <FormField
          key={`${prefix}.${field.name}`}
          control={control}
          name={`${prefix}.${field.name}`}
          render={({ field: formField }) => (
            <FormItem className="flex flex-col gap-2">
              {showLabels && (
                <FormLabel>
                  {field.label}
                  {requiredIndicator && <span className="text-red-500">*</span>}
                </FormLabel>
              )}
              <FormControl>
                <Input
                  type={field.name === "password" ? "password" : "text"}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  {...formField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      {/* Switch isActive */}
      <FormField
        control={control}
        name={`${prefix}.isActive`}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            {showLabels && <FormLabel>Actif ?</FormLabel>}
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
