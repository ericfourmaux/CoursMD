---
title: "🌿 Chapitre 6 — Branches & HEAD"
tags: [git, branches, head, checkout, switch, naming, upstream, tracking]
cssclass: chapitre
---

# 🌿 Chapitre 6 — Branches & HEAD

> **Objectif pédagogique :** comprendre **ce qu’est une branche** (pointeur léger vers un commit), **comment HEAD fonctionne** (référence symbolique vs détachée), et **manipuler** les branches en sécurité : créer, basculer, renommer, supprimer (local & remote), lier l’**upstream**, inspecter les **tracking branches**, et éviter les pièges courants.

---

## 🧠 Résumé rapide (à garder en tête)
- **Branche** = **pointeur** vers un commit ; un **commit** peut avoir **0/1/2+ parents** (merge) ; une branche **avance** quand tu **commits** dessus.
- **HEAD** = **ref symbolique** vers la branche courante (ex.: `refs/heads/main`) ou **détachée** (HEAD pointe **directement** un commit).
- **Créer** (`git switch -c` / `git checkout -b`), **basculer** (`git switch`), **renommer** (`git branch -m`), **supprimer** (`git branch -d/-D`), **remote** (`git push -u`, `git push --delete`).
- **Upstream** : associe ta branche locale à sa **branche distante** pour faciliter `git pull/push`.

---

## 📚 Définitions précises

### 🔹 Branche (définition)
Une **branche** Git est une **référence nommée** (`refs/heads/<nom>`) qui **pointe** vers le **dernier commit** d’une ligne de développement. Les branches sont **légères** : ce sont **juste des noms**, pas des copies de fichiers.

**Pourquoi** : isoler des travaux (features, fixes), organiser le flux (release/hotfix), expérimenter sans casser `main`.

**Exemple concret** :
```bash
# Créer et basculer sur une nouvelle branche de fonctionnalité
git switch -c feat/login
# Faire des commits… la branche avance automatiquement
```

### 🔹 HEAD (définition)
**HEAD** est une **référence** qui indique **où tu es** dans l’historique. Deux états :
- **Symbolique** : `HEAD` → `ref: refs/heads/<branche>` (ex.: `main`). Les nouveaux commits **déplacent** la branche.
- **Détaché** : `HEAD` → `<hash>` (commit) ; les nouveaux commits ne sont **pas** attachés à une branche (risque de perte si non référencés).

**Exemples** :
```bash
# Voir où pointe HEAD
git symbolic-ref -q HEAD           # ex.: refs/heads/main (si symbolique)

# Basculer en détaché (sur un commit)
git checkout <hash>                # équiv. git switch --detach <hash>

# Re-attacher en créant une branche
git switch -c fix/typo             # crée et attache HEAD à fix/typo
```

---

## 💡 Analogies
- **Fil et balise** : la branche est la **balise** qui marque le **bout** du fil de commits ; chaque commit **rallonge** ce fil.
- **Marque-page** : *HEAD* est le marque-page : il dit **où tu lis**. En mode détaché, tu lis une **page** sans être sur un **chapitre** (branche).

---

## 🧭 Schémas ASCII — Avancée d’une branche & états de HEAD

```text
(main) o---o---o A
              \
(feat/login)    o---o B
                   \ 
                    o---o M   (merge)
```
- `A`, `B` = commits de fin ; `M` = merge (2 parents).

```text
HEAD (symbolique)
HEAD -> refs/heads/main
main -> A

HEAD (détaché)
HEAD -> <hash_B>
(feat/login) -> B
```

---

## 🔧 Créer, basculer, renommer, supprimer

### Créer et basculer
```bash
# Méthode moderne (Git >= 2.23)
git switch -c feat/auth

# Ancienne commande (toujours valide)
git checkout -b feat/auth
```

### Basculer (sans créer)
```bash
git switch main
# ou
git checkout main
```

### Renommer (local)
```bash
# Renommer la branche courante
git branch -m feat/auth feat/login
```

### Supprimer (local)
```bash
# Sécurisé (refuse si commits non fusionnés)
git branch -d feat/login
# Forcé (⚠️ prudence)
git branch -D feat/login
```

---

## ☁️ Branches **distantes** & upstream

### Lier au remote (création côté GitHub)
```bash
# Pousser et établir l'upstream en une fois
git push -u origin feat/login
```

### Lister & voir le lien upstream
```bash
# Afficher branches locales & suivi
git branch -vv
```

### Définir/Changer l’upstream
```bash
git branch --set-upstream-to=origin/feat/login feat/login
```

### Supprimer une branche distante
```bash
git push origin --delete feat/login
```

### Synchroniser (fetch/pull)
```bash
# Récupérer les nouvelles refs
git fetch --all --prune
# Mettre à jour la branche courante depuis son upstream
git pull --rebase   # (recommande rebase pour garder un historique linéaire — chap. 7)
```

> **Astuce** : `--rebase` évite un *merge commit* automatique lors de `pull` et garde une ligne de commits propre (on détaillera au Chapitre 7).

---

## 🏷️ Conventions de nommage de branches
- Préfixes **clairs** : `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`.  
- **Kebab-case** ou **slash** pour structurer : `feat/api-auth`, `fix/ui/navbar-overflow`.  
- Évite les noms **génériques** : `update`, `work`, `temp`.  
- **Courtes** et **jetables** pour features : crée, merge, supprime → évite branches longues non synchronisées.

---

## 🔎 Inspection & dépannage rapide
```bash
# Où pointe une branche ?
git rev-parse feat/login

# Voir les commits non poussés/pullés
git log --oneline --graph --decorate --branches --remotes

# Comparer deux branches
git log main..feat/login --oneline   # commits présents sur feat/login mais pas sur main
```

---

## ✅ Checklist de fin de chapitre
- [ ] Je sais **créer/basculer** une branche (`switch`/`checkout`).
- [ ] Je sais **renommer/supprimer** localement et à distance.
- [ ] Je comprends **HEAD** (symbolique vs détaché) et je sais me **ré-attacher** proprement.
- [ ] Je sais configurer l’**upstream** et utiliser `branch -vv`.
- [ ] Je respecte des **noms de branches** parlant et courts.

---

## ⚠️ Encadré risques & hygiène
- **Detached HEAD** prolongé : risque de **perte** des commits → crée une **branche** dès que tu veux garder ton travail.
- **Suppression forcée** (`-D`) : peut **perdre** des commits non fusionnés → vérifie `log` et/ou ouvre une **PR** avant.
- **Branches longues** : accumulent des divergences → **rebase régulier** sur `main` (chap. 7) ou merges fréquents.
- **Nom flou** : rend la collaboration difficile → utilise **préfixes & descriptifs**.

---

## 🧑‍🏫 Théorie & modélisation en **JavaScript**

### 1) Pointeur de branche & avancement après commit
```js
// Modèle simplifié : un commit {id, parents: []}
function toyHash(str) { let h=0; for (let c of str) h=(h*31+c.charCodeAt(0))>>>0; return h.toString(16); }
function makeCommit(parentIds, message) { const id = toyHash(JSON.stringify({ parentIds, message, t: Date.now() })); return { id, parents: parentIds, message }; }

class Branch {
  constructor(name, tip=null) { this.name=name; this.tip=tip; }
  advance(newCommit) { this.tip = newCommit.id; }
}

// Créons une branche main, ajoutons 2 commits
const main = new Branch('main', null);
const c0 = makeCommit([], 'init');
main.advance(c0);
const c1 = makeCommit([main.tip], 'feat: base');
main.advance(c1);
console.log(main); // tip pointe sur le dernier commit
```

### 2) HEAD symbolique vs détaché
```js
class Head {
  constructor(refName=null, detachedId=null) { this.refName = refName; this.detachedId = detachedId; }
  isDetached() { return this.refName === null && this.detachedId !== null; }
  attach(refName) { this.refName = refName; this.detachedId = null; }
  detach(commitId) { this.refName = null; this.detachedId = commitId; }
}

const head = new Head('refs/heads/main');
head.detach('abc123');
console.log(head.isDetached()); // true
head.attach('refs/heads/feat/login');
console.log(head.isDetached()); // false
```

### 3) Tracking branches (mapping local ↔ remote)
```js
class Tracking {
  constructor() { this.map = new Map(); }
  set(local, remote) { this.map.set(local, remote); }
  get(local) { return this.map.get(local); }
}
const track = new Tracking();
track.set('feat/login', 'origin/feat/login');
console.log(track.get('feat/login')); // 'origin/feat/login'
```

---

## 🧪 Exercices pratiques
1. **Créer/renommer/supprimer** une branche locale (`switch -c`, `branch -m`, `branch -d`).  
2. **Pousser** une nouvelle branche sur GitHub et établir l’**upstream** (`push -u`).  
3. **Supprimer** la branche distante une fois fusionnée (`push origin --delete <branche>`).  
4. **Expérimenter le detached HEAD** : `checkout <hash>`, faire un commit, puis **sauver** en créant une branche (`switch -c`) et **pousser**.  
5. **Lister** les branches et vérifier `branch -vv` ; expliquer le lien local ↔ remote.

---

## 📎 Glossaire (sélection)
- **Branche** : ref nommée qui pointe le dernier commit.
- **HEAD** : référence de position (symbolique vers une branche, ou détachée vers un commit).
- **Upstream** : branche distante associée à une branche locale.
- **Tracking branch** : branche locale **suivant** une branche distante.
- **`-d` vs `-D`** : suppression prudente vs forcée.

---

## 📚 Ressources officielles
- Branches (`git-branch`, `git-switch`, `git-checkout`) : https://git-scm.com/docs  
- Références & HEAD (`gitrevisions`, `git symbolic-ref`) : https://git-scm.com/docs  
- Bonnes pratiques de nommage (guides) : https://docs.github.com/en/get-started/quickstart/github-flow

---

## 🧾 Résumé des points essentiels — Chapitre 6
- **Branches = pointeurs légers** qui avancent au fil des commits.
- **HEAD** : savoir **où tu es** (symbolique vs détaché) et re‑attacher.
- **Manipulations courantes** : créer, basculer, renommer, supprimer (local & remote).
- **Upstream & tracking** : simplifient `pull`/`push` et la collaboration.
- **Conventions de nommage** : rendent l’historique lisible et la collab fluide.

---

> 🔜 **Prochain chapitre** : [[07-chapitre-7-merge-vs-rebase-conflits-et-resolutions]] (sera fourni après validation).
