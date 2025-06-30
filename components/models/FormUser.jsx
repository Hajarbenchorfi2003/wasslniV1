import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';

export default function FormUser({
  control,
  setValue,
  prefix = "user",
  className = "sm:grid  sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0",
  disabled = false,
  showLabels = true,
  requiredIndicator = true,
  role = 'ADMIN',
  establishments = [],
  editdrive = false
}) {
  useEffect(() => {
    if (setValue) {
      setValue(`${prefix}.role`, role);
    }
  }, [setValue, prefix, role]);
 console.log("data in formUser",setValue)
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

      {/* Establishment Selection */}
      {!editdrive && establishments.length > 0 && (
        <FormField
          control={control}
          name={`${prefix}.establishmentId`}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 col-span-2">
              <FormLabel>
                Établissement
                {requiredIndicator && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(val) => field.onChange(parseInt(val))}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {establishments.map((est) => (
                      <SelectItem key={est.id} value={est.id.toString()}>
                        {est.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}


    </div>
  );
}
