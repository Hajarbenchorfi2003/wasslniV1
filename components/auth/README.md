# Système de Protection des Rôles

Ce système permet de protéger les routes et composants en fonction des rôles des utilisateurs.

## Fonctions Utilitaires (utils/auth.js)

### Vérification des Rôles
```javascript
import { hasRole, hasAnyRole, isSuperAdmin, isAdmin, isDriver, isParent, isResponsible } from '@/utils/auth';

// Vérifier un rôle spécifique
const isUserAdmin = hasRole('admin');

// Vérifier plusieurs rôles
const canAccess = hasAnyRole(['admin', 'super-admin']);

// Vérifications spécifiques
const isSuperAdminUser = isSuperAdmin();
const isAdminUser = isAdmin();
const isDriverUser = isDriver();
const isParentUser = isParent();
const isResponsibleUser = isResponsible();
```

## Composants de Protection

### RoleGuard
Composant de base pour protéger n'importe quel contenu :

```javascript
import RoleGuard from '@/components/auth/RoleGuard';

<RoleGuard requiredRole="super-admin">
  <YourComponent />
</RoleGuard>

// Ou avec plusieurs rôles
<RoleGuard requiredRoles={['admin', 'super-admin']}>
  <YourComponent />
</RoleGuard>
```

### Composants Pré-définis
```javascript
import { 
  SuperAdminRoute, 
  AdminRoute, 
  DriverRoute, 
  ParentRoute, 
  ResponsibleRoute,
  MultiRoleRoute 
} from '@/components/auth/ProtectedRoute';

// Protection avec un rôle spécifique
<SuperAdminRoute>
  <YourComponent />
</SuperAdminRoute>

// Protection avec plusieurs rôles
<MultiRoleRoute roles={['admin', 'super-admin']}>
  <YourComponent />
</MultiRoleRoute>
```

## Layouts Protégés

Tous les layouts de l'application sont maintenant protégés :

- `(super-admin)/layout.jsx` - Seuls les super-admin peuvent accéder
- `(admin)/layout.jsx` - Seuls les admin peuvent accéder  
- `(driver)/layout.jsx` - Seuls les drivers peuvent accéder
- `(parent)/layout.jsx` - Seuls les parents peuvent accéder
- `(responsible)/layout.jsx` - Seuls les responsables peuvent accéder

## Gestion des Erreurs

Quand un utilisateur n'a pas les permissions requises :
1. Il est automatiquement redirigé vers `/error-page/403`
2. Un message d'erreur est affiché dans la console
3. La page d'erreur 403 personnalisée s'affiche

## Exemple d'Utilisation

```javascript
// Dans un composant
import { SuperAdminRoute } from '@/components/auth/ProtectedRoute';

const MyComponent = () => {
  return (
    <SuperAdminRoute>
      <div>
        <h1>Contenu réservé aux super-admin</h1>
        {/* Votre contenu ici */}
      </div>
    </SuperAdminRoute>
  );
};
```

## Personnalisation

Vous pouvez personnaliser le comportement :

```javascript
<RoleGuard 
  requiredRole="admin"
  fallbackPath="/custom-error-page"
  showLoading={false}
>
  <YourComponent />
</RoleGuard>
```

## Props du RoleGuard

- `requiredRole` : Rôle spécifique requis
- `requiredRoles` : Tableau de rôles acceptés
- `fallbackPath` : Chemin de redirection en cas d'échec (défaut: "/error-page/403")
- `showLoading` : Afficher un spinner pendant la vérification (défaut: true) 