---
title: "🔗 Chapitre 7 — Merge vs Rebase : conflits & résolutions"
tags: [git, merge, rebase, conflits, resolution, fast-forward, no-ff, rebase-interactif, rebase-onto, reflog]
cssclass: chapitre
---

# 🔗 Chapitre 7 — Merge vs Rebase : conflits & résolutions

> **Objectif pédagogique :** comprendre **en profondeur** la différence entre **merge** et **rebase**, savoir **quand choisir** l’un ou l’autre, **résoudre les conflits** proprement, utiliser **rebase interactif** pour nettoyer l’historique, et **se protéger** (reflog, `--force-with-lease`).

---

## 🧠 Résumé rapide (à garder en tête)
- **Merge** : crée un **commit de jonction** avec **deux parents** ; préserve la **chronologie réelle** et l’**intégration**.
- **Rebase** : **rejoue** des commits sur une **nouvelle base** ; produit un historique **linéaire**, change les **hashes**.
- **Conflits** : mêmes principes, que ce soit merge ou rebase ; on corrige, on **stage**, puis on **continue**.
- **Sécurité** : **ne rebaser pas** des branches **déjà partagées** sans coordination ; si nécessaire, `push --force-with-lease`.

---

## 📚 Définitions précises

### 🔹 Merge
- **Définition** : crée un **commit** `M` avec **deux parents** (ex. `main` et `feature`).
- **Pourquoi** : garder la **trace** explicite de l’intégration ; **aucun changement** sur les commits existants.
- **Commandes clés** :
  ```bash
  # Depuis main, intégrer feature
  git switch main
  git merge feature             # merge (fast-forward si possible)

  # Empêcher fast-forward (forcer un commit de merge)
  git merge --no-ff feature
  ```

### 🔹 Rebase
- **Définition** : **réapplique** les commits d’une branche sur une nouvelle base (ex. `main`) ; **nouveaux hashes** générés.
- **Pourquoi** : obtenir un historique **linéaire**, faciliter la lecture (`git log --oneline`).
- **Commandes clés** :
  ```bash
  # Rebasing la branche feature sur main
  git switch feature
  git rebase main               # rejoue les commits de feature au-dessus de main

  # Rebase interactif (nettoyage)
  git rebase -i main            # squash/fixup/reword/edit/drop
  ```

> **Règle d’or** : **ne rebase pas** `main` ou une branche **déjà poussée et partagée** (sauf si toute l’équipe est alignée).

---

## 💡 Analogies
- **Merge = tresse** : on **tresse** deux fils pour créer une corde commune, avec un **nœud visible** (commit de merge).
- **Rebase = réinterprétation** : on **rejoue** la même partition, mais **à partir** d’une nouvelle tonalité (base) ; le **résultat** est similaire mais les **notes** (hashes) changent.

---

## 🧭 Schémas ASCII — Merge vs Rebase

### Avant intégration
```text
main:    o---o---A
                 \
feature:          o---B---C
```

### Merge (fast-forward possible)
```text
main:    o---o---A---B---C   # ff si A est l’ancêtre direct de C
feature:          o---B---C
```

### Merge (commit de merge)
```text
main:    o---o---A-----------M
                 \         /
feature:          o---B---C
```

### Rebase (feature sur main)
```text
main:    o---o---A
                 \
feature:          o---B'--C'  # nouveaux hashes
```

---

## 🔧 Conflits : détecter, résoudre, continuer

### Détection
```bash
# Fichiers en conflit
git status
# ou
git diff --name-only --diff-filter=U
```

### Marqueurs de conflit (dans les fichiers)
```text
<<<<<<< HEAD
ligne depuis main
=======
ligne depuis feature
>>>>>>> feature
```

### Résolutions courantes
```bash
# Choisir notre version (ours) ou la leur (theirs) sur un fichier
git checkout --ours   path/to/file
git checkout --theirs path/to/file

# OU utiliser mergetool (si configuré)
git mergetool

# Après résolution, **stagé** et continuer (merge/rebase)
git add path/to/file
# Merge
git merge --continue
# Rebase
git rebase --continue

# Abandonner
git merge --abort
# ou
git rebase --abort

# Sauter un commit fautif (rebase)
git rebase --skip
```

> **Bonnes pratiques** : résout **petit à petit**, re‑lance les **tests** localement, et n’oublie pas la **revue** via PR si l’intégration est complexe.

---

## 🔁 Rebase interactif : nettoyer l’historique

### Objectifs
- **Squash** commits intermédiaires en **un** commit cohérent.
- **Fixup** pour fusionner un correctif avec le commit précédent.
- **Reword** pour améliorer un message.
- **Drop** pour supprimer un commit inutile.

### Exécution
```bash
git switch feature
git rebase -i main
# L’éditeur ouvre le rebase-todo :
# pick <h1> feat: base
# pick <h2> fix: typo
# pick <h3> docs: update
# → changer en :
# pick <h1> feat: base
# fixup <h2>
# squash <h3>
```

> **Résultat** : historique **plus lisible**, idéal avant d’ouvrir une **PR**.

---

## 🧭 Rebase avancé : `--onto`, `--rebase-merges`

### `--onto` (changer d’assise spécifiquement)
```bash
# Rejouer les commits de feature à partir de new-base
# en sautant tout ce qui est commun (old-base)
git rebase --onto new-base old-base feature
```

### `--rebase-merges`
```bash
# Préserver la structure de merge lors d'un rebase
git rebase --rebase-merges main
```

---

## ☁️ Pull avec rebase
```bash
# Mettre à jour la branche courante **sans merge commit auto**
git pull --rebase
# Équivalent souvent recommandé dans projets front pour garder un log linéaire
```

---

## 🛡️ Sécurité : poussée forcée, reflog, politique d’équipe

### Pousser après rebase
```bash
# Tu as réécrit l’historique local → utilise le "lease"
git push --force-with-lease
# ⚠️ Évite "--force" brut : risque d'écraser le travail d'autrui
```

### Reflog : filet de sécurité
```bash
# Voir les mouvements récents
git reflog
# Récupérer avant rebase/merge
git reset --hard HEAD@{1}
```

### Politique d’équipe (recommandations)
- **Petites branches** (durée courte), **rebase** locaux avant PR.
- Sur `main` : **merge via PR** (review + CI) ; éviter rebase **partagé**.
- Protéger `main` : **protected branch** + `require linear history` (selon préférence) + CI verte.

---

## 🧪 Exercices pratiques
1. **Merge fast-forward** : crée `feature/ff`, fais 2 commits, merge sur `main` (ff).  
2. **Merge avec commit de merge** : force `--no-ff`, observe le DAG (`git log --graph`).  
3. **Rebase simple** : rebase `feature` sur `main`, résout un **conflit**, `rebase --continue`.  
4. **Rebase interactif** : `-i` pour **squash/fixup/reword**.  
5. **Rebase --onto** : rejoue une série en changeant l’assise.  
6. **Push sécurisé** : après rebase, utilise `--force-with-lease` et montre comment **reflog** permet de récupérer.

---

## ⚠️ Encadré risques & hygiène
- **Rebase sur branche partagée** : risque de **divergences** ; **coordination** et `--force-with-lease` nécessaires.
- **Conflits laissés** : ne **stage** pas des fichiers avec **marqueurs** non retirés ; relis **diff** avant de continuer.
- **`--force` brut** : peut écraser le travail d’un collègue ; préfère `--force-with-lease`.
- **Squash excessif** : perdre la granularité utile ; garder un **équilibre**.

---

## 🧑‍🏫 Théorie & modélisation en **JavaScript**

### 1) Simulation de **merge** (commit à deux parents)
```js
function toyHash(str){let h=0;for(const c of str)h=(h*31+c.charCodeAt(0))>>>0;return h.toString(16);} 
function commit(tree, parents, msg){const id=toyHash(JSON.stringify({tree,parents,msg}));return {id,tree,parents,msg};}

const A = commit({files:['a']}, [], 'A');
const B = commit({files:['a','b']}, [A.id], 'B');
const C = commit({files:['a','c']}, [A.id], 'C');
const M = commit({files:['a','b','c']}, [B.id, C.id], 'merge B+C');
console.log(M.parents.length === 2); // true
```

### 2) Simulation de **rebase** (rejouer commits sur une nouvelle base)
```js
function rebase(baseId, commits){
  // commits: [{id, parents:[prev], msg}]
  let currentBase = baseId;
  const rebased = [];
  for (const c of commits){
    const newCommit = commit(c.tree, [currentBase], c.msg + ' (rebased)');
    rebased.push(newCommit);
    currentBase = newCommit.id;
  }
  return rebased;
}

const base = A.id; // supposons A comme base
const featureCommits = [B, C];
const rebased = rebase(base, featureCommits);
console.log(rebased.map(x=>x.id)); // nouveaux ids
```

### 3) Détection **naïve** de conflit texte
```js
function conflict(aLine, bLine){
  return aLine.trim() !== bLine.trim();
}
console.log(conflict('color: red;', 'color: blue;')); // true
```

---

## 📎 Glossaire (sélection)
- **Fast-forward** : avancer le pointeur de branche sans créer de commit de merge.
- **No‑ff** : forcer un commit de merge même si ff possible.
- **Rebase interactif** : éditer l’ordre/contenu des commits (`pick`, `squash`, `fixup`, `reword`, `drop`).
- **`--onto`** : rebase avancé en spécifiant nouvelle base et ancienne.
- **Reflog** : journal local des mouvements de refs ; permet de **récupérer**.
- **`--force-with-lease`** : poussée forcée **sécurisée** ; refuse d’écraser si remote a avancé.

---

## 📚 Ressources officielles
- `git merge` : https://git-scm.com/docs/git-merge  
- `git rebase` : https://git-scm.com/docs/git-rebase  
- Rebase interactif : https://git-scm.com/docs/git-rebase#Documentation/git-rebase.txt---interactive  
- Résolution de conflits : https://git-scm.com/docs/git-merge#_how_conflicts_are_presented  
- Reflog : https://git-scm.com/docs/gitreflog

---

## 🧾 Résumé des points essentiels — Chapitre 7
- **Merge** : préserve la chronologie, peut créer un **commit de jonction**.
- **Rebase** : réécrit l’historique pour un **log linéaire** ; attention aux branches partagées.
- **Conflits** : mêmes étapes (corriger, **stage**, **continue**), `--abort` et `--skip` utiles.
- **Nettoyage** : **rebase interactif** (`squash`, `fixup`, etc.) avant PR.
- **Sécurité** : `--force-with-lease`, **reflog** et **politiques d’équipe**.

---

> 🔜 **Prochain chapitre** : [[08-chapitre-8-stash-amend-restore-reset-revert]] (sera fourni après validation).
