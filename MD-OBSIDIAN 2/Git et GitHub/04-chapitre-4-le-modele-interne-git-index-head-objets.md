---
title: "📦 Chapitre 4 — Le modèle interne de Git : working tree, index, HEAD & objets"
tags: [git, internals, index, head, blobs, trees, commits, tags, refs, reflog, dag]
cssclass: chapitre
---

# 📦 Chapitre 4 — Le modèle interne de Git : working tree, index, HEAD & objets

> **Objectif pédagogique :** comprendre **ce que Git stocke réellement** (objets, références), **comment le staging fonctionne** (index et stages), **ce qu’est `HEAD`** (symbolic ref vs détaché), et **comment inspecter/manipuler** ces éléments avec des commandes *plumbing* en toute sécurité.

---

## 🧠 Résumé rapide (à garder en tête)
- **Working tree** = fichiers sur ton disque ; **Index** = zone de préparation (staging) ; **Repository (`.git/`)** = historique (objets + refs).
- **Objets Git** : `blob` (contenu de fichier), `tree` (répertoire), `commit` (snapshot + métadonnées), `tag` (référence annotée).
- **HEAD** : référence **symbolique** vers la branche courante (ex.: `refs/heads/main`) ou **détachée** (pointe directement vers un commit).
- **Refs** : pointeurs (branches, tags, remotes) ; **reflog** : journal local des mouvements de références pour **récupérer**.

---

## 🗂️ Les 3 zones : Working tree, Index, Repository

### 🧾 Définitions précises
- **Working tree** : l’état des fichiers que tu édites.
- **Index (staging area)** : table qui liste **ce qui ira dans le prochain commit** (chemin, mode, hash, *stage*).
- **Repository** (`.git/`) : la base d’objets (blobs/trees/commits/tags), les **références** (branches, tags) et la configuration.

### 💡 Analogie
- **Cuisine** : *working tree* = plan de travail ; *index* = plat dressé prêt pour le photographe ; *commit* = photo publiée dans l’album.

### 🔧 Inspecter les 3 zones
```bash
# État des différences
git status

# Voir les fichiers suivis et l'index (stages)
git ls-files --stage

# Différences entre working tree et index
git diff

# Différences entre index et dernier commit
git diff --cached
```

> **Stages de l’index en merge** : `stage 1` (base), `stage 2` (nôtre), `stage 3` (leur). Hors conflit, `stage 0`.

---

## 🗃️ Objets Git : blob, tree, commit, tag

### 🔹 Blob
- **Définition** : contenu brut d’un fichier versionné (sans nom).
- **Pourquoi** : dédupliqué par **hash** (adressage par contenu). 
- **Exemple (plumbing)** :
  ```bash
  echo "Hello" | git hash-object -w --stdin   # crée un blob et retourne son hash
  git cat-file -t <hash>                      # → blob
  git cat-file -p <hash>                      # → contenu "Hello"
  ```

### 🔹 Tree
- **Définition** : répertoire (liste de *entrées* : mode, type, hash, nom).
- **Pourquoi** : structure hiérarchique ; relie des blobs et sous-trees.
- **Exemple (plumbing)** :
  ```bash
  git ls-tree HEAD              # liste le tree de HEAD
  git cat-file -p <tree-hash>   # détail d'un objet tree
  ```

### 🔹 Commit
- **Définition** : snapshot **pointe vers un tree**, avec **parents**, **auteur** et **message**.
- **Pourquoi** : trace l’histoire (DAG), garantit l’**immuabilité** par hash.
- **Exemple (plumbing)** :
  ```bash
  git cat-file -p HEAD          # montre tree, parents, auteur, message
  git log --oneline --graph     # vue DAG compacte
  ```

### 🔹 Tag
- **Définition** : référence annotée (ou légère) vers un commit, souvent pour **releases**.
- **Exemple** :
  ```bash
  git tag -a v1.0.0 -m "First release"
  git show v1.0.0
  ```

---

## 🧭 Schémas ASCII — DAG & index

```text
Commit DAG

      o C2 (feat)
     / \
C0 -o   o M (merge)
     \ /
      o C1 (main)
```

```text
Index (staging)

Path              Mode    Hash            Stage
src/app.js        100644  a1b2c3...       0
src/view.css      100644  d4e5f6...       0
# En conflit :
src/login.js      100644  base: x1y2z3    1
                  100644  ours: r4s5t6    2
                  100644  theirs: u7v8w9  3
```

---

## 🎛️ HEAD : symbolic ref vs detached HEAD

### 🔹 Symbolic ref
- **Définition** : `HEAD` contient `ref: refs/heads/<branche>`. 
- **Effet** : les commits avancent la **branche**.

### 🔹 Detached HEAD
- **Définition** : `HEAD` contient directement un **hash** de commit.
- **Effet** : commits **sans branche** (peuvent se perdre si non référencés).

### 🔧 Commandes utiles
```bash
# Où pointe HEAD ?
git symbolic-ref -q HEAD        # refs/heads/main (si symbolique)

# Convertir entre modes (exemples)
git checkout <hash>             # détache HEAD
git switch -C fix/typo          # crée une branche et attache HEAD
```

> **Bonnes pratiques** : évite de travailler longtemps en **detached HEAD** ; crée une branche si tu veux conserver le travail.

---

## 🔗 Références & Reflog

### 🔹 Références
- **Branches** : `refs/heads/<name>`
- **Tags** : `refs/tags/<name>`
- **Remotes** : `refs/remotes/<remote>/<branch>`

### 🔧 Inspecter & manipuler
```bash
# Lister les refs locales
git show-ref

# Résoudre un nom en hash
git rev-parse HEAD main v1.0.0

# Mettre à jour une ref (avancé)
git update-ref refs/heads/main <hash>
```

### 🧾 Reflog — filet de sécurité
- **Définition** : journal **local** des mouvements de HEAD et des refs.
- **Utilité** : récupérer après `reset` dur ou rebase.

```bash
git reflog
# Exemple de récupération:
git reset --hard HEAD@{2}   # revenir 2 mouvements en arrière
```

---

## 🧱 `.git/` — anatomie minimale

```text
.git/
 ├─ objects/          # base d'objets (blobs/trees/commits/tags)
 │   ├─ pack/         # packfiles (objets compressés)
 │   └─ xx/abcd...    # objets loose (nommés par hash)
 ├─ refs/
 │   ├─ heads/        # branches locales
 │   ├─ tags/         # tags
 │   └─ remotes/      # branches distantes
 ├─ HEAD              # symbolic ref ou hash
 ├─ config            # configuration locale
 └─ index             # staging area (binaire)
```

> **Packfiles** : Git compresse et regroupe les objets pour la performance (`.pack`, `.idx`).

---

## ⚙️ SHA‑1 vs SHA‑256 (aperçu)
- Historiquement, Git utilise **SHA‑1** (160 bits) pour les IDs d’objets.
- Transition en cours vers **SHA‑256** dans certaines configurations. 
- **Conséquence** : l’ID d’un objet dépend de son **contenu** → changer le contenu = **nouvel hash**.

---

## 🧪 Atelier *plumbing* (sécurisé)

> Créer manuellement un commit (sans passer par `git add/commit`) pour comprendre l’assemblage des objets.

1. **Créer deux blobs**
   ```bash
   echo "hello" | git hash-object -w --stdin   # → H_blob1
   echo "world" | git hash-object -w --stdin   # → H_blob2
   ```
2. **Écrire un tree** (répertoire racine avec deux entrées)
   ```bash
   printf "100644 blob %s\thello.txt\n100644 blob %s\tworld.txt\n" H_blob1 H_blob2 | \
   git mktree                                  # → H_tree
   ```
3. **Créer un commit**
   ```bash
   echo "author Eric <eric@example.com> 0 +0000"; echo "committer Eric <eric@example.com> 0 +0000"; \
   git commit-tree H_tree -m "Plumbing demo"    # → H_commit
   ```
4. **Pointer une branche vers ce commit**
   ```bash
   git update-ref refs/heads/plumbing-demo H_commit
   git switch plumbing-demo
   ```

> **Lecture** : `git cat-file -p H_commit` et `git ls-tree H_tree` pour vérifier.

---

## 🧹 Garbage collection & reachability

- **Reachable** : un objet est *joignable* si un **ref** ou un **commit reachable** y mène.
- **Unreachable** : objets orphelins = candidats au **prune**.
- **Commandes** :
  ```bash
  git gc                # pack, nettoie
  git prune -n          # montre ce qui serait supprimé (dry-run)
  ```

> ⚠️ **Prudence** : ne lance pas `prune` si tu penses récupérer via `reflog`.

---

## 🧑‍🏫 Théorie & modélisation en **JavaScript**

### 1) Adressage par contenu → immuabilité
```js
function toyHash(str) { // illustratif
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function makeBlob(content) {
  const header = `blob ${content.length}\0`;
  const payload = header + content;
  return { type: 'blob', id: toyHash(payload), content };
}

const b1 = makeBlob('hello');
const b2 = makeBlob('hello!');
console.log(b1.id !== b2.id); // true → contenu différent ⇒ id différent
```

### 2) Index (staging) avec *stages* (simplifié)
```js
class IndexEntry {
  constructor(path, mode, hash, stage = 0) {
    this.path = path; this.mode = mode; this.hash = hash; this.stage = stage;
  }
}
class IndexTable {
  constructor() { this.entries = []; }
  add(entry) { this.entries.push(entry); }
  list(path = null) { return this.entries.filter(e => !path || e.path === path); }
}

// Démonstration : conflit sur src/login.js
const idx = new IndexTable();
idx.add(new IndexEntry('src/login.js', '100644', 'baseHash', 1));
idx.add(new IndexEntry('src/login.js', '100644', 'oursHash', 2));
idx.add(new IndexEntry('src/login.js', '100644', 'theirsHash', 3));
console.log(idx.list('src/login.js').map(e => e.stage)); // [1,2,3]
```

### 3) Reachability dans le DAG
```js
function reachable(startCommitId, commitGraph) {
  // commitGraph: { id: { parents: [id1,id2], ... } }
  const seen = new Set();
  const stack = [startCommitId];
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    const parents = (commitGraph[id] && commitGraph[id].parents) || [];
    for (const p of parents) stack.push(p);
  }
  return seen; // ensemble des commits joignables depuis startCommitId
}
```

---

## 🧪 Exercices pratiques
1. **Lister l’index** sur un dépôt existant et expliquer 3 entrées (`git ls-files --stage`).  
2. **Créer un tag annoté** et afficher ses métadonnées (`git tag -a`, `git show <tag>`).  
3. **Basculer en detached HEAD** sur un ancien commit, tester une modification, puis **créer une branche** pour la conserver.  
4. **Lire un objet commit** avec `git cat-file -p HEAD` et identifier `tree`, `parents`, `author`, `committer`.  
5. **Utiliser le reflog** pour revenir à l’état d’il y a 3 mouvements (`git reflog` + `git reset --hard HEAD@{3}`).

---

## ⚠️ Encadré risques & hygiène
- **Detached HEAD** : commits non référencés peuvent être perdus — **crée une branche**.
- **Manipulation des refs** (`update-ref`) : à utiliser avec prudence, **ne jamais** pousser en remote sans comprendre.
- **Secrets dans l’historique** : même si l’objet est immuable, il reste dans l’historique ; utilise `git filter-repo` (ou équivalents) avec soin.
- **Prune/Gc agressifs** : risquent de supprimer des objets utiles si non référencés — vérifie le **reflog** avant.

---

## 📎 Glossaire (sélection)
- **Blob** : contenu brut d’un fichier.
- **Tree** : répertoire (liste d’entrées vers blobs/trees).
- **Commit** : snapshot + métadonnées, parents, message.
- **Tag** : référence (souvent annotée) vers un commit.
- **Ref** : pointeur vers un commit (`refs/heads/...`, `refs/tags/...`).
- **HEAD** : ref symbolique vers la branche courante, ou hash (détaché).
- **Index** : staging area ; prépare les fichiers pour le prochain commit.
- **Reflog** : historique local des mouvements de refs.
- **DAG** : graphe acyclique orienté (structure de l’historique Git).

---

## 📚 Ressources officielles
- Base de commandes (Git docs) : https://git-scm.com/docs  
- `git cat-file`, `git ls-tree`, `git rev-parse` : https://git-scm.com/docs  
- Détail des *plumbing* : https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain  
- Refs & reflog : https://git-scm.com/docs/gitreflog

---

## 🧾 Résumé des points essentiels — Chapitre 4
- **Compréhension des zones** : working tree ↔ index ↔ repository.
- **Objets Git** (blob/tree/commit/tag) et **adressage par contenu**.
- **HEAD** : symbolique vs détaché ; **refs** et **reflog** pour la récupération.
- **Plumbing** : inspecter/manipuler les objets et refs de façon sûre.
- **DAG** : visualiser et raisonner sur la **reachability**.

---

> 🔜 **Prochain chapitre** : [[05-chapitre-5-flux-minimal-init-add-commit-log]] (sera fourni après validation).
