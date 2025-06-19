"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/form";
import toast from 'react-hot-toast';
import { 
  demoData, 
  getUserById, 
  updateUserData, 
  updateUserPassword,
  getUsersByRoleAndEstablishment 
} from '@/data/data';

// Form schemas for different user types
const userSchema = z.object({
  fullname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^\+\d{1,3} ?\d{6,9}$/, {
    message: "Le numéro doit commencer par un indicatif (ex: +212) suivi du numéro.",
  }),
  cin: z.string().min(5, "Le CIN doit contenir au moins 5 caractères"),
  role: z.enum(['RESPONSIBLE', 'DRIVER', 'PARENT']),
  isActive: z.boolean(),
  establishmentId: z.string().optional(),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

  // Forms
  const userForm = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      cin: '',
      role: 'PARENT',
      isActive: true,
      establishmentId: '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when role or search term changes
  useEffect(() => {
    filterUsers();
  }, [users, selectedRole, searchTerm]);

  const loadUsers = () => {
    // Get all users except SUPER_ADMIN
    const allUsers = demoData.users.filter(user => user.role !== 'SUPER_ADMIN');
    setUsers(allUsers);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = (data) => {
    const newUser = {
      id: Math.max(...demoData.users.map(u => u.id), 0) + 1,
      ...data,
      password: '$2a$10$hashedpassword', // In real app, hash the password
    };

    demoData.users.push(newUser);
    loadUsers();
    setIsAddModalOpen(false);
    userForm.reset();
    toast.success('Utilisateur ajouté avec succès');
  };

  const handleEditUser = (data) => {
    if (editingUser) {
      updateUserData(editingUser.id, data);
      loadUsers();
      setIsEditModalOpen(false);
      setEditingUser(null);
      userForm.reset();
      toast.success('Utilisateur modifié avec succès');
    }
  };

  const handlePasswordReset = (data) => {
    if (selectedUserForPassword) {
      updateUserPassword(selectedUserForPassword.id, data.newPassword);
      setIsPasswordModalOpen(false);
      setSelectedUserForPassword(null);
      passwordForm.reset();
      toast.success('Mot de passe réinitialisé avec succès');
    }
  };

  const handleToggleUserStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      updateUserData(userId, { isActive: !user.isActive });
      loadUsers();
      toast.success(`Utilisateur ${user.isActive ? 'désactivé' : 'activé'} avec succès`);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    userForm.reset({
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      cin: user.cin,
      role: user.role,
      isActive: user.isActive,
      establishmentId: user.establishmentId?.toString() || '',
    });
    setIsEditModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUserForPassword(user);
    setIsPasswordModalOpen(true);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'RESPONSIBLE':
        return 'default';
      case 'DRIVER':
        return 'secondary';
      case 'PARENT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'RESPONSIBLE':
        return 'heroicons:user';
      case 'DRIVER':
        return 'heroicons:truck';
      case 'PARENT':
        return 'heroicons:users';
      default:
        return 'heroicons:user';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-800">Gestion des Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez tous les utilisateurs du système (Responsables, Chauffeurs, Parents)
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Icon icon="heroicons:plus" className="h-4 w-4" />
              Ajouter un Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Utilisateur</DialogTitle>
            </DialogHeader>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={userForm.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom Complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom complet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemple.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+212 601010101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="cin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CIN</FormLabel>
                      <FormControl>
                        <Input placeholder="CIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RESPONSIBLE">Responsable d'Établissement</SelectItem>
                          <SelectItem value="DRIVER">Chauffeur</SelectItem>
                          <SelectItem value="PARENT">Parent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Ajouter
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="RESPONSIBLE">Responsables</SelectItem>
                <SelectItem value="DRIVER">Chauffeurs</SelectItem>
                <SelectItem value="PARENT">Parents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:users" className="h-5 w-5" />
            Liste des Utilisateurs ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon icon={getRoleIcon(user.role)} className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.fullname}</div>
                        <div className="text-sm text-muted-foreground">CIN: {user.cin}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{user.email}</div>
                      <div className="text-sm text-muted-foreground">{user.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      <Icon icon={getRoleIcon(user.role)} className="h-3 w-3 mr-1" />
                      {user.role === 'RESPONSIBLE' ? 'Responsable' : 
                       user.role === 'DRIVER' ? 'Chauffeur' : 'Parent'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditModal(user)}
                      >
                        <Icon icon="heroicons:pencil" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPasswordModal(user)}
                      >
                        <Icon icon="heroicons:key" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={user.isActive ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                      >
                        <Icon 
                          icon={user.isActive ? 'heroicons:eye-slash' : 'heroicons:eye'} 
                          className="h-4 w-4" 
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur</DialogTitle>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom Complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom complet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+212 601010101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="cin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CIN</FormLabel>
                    <FormControl>
                      <Input placeholder="CIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RESPONSIBLE">Responsable d'Établissement</SelectItem>
                        <SelectItem value="DRIVER">Chauffeur</SelectItem>
                        <SelectItem value="PARENT">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Modifier
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser le Mot de Passe</DialogTitle>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau Mot de Passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nouveau mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le Mot de Passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirmer le mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Réinitialiser
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 