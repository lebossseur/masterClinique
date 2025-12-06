# Fonctionnalité : Actes Médicaux Multiples par Consultation

## Description

Le système permet maintenant d'ajouter **plusieurs actes médicaux** pour une même consultation. Tous ces actes figureront sur la **même facture** avec un calcul automatique du total.

## Fonctionnalités

### 1. Sélection Multiple d'Actes

- **Interface intuitive** : Liste déroulante avec tous les actes médicaux actifs
- **Ajout dynamique** : Bouton "+ Ajouter" pour ajouter un acte à la liste
- **Prévention des doublons** : Impossible d'ajouter le même acte deux fois
- **Suppression facile** : Bouton de suppression pour chaque acte ajouté

### 2. Calcul Automatique

Pour chaque acte ajouté, le système calcule automatiquement :
- **Prix de base** : Tarif standard de l'acte
- **Part assurance** : Montant pris en charge selon le taux de couverture
- **Part patient** : Montant restant à la charge du patient

### 3. Gestion de l'Assurance

- **Recalcul automatique** : Quand l'assurance change, tous les actes sont recalculés
- **Taux de couverture dynamique** : Prise en compte du taux spécifique par acte si disponible
- **Affichage détaillé** : Montants clairs pour chaque acte et pour le total

### 4. Récapitulatif Total

En bas de la liste des actes sélectionnés :
- **Total Base** : Somme de tous les prix de base
- **Total Pris en Charge** : Somme de ce que l'assurance couvre
- **Total à Payer** : Montant final que le patient doit payer

## Comment Utiliser

### Étape par Étape

1. **Arriver à l'étape 3** (Informations de Consultation)
2. **Sélectionner l'assurance** du patient (optionnel)
3. **Choisir un acte médical** dans la liste déroulante
4. **Cliquer sur "+ Ajouter"**
5. **Répéter** les étapes 3-4 pour ajouter d'autres actes
6. **Vérifier** le récapitulatif des actes et le total
7. **Continuer** vers l'étape 4 (Affectation Caisse)

### Exemple Concret

**Scénario** : Un patient vient pour plusieurs soins

1. Sélectionner "Consultation Générale" → Ajouter
2. Sélectionner "Radiographie" → Ajouter
3. Sélectionner "Examens Médicaux" → Ajouter

**Résultat** : La facture contiendra les 3 actes avec :
- Calcul individuel pour chaque acte
- Total global de la consultation
- Répartition claire assurance/patient

## Interface Utilisateur

### Liste des Actes Sélectionnés

Chaque acte affiché montre :
```
[Nom de l'Acte]
Prix: X FCFA | Assurance: Y FCFA | Patient: Z FCFA [Supprimer]
```

### Récapitulatif Total

```
┌─────────────────────────────────────────┐
│ Total Base       : 15,000 FCFA          │
│ Pris en Charge   : 12,000 FCFA (80%)    │
│ À Payer          :  3,000 FCFA          │
└─────────────────────────────────────────┘
```

## Validation

- **Minimum 1 acte** : Impossible de continuer sans au moins un acte sélectionné
- **Bouton désactivé** : Le bouton "Continuer" est grisé tant qu'aucun acte n'est ajouté

## Avantages

### Pour la Clinique
- ✅ **Facturation précise** : Tous les actes sur une même facture
- ✅ **Gain de temps** : Plus besoin de créer plusieurs factures
- ✅ **Traçabilité** : Historique complet des actes par consultation
- ✅ **Comptabilité simplifiée** : Une facture = une transaction

### Pour le Patient
- ✅ **Transparence** : Vue claire de tous les coûts
- ✅ **Simplicité** : Une seule facture à régler
- ✅ **Détails assurance** : Comprend ce que l'assurance paie

## Données Techniques

### Structure des Actes Sélectionnés

```javascript
selectedServices = [
  {
    service_code: "CONSULTATION_GENERALE",
    service_name: "Consultation Générale",
    base_price: 5000,
    insurance_covered: 4000,
    patient_pays: 1000
  },
  {
    service_code: "RADIOGRAPHIE",
    service_name: "Radiographie",
    base_price: 10000,
    insurance_covered: 8000,
    patient_pays: 2000
  }
]
```

### Calcul du Total

```javascript
totalPricing = {
  base_total: 15000,        // 5000 + 10000
  insurance_covered: 12000,  // 4000 + 8000
  patient_pays: 3000         // 1000 + 2000
}
```

## Notes Importantes

1. **Base de données** : La structure `invoice_items` existe déjà et supporte plusieurs lignes par facture
2. **Backend compatible** : Le système d'admission doit être mis à jour pour enregistrer plusieurs actes
3. **Calcul dynamique** : Les prix sont recalculés en temps réel si l'assurance change

## Prochaines Étapes (Si Nécessaire)

1. Mettre à jour l'API d'admission pour accepter plusieurs actes
2. Modifier le controller d'admission pour créer les lignes de facture
3. Tester le flux complet de bout en bout
