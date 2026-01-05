---
title: "✍️ Chapitre 5 — Flux minimal : init → status → add → commit → log"
tags: [git, flux, init, add, commit, log, status, ignore]
cssclass: chapitre
---

# ✍️ Chapitre 5 — Flux minimal : init → status → add → commit → log

> **Objectif pédagogique :** maîtriser le **cycle de base** de Git en solo : initialiser un dépôt, suivre/ignorer des fichiers, mettre en **staging** (partiel ou total), committer avec un **message informatif**, et **lire l’historique** (log/show). À l’issue de ce chapitre, tu sauras créer un historique propre et lisible.

---

## 🧠 Résumé rapide (à garder en tête)
- **init** : crée `.git/` et démarre l’historique (branche `main`).
- **status** : visualise l’état (untracked, modified, staged).
- **add** : place des changements dans l’**index** (sélection possible `-p`).
- **commit** : enregistre un **snapshot** avec message **clair**.
- **log** : inspecte l’historique (`--oneline --graph --decorate`).
- **.gitignore** : évite de suivre les fichiers indésirables (ex.: `node_modules/`, `.env`).

---

## 📚 Définitions précises

### 🔹 `git init`
- **Définition** : initialise un dépôt Git **vide** dans le dossier courant (ou au chemin donné) et crée la structure `.git/`.
- **Pourquoi** : point de départ pour versionner localement.
- **Exemple** :
  ```bash
  mkdir demo && cd demo
  git init -b main   # -b pour choisir la branche par défaut
  ```

### 🔹 `git status`
- **Définition** : indique l’état des fichiers : **non suivis** (*untracked*), **modifiés**, **indexés**.
- **Pourquoi** : décider quoi **stager** ou **restaurer**.
- **Exemple** :
  ```bash
  git status
  ```

### 🔹 `git add`
- **Définition** : ajoute des fichiers/changements à l’**index** (staging area) pour le **prochain commit**.
- **Pourquoi** : contrôler précisément le contenu du snapshot.
- **Exemples** :
  ```bash
  git add .                  # tout (⚠︎ à utiliser avec discernement)
  git add src/index.js       # fichier spécifique
  git add -p                 # staging **partiel** (hunks interactifs)
  ```

### 🔹 `git commit`
- **Définition** : crée un **snapshot** de l’index avec un **message** ; associe auteur/committer, date, parents.
- **Pourquoi** : construire un historique **cohérent** et **traçable**.
- **Exemples** :
  ```bash
  git commit -m "feat(app): initialiser l’application"
  git commit --amend        # corriger le dernier commit (non pushé)
  ```

### 🔹 `git log` / `git show`
- **Définition** : `log` liste les commits ; `show` affiche le détail (diff + métadonnées).
- **Pourquoi** : **lire** et **filtrer** l’historique.
- **Exemples** :
  ```bash
  git log --oneline --graph --decorate --all
  git show HEAD~1           # diff et métadonnées du commit précédent
  ```

---

## 🧭 Schémas ASCII — Flux minimal

```text
Working tree   →   Index (staging)   →   Commit (historique)
   (éditer)           (git add)               (git commit)
```

```text
État typique

untracked: README.md
modified:  src/app.js
staged:    src/styles.css
```

---

## 🧾 `.gitignore` — ne pas suivre l’inutile

### 🔹 Pourquoi
- Éviter les **fichiers générés** (builds), **dépendances** (node_modules), **secrets** (`.env`).

### 🔧 Exemple
```gitignore
# Dépôt front-end
node_modules/
dist/
coverage/
.env*
*.log
.vscode/
```

> **Astuce** : `git status --ignored` pour **voir** les fichiers ignorés.

---

## 🔧 Commandes utiles — autour du flux

### Sélection, restauration & nettoyage
```bash
# Sélection partielle (interactive)
git add -p

# Restaurer un fichier (depuis index/HEAD)
git restore --staged src/app.js   # retire du staging
git restore src/app.js            # remplace par version index (ou HEAD)

# Renommer / supprimer
git mv src/app.js src/main.js
git rm debug.log
```

### Qualité des messages & conventions
```text
Conventional Commits
- feat(scope): description
- fix(scope): description
- docs(readme): description
- refactor(core): description
- chore(deps): description
```

### `commit --amend` (corriger le dernier commit)
```bash
git commit --amend -m "feat(app): init + config"
# ⚠︎ Ne pas amender un commit **déjà pushé** (risque de réécriture d'historique)
```

### Formats de `log`
```bash
# Vue lisible compacte
git log --oneline --graph --decorate

# Filtres temporels
git log --since="2 days ago" --until="yesterday"

# Format personnalisé
git log --pretty=format:"%h %ad | %an | %s" --date=short
```

---

## 💻 VS Code — intégration rapide
- Onglet **Source Control** : stage, commit, message, diff.
- Extension **GitLens** : histoire ligne par ligne (blame), navigation de commits.
- **Terminal intégré** pour les commandes.

---

## 🧪 Exercices pratiques
1. **Init & premier commit**  
   Crée `demo-flux`, initialise (`git init -b main`), ajoute `README.md`, commit `feat(docs): init README`.
2. **Ignorer les fichiers**  
   Ajoute `.gitignore` (avec `node_modules/`, `dist/`, `.env*`), vérifie `git status --ignored`.
3. **Staging partiel**  
   Modifie `src/app.js` en 2 endroits ; utilise `git add -p` pour ne staging qu’une partie.
4. **Amend sécurisé**  
   Corrige le **dernier commit** (non pushé) avec `--amend` pour ajouter un fichier oublié.
5. **Log filtré**  
   Crée 3-4 commits, teste `git log --oneline --graph --decorate` et un format custom.

---

## ⚠️ Encadré risques & hygiène
- **`git add .` non réfléchi** : risque de **stager trop** (fichiers non voulus). Préfère `git add -p` ou ciblé.
- **Commits géants** : difficiles à relire ; **découpe** en commits cohérents (un sujet).
- **Messages vagues** : évite `update`/`fix`; **explique le pourquoi**.
- **Amender un commit pushé** : réécrit l’historique partagé → préférer un **nouveau commit** ou un **revert**.
- **Secrets** : vérifie avant commit (utilise `.gitignore`, scans, review).

---

## 🧑‍🏫 Théorie & outils en **JavaScript**

### 1) Vérifier un message de commit selon *Conventional Commits*
```js
// Regex simple pour valider: type(scope): description
const CC_RE = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?:\s.+/;
function isConventionalCommit(msg) { return CC_RE.test(msg); }
console.log(isConventionalCommit('feat(ui): ajouter bouton')); // true
console.log(isConventionalCommit('update stuff')); // false
```

### 2) Simuler un staging **partiel** (par *hunks*)
```js
function splitHunks(diffText) {
  // Découpe très simplifiée par headers de hunks @@
  return diffText.split(/\n(?=@@)/).filter(Boolean);
}
function stageSelectedHunks(hunks, selectedIdxs) {
  return hunks.filter((_, i) => selectedIdxs.includes(i)).join('\n');
}
// Exemple
const diff = `@@ -1,3 +1,4 @@\n-const a=1;\n+const a=2;\n console.log(a);\n@@ -10,0 +11,1 @@\n+console.log('new line');`;
const hunks = splitHunks(diff);
const staged = stageSelectedHunks(hunks, [0]); // ne stage que le 1er hunk
console.log(staged);
```

### 3) Formatage d’un `log` custom (illustratif)
```js
function formatLog(commits) {
  // commits: [{hash, date, author, subject}]
  return commits.map(c => `${c.hash} ${c.date} | ${c.author} | ${c.subject}`).join('\n');
}
```

---

## 📎 Glossaire (sélection)
- **Staging** : sélection des changements pour le prochain commit.
- **Hunk** : bloc de diff (portion contiguë modifiée).
- **Amend** : modifier le **dernier commit local**.
- **HEAD~1** : parent de HEAD ; `HEAD^` similaire (premier parent).
- **Subject** : première ligne du message de commit.

---

## 📚 Ressources officielles
- `git init` : https://git-scm.com/docs/git-init  
- `git add` : https://git-scm.com/docs/git-add  
- `git commit` : https://git-scm.com/docs/git-commit  
- `git log` : https://git-scm.com/docs/git-log  
- `.gitignore` : https://git-scm.com/docs/gitignore  
- Conventional Commits : https://www.conventionalcommits.org/

---

## 🧾 Résumé des points essentiels — Chapitre 5
- **Flux minimal** maîtrisé : `init → status → add → commit → log`.
- **Staging partiel** (`-p`) pour des commits **granulaires** et lisibles.
- **Messages conformes** aux **Conventional Commits** (traçabilité).
- **.gitignore** pour garder l’historique **propre**.
- **Log** pour **lire/filtrer** efficacement l’historique.

---

> 🔜 **Prochain chapitre** : [[06-chapitre-6-branches-et-head]] (sera fourni après validation).
