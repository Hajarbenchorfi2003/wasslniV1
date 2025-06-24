'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast';
import { userAPI } from '@/utils/auth';

const ChangePassword = () => {
  const [currentPasswordType, setCurrentPasswordType] = useState("password");
  const [newPasswordType, setNewPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await userAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Mot de passe changé avec succès');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-t-none pt-6">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 md:gap-x-12 gap-y-5">
            <div className="col-span-12 md:col-span-6">
              <Label htmlFor="currentPassword" className="mb-2 text-default-800">Mot de passe actuel</Label>
              <div className="relative">
                <Input 
                  id="currentPassword" 
                  name="currentPassword"
                  type={currentPasswordType}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <Eye
                  className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-default-500 w-4 h-4 cursor-pointer", currentPasswordType === "text" && "hidden")}
                  onClick={() => setCurrentPasswordType("text")}
                />
                <EyeOff
                  className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-default-500 w-4 h-4 cursor-pointer", currentPasswordType === "password" && "hidden")}
                  onClick={() => setCurrentPasswordType("password")}
                />
              </div>
            </div>
            <div className="col-span-12 md:col-span-6"></div>
            <div className="col-span-12 md:col-span-6">
              <Label htmlFor="newPassword" className="mb-2 text-default-800">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={newPasswordType}
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <Eye
                  className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-default-500 w-4 h-4 cursor-pointer", newPasswordType === "text" && "hidden")}
                  onClick={() => setNewPasswordType("text")}
                />
                <EyeOff
                  className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-default-500 w-4 h-4 cursor-pointer", newPasswordType === "password" && "hidden")}
                  onClick={() => setNewPasswordType("password")}
                />
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Label htmlFor="confirmPassword" className="mb-2 text-default-800">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmPasswordType}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <Eye
                  className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-default-500 w-4 h-4 cursor-pointer", confirmPasswordType === "text" && "hidden")}
                  onClick={() => setConfirmPasswordType("text")}
                />
                <EyeOff
                  className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-default-500 w-4 h-4 cursor-pointer", confirmPasswordType === "password" && "hidden")}
                  onClick={() => setConfirmPasswordType("password")}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 text-sm font-medium text-default-800">Exigences du mot de passe :</div>
          <div className="mt-3 space-y-1.5">
            {[
              "Minimum 8 caractères - plus c'est long, mieux c'est",
              "Au moins une lettre minuscule",
              "Au moins un chiffre, symbole ou caractère d'espacement"
            ].map((item, index) => (
              <div className="flex items-center gap-1.5" key={`requirement-${index}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-default-400"></div>
                <div className="text-xs text-default-600">{item}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-5 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              })}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              <Icon icon="heroicons:lock-closed" className="w-5 h-5 text-primary-foreground me-1" />
              {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;