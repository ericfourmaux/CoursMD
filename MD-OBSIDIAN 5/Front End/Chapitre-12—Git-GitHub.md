
# 📘 Chapitre 12 — Git, GitHub, Branching & CI

> 🎯 **Objectifs du chapitre**
> - Maîtriser **Git** (init, commit, branche, merge, rebase, stash, cherry‑pick, tags, reflog).
> - Choisir une **stratégie de branches** (Git Flow vs **Trunk‑Based**), **Conventional Commits** et **versioning sémantique**.
> - Collaborer efficacement avec **GitHub** (fork/PR, code review, protected branches, templates, CODEOWNERS).
> - Mettre en place une **CI** avec **GitHub Actions**: lint, build, tests, coverage, cache, matrix.
> - Définir un **processus de release** (tags, changelog, badges) et gérer **secrets**/environnements.

---

## 🧠 1. Git — fondements et commandes clés

### 🔍 Vocabulaire
- **Commit**: unité d’historique (snapshot + message).
- **Branche**: pointeur vers un commit (ligne d’évolution).
- **HEAD**: commit courant (ou ref).
- **Remote**: dépôt distant (ex. `origin`).

### 🧰 Workflow minimal
```bash
# initialiser
git init
# config utilisateur (global)
git config --global user.name "Eric Fourmaux"
git config --global user.email "eric@example.com"
# suivre des fichiers
git add .
# enregistrer
git commit -m "feat: initialiser le projet"
# créer une branche
git switch -c feature/login
# fusionner dans main
git switch main && git merge feature/login
```

### 🧠 Inspecter l’historique
```bash
git log --oneline --graph --decorate --all
# historique récemment modifié
git reflog
# voir diff
git diff HEAD~1 HEAD -- src/
```

### 🛠 Rebase vs Merge (diagrammes ASCII)
```
Avant:
main: A -- B -- C
feat:      \-- D -- E

Merge (commit de merge):
main: A -- B -- C -- M
feat:      \-- D -- E

Rebase (réécrit l’histoire de feat sur C):
feat: A -- B -- C -- D' -- E'
(main reste A -- B -- C)
```
**Bonnes pratiques**: Rebase pour garder une histoire **linéaire** (sur branches privées). Merge pour **conserver** l’historique **public**.

### 🧰 Autres commandes utiles
```bash
# stash: mettre de côté les modifications locales
git stash push -m "WIP login"
# récupérer
git stash pop
# cherry-pick: rejouer un commit sur une autre branche
git cherry-pick <commit-sha>
# tag: marquer une version
git tag -a v1.2.0 -m "release 1.2.0"
# pousser tags
git push origin --tags
```

---

## 🧠 2. Stratégies de branches & conventions de commit

### 📦 Git Flow (classique)
```
main ← release ← hotfix
       ↑
     develop ← feature/*
```
**Pour**: projet avec **versions** et **cycles** lourds. **Contre**: complexité, latence.

### 🚀 Trunk‑Based (recommandé pour Front)
```
main ← feature/* (petites PR rapides, feature flags)
```
**Pour**: livraison **fréquente**, simples PR, **CI** stricte. **Contre**: demande de discipline (tests + flags).

### 🧠 Conventional Commits
Format: `type(scope?): subject` + **body** optionnel + **footer** (BREAKING CHANGE).
- **types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `perf`, `chore`.
- **exemples**:
  - `feat(auth): ajouter SSO`
  - `fix(form): valider l’email`
  - `feat!: supprimer support IE11` (**breaking change**)

### 🧮 JS — Bump sémantique automatique (MAJOR/MINOR/PATCH)
```js
/** Calcule le prochain semver à partir d'une liste de messages Conventional Commits */
function nextVersion(current, messages){
  const [maj, min, pat] = current.split('.').map(Number);
  let major = maj, minor = min, patch = pat, breaking = false, feat = false;
  for(const m of messages){
    if (/BREAKING CHANGE|!:/.test(m)) breaking = true;
    else if (/^feat(\(|:)/.test(m)) feat = true;
    else if (/^fix(\(|:)/.test(m)) patch = true; // indicateur
  }
  if (breaking) return `${major+1}.0.0`;
  if (feat)     return `${major}.${minor+1}.0`;
  return `${major}.${minor}.${patch+1}`;
}
console.log(nextVersion('1.2.3', [
  'feat(ui): nouveau composant',
  'fix(api): corriger le code status'
])); // 1.3.0
```

### ✅ Bonnes pratiques
- Branches **courtes**, **tests** verts avant merge.
- Messages **clairs** (Conventional Commits) → changelog auto.

---

## 🧠 3. Collaboration GitHub — PR, Reviews & Protection

### 🔗 Flux PR
1. **Fork/branch** → push sur GitHub.
2. Ouvrir une **Pull Request** (PR) vers `main`.
3. **Review** (commentaires, suggestions). **Required checks** (CI).
4. **Merge** (squash, merge commit, rebase) selon politique.

### 🧰 Protected branches & règles
- Exiger **review** (min 1‑2 approbations).
- **Status checks** requis (CI: lint, tests, build).
- Empêcher **force‑push** sur `main`.

### 🧰 Templates & CODEOWNERS
**PR template** — `.github/pull_request_template.md`
```md
### 🎯 Objet
- [ ] Feature
- [ ] Fix

### 🧪 Tests
- [ ] Unitaires
- [ ] Intégration

### ✅ Checklist
- [ ] Lint/Build/Tests OK
- [ ] Docs mises à jour
```
**CODEOWNERS** — `.github/CODEOWNERS`
```
# Equipe web
src/** @team-web
```

---

## 🧠 4. CI avec GitHub Actions — pipeline complet

### 📦 Arborescence
```
.github/
  workflows/
    ci.yml
```

### 💡 `ci.yml` — Lint + Build + Tests (matrix Node)
```yaml
name: CI
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
jobs:
  build-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build
      - name: Test with coverage
        run: npm run test:coverage
      - name: Upload coverage artifact
        uses: actions/upload-artifact@v4
        with:
          name: coverage-${{ matrix.node-version }}
          path: coverage
```

### 🧰 Cache & performance
- `actions/setup-node` avec `cache: 'npm'`.
- `npm ci` pour installations **reproductibles**.

### 🔐 Secrets & environnements
- **Secrets** → `Settings > Secrets and variables > Actions`.
- Injecter via `env` ou `DefinePlugin` au build (voir Chap. 7). **Ne jamais** logguer les secrets.

### 🧪 Badge CI (README)
```md
![CI](https://github.com/<org>/<repo>/actions/workflows/ci.yml/badge.svg)
```

---

## 🧠 5. Versioning sémantique, tags & changelog

### 🔍 SemVer
`MAJOR.MINOR.PATCH`:
- **MAJOR** (incompatibilités)
- **MINOR** (fonctionnalités rétro‑compatibles)
- **PATCH** (corrections)

### 🧰 Générer le changelog (ex. `conventional-changelog`)
```bash
# Exemple d’outil (local)
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

### 🧰 Release — tag + GH Release
```bash
# 1) calculer la version suivante (script JS ou outil)
# 2) tagger et pousser
VERSION=1.3.0
git tag -a v$VERSION -m "release $VERSION"
git push origin v$VERSION
# 3) créer une release sur GitHub (notes + assets)
```

### 🧮 JS — Comparer deux versions SemVer
```js
function cmp(a, b){
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for(let i=0;i<3;i++){ if(pa[i]!==pb[i]) return pa[i]-pb[i]; }
  return 0;
}
console.log(cmp('1.2.3', '1.3.0') < 0 ? 'older' : 'newer');
```

---

## 🧠 6. Intégrer la CI au process d’équipe

### ✅ Checkpoints PR
- **Lint/Build/Tests** → **requis** avant merge.
- **Coverage** ≥ 80% (voir Chap. 8), **Core Web Vitals** (aperçu) via job optionnel.
- **Review** multi‑pairs (au moins 1 approbation). 

### 🧠 Politiques
- **Squash merge** pour garder une histoire **propre**.
- **Require up‑to‑date** branch (rebase/merge avant merge PR).

---

## 🧠 7. Exemples avancés GitHub Actions

### 📦 Job de **preview** déployée (ex. Vercel/Netlify)
```yaml
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci && npm run build
      - name: Deploy Preview
        run: npx vercel --token=${{ secrets.VERCEL_TOKEN }} --prod=false
```

### 📦 Job **release** (tag auto sur `main`)
```yaml
jobs:
  release:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci
      - name: Compute next version
        run: node scripts/next-version.js > .version
      - name: Create tag
        run: |
          VERSION=$(cat .version)
          git tag -a v$VERSION -m "release $VERSION"
          git push origin v$VERSION
```

---

## 🧪 8. Exercices guidés

1. **Git avancé**: Faites un `rebase` interactif pour réécrire 3 commits (fusionner, renommer, supprimer).
2. **Stratégie**: Mettez en place **Trunk‑Based** avec **feature flags** (ex. guard dans UI).
3. **Conventional Commits**: Ajoutez des hooks (Husky) pour valider le format avant commit.
4. **CI**: Créez un `ci.yml` avec matrix Node (18/20), cache npm et **coverage artifact**.
5. **Release**: Générez un **CHANGELOG.md** et créez un **tag** `v1.0.0`.
6. **Badges**: Ajoutez le badge CI dans le `README.md`.
7. **CODEOWNERS**: Définissez les responsables des dossiers critiques.

---

## ✅ 9. Check‑list Git & CI

- [ ] **Branches courtes** et PRs fréquentes.
- [ ] **Conventional Commits** appliqués.
- [ ] **CI**: lint/build/tests sur PR + push.
- [ ] **Coverage** ≥ 80% et artefacts conservés.
- [ ] **Protected branches** (review + checks requis).
- [ ] **Release** taggée + changelog.
- [ ] **Badges** dans README.
- [ ] **Secrets** gérés via GitHub (jamais en clair).

---

## 📦 Livrable du chapitre
Un **repo GitHub** avec:
- Stratégie **Trunk‑Based** + PRs petites.
- **CI** GitHub Actions (lint, build, tests, coverage, badge).
- **Conventional Commits**, **CHANGELOG.md**, **tags** et **release**.
- Templates PR et **CODEOWNERS**.

---

## 🔚 Résumé essentiel du Chapitre 12
- **Git**: savoir fusionner/rebaser proprement, utiliser stash/cherry‑pick/tags.
- **Branches**: **Trunk‑Based** favorise cycles rapides; **Conventional Commits** = messages standardisés.
- **GitHub**: PRs révisées, branches protégées, templates et CODEOWNERS pour la qualité.
- **CI**: pipeline automatisé (lint/build/tests/coverage) avec **cache** and **secrets**.
- **Release**: SemVer, changelog et tags pour un cycle clair et traçable.

---

> Prochain chapitre: **Déploiement & Environnements** — builds, Netlify/Vercel/GitHub Pages, variables d’environnement, flags et stratégies de rollback.
