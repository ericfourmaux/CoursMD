
# 🖥️ Chapitre 2 — Installation & Environnement

> [!NOTE] Objectifs du chapitre
> - Installer Node.js de façon **fiable et reproductible** (recommandation : **nvm**).
> - Comprendre les outils **`node`**, **`npm`** et **`npx`** et vérifier leurs versions.
> - Poser la **structure d’un projet** Node propre (dossiers, `package.json`, `.gitignore`).
> - Introduire des **scripts npm** et des **bonnes pratiques** dès le départ.
> - Inclure quelques **formules/théories en JavaScript** utiles (contrôles de version, etc.).

---

## 2.1 🔧 Choisir une méthode d’installation

La méthode recommandée pour les environnements de développement est d’utiliser un **gestionnaire de versions** (Version Manager) tel que **`nvm`** (macOS/Linux, WSL) ou **`nvm-windows`** (Windows). Cela permet d’installer **plusieurs versions** de Node et de **basculer** facilement selon les projets. Cette approche est **fortement recommandée** par la documentation npm. citeturn4search5

- **Téléchargements officiels** (installateurs) : disponibles sur le site de Node.js. Préférez la **version LTS** pour la stabilité. citeturn4search4
- **`nvm` (macOS/Linux/WSL)** : projet officiel pour shells POSIX. citeturn4search10
- **`nvm-windows` (Windows natif)** : gestionnaire recommandé pour Windows (non identique à `nvm`). citeturn4search16

> [!WARNING] Évitez le Node des **dépôts système** par défaut (ex: `apt-get install nodejs`), souvent **ancien**. Utilisez les **binaires officiels** ou un gestionnaire de versions. citeturn4search9

---

## 2.2 🐧 Installer `nvm` (macOS/Linux/WSL)

1. **Télécharger & installer `nvm`** :
   ```sh
   # Via curl
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   # ou via wget
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```
   > Rechargez votre shell : `source ~/.bashrc` ou `source ~/.zshrc`.
   > Consultez le README pour les détails et autres options d’installation. citeturn4search10turn4search12

2. **Activer `nvm` dans le shell courant** (si besoin) :
   ```sh
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # charge nvm
   [ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # complétion
   ```
   > Cette séquence provient des instructions d’installation typiques. citeturn4search12

3. **Installer Node LTS** :
   ```sh
   nvm install --lts
   nvm use --lts
   node -v
   npm -v
   ```
   > `--lts` installe et sélectionne la **dernière LTS** disponible. citeturn4search13

---

## 2.3 🪟 Installer `nvm-windows` (Windows natif)

1. **Télécharger l’installateur** : rendez-vous sur la page GitHub et cliquez sur **Download Now!** puis récupérez le **`nvm-setup.exe`** de la dernière release. citeturn4search16turn4search21
2. **Désinstaller** toute installation Node existante **avant** d’installer `nvm-windows`. citeturn4search16
3. **Installer puis vérifier** :
   ```powershell
   nvm version
   nvm install lts
   nvm use lts
   node -v
   npm -v
   ```
   > Les releases récentes corrigent des problèmes de chemins et fournissent l’installateur mis à jour. citeturn4search21

> [!TIP] Astuce
> Sur Windows, `nvm-windows` nécessite souvent des **droits administrateur** pour créer les **symlinks**. citeturn4search16

---

## 2.4 ✅ Vérifier l’installation

Exécutez :
```sh
node -v
npm -v
```
Ces commandes confirment que Node et npm sont bien installés (recommandation officielle npm). citeturn4search5

> [!INFO] LTS & cycle de vie
> Choisissez une **version LTS** pour la prod. Le **calendrier des LTS** est public (ex: Node 24 marqué **Active LTS** fin 2025). citeturn4search8

---

## 2.5 🔤 Comprendre `node`, `npm`, `npx`

- **`node`** : exécute du JavaScript côté serveur (fichiers `.js`, REPL).  
- **`npm`** : gestionnaire de paquets (installe, met à jour, publie des packages). La doc recommande un **version manager** pour l’installation. citeturn4search5  
- **`npx`** : exécute un **binaire de package** sans installation globale (utile pour `create-*`).

> [!WARNING] Global vs local
> Évitez d’installer globalement des outils si possible (`npm i -g`). Préférez `npx` pour une exécution ponctuelle ou des **scripts npm**.

---

## 2.6 🗂️ Structure d’un projet Node (propre & minimale)

Arborescence recommandée :
```
mon-projet/
  ├─ src/
  │   └─ index.js
  ├─ test/
  ├─ .gitignore
  ├─ package.json
  ├─ README.md
  └─ .env           # variables d'environnement (non commit)
```

**Créer le projet** :
```sh
mkdir mon-projet && cd mon-projet
npm init -y
```

**`.gitignore`** (exemple) :
```
node_modules/
.env
coverage/
dist/
.DS_Store
```

**`package.json`** (exemple commenté) :
```json
{
  "name": "mon-projet-node",
  "version": "1.0.0",
  "description": "Projet Node de base",
  "type": "module", // Active les ES Modules (import/export)
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node test/run-tests.js"
  },
  "keywords": ["node", "exemple"],
  "author": "Eric Fourmaux",
  "license": "MIT"
}
```

> [!TIP] ESM vs CJS
> En définissant `"type": "module"`, vous utilisez **ESM** (`import/export`). Sans ce champ, Node suppose **CommonJS** (`require/module.exports`). Le chapitre 5 détaillera les différences.

---

## 2.7 ▶️ Fichier d’entrée & scripts npm

**`src/index.js`** :
```js
console.log(`[${new Date().toISOString()}] Démarrage…`);
console.log('Node version:', process.versions.node);
console.log('Plateforme:', process.platform);
```

Lancer :
```sh
npm run start   # exécute src/index.js
npm run dev     # relance automatiquement avec --watch
```

> [!NOTE]
> Les **scripts npm** permettent d’encapsuler vos commandes (dev, build, test), de les **standardiser** et de les **documenter** pour l’équipe.

---

## 2.8 🔐 Variables d’environnement (`.env`) & configuration

Node lit les variables via **`process.env`**. Exemple :
```js
// src/config.js
export const config = {
  port: Number(process.env.PORT ?? 3000),
  env: process.env.NODE_ENV ?? 'development',
};
```

> [!WARNING]
> Ne **committez pas** le fichier `.env`. Utilisez `.env.example` pour montrer les clés attendues, et chargez `.env` via un outil (ex: `dotenv`) plus tard dans le cours.

---

## 2.9 🧮 Mini-théories/formules en JavaScript

### 2.9.1 Vérifier qu’une version Node **minimale** est respectée

```js
/**
 * Compare des versions semver au format "MAJOR.MINOR.PATCH".
 * Retourne true si current >= required.
 */
function isVersionAtLeast(required, current) {
  const toNums = v => v.split('.').map(n => parseInt(n, 10));
  const [rM, rm, rp] = toNums(required);
  const [cM, cm, cp] = toNums(current);
  if (cM !== rM) return cM > rM;
  if (cm !== rm) return cm >= rm;
  return cp >= rp;
}

const required = '18.0.0';
const current = process.versions.node; // ex: '20.11.1'
console.log(`Node >= ${required} ?`, isVersionAtLeast(required, current));
```

> [!TIP]
> Placez cette vérification au **démarrage** pour informer l’utilisateur en cas de version insuffisante.

### 2.9.2 Détecter ESM/CommonJS automatiquement

```js
// En ESM ("type": "module"), import.meta.url est défini
export function isESM() {
  return typeof import.meta !== 'undefined' && typeof import.meta.url === 'string';
}

// En CJS, module.exports est défini
function isCJS() {
  return typeof module !== 'undefined' && !!module.exports;
}

console.log('ESM ?', isESM());
console.log('CJS ?', isCJS());
```

### 2.9.3 Mesurer la **durée** d’un script (latence de démarrage)

```js
const t0 = performance.now?.() ?? Date.now();
// … exécutions …
const t1 = performance.now?.() ?? Date.now();
console.log(`Temps (ms):`, t1 - t0);
```

---

## 2.10 ⚠️ Pièges & bonnes pratiques

- **Utilisez `nvm`/`nvm-windows`** pour éviter les conflits et gérer les mises à jour proprement (recommandation npm). citeturn4search5
- **Préférez LTS** pour la prod; testez régulièrement sur la **Current** pour anticiper (release WG). citeturn4search8
- **Évitez `sudo npm i -g`** : privilégiez l’environnement utilisateur ou `npx`.
- **Ne mélangez pas** ESM/CJS sans comprendre les interops (voir Chapitre 5).
- **Ne commitez pas** de secrets (`.env`, clés, tokens). Ajoutez un `.env.example`.

---

## 2.11 🧭 Questions de compréhension

1. Pourquoi un **version manager** est-il recommandé pour Node ?  
2. Quels sont les avantages de **LTS** par rapport à **Current** ?  
3. Quelle est la différence entre **`npm`** et **`npx`** ?  
4. Que contient typiquement un **`.gitignore`** pour un projet Node ?

---

## 2.12 🧩 Check-list de fin de chapitre

- [x] J’ai installé Node avec `nvm`/`nvm-windows` et je peux **basculer** de version.  
- [x] Je sais vérifier `node -v` et `npm -v`.  
- [x] Mon projet a une **structure propre** (`src/`, `test/`, `.gitignore`, `package.json`).  
- [x] Je sais créer des **scripts npm** (`start`, `dev`, `test`).

---

## 2.13 📘 Résumé des points essentiels

- La méthode **fiable** pour un dev environnement : **`nvm` / `nvm-windows`**. citeturn4search5  
- **Installez la LTS** et **basculez** avec `nvm install/use --lts`. citeturn4search13  
- Vérifiez avec `node -v` et `npm -v`. citeturn4search5  
- Structure minimale du projet + **scripts npm** pour standardiser vos commandes.  
- Quelques **formules JS** utiles (comparaison de versions, détection ESM/CJS, mesure de temps).

---

### 📎 Téléchargement (Chapitre 2)
- **Fichier Obsidian** : `02-installation-environnement.md` (ce document).

