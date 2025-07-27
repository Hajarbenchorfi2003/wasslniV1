// components/FormAdmin.jsx
'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const FormAdmin = ({ onSubmit, editingSchool, schools }) => {
  const [adminMode, setAdminMode] = useState("new");

  useEffect(() => {
    if (editingSchool?.admin) {
      setAdminMode("new");
    } else if (editingSchool?.adminId) {
      setAdminMode("select");
    }
  }, [editingSchool]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newSchool = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      isActive: true,
    };

    if (adminMode === "new") {
      newSchool.admin = {
        firstName: formData.get("adminName").split(" ")[0],
        lastName: formData.get("adminName").split(" ").slice(1).join(" ") || "",
        email: formData.get("adminEmail"),
        phone: formData.get("adminPhone"),
      };
    } else {
      newSchool.adminId = formData.get("existingAdmin");
    }

    onSubmit(newSchool);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="adminMode" value={adminMode} />
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nom de l&apos;école</Label>
          <Input id="name" name="name" defaultValue={editingSchool?.name} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={editingSchool?.email} required />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={editingSchool?.phone} required />
        </div>
        <div>
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" defaultValue={editingSchool?.address} required />
        </div>
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={editingSchool?.city} required />
        </div>

        <div className="space-y-2">
          <Label>Mode Admin</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newAdmin"
                checked={adminMode === "new"}
                onCheckedChange={() => setAdminMode("new")}
              />
              <Label htmlFor="newAdmin">Ajouter un nouvel admin</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="existingAdmin"
                checked={adminMode === "select"}
                onCheckedChange={() => setAdminMode("select")}
              />
              <Label htmlFor="existingAdmin">Assigner un admin existant</Label>
            </div>
          </div>
        </div>

        {adminMode === "new" && (
          <>
            <div>
              <Label htmlFor="adminName">Nom complet de l&apos;admin</Label>
              <Input
                name="adminName"
                id="adminName"
                placeholder="Prénom Nom"
                required
                defaultValue={
                  editingSchool?.admin
                    ? `${editingSchool.admin.firstName} ${editingSchool.admin.lastName}`
                    : ""
                }
              />
            </div>
            <div>
              <Label htmlFor="adminEmail">Email de l&apos;admin</Label>
              <Input
                type="email"
                name="adminEmail"
                id="adminEmail"
                placeholder="admin@example.com"
                required
                defaultValue={editingSchool?.admin?.email}
              />
            </div>
            <div>
              <Label htmlFor="adminPhone">Téléphone de l&apos;admin</Label>
              <Input
                name="adminPhone"
                id="adminPhone"
                placeholder="+212 6..."
                required
                defaultValue={editingSchool?.admin?.phone}
              />
            </div>
          </>
        )}

        {adminMode === "select" && (
          <div>
            <Label htmlFor="existingAdmin">Admins existants</Label>
            <select
              name="existingAdmin"
              id="existingAdmin"
              className="w-full border p-2 rounded"
              required
              defaultValue={editingSchool?.adminId}
            >
              <option value="">-- Sélectionner un admin --</option>
              {Array.from(new Set(schools.filter(s => s.admin).map(s => s.admin)))
                .map((admin, index) => (
                  <option key={index} value={index}>
                    {admin.firstName} {admin.lastName} ({admin.email})
                  </option>
                ))}
            </select>
          </div>
        )}

        <Button type="submit" className="w-full">
          {editingSchool ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
};

export default FormAdmin;
