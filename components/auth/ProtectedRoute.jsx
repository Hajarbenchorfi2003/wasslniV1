"use client";

import RoleGuard from "./RoleGuard";

// Composant pour protéger une route avec un rôle spécifique
export const SuperAdminRoute = ({ children }) => (
  <RoleGuard requiredRole="super-admin">
    {children}
  </RoleGuard>
);

// Composant pour protéger une route avec le rôle admin
export const AdminRoute = ({ children }) => (
  <RoleGuard requiredRole="admin">
    {children}
  </RoleGuard>
);

// Composant pour protéger une route avec le rôle driver
export const DriverRoute = ({ children }) => (
  <RoleGuard requiredRole="driver">
    {children}
  </RoleGuard>
);

// Composant pour protéger une route avec le rôle parent
export const ParentRoute = ({ children }) => (
  <RoleGuard requiredRole="parent">
    {children}
  </RoleGuard>
);

// Composant pour protéger une route avec le rôle responsible
export const ResponsibleRoute = ({ children }) => (
  <RoleGuard requiredRole="responsible">
    {children}
  </RoleGuard>
);

// Composant pour protéger une route avec plusieurs rôles
export const MultiRoleRoute = ({ children, roles }) => (
  <RoleGuard requiredRoles={roles}>
    {children}
  </RoleGuard>
);

// Exemple d'utilisation:
// <SuperAdminRoute>
//   <YourComponent />
// </SuperAdminRoute> 