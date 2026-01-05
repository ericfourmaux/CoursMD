---
title: "🧳 Chapitre 8 — Stash, Amend, Restore, Reset, Revert"
tags: [git, stash, amend, restore, reset, revert, reflog, recovery]
cssclass: chapitre
---

# 🧳 Chapitre 8 — Stash, Amend, Restore, Reset, Revert

> **Objectif pédagogique :** savoir **mettre de côté** des changements (stash), **corriger** le dernier commit local (amend), **restaurer** des fichiers (restore), **déplacer HEAD** avec les **modes de reset** (soft/mixed/hard) et **annuler** proprement avec **revert** (anti‑commit sûr). Tu apprendras aussi des **recettes de sauvetage** avec `reflog` et les **bonnes pratiques** pour éviter d’endommager l’historique partagé.

---

## 🧠 Résumé rapide (à garder en tête)
- **stash** : met l’état du *working tree* (et éventuellement les **untracked**) dans une **pile** temporaire ; `apply/pop` pour revenir.
- **amend** : modifie **le dernier commit local** (message ou contenu). **Ne pas** amender si déjà **pushé**.
- **restore** : revient à la version **index** ou **HEAD** d’un fichier ; plus clair que `checkout` pour ces usages.
- **reset** : **déplace HEAD** sur un commit (soft/mixed/hard = impact différent sur index/working tree). ⚠️ Risques.
- **revert** : crée un **nouveau commit** qui **annule** un commit précédent ; **sûr** sur remote.

---

## 📚 Définitions précises

### 🔹 `git stash`
- **Définition** : enregistre **temporairement** les modifications du *working tree* (et éventuellement **untracked**) dans `.git/refs/stash` (pile). 
- **Pourquoi** : changer **rapidement de contexte** (pull, switch de branche, hotfix) sans committer du travail en cours.
- **Commandes clés** :
  ```bash
  # Basique : stash des modifications suivies
  git stash push -m "WIP: form login"

  # Inclure les fichiers non suivis (untracked)
  git stash push -u -m "WIP + untracked"

  # Inclure tout (même ignorés)
  git stash push -a -m "WIP + all"

  # Lister, appliquer, supprimer
  git stash list
  git stash apply stash@{0}   # conserve dans la pile
  git stash pop stash@{0}     # applique puis supprime
  git stash drop stash@{0}    # supprime sans appliquer

  # Stager seulement ce qui n'est pas dans l'index
  git stash push --keep-index

  # Stash partiel (interactif)
  git stash push -p
  ```

> **Astuce** : `stash@{0}` est le dernier élément ; la pile fonctionne en **LIFO** (dernier entré, premier sorti).

---

### 🔹 `git commit --amend`
- **Définition** : remplace **le dernier commit** par un **nouveau** (même parent) ; change le **hash**. 
- **Quand** : corriger un **message**, **ajouter** un fichier oublié, **retirer** un fichier.
- **Commandes clés** :
  ```bash
  # Modifier le message uniquement
  git commit --amend -m "feat(auth): init + doc"

  # Garder le message, juste le contenu
  git commit --amend --no-edit
  ```

> ⚠️ **Ne pas amender** un commit **déjà pushé** sur une branche partagée (réécriture d’historique). Préfère **un nouveau commit** ou **revert**.

**Alternative avancée** : `git commit --fixup <hash>` puis `git rebase -i --autosquash` (voir chap. 7) pour corriger proprement sans amend sur commit pushé.

---

### 🔹 `git restore`
- **Définition** : restaure des fichiers depuis l’**index** ou **HEAD** ; 
- **Pourquoi** : commande plus **explicite** que `checkout` pour la restauration.
- **Commandes clés** :
  ```bash
  # Retirer un fichier du staging (revient à l'état working)
  git restore --staged src/app.js

  # Revenir à la version index (ou HEAD si aucun index)
  git restore src/app.js

  # Revenir à la version d'un commit spécifique
  git restore --source=HEAD~1 src/app.js

  # Ne pas écraser (sécurité) : demander confirmation
  git restore --worktree --staged --source=HEAD --patch src/app.js
  ```

---

### 🔹 `git reset` (soft / mixed / hard)

- **Définition** : **déplace HEAD** vers un commit. Impact selon mode :
  - **`--soft`** : **HEAD** bouge ; **index/working** **inchangés** → prépare un **squash** (re‑commit).
  - **`--mixed`** (défaut) : HEAD bouge ; **index** est **réinitialisé** ; **working** **inchangé**.
  - **`--hard`** : HEAD bouge ; **index + working** **réinitialisés** au commit ciblé → ⚠️ **perte** de travail non commit.

- **Commandes clés** :
  ```bash
  # Revenir 1 commit en arrière (soft)
  git reset --soft HEAD~1

  # Revenir à un commit précis (mixed par défaut)
  git reset <hash>

  # Effacer tout ce qui n'est pas commit (hard)
  git reset --hard HEAD~1

  # Sécurité : voir le reflog avant un hard
  git reflog
  ```

> ⚠️ **`--hard`** supprime les modifications non commit ; assure‑toi de pouvoir récupérer via **reflog** et de ne pas être sur une branche **partagée**.

---

### 🔹 `git revert`
- **Définition** : crée un **nouveau commit** qui **annule** le contenu d’un commit ciblé (ou d’un merge).
- **Pourquoi** : **sûr** pour un dépôt **partagé** (n’efface pas l’historique, il ajoute un anti‑commit).
- **Commandes clés** :
  ```bash
  # Annuler le dernier commit (HEAD)
  git revert HEAD

  # Annuler un commit spécifique
  git revert <hash>

  # Annuler un merge commit (spécifier le parent principal)
  git revert -m 1 <merge-hash>

  # Revert d'une série (chronologique)
  git revert --no-commit <hash1> <hash2> && git commit -m "revert: annule la série"
  ```

> 💡 **Revert vs Reset** : `revert` **ajoute** un commit correctif (sécurisé) ; `reset` **déplace HEAD** (dangereux sur remote).

---

## 💡 Analogies pour retenir
- **Stash** : comme **une étagère** où tu poses rapidement ton travail en cours pour libérer le plan de travail.
- **Amend** : **corriger** la dernière page avant impression ; **ne pas** corriger un livre déjà publié (pushé).
- **Restore** : **revenir** à la version sauvegardée d’un fichier.
- **Reset** : **replacer** ton marque‑page (**HEAD**) dans le livre ; selon le mode, tu **garde** ou **jettes** les brouillons.
- **Revert** : écrire une **nouvelle page** qui **annule** une page précédente, sans arracher de pages.

---

## 🧭 Schémas ASCII — effets visuels

### Stack du `stash`
```text
stash@{2}  WIP: refactor
stash@{1}  WIP: api client
stash@{0}  WIP: form login  ← top (LIFO)
```

### Reset modes
```text
Avant: HEAD -> C3, index/working = C3

soft:  HEAD -> C2, index/working = C3  (re‑commit possible)
mixed: HEAD -> C2, index = C2, working = C3
hard:  HEAD -> C2, index = C2, working = C2  (⚠️ tout non commit perdu)
```

### Revert
```text
C0 — C1 — C2 — C3 — R(C2)
        \__________/
        anti‑commit qui annule C2, sans changer C0..C3
```

---

## 🧪 Recettes de sauvetage (avec `reflog`)
```bash
# 1) Tu as fait un reset --hard par erreur
git reflog                      # repère l'état avant le hard
git reset --hard HEAD@{1}

# 2) Tu as amend un commit pushé (ou rebase mal coordonné)
# → rebase interactif pour ré‑injecter, ou revert
git reflog
# si besoin, cherry-pick le commit perdu
git cherry-pick <hash>

# 3) Tu veux annuler plusieurs commits sur remote
git revert <hashA> <hashB>     # en série (attention à l’ordre)
```

---

## ⚠️ Encadré risques & hygiène
- **Amend/Rebase sur remote partagé** : **coordination** requise ; préfère **revert** si doute.
- **Reset hard** : ne pas l’utiliser à la légère ; pense **stash** avant et **reflog** pour revenir.
- **Stash non nommé** : multiplie les WIP anonymes → **message** `-m` pour s’y retrouver.
- **Revert de merge** : nécessite `-m <parent>` ; sinon résultat inattendu.

---

## 💻 VS Code — gestes rapides
- **Source Control** : bouton **Stash Changes** (selon extensions) ou via terminal intégré.
- **Diff & restore** : clic droit sur fichier → **Discard Changes** (équiv. restore).
- **Historique** (GitLens) : revert/amend guidé via UI.

---

## 🧑‍🏫 Théorie & modélisations en **JavaScript**

### 1) Simuler la pile de `stash`
```js
class Stash {
  constructor(){ this.stack = []; }
  push(entry){ this.stack.push(entry); }
  apply(){ return this.stack[this.stack.length - 1]; }
  pop(){ return this.stack.pop(); }
}

const stash = new Stash();
stash.push({ msg: 'WIP: form login', diff: '+input' });
stash.push({ msg: 'WIP: api client', diff: '+fetch' });
console.log(stash.apply().msg); // top sans retirer
console.log(stash.pop().msg);   // retire le top (LIFO)
```

### 2) Effet `reset` (soft/mixed/hard) sur index/working
```js
function reset(mode, headCommit, targetCommit){
  const state = { head: headCommit, index: headCommit, working: headCommit };
  if(mode === 'soft'){
    state.head = targetCommit;                 // index/working gardent les modifs
  } else if(mode === 'mixed'){
    state.head = targetCommit;
    state.index = targetCommit;                // working reste sur ancien état
  } else if(mode === 'hard'){
    state.head = targetCommit;
    state.index = targetCommit;
    state.working = targetCommit;              // tout aligné sur target
  }
  return state;
}
console.log(reset('soft', 'C3', 'C2'));  // {head:'C2', index:'C3', working:'C3'}
console.log(reset('mixed','C3','C2'));   // {head:'C2', index:'C2', working:'C3'}
console.log(reset('hard', 'C3', 'C2'));  // {head:'C2', index:'C2', working:'C2'}
```

### 3) `revert` comme anti‑commit
```js
function revertCommit(history, target){
  // history: [{id, delta}], delta: +X ou -X
  const anti = { id: `R(${target.id})`, delta: target.delta.startsWith('+') ? target.delta.replace('+','-') : target.delta.replace('-','+') };
  return [...history, anti];
}

const hist = [{id:'C1', delta:'+A'}, {id:'C2', delta:'+B'}, {id:'C3', delta:'+C'}];
const newHist = revertCommit(hist, hist[1]); // annule C2
console.log(newHist.map(x => x.id)); // [ 'C1', 'C2', 'C3', 'R(C2)' ]
```

---

## 🧪 Exercices pratiques
1. **Stash/Pop** : modifie 2 fichiers, fais `stash push -m`, puis `stash pop`; explique ce qui se passe si tu avais des **conflits**.
2. **Amend sûr** : ajoute un fichier oublié et `--amend --no-edit` (sur commit **non pushé**).
3. **Restore ciblé** : `restore --source=HEAD~1` sur un seul fichier ; explique la différence avec `checkout`.
4. **Reset** : crée 3 commits, fais `--soft`, `--mixed`, `--hard` et observe index/working via `status`.
5. **Revert** : annule un commit fautif ; puis pousse sur remote et ouvre une PR de correction.
6. **Reflog** : simule une erreur (`reset --hard`), récupère avec `HEAD@{n}`.

---

## 📎 Glossaire (sélection)
- **Stash** : pile temporaire de modifications du working tree.
- **Amend** : réécrit le dernier commit local.
- **Restore** : restaure fichiers depuis index/HEAD.
- **Reset** : déplace HEAD (impact index/working selon mode).
- **Revert** : anti‑commit sûr qui annule un commit.
- **Reflog** : journal local des mouvements de refs (sauvetage).

---

## 📚 Ressources officielles
- `git stash` : https://git-scm.com/docs/git-stash  
- `git commit` (amend) : https://git-scm.com/docs/git-commit  
- `git restore` : https://git-scm.com/docs/git-restore  
- `git reset` : https://git-scm.com/docs/git-reset  
- `git revert` : https://git-scm.com/docs/git-revert  
- `git reflog` : https://git-scm.com/docs/gitreflog

---

## 🧾 Résumé des points essentiels — Chapitre 8
- **Stash** : mettre de côté et reprendre ; messages et options (`-u`, `-a`, `--keep-index`, `-p`).
- **Amend** : corriger **localement** le dernier commit ; éviter si **pushé**.
- **Restore** : commande **claire** pour revenir à des versions connues.
- **Reset** : comprendre **soft/mixed/hard** et les impacts ; prudence avec `--hard`.
- **Revert** : méthode **sécurisée** pour annuler sur **remote** ; spécial pour merges via `-m`.
- **Reflog** : meilleur ami en cas d’erreur pour **récupérer**.

---

> 🔜 **Prochain chapitre** : [[09-chapitre-9-diff-blame-bisect-enqueter]] (sera fourni après validation).
