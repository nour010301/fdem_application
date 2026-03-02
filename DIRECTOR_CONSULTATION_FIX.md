# Fix for Director Consultation - Multiple Periods Issue

## Problem Description
The issue was that "TALIDJ Brahim" has two separate periods in the data:
- Period 1: 2015-05-22 to 2015-09-09 (idDirecteur: 16)
- Period 2: 2026-01-30 to 2027-01-30 (idDirecteur: 16)

But the consultation modal was only showing one row per person instead of showing all their individual periods.

## Root Cause
The consultation logic was likely grouping directors by name/ID instead of showing all their individual periods as separate rows.

## Solution Applied

### 1. Template Changes (Already Applied)
- Fixed the key generation in the consultation table to use index for uniqueness
- Added CSS classes for visual grouping of director periods
- Enhanced display to show period indicators for additional periods

### 2. CSS Styles Added
```css
.director-first-period {
  border-top: 2px solid #43E97B;
}

.director-additional-period {
  background: rgba(67, 233, 123, 0.05);
  border-left: 3px solid #43E97B;
}

.director-additional-period td:first-child {
  padding-left: 20px;
  font-style: italic;
  color: #666;
  font-size: 0.9rem;
}
```

### 3. JavaScript Functions to Add
You need to add these functions to your AddDocView.vue script section:

```javascript
// Function to get CSS class for director rows
function getDirectorRowClass(row, index, allRows) {
  if (index === 0) return 'director-first-period';
  
  const currentDirector = row.nomPrenomDirecteur || '';
  const previousDirector = allRows[index - 1]?.nomPrenomDirecteur || '';
  
  if (currentDirector === previousDirector) {
    return 'director-additional-period';
  }
  
  return 'director-first-period';
}

// Function to get display name for directors
function getDirectorDisplayName(row, index, allRows) {
  if (index === 0) return row.nomPrenomDirecteur || '';
  
  const currentDirector = row.nomPrenomDirecteur || '';
  const previousDirector = allRows[index - 1]?.nomPrenomDirecteur || '';
  
  if (currentDirector === previousDirector) {
    let periodCount = 1;
    for (let i = 0; i < index; i++) {
      if (allRows[i].nomPrenomDirecteur === currentDirector) {
        periodCount++;
      }
    }
    return `↳ Période ${periodCount}`;
  }
  
  return currentDirector;
}
```

### 4. Backend Consultation Function
Make sure your consultation function for direction_projet doesn't group the data:

```javascript
async function consultDirectionProjet() {
  contextConsulter.value.loading = true;
  contextConsulter.value.error = '';
  contextConsulter.value.visible = true;
  contextConsulter.value.entityKey = 'direction_projet';
  contextConsulter.value.entityLabel = 'Direction du Projet';
  contextConsulter.value.columns = ['Nom', 'Fonction', 'Téléphone', 'Date Début', 'Date Fin'];
  contextConsulter.value.columnKeys = ['nomPrenomDirecteur', 'fonction', 'telephone', 'date_deb', 'date_fin'];

  try {
    if (!selectedProduitId.value) {
      throw new Error('Aucun produit sélectionné');
    }

    const response = await axiosInstance.get(`direction-projet/by-produit/${selectedProduitId.value}`);
    
    // KEY FIX: Don't group by director, show ALL periods as separate rows
    const allPeriods = response.data || [];
    
    // Sort by director name and then by date
    const sortedPeriods = allPeriods.sort((a, b) => {
      const nameA = a.nomPrenomDirecteur || '';
      const nameB = b.nomPrenomDirecteur || '';
      
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }
      
      const dateA = new Date(a.date_deb || '1900-01-01');
      const dateB = new Date(b.date_deb || '1900-01-01');
      return dateA - dateB;
    });

    contextConsulter.value.data = sortedPeriods;
    
  } catch (error) {
    console.error('Erreur lors de la consultation direction projet:', error);
    contextConsulter.value.error = 'Erreur lors du chargement des données';
  } finally {
    contextConsulter.value.loading = false;
  }
}
```

## Expected Result
After applying this fix:
1. "TALIDJ Brahim" will appear twice in the consultation table
2. The first row will show "TALIDJ Brahim" with his first period (2015-05-22 to 2015-09-09)
3. The second row will show "↳ Période 2" with his second period (2026-01-30 to 2027-01-30)
4. The second row will have a visual indicator (indentation and different background) to show it's an additional period

## Files Modified
1. `AddDocView.vue` - Template and CSS changes applied
2. `DirectorConsultationFunctions.js` - JavaScript functions to integrate
3. `DirectorConsultationFix.js` - Complete fix documentation

## Integration Steps
1. Copy the JavaScript functions from `DirectorConsultationFunctions.js` into your AddDocView.vue script section
2. Update your consultation function to use the new `consultDirectionProjet` function
3. Test with "TALIDJ Brahim" data to verify both periods are displayed

The fix ensures that each period is treated as a separate row while providing visual grouping to show they belong to the same director.