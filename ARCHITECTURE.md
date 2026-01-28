# Documentation Technique - ZenCalendar Availability

Cette documentation décrit l'architecture du code pour faciliter sa compréhension et sa modification par une IA ou un développeur.

## Stack Technique
- **Framework** : React 19.
- **Langage** : TypeScript (TSX).
- **Style** : Tailwind CSS (via CDN).
- **IA** : Google GenAI SDK (Gemini).
- **Build Tool** : Vite (Nécessaire pour la production).

## Structure du Projet

### 1. Configuration & Build
- **`package.json`** : Dépendances et scripts (`npm run build`).
- **`vite.config.ts`** : Configuration de la compilation.
- **`tsconfig.json`** : Règles TypeScript.
- **`.htaccess`** : Configuration serveur Apache pour le routage.

### 2. Services (Logique Métier) - `services/`
- **`dateUtils.ts`** : Génération de la grille et formatage ISO.
- **`icalService.ts`** : Parsing et génération iCal.
- **`geminiService.ts`** : Intégration IA pour le parsing langage naturel.

### 3. Composants UI - `components/`
- **`MonthView.tsx`** : Affiche le mois avec les diagonales visuelles (Check-in/Check-out).
- **`YearView.tsx`** : Vue annuelle.
- **`SmartScheduler.tsx`** : Saisie IA.
- **`Button.tsx`** : UI générique.

### 4. Contrôleur Principal - `App.tsx`
Orchestre l'état global (`events`, `currentDate`, `selectionStart`).

## Déploiement sur Apache (Debian)

L'application ne peut pas être copiée "telle quelle" (fichiers .tsx).

1. **Localement** :
   - `npm install`
   - `npm run build`
2. **Sur le serveur** :
   - Copier le contenu du dossier `dist/` généré vers `/var/www/html/`.
   - S'assurer que le fichier `.htaccess` est présent pour gérer le routage.
