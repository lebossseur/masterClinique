# Configuration du Service SMS

## Vue d'ensemble

Le système de gestion des rendez-vous inclut maintenant l'envoi automatique de SMS aux patients via Twilio.

## Fonctionnalités SMS

### 1. Confirmation de rendez-vous
Lorsqu'un nouveau rendez-vous est créé, un SMS de confirmation est automatiquement envoyé au patient:
```
Bonjour [Nom Patient],

Votre rendez-vous a été confirmé pour le [Date] à [Heure].

Master Clinique
```

### 2. Modification de rendez-vous
Si un rendez-vous est modifié (date ou heure), le patient reçoit un SMS:
```
Bonjour [Nom Patient],

Votre rendez-vous a été modifié.

Ancien: [Ancienne Date] à [Ancienne Heure]
Nouveau: [Nouvelle Date] à [Nouvelle Heure]

Master Clinique
```

### 3. Annulation de rendez-vous
Si un rendez-vous est annulé, le patient reçoit une notification:
```
Bonjour [Nom Patient],

Votre rendez-vous du [Date] à [Heure] a été annulé.

Pour plus d'informations, contactez-nous.

Master Clinique
```

## Configuration Twilio

### Étape 1: Créer un compte Twilio

1. Allez sur [https://www.twilio.com/](https://www.twilio.com/)
2. Créez un compte gratuit (crédit d'essai inclus)
3. Vérifiez votre numéro de téléphone

### Étape 2: Obtenir vos identifiants

1. Connectez-vous à votre console Twilio
2. Accédez au Dashboard
3. Copiez les informations suivantes:
   - **Account SID**
   - **Auth Token**

### Étape 3: Obtenir un numéro Twilio

1. Dans la console Twilio, allez dans "Phone Numbers"
2. Cliquez sur "Buy a Number"
3. Sélectionnez un numéro avec capacité SMS
4. Achetez le numéro (compte d'essai: gratuit)

### Étape 4: Configurer le fichier .env

Modifiez le fichier `backend/.env` avec vos identifiants:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
SMS_ENABLED=true
```

**Important:**
- `TWILIO_ACCOUNT_SID`: Commence par "AC"
- `TWILIO_AUTH_TOKEN`: Token d'authentification de 32 caractères
- `TWILIO_PHONE_NUMBER`: Numéro Twilio au format international (+...)
- `SMS_ENABLED`: Mettre `false` pour désactiver les SMS

### Étape 5: Redémarrer le serveur

```bash
cd backend
npm run dev
```

## Mode Développement (Sans Twilio)

Si vous souhaitez tester sans configurer Twilio:

1. Dans le fichier `.env`, configurez:
```env
SMS_ENABLED=false
```

2. Les messages SMS seront affichés dans la console backend au lieu d'être envoyés

## Utilisation dans l'application

### Créer un rendez-vous avec SMS

1. Allez dans **Rendez-vous**
2. Cliquez sur **Nouveau Rendez-vous**
3. Remplissez le formulaire
4. Cochez **"Envoyer un SMS de confirmation au patient"**
5. Cliquez sur **Créer**

Le patient recevra automatiquement un SMS de confirmation.

### Modifier un rendez-vous avec SMS

1. Dans la liste des rendez-vous, cliquez sur l'icône **Éditer**
2. Modifiez la date/heure ou le statut
3. Cochez **"Envoyer un SMS de confirmation au patient"**
4. Cliquez sur **Modifier**

Si la date/heure change, le patient reçoit un SMS de modification.
Si le statut devient "Annulé", le patient reçoit un SMS d'annulation.

## Format des numéros de téléphone

- Les numéros ivoiriens seront automatiquement convertis au format international (+225)
- Exemple: `0708090605` devient `+2250708090605`
- Pour d'autres pays, ajustez le code dans `backend/src/services/sms.service.js`

## Tarification Twilio

### Compte d'essai
- Crédit gratuit: ~15 USD
- Peut envoyer des SMS uniquement aux numéros vérifiés
- Préfixe dans le message: "Sent from your Twilio trial account"

### Compte payant
- SMS sortants (Côte d'Ivoire): ~0.05 USD par SMS
- Coût mensuel du numéro: ~1 USD
- Pas de préfixe dans les messages

## Dépannage

### Les SMS ne sont pas envoyés

1. Vérifiez que `SMS_ENABLED=true` dans `.env`
2. Vérifiez vos identifiants Twilio
3. Vérifiez que le numéro Twilio est au bon format (+...)
4. Consultez les logs du backend pour les erreurs
5. Pour un compte d'essai, vérifiez que le numéro du patient est vérifié dans Twilio

### Erreur "Invalid phone number"

- Assurez-vous que le patient a un numéro de téléphone valide
- Le numéro doit être au format international ou sera converti en +225

### Les messages sont en double

- Vérifiez que vous ne créez/modifiez le rendez-vous qu'une seule fois
- Regardez les logs du backend

## Logs

Les logs SMS apparaissent dans la console backend:
```
SMS envoyé avec succès: SM... [SID du message]
```

Ou en mode désactivé:
```
SMS désactivé. Message qui aurait été envoyé:
À: +2250708090605
Message: Bonjour John Doe, ...
```

## Alternatives à Twilio

Le service SMS est modulaire. Vous pouvez facilement intégrer:
- **InfoBip** (populaire en Afrique)
- **Africa's Talking**
- **Nexmo/Vonage**

Modifiez simplement `backend/src/services/sms.service.js` pour utiliser leur API.

## Support

Pour toute question concernant la configuration SMS, consultez:
- Documentation Twilio: https://www.twilio.com/docs/sms
- Support Twilio: https://support.twilio.com/
