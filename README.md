# Bot Discord - Modération

Ce bot Discord permet de gérer les actions de modération sur un serveur, telles que bannir, expulser, muter, avertir et supprimer des messages. Il inclut également un système de détection de spam et de contenu offensant.

## Commandes disponibles

- `/ban`: Bannir un utilisateur du serveur.
- `/kick`: Expulser un utilisateur du serveur.
- `/mute`: Rendre un utilisateur muet pour un certain temps.
- `/unmute`: Annuler le mute d'un utilisateur.
- `/warn`: Avertir un utilisateur avec une raison.
- `/clear`: Supprimer un certain nombre de messages.

## Fonctionnalités supplémentaires

- Système de logs pour chaque action de modération effectuée.
- Détection et suppression de messages contenant des mots offensants.
## Installation

### Prérequis

- Node.js (version 16 ou supérieure)
- Un serveur Discord
- Un token d'application Discord et un ID de client (disponibles via [Discord Developer Portal](https://discord.com/developers/applications))

### Étapes d'installation

1. Clonez ce dépôt ou téléchargez les fichiers sur votre machine.
2. Installez les dépendances avec la commande suivante :

   ```bash
   npm install discord.js dotenv
   ```
3. Mettre votre token, votre id client de votre [bot](https://discord.com/developers/applications) dans le .env après le égal ex ID_CLIENT=votr_id_client 

4. Lancer votre bot en faisant 

```bash
node index.js
```

5. Facultatif. Supprimer l'inutile

Vous pouvez supprimer 
README.MD

### Rappels 

Vous avez le droit de modifier et d'utiliser le code du bot. Mais toujours me mentionner.

**Merci**