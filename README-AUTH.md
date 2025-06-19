# Système d'Authentification Frontend avec API Backend

Ce projet utilise un système d'authentification personnalisé pour consommer votre API backend Node.js réelle.

## 🔄 **Changements Récents**

Le système a été modifié pour utiliser votre API backend réelle au lieu du système local. Les principales modifications :

- ✅ **Intégration API backend** : Utilise maintenant `http://localhost:5000/api/user/login`
- ✅ **Compatibilité localStorage** : Utilise les mêmes clés que `utils/auth.js` existant
- ✅ **Service unifié** : `utils/auth.js` combine les fonctions locales et API
- ✅ **Page de test** : `/test-auth` pour tester l'intégration

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# URL de votre API backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Configuration NextAuth (optionnel)
AUTH_SECRET=your-auth-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
ALLOWED_DOMAIN=yourdomain.com
```

### 2. Structure des fichiers

```
lib/
├── api.js              # Configuration axios et intercepteurs

utils/
├── auth.js             # Service d'authentification unifié (local + API)

hooks/
└── useAuth.js          # Hook personnalisé pour l'authentification

components/
├── auth/
│   └── ProtectedRoute.jsx  # Composant de protection des routes
└── layout/
    └── UserNav.jsx         # Navigation utilisateur

app/
├── auth/
│   └── login/
│       └── page.jsx        # Page de connexion
├── dashboard/
│   └── page.jsx            # Page dashboard protégée
├── test-auth/
│   └── page.jsx            # Page de test de l'API
└── unauthorized/
    └── page.jsx            # Page d'erreur 401
```

## 🧪 **Test de l'Intégration**

### Page de test

Accédez à `http://localhost:3000/test-auth` pour tester l'intégration avec votre API backend.

Cette page permet de :
- ✅ Tester la connexion avec votre API
- ✅ Vérifier la récupération du profil
- ✅ Tester le rafraîchissement des données
- ✅ Voir les détails des réponses API
- ✅ Diagnostiquer les problèmes de connexion

## Utilisation

### 1. Service d'authentification unifié

Le fichier `utils/auth.js` combine maintenant les fonctions locales et API :

```jsx
import { authAPI, userAPI } from '@/utils/auth';

// Connexion avec l'API backend
const response = await authAPI.login(email, password);

// Vérifier l'authentification
const isAuth = authAPI.isAuthenticated();

// Obtenir l'utilisateur actuel
const user = authAPI.getCurrentUser();

// Rafraîchir les données utilisateur
const updatedUser = await authAPI.refreshUser();
```

### 2. Hook useAuth (inchangé)

Le hook `useAuth` fonctionne de la même manière :

```jsx
import { useAuth } from '@/hooks/useAuth';

export default function MonComposant() {
  const { 
    user,           // Informations utilisateur
    loading,        // État de chargement
    error,          // Erreurs
    login,          // Fonction de connexion
    logout,         // Fonction de déconnexion
    isAuthenticated, // Booléen si connecté
    hasRole,        // Vérifier un rôle
    hasPermission   // Vérifier une permission
  } = useAuth();

  // Utilisation normale
  if (loading) return <div>Chargement...</div>;
  
  return (
    <div>
      <h1>Bienvenue {user?.email}</h1>
      {hasRole('ADMIN') && <div>Contenu admin</div>}
    </div>
  );
}
```

### 3. Protection des routes (inchangée)

```jsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MaPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>Contenu protégé pour les admins</div>
    </ProtectedRoute>
  );
}
```

## 🔧 **API Backend Requise**

Votre API backend doit exposer ces endpoints :

### POST /api/user/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse attendue :**
```json
{
  "message": "Connexion réussie",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "ADMIN",
    "permissions": ["user:read", "user:write"]
  }
}
```

### GET /api/user/profile (avec token)
**Headers :**
```
Authorization: Bearer jwt_token_here
```

**Réponse attendue :**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "ADMIN",
  "permissions": ["user:read", "user:write"]
}
```

## 🚀 **Démarrage**

1. **Démarrer votre API backend** sur le port 5000
2. **Créer le fichier `.env.local`** avec la configuration
3. **Lancer le frontend** :
   ```bash
   npm run dev
   ```
4. **Tester l'intégration** :
   - Page de connexion : `http://localhost:3000/auth/login`
   - Page de test : `http://localhost:3000/test-auth`

## 🔍 **Dépannage**

### Problèmes courants :

1. **Erreur CORS** :
   - Vérifiez que votre backend autorise les requêtes depuis `http://localhost:3000`
   - Ajoutez les headers CORS appropriés

2. **Erreur 401** :
   - Vérifiez que l'endpoint `/api/user/login` fonctionne
   - Testez avec Postman ou curl

3. **Token non reçu** :
   - Vérifiez que votre API renvoie bien le token dans la réponse
   - Vérifiez le format de la réponse JSON

4. **Erreur de connexion** :
   - Utilisez la page `/test-auth` pour diagnostiquer
   - Vérifiez les logs de votre backend

### Test avec curl :

```bash
# Test de connexion
curl -X POST http://localhost:5000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test du profil (avec token)
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 **Migration depuis l'ancien système**

Si vous utilisiez l'ancien système local :

1. **Les fonctions existantes** dans `utils/auth.js` sont toujours disponibles
2. **Nouvelles fonctions API** : `authAPI` et `userAPI`
3. **Le hook useAuth** fonctionne de la même manière
4. **Pas de changement** dans vos composants existants

## 🎯 **Fonctionnalités**

- ✅ **Authentification JWT** avec votre API backend
- ✅ **Gestion des rôles** (ADMIN, RESPONSIBLE, PARENT, DRIVER)
- ✅ **Gestion des permissions** dynamiques
- ✅ **Protection des routes** automatique
- ✅ **Redirection intelligente** selon le rôle
- ✅ **Interface de test** pour diagnostiquer
- ✅ **Gestion d'erreurs** complète
- ✅ **Déconnexion automatique** sur token expiré
- ✅ **Compatibilité** avec le code existant 