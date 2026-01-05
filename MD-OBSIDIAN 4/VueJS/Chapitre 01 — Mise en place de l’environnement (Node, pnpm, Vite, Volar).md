---
title: Chapitre 01 — Mise en place de l’environnement (Node, pnpm, Vite, Volar)
tags: [Vue.js, Vue 3, Formation, Débutant]
---


# 📘 Chapitre 01 — Mise en place de l’environnement (Node, pnpm, Vite, Volar)

🎯 **Objectifs**
- Installer **Node LTS**, choisir **npm/pnpm**, créer un projet **Vite + Vue 3**.
- Configurer **VS Code** avec **Volar**, ESLint et Prettier.
- Comprendre la **structure** et les **scripts** d’un projet.

🧰 **Outils**
- **Node.js LTS** (>= 18 recommandé)
- **pnpm** (rapide, workspace) ou **npm**
- **Vite** (dev server ultra rapide) + **Rollup** (build)
- **VS Code** + extension **Volar** (support Vue SFC)

🛠️ **Création du projet**
```bash
# Avec npm
npm create vite@latest my-vue-app -- --template vue-ts
cd my-vue-app
npm install
npm run dev

# Avec pnpm
pnpm create vite my-vue-app --template vue-ts
cd my-vue-app
pnpm install
pnpm dev
```

📁 **Structure générée (exemple)**
```
my-vue-app/
├─ index.html
├─ src/
│  ├─ main.ts
│  ├─ App.vue
│  ├─ assets/
│  └─ components/
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
└─ node_modules/
```

⚙️ **Configuration utile**
- **Alias `@/`** dans `vite.config.ts` :
```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```
- **Variables d’environnement** (`.env`, `.env.production`) :
```ini
VITE_API_BASE_URL=https://api.example.com
```
  Utilisation :
```ts
const baseUrl = import.meta.env.VITE_API_BASE_URL
```

⚠️ **Pièges**
- Version Node trop ancienne → erreurs d’import ESM.
- Oublier d’installer **Volar** et **TypeScript** pour l’IntelliSense.
- Confondre `dev` (non optimisé) et `build` (optimisé) dans les mesures de perf.

✅ **Bonnes pratiques**
- Activer **ESLint + Prettier** dès le départ.
- Utiliser **pnpm** pour des installs plus rapides et reproductibles.
- Garder une **convention de chemins** (`@/`) pour éviter le spaghetti d’imports.

🧩 **Exercice**
- Créez un projet, ajoutez l’alias `@/`, et injectez une variable d’API via `.env`.

📝 **Résumé essentiel**
- Vite fournit un **dev server rapide**, TypeScript améliore la **robustesse**.
- Les **alias** et **.env** simplifient les imports et la configuration.
- VS Code + **Volar** = meilleure expérience de dev pour les **SFC**.


## 🧭 Légende des icônes
- 📘 **Chapitre**
- 🎯 **Objectifs**
- 🧠 **Concept clé**
- 🔍 **Pourquoi ?**
- 🧪 **Exemple**
- 💡 **Analogie**
- ⚠️ **Pièges**
- ✅ **Bonnes pratiques**
- 🛠️ **Mise en pratique**
- 🧩 **Exercice**
- 📝 **Récap**
- 🔗 **Ressources**
- 🧰 **Outils**
- 🔒 **Sécurité**
- 🚀 **Déploiement**
- 🧪🧰 **Tests & Qualité**
- 🌐 **i18n**
- 🧭 **Architecture**
- ⚙️ **Tooling**
- 📊 **Performance**
- 🧱 **Interop**
