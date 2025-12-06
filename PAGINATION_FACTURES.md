# Pagination de la Liste des Factures

## Fonctionnalité ajoutée

La liste des factures sur la page "Caisse et Facturation" dispose maintenant d'une pagination complète pour faciliter la navigation lorsqu'il y a beaucoup de factures.

## Caractéristiques

### 1. Navigation par pages
- **Boutons précédent/suivant**: Naviguez facilement entre les pages
- **Numéros de pages**: Cliquez directement sur un numéro de page
- **Pages visibles**: Affiche jusqu'à 5 numéros de pages à la fois
- **Pages centrées**: La page actuelle est toujours au centre si possible

### 2. Sélecteur d'éléments par page
Choisissez le nombre de factures à afficher par page:
- 5 factures
- 10 factures (par défaut)
- 20 factures
- 50 factures
- 100 factures

### 3. Informations d'affichage
Affiche clairement:
- Le nombre d'éléments affichés sur la page actuelle
- Le nombre total de factures
- Exemple: "Affichage 1 à 10 sur 47 factures"

## Interface utilisateur

### En bas du tableau des factures:

```
┌─────────────────────────────────────────────────────────┐
│ Affichage 1 à 10 sur 47 factures                      │
│                                                          │
│  Par page: [10 ▼]  [◄] [1] [2] [3] [4] [5] [►]       │
└─────────────────────────────────────────────────────────┘
```

- **Gauche**: Information sur les éléments affichés
- **Droite**:
  - Sélecteur du nombre par page
  - Bouton précédent (grisé sur la première page)
  - Numéros de pages (la page actuelle en bleu)
  - Bouton suivant (grisé sur la dernière page)

## Détails techniques

### Code frontend (Invoices.js)

**États ajoutés:**
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

**Calcul de la pagination:**
```javascript
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);
```

**Icônes importées:**
```javascript
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
```

### Comportement

1. **Changement du nombre par page**:
   - Réinitialise à la page 1
   - Recalcule le nombre total de pages
   - Met à jour l'affichage

2. **Navigation**:
   - Le bouton "Précédent" est désactivé sur la page 1
   - Le bouton "Suivant" est désactivé sur la dernière page
   - Les numéros de pages s'adaptent dynamiquement

3. **Affichage intelligent**:
   - Affiche jusqu'à 5 numéros de pages
   - Centre la page actuelle
   - Ajuste automatiquement aux extrémités

## Exemples d'utilisation

### Scénario 1: 47 factures avec 10 par page
```
Pages disponibles: 5 pages (47 / 10 = 4.7 → 5 pages)
Affichage par page:
- Page 1: Factures 1-10
- Page 2: Factures 11-20
- Page 3: Factures 21-30
- Page 4: Factures 31-40
- Page 5: Factures 41-47 (7 factures)
```

### Scénario 2: 200 factures avec 20 par page
```
Pages disponibles: 10 pages
Sur la page 1: Affiche numéros [1] [2] [3] [4] [5]
Sur la page 5: Affiche numéros [3] [4] [5] [6] [7]
Sur la page 10: Affiche numéros [6] [7] [8] [9] [10]
```

### Scénario 3: Moins de 10 factures
```
Avec 7 factures et 10 par page:
- Une seule page
- Affiche "Affichage 1 à 7 sur 7 factures"
- Boutons de navigation désactivés
```

## Avantages

✅ **Performance**: Affiche seulement les factures nécessaires
✅ **Ergonomie**: Navigation intuitive et rapide
✅ **Flexibilité**: Ajustez le nombre d'éléments selon vos besoins
✅ **Visibilité**: Informations claires sur la position dans la liste
✅ **Responsive**: S'adapte aux petits écrans avec flexwrap

## Styling

### Couleurs
- Page active: Bleu (#3b82f6) avec texte blanc
- Pages inactives: Blanc avec bordure grise
- Texte d'information: Gris (#6b7280)

### Espacement
- Padding: 1rem 1.5rem
- Gap entre éléments: 0.5rem - 1rem
- Border top: 1px solid #e5e7eb

### Boutons
- Border radius: 0.375rem
- Min-width pour numéros: 2rem
- Opacity réduite quand désactivé: 0.5
- Curseur: not-allowed quand désactivé

## État persistant

⚠️ **Note**: La pagination se réinitialise quand:
- Vous rechargez la page
- Vous changez le nombre d'éléments par page
- Vous créez une nouvelle facture

La page actuelle et le nombre par page ne sont PAS sauvegardés dans localStorage (pour l'instant).

## Améliorations futures possibles

1. **Sauvegarder les préférences**: localStorage pour mémoriser le nombre par page
2. **Recherche/filtrage**: Combiner avec une barre de recherche
3. **Tri**: Permettre de trier les factures avant pagination
4. **URL params**: Partager un lien vers une page spécifique
5. **Pagination serveur**: Pour >1000 factures, paginer côté backend

## Code modifié

**Fichier**: `frontend/src/pages/Invoices.js`

**Lignes modifiées**:
- Ligne 3: Ajout des icônes FaChevronLeft, FaChevronRight
- Lignes 27-29: Ajout des états currentPage et itemsPerPage
- Lignes 401-454: Logique de pagination dans le tbody
- Lignes 460-571: Interface de pagination complète

## Test

Pour tester la pagination:

1. Ouvrez l'application: http://localhost:3000
2. Allez dans "Caisse et Facturation"
3. Si vous avez plus de 10 factures:
   - Vous verrez la pagination en bas du tableau
   - Cliquez sur les numéros de pages
   - Changez le nombre par page
   - Utilisez les flèches pour naviguer

## Date d'ajout

**06 décembre 2025**

---

✅ **La liste des factures est maintenant paginée pour une meilleure expérience utilisateur!**
