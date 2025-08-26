# Suppression Permission Implementation

## What was implemented:

### 1. Users View (UsersView.vue)
- Added "Supprimer documents" column to the users table
- Added checkbox in the permissions step of user creation/editing modal
- Updated the User interface to include `suppression` property
- Updated all permission handling to include the suppression permission

### 2. Documents View (Documents.vue)
- Added conditional rendering for the delete button based on user permissions
- Only users with `suppression: true` or admin informatique (profil: 2) can see the delete button
- Added `canDeleteDocuments` computed property

### 3. User Store (userStore.ts)
- Added `suppression` property to the UserProfile interface

## How it works:

### Backend Data Structure
The user object from backend should include:
```javascript
{
  id: 36,
  username: "m",
  email: "z.araar@gmail.com",
  nom: "ara",
  prenom: "zei",
  // ... other properties
  suppression: true,  // This is the key property
  impression: false,
  telechargement: false,
  plan: false
}
```

### Frontend Usage in Documents View
```vue
<!-- Delete button only shows if user has permission -->
<button 
  v-if="canDeleteDocuments" 
  class="action-btn delete-btn" 
  @click="confirmDelete(document)" 
  title="Supprimer"
>
  🗑️
</button>
```

### Permission Logic
```javascript
const canDeleteDocuments = computed(() => {
  return userStore.user.value?.profil === 2 || userStore.user.value?.suppression || false
})
```

## User Experience:
1. **Admin Informatique (profil: 2)**: Can always see delete buttons
2. **Users with suppression: true**: Can see delete buttons
3. **Users with suppression: false/null**: Cannot see delete buttons
4. **In Users management**: Admins can set the "Supprimer documents" permission for each user

## Testing:
1. Login with a user that has `suppression: true`
2. Go to Documents view
3. You should see the delete (🗑️) button in the Actions column
4. Login with a user that has `suppression: false` or `null`
5. The delete button should not be visible

## Backend Integration:
Make sure your backend API:
1. Returns the `suppression` field in user profile responses
2. Accepts the `suppression` field when updating user permissions
3. The endpoint `http://10.10.150.75:8000/api/utilisateurs/update-produits-types/` should handle the suppression field