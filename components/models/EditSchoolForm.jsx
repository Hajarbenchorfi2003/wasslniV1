'use client';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

// Schéma commun pour école
const schoolSchema = z.object({
  name: z.string().min(2, "Nom de l'école requis"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  phone: z.string().min(10, "Numéro trop court").optional().or(z.literal('')),
  address: z.string().min(5, "Adresse requise").optional().or(z.literal('')),
  city: z.string().min(2, "Ville requise").optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export default function EditSchoolForm({ defaultValues, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(schoolSchema),
    defaultValues: defaultValues?.school || {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      isActive: true,
    },
    mode: 'onChange', // Valide en temps réel
  });

  const errors = form.formState.errors;
  console.log("❌ Erreurs de validation:", errors);

  const handleSubmit = (data) => {
    console.log("✅ Données validées :", data);
    onSubmit({ school: data });
  };

  const schoolFields = [
    { name: "name", label: "Nom de l'école", placeholder: "Nom de l'école" },
    { name: "email", label: "Email", placeholder: "Email de l'école", type: 'email' },
    { name: "phone", label: "Téléphone", placeholder: "Numéro de téléphone" },
    { name: "address", label: "Adresse", placeholder: "Adresse de l'école" },
    { name: "city", label: "Ville", placeholder: "Ville" },
  ];

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={(e) => {
          console.log("🔴 Soumission du formulaire");
          form.handleSubmit(handleSubmit)(e);
        }}
        className="space-y-6"
      >
        {/* Section École */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Informations de l'école</h3>

          {/* Afficher toutes les erreurs */}
          {Object.keys(errors).map((key) => (
            <p key={key} style={{ color: 'red' }}>
              ❌ {errors[key].message}
            </p>
          ))}

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
              name="isActive"
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

        <div className="flex justify-end pb-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}