# Event App - Application de Gestion d'Évènements
##  Présentation

Cette application permet de gérer des évènements avec les fonctionnalités suivantes :
- **CRUD** : Création, affichage et modification d'évènements
- **Filtrage** : Par catégorie et par date
- **Détail** : Page détaillée pour chaque évènement
- **Inscription** : Système d'inscription d'utilisateurs avec validations
- **Gestion utilisateurs** : Création d'utilisateurs avec validation d'unicité
- **Sécurité** : Simplification — l'administrateur peut créer/éditer sans authentification

##  Fonctionnalités

| Fonctionnalité | Statut | Description |
|----------------|--------|-------------|
| Création d'évènements | ✅ | Formulaire (titre, description, date, lieu, catégorie, capacité) — l'admin crée sans email |
| Modification d'évènements | ✅ | Modification possible avant la date (plus de vérification d'email requise) |
| Affichage liste | ✅ | Cartes d'évènements avec informations essentielles |
| Filtre par catégorie | ✅ | Sélection parmi conférence, sport, atelier, autre |
| Filtre par date | ✅ | Filtrage par date min/max |
| Page détail | ✅ | Modal avec toutes les informations + liste des inscrits |
| Bouton Participer | ✅ | Accès direct à l'inscription depuis la carte d'évènement |
| Inscription utilisateurs | ✅ | Formulaire nom + email (tout email valide) |
| Création utilisateurs | ✅ | Section dédiée pour créer des utilisateurs (unicité par email) |
| Validation doublons | ✅ | Empêche les inscriptions multiples du même email |
| Gestion capacité | ✅ | Affiche places restantes et bloque si complet |
| Validation date passée | ✅ | Empêche inscription aux évènements terminés |
| Validation email | ✅ | Vérifie format d'email standard (tout domaine) |
| Sécurité modification | ✅ | Vérification de l'email du créateur avant modification |

##  Arborescence

```
event-app/
│── index.html              # Page principale
│── styles/
│   └── main.css            # Styles CSS
│── src/
│   ├── models/
│   │   ├── Event.ts        # Classe Event
│   │   ├── User.ts         # Classe User
│   │   └── Registration.ts # Classe Registration
│   └── main.ts             # Logique principale
│── scripts/
│   └── start.js            # Script de lancement automatique
│── dist/                    # Fichiers JS compilés (généré)
│── package.json
│── tsconfig.json
│── .gitignore
│── README.md
```

##  Installation & Lancement

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn

### Étapes

1. **Cloner le dépôt** (ou télécharger les fichiers)
```bash
git clone <url-du-repo>
cd event-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Compiler le TypeScript**
```bash
npm run build
```

4. **Lancer l'application**
```bash
npm run start
```
Cette commande compile automatiquement le TypeScript et lance un serveur local qui s'ouvre dans votre navigateur. Le port est choisi automatiquement (8080, 8081, etc.).

**Alternative** : Ouvrir `index.html` directement dans un navigateur moderne (après compilation)

5. **Mode développement** (avec recompilation automatique)
```bash
npm run watch
```

## Mode d'utilisation

### Créer un évènement
1. Remplir le formulaire "Nouvel évènement" (titre, description, date, lieu, catégorie, capacité)
2. Cliquer sur "Ajouter"
3. L'évènement apparaît dans la liste

### Créer un utilisateur
1. Remplir le formulaire "Créer un utilisateur" (nom + email)
2. Cliquer sur "Créer"
3. L'utilisateur est enregistré (email unique requis)

### Filtrer les évènements
1. Utiliser les filtres dans la section "Filtrer les évènements"
2. Sélectionner une catégorie et/ou des dates
3. La liste se met à jour automatiquement
4. Cliquer sur "Réinitialiser" pour effacer les filtres

### Voir le détail d'un évènement
1. Cliquer sur le bouton "Détail" d'une carte d'évènement
2. Une modal s'ouvre avec toutes les informations
3. La liste des inscrits est affichée si disponible

### S'inscrire à un évènement
1. Cliquer sur le bouton **"Participer"** sur une carte d'évènement (ou "Détail" puis "S'inscrire")
2. Remplir le formulaire avec :
   - **Nom complet**
   - **Email** (format standard)
3. Cliquer sur "S'inscrire"
4. Des validations sont effectuées :
   - Email institutionnel valide
   - Évènement non terminé
   - Places disponibles
   - Pas déjà inscrit

### Modifier un évènement
1. Cliquer sur le bouton **"Modifier"** sur une carte d'évènement (disponible uniquement si l'évènement n'est pas passé)
2. Le formulaire d'édition s'affiche directement
3. Modifier les champs souhaités
4. Cliquer sur "Enregistrer"

## Tests manuels recommandés

- ✅ Créer plusieurs évènements avec différentes dates et capacités
- ✅ Créer des utilisateurs avec des emails différents
- ✅ Tenter de créer un utilisateur avec un email existant → doit être bloqué
- ✅ Tenter une inscription multiple avec le même email → doit être bloqué
- ✅ Remplir la capacité d'un évènement puis vérifier le blocage
- ✅ Essayer de s'inscrire à un évènement passé → doit être bloqué
- ✅ Modifier un évènement avec l'email du créateur → doit fonctionner
- ✅ Tenter de modifier un évènement avec un mauvais email → doit être bloqué
- ✅ Filtrer par catégorie et vérifier les résultats
- ✅ Filtrer par date min/max et vérifier les résultats
- ✅ Vérifier que `dist/main.js` est généré après compilation
- ✅ Tester `npm run start` pour le lancement automatique

##  Captures d'écran

> **À ajouter** : Insérer ici les captures d'écran de l'application
> - Page d'accueil avec liste d'évènements
> - Formulaire de création
> - Modal de détail avec inscription
> - Filtres actifs

## Architecture technique

- **Langage** : TypeScript (ES2020)
- **Compilation** : TypeScript Compiler (tsc)
- **Stockage** : Tableaux JavaScript en mémoire (POO)
- **UI** : HTML5 + CSS3 pur (sans framework)
- **Validation** : Logique métier dans les classes et fonctions utilitaires

### Classes principales

- **Event** : Représente un évènement avec ses propriétés, méthode `isPassed()` et `creatorEmail` pour la sécurité
- **User** : Représente un utilisateur avec validation d'email institutionnel et méthode statique `isValidEmail()`
- **Registration** : Lien entre un utilisateur et un évènement avec timestamp

## Notes

- Le stockage est en mémoire : les données sont perdues au rechargement de la page
- Pour persister les données, on pourrait utiliser `localStorage` (non implémenté dans cette version)
- L'application fonctionne entièrement côté client (pas de backend)

##  Auteurs

- **Nom** :Diabanza 
- **Matricule** : 242L065
- **Email** : nelly.diabanza@saintjeaningenieur.org

##  Licence

 License2 - Projet pédagogique de fin de semestre 

---

**Date de réalisation** : 23 DECEMBRE 2025

# Sandra_tp_Final_typescript
