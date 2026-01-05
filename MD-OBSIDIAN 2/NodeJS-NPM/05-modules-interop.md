
# 📦 Chapitre 5 — Modules & interop (ESM ↔ CommonJS)

> [!NOTE] Objectifs du chapitre
> - Comprendre les **deux systèmes de modules** de Node.js (**CommonJS** et **ES Modules**) et savoir **les activer**. citeturn7search148turn7search151  
> - Maîtriser l’**interopérabilité** : importer **CJS depuis ESM** (et inversement), `createRequire`, **named exports** détectés, `import()` dynamique. citeturn7search148turn7search150turn7search184  
> - Utiliser **package.json** (`type`, `exports`, **conditional exports**, **import attributes**) pour publier des **packages robustes**. citeturn7search142  
> - Travailler avec **import.meta** (`url`, `dirname`, `filename`) et **top-level await**. citeturn7search148  
> - Connaître l’**écosystème bundling** (Webpack/Rollup/esbuild) & **tree‑shaking** (quand et pourquoi). citeturn7search176

---

## 5.1 🧭 Les deux systèmes de modules

### CommonJS (CJS)
- Syntaxe : `require()` / `module.exports`. **Synchronous** et historiquement par défaut côté Node. citeturn7search171

### ES Modules (ESM)
- Syntaxe standard : `import` / `export`. Activable via **`.mjs`**, `package.json` → `type:"module"`, ou `--input-type=module`. **Interop** avec CJS fournie par Node. citeturn7search148

> [!TIP]
> Sans `type`, les fichiers `.js` sont **CJS** par défaut ; utilisez `.mjs`/`.cjs` pour être explicite, ou renseignez `"type"`. citeturn7search142

---

## 5.2 ⚙️ Activer et mélanger CJS/ESM

**Choix global** (dans `package.json`)
```json
{
  "type": "module" // sinon CommonJS par défaut
}
```
- `.js` → ESM si `type:"module"`; **CJS** si `type:"commonjs"` ou absent. `.mjs` force ESM, `.cjs` force CJS. citeturn7search142

**Interop ESM → CJS**
- Importer un module CJS depuis ESM :
```js
import pkg from 'cjs-module';
const { named } = pkg;  // named exports via l'export par défaut
```
> Les **named imports** depuis CJS peuvent fonctionner si Node **détecte statiquement** des affectations sur `exports`/`module.exports`. Sinon, utilisez l’**export par défaut**. citeturn7search148turn7search150

**Interop CJS → ESM**
- Dans CJS, impossible d’`import` statique ; utilisez **`import()`** (promesse) ou transpilation. citeturn7search184
- Dans ESM, vous pouvez **simuler `require`** via `createRequire` :
```js
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const cjs = require('./legacy.cjs');
```
> Node propose une **interop complète** : import par défaut pour CJS, détection de **named exports** selon l’analyse statique. citeturn7search148

---

## 5.3 🧩 `import.meta` & équivalents de `__dirname`

- En ESM, vous n’avez pas `__filename`/`__dirname` (historiquement CJS). Utilisez **`import.meta`** :
```js
// Node ≥ 20.11
console.log(import.meta.dirname);   // équivalent __dirname
console.log(import.meta.filename);  // équivalent __filename
```
> Pour Node < 20.11, calculez via `fileURLToPath(import.meta.url)` + `path.dirname`. citeturn7search165turn7search168

- `import.meta.url` donne l’URL du module courant (utile pour chemins relatifs, loaders personnalisés). citeturn7search148

---

## 5.4 🔀 `import()` dynamique & top‑level await

- **`import()`** charge un module **asynchrone** (promesse). Pratique pour **lazy‑load**, branches conditionnelles, ou éviter du coût initial. citeturn7search184
```js
const mod = await import('./feature.js');
mod.run();
```
- Node **supporte** `top‑level await` (sans wrapper async) depuis v14.8+. citeturn7search148

---

## 5.5 📦 `package.json` : `type`, `exports`, conditions & sous‑chemins

### Déterminer le système
- `type:"module"` → `.js` traités en **ESM** ; `type:"commonjs"` ou absent → **CJS**. `.mjs`/`.cjs` restent **explicites**. citeturn7search142

### `exports` : API publique & **multi‑entrées**
- `exports` remplace `main` et **contrôle** les points d’entrée exposés (bloque l’accès aux fichiers internes). citeturn7search142
```json
{
  "name": "@scope/pkg",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": "./dist/utils.js"
  }
}
```
> Supporte **sous‑chemins** (`"./utils"`) et **exports conditionnels** (`import`/`require`, `node`, etc.). citeturn7search142

### Conditions personnalisées
- Vous pouvez définir des **conditions** (ex. `production`) et les activer via `node --conditions=production`. citeturn7search190

### `import attributes` (JSON, etc.)
- Depuis Node ≥ **20.10**/**22**+, utilisez la syntaxe **`with { ... }`** (remplace `assert`). citeturn7search148turn7search163
```js
import pkg from './package.json' with { type: 'json' };
const { default: conf } = await import('./conf.json', { with: { type: 'json' } });
```
> Node a **abandonné** `assert { type: 'json' }` au profit de `with`. citeturn7search161turn7search162

---

## 5.6 🔎 “Named exports” depuis CJS : ce qui marche

- Node tente une **analyse statique** des modules CJS pour exposer des **named exports** assimilables côté ESM. Cela **fonctionne** pour `exports.foo = ...` / `module.exports.bar = ...`. citeturn7search148
- Certains patterns brisent l’analyse (ex. parenthèses ou réaffectation complexe) → utilisez l’**export par défaut** et **désassemblez** :
```js
import cjs from './lib.cjs';
const { foo } = cjs; // garanti
```
> Voir l’exemple de panne avec `(exports).MyNamedExport = 'OK'`. citeturn7search150

---

## 5.7 🧯 Trucs & pièges courants

- **Extensions** obligatoires en ESM pour chemins relatifs (`./util.js`) ; ne pas les omettre. citeturn7search148  
- **ESM** n’a pas `require`, `__filename`, `__dirname` par défaut : utilisez `createRequire` ou `import.meta`. citeturn7search148  
- Mélange CJS/ESM : préférez `.mjs`/`.cjs` pour éviter l’ambiguïté et gardez `exports` **cohérent**. citeturn7search142

---

## 5.8 🛠️ Bundling & tree‑shaking (aperçu)

- **Rollup** excelle pour **librairies** et **tree‑shaking** agressif (sorties minimales). **esbuild** est **ultra‑rapide** (CI/dev). **Webpack** reste **polyvalent** (écosystème massif, HMR, federation). Choisir selon **cas d’usage**. citeturn7search176turn7search180

> [!TIP]
> Pour **publier** une lib ESM+CJS, combinez `exports` conditionnels et générez **deux builds** (Rollup + esbuild par ex.). citeturn7search142

---

## 5.9 🧪 Exercices pratiques

### Ex. A — Dual package (ESM + CJS)
1) Générez deux bundles : `dist/index.js` (ESM) & `dist/index.cjs` (CJS).  
2) Ajoutez dans `package.json` :
```json
{
  "type": "module",
  "exports": {
    ".": { "import": "./dist/index.js", "require": "./dist/index.cjs" },
    "./cli": { "node": "./dist/cli.js" }
  }
}
```
3) Testez dans un projet CJS (`require('pkg')`) et ESM (`import pkg from 'pkg'`). citeturn7search142

### Ex. B — `import()` & top‑level await
- Chargez dynamiquement un module lourd **au clic** et comparez le **temps de démarrage**. citeturn7search184

### Ex. C — `import.meta`
- Implémentez une **lecture de fichier** relative au module via `import.meta.dirname`. citeturn7search168

---

## 5.10 🧭 FAQ rapide

- **Puis‑je mélanger CJS et ESM dans un même repo ?** Oui, avec `.mjs`/`.cjs` et `exports` bien configurés. citeturn7search142  
- **Comment importer un JSON en Node 22 ?** Utiliser **`with { type:'json' }`** (remplace `assert`). citeturn7search162  
- **Pourquoi mes named imports depuis CJS échouent ?** Pattern non détectable statiquement : importez le **défaut** et déstructurez. citeturn7search150

---

## 5.11 📘 Résumé

- Node **supporte** CJS & ESM et fournit une **interop** solide. Choisissez un **marquage explicite** (`type`, `.mjs`, `.cjs`). citeturn7search148turn7search142  
- **`import.meta`** comble les manques de CJS (`__dirname`, `__filename`) et favorise des chemins robustes. citeturn7search168  
- **`exports`** et **conditions** structurent l’API d’un package et permettent **dual builds** ESM/CJS. citeturn7search142  
- **`import()`** + **top‑level await** améliorent la **modularité** et le **temps de démarrage**. citeturn7search184turn7search148

---

### 📎 Téléchargement (Chapitre 5)
- **Fichier Obsidian** : `05-modules-interop.md` (ce document).

