---
title: "🧰 Chapitre 17 — Outils de qualité : pre-commit, ESLint, Prettier, Husky"
tags: [quality, eslint, prettier, husky, lint-staged, commitlint, conventional-commits, editorconfig]
cssclass: chapitre
---

# 🧰 Chapitre 17 — Outils de qualité : pre-commit, ESLint, Prettier, Husky

> **Objectif pédagogique :** mettre en place une **chaîne de qualité locale** et **pré‑commit** : **ESLint** (static analysis), **Prettier** (formatage auto), **Husky** (hooks Git), **lint‑staged** (ne lint que les fichiers indexés) et **Commitlint** (+ **Conventional Commits**) pour **sécuriser les messages de commit**. À la fin, tu auras des **commits propres**, un **style stable**, et des **CI** moins bruyantes.

---

## 🧠 Résumé rapide (à garder en tête)
- **ESLint** : détecte **erreurs** & **mauvaises pratiques** (JS/TS).  
- **Prettier** : **formate** le code de façon déterministe ; **couper** les règles de style conflictuelles dans ESLint via `eslint-config-prettier`.  
- **Husky** : exécute des **hooks Git** (`pre-commit`, `commit-msg`, `pre-push`).  
- **lint‑staged** : applique lint/format **uniquement** aux **fichiers stagés**.  
- **Commitlint** : **valide** le **message de commit** selon **Conventional Commits**.

---

## 📚 Pourquoi ces outils ensemble ?
- **Qualité** : moins d’erreurs, code plus lisible (ESLint+Prettier).  
- **Vélocité** : corrections **automatiques** (`--fix`, format on save).  
- **Traçabilité** : commits **normalisés**, changelog **prévisible** (Chap. 13).  
- **Hygiène** : ne laisse pas passer du code **mal formaté** ou des messages **vagues**.

---

## 🔧 Mise en place — pas à pas (npm)

> **Pré‑requis** : Node ≥ 18, dépôt initialisé (`git init`), `package.json` (via `npm init -y`).

### 1) Installer les dépendances
```bash
# Lint + format
npm install -D eslint prettier eslint-config-prettier

# TypeScript (si applicable)
npm install -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin

# (Optionnel Vue 3)
npm install -D eslint-plugin-vue

# Hooks & staging
npm install -D husky lint-staged

# Commit message
npm install -D @commitlint/cli @commitlint/config-conventional
```

### 2) Configurer **ESLint** (JS/TS)
```js
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { es2022: true, node: true, browser: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // désactive les règles de style conflictuelles
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    // (Optionnel) Vue 3 SFC
    {
      files: ['**/*.vue'],
      extends: ['plugin:vue/vue3-recommended', 'prettier'],
      parserOptions: { parser: '@typescript-eslint/parser' },
    },
  ],
};
```

### 3) Configurer **Prettier**
```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### 4) (Conseillé) **EditorConfig**
```ini
# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
end_of_line = lf
trim_trailing_whitespace = true
```

### 5) Scripts npm
```json
// extrait package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "echo \"(brancher Jest ici)\""
  },
  "lint-staged": {
    "**/*.{js,ts,vue}": ["eslint --fix"],
    "**/*.{json,md,css,scss}": ["prettier --write"]
  }
}
```

### 6) Initialiser **Husky** & hooks
```bash
# Crée la structure .husky et le hook pre-commit par défaut
npx husky init
# (Ajoute automatiquement script "prepare": "husky") dans package.json

# Hook pre-commit : exécuter lint-staged
printf "npx lint-staged\n" > .husky/pre-commit

# Hook commit-msg : valider le message
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"

# Hook pre-push : lancer les tests (ou build rapide)
npx husky add .husky/pre-push "npm test"
```

### 7) Configurer **Commitlint**
```js
// commitlint.config.cjs
module.exports = { extends: ['@commitlint/config-conventional'] };
```

> **Format attendu des commits** : `type(scope): description` (ex. `feat(auth): login v2`). Types conseillés : `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

---

## 💻 VS Code — intégration

```json
// .vscode/settings.json (exemple)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

> **Astuce** : active **Format on Save** (Prettier) et **Fix All ESLint** ; le code est propre **avant** d’être commit.

---

## 🧭 Schémas ASCII — flux pre‑commit

```
[Working tree] → git add → [Index]
                   │
                   ▼ (pre-commit / lint-staged)
             ESLint --fix + Prettier sur fichiers stagés
                   │
                   ▼
                 git commit
                   │
                   ▼ (commit-msg)
             Commitlint (Conventional Commits)
                   │
                   ▼
                 git push
                   │
                   ▼ (pre-push)
                 npm test (rapide)
```

---

## ⚠️ Encadré risques & hygiène
- **Conflits ESLint/Prettier** : ajoute `eslint-config-prettier` et garde **Prettier maître** du style.  
- **Hooks trop lents** : sur gros monorepos, restreins avec **lint‑staged** ; vise des hooks **< 5–10 s**.  
- **Messages non standard** : Commitlint **bloque** le commit — **réécris** le message.  
- **Windows/CRLF** : normalise via `.gitattributes` (**LF**) (voir Chap. 2) pour éviter diffs décoratifs.

---

## 🧪 Exercices pratiques
1. **Installer & configurer** ESLint + Prettier ; exécuter `npm run lint:fix` et `npm run format`.  
2. **Activer Husky** ; simuler un commit avec fichiers mal formatés → vérifier que le **hook** corrige/refuse.  
3. **Commitlint** : essayer un message invalide (`update`) → **refusé** ; puis validé (`feat(ui): bouton primaire`).  
4. **lint‑staged** : mettre deux fichiers en staging et exécuter le hook pre‑commit ; observer que **seuls les stagés** sont traités.  
5. **VS Code** : activer Format on Save, corriger une erreur ESLint automatiquement au save.

---

## 🧑‍🏫 Théorie & utilitaires en **JavaScript**

### 1) Valider un message **Conventional Commits**
```js
const CC_RE = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?:\s.+/;
function isConventional(msg){ return CC_RE.test(msg); }
console.log(isConventional('feat(ui): ajouter bouton')); // true
console.log(isConventional('update things')); // false
```

### 2) Filtrer les **fichiers stagés** (idée lint‑staged)
```js
function pickStaged(files, stagedSet){
  return files.filter(f => stagedSet.has(f));
}
console.log(pickStaged(['a.ts','b.js','c.md'], new Set(['b.js','c.md']))); // ['b.js','c.md']
```

### 3) Normaliser un **import** (rule ESLint simulée)
```js
function normalizeImport(line){
  // Remplace \"var\" par \"const\" sur import simulé
  return line.replace(/^var\s+([a-zA-Z_$][\w$]*)\s*=\s*require\(([^)]+)\);/, 'const $1 = require($2);');
}
console.log(normalizeImport("var x = require('y');")); // const x = require('y');
```

---

## 📎 Glossaire (sélection)
- **ESLint** : linter JS/TS (analyse statique).  
- **Prettier** : formateur d’**opinions** (style).  
- **Husky** : gestionnaire de **hooks Git**.  
- **lint‑staged** : outils pour ne traiter que les **fichiers stagés**.  
- **Commitlint** : valide les **messages de commit**.  
- **Conventional Commits** : convention de messages (type(scope): desc.).  
- **EditorConfig** : standard fichier pour styles d’éditeur.

---

## 📚 Ressources officielles
- ESLint : https://eslint.org/docs/latest/  
- Prettier : https://prettier.io/docs/en/  
- eslint-config-prettier : https://github.com/prettier/eslint-config-prettier  
- Husky : https://typicode.github.io/husky/  
- lint‑staged : https://github.com/okonet/lint-staged  
- Commitlint : https://commitlint.js.org/  
- Conventional Commits : https://www.conventionalcommits.org/  
- Git hooks : https://git-scm.com/docs/githooks  
- EditorConfig : https://editorconfig.org/

---

## 🧾 Résumé des points essentiels — Chapitre 17
- **ESLint + Prettier** : lint & format **cohérents** (désamorçage des conflits via `prettier`).  
- **Husky + lint‑staged** : qualité **avant** commit ; rapide et **ciblé**.  
- **Commitlint + Conventional Commits** : messages **normés**, changelog **automatisable**.  
- **VS Code** : format & fix **au save** ; un style **stable** sans friction.

---

> 🔜 **Prochain chapitre** : [[18-chapitre-18-tests-unitaires-avec-jest-introduction]] (sera fourni après validation).
