---
title: "☁️ Chapitre 10 — Remotes : origin, fetch, pull, push"
tags: [git, remote, origin, fetch, pull, push, upstream, refspec, ahead, behind]
cssclass: chapitre
---

# ☁️ Chapitre 10 — Remotes : origin, fetch, pull, push

> **Objectif pédagogique :** maîtriser les **remotes** (définitions, URLs SSH/HTTPS), comprendre les **branches suivies** (*tracking branches*), utiliser **fetch/pull/push** en sécurité, configurer l’**upstream**, interpréter **ahead/behind**, manipuler les **refspecs**, pousser/rapatrier les **tags**, et appliquer les **bonnes pratiques** (prune, `--force-with-lease`, `pull --rebase`).

---

## 🧠 Résumé rapide (à garder en tête)
- **Remote** = dépôts **distants** (ex.: `origin`) liés à ton dépôt local via une **URL** (SSH recommandé).
- **Fetch** = **récupération** des nouvelles refs **sans modifier** ta branche courante.
- **Pull** = `fetch` + **intégration** (merge par défaut, souvent **rebase** recommandé).
- **Push** = **envoi** de tes commits vers la branche distante (souvent via `-u` pour lier l’upstream).
- **Tracking branches** : `main` ↔ `origin/main` ; utilise `branch -vv`, `status -sb`, et `rev-list` pour lire **ahead/behind**.
- **Sécurité** : préfère `--force-with-lease` (pas `--force`), active `fetch.prune`, et config **pull.rebase=true** pour historique lisible.

---

## 📚 Définitions & concepts

### 🔹 Remote
Un **remote** est un **alias** local (ex.: `origin`, `upstream`) pointant vers une **URL** SSH/HTTPS. Il permet de **synchroniser** avec un dépôt hébergé (GitHub).

**Commandes clés :**
```bash
# Lister les remotes et leurs URLs
git remote -v

# Ajouter un remote (SSH recommandé)
git remote add origin git@github.com:<user>/<repo>.git

# Renommer un remote
git remote rename origin upstream

# Changer l’URL (ex.: basculer HTTPS → SSH)
git remote set-url origin git@github.com:<user>/<repo>.git

# Inspecter un remote en détail
git remote show origin
```

### 🔹 Tracking branches & upstream
- Une **branche locale** peut **suivre** une **branche distante** (ex. `main` suit `origin/main`).  
- L’**upstream** simplifie `git pull`/`git push` (sans préciser remote/branche).

**Commandes clés :**
```bash
# Étendre l'upstream à la créations
git push -u origin main   # crée origin/main et lie main ↔ origin/main

# (ou) définir après coup
git branch --set-upstream-to=origin/main main

# Visualiser le suivi et ahead/behind
git branch -vv
```

---

## 🔁 `fetch` vs `pull`

### 🔧 `git fetch`
- **Récupère** les **nouvelles refs** (commits, tags) depuis le remote **sans** modifier ta branche courante.  
- Utile pour **prévisualiser** et **revoir** avant d’intégrer.

**Exemples :**
```bash
# Récupérer toutes les refs
git fetch origin

# Récupérer et nettoyer les branches distantes supprimées
git fetch --prune

# Activer le prune par défaut
git config --global fetch.prune true
```

### 🔧 `git pull`
- **Combine** `fetch` + **intégration** (merge par défaut).  
- Recommandation fréquente : **`pull --rebase`** pour un historique **linéaire** (moins de merge auto).

**Exemples & config :**
```bash
# Mettre à jour la branche courante depuis son upstream
git pull --rebase

# Configurer le rebase par défaut
git config --global pull.rebase true

# Automatiquement stash avant rebase (évite conflits d'état)
git config --global rebase.autoStash true
```

> **Astuce :** Si la branche est protégée sur GitHub (PR requise), évite `pull` direct sur `main` : travaille en **feature branch** → **PR**.

---

## 🚀 `push` — envoyer au remote

### 🔧 Base
```bash
# Pousser la branche courante vers l'upstream
git push

# Créer et lier une nouvelle branche en une fois
git push -u origin feat/login

# Pousser un tag
git tag -a v1.0.0 -m "release"
git push origin v1.0.0
# (ou) tous les tags
git push --tags
```

### 🔒 Sécurité du push
```bash
# En cas d'historique réécrit local (rebase/amend)
# Utilise le "lease" pour ne pas écraser le travail distant
git push --force-with-lease

# (Évite) --force brut : peut écraser des commits distants
```

### ⚙️ Comportement par défaut
```bash
# Recommandé : push.default=simple (Git >= 2.0)
git config --global push.default simple
```
- `simple` : pousse **branche courante** vers **upstream** si noms **identiques** ; sinon refuse (plus sûr).

---

## 🔎 Lire **ahead/behind**

### 👀 Vue rapide
```bash
git status -sb    # ex.: "## main...origin/main [ahead 2, behind 1]"
```

### 🧮 Comptage précis
```bash
# Combien de commits d'avance / retard ?
git rev-list --left-right --count origin/main...main
# → sortie: "behind ahead"
```

> **Bonne pratique** : si **ahead** > 0 et **behind** > 0, alors la branche est **divergente** → rebase ou merge avant push.

---

## 🧩 Refspecs — mode avancé
Un **refspec** décrit **quoi** récupérer/pousser et **où** le stocker.

### 🔧 Syntaxe
- **Fetch** : `<src>:<dst>` (dans `remote.<name>.fetch`).  
- **Push** : `<src>:<dst>` (dans `remote.<name>.push`).  
- **`+`** prefixe : autorise **non‐FF** (⚠️ à manier avec prudence).

**Exemples :**
```bash
# Pousser explicitement main vers origin/main
git push origin main:main

# Pousser head courant vers une autre branche distante
git push origin HEAD:refs/heads/review/tmp

# Fetch sélectif (ex.: seulement main)
git fetch origin refs/heads/main:refs/remotes/origin/main
```

---

## 🏷️ Tags — rapatrier & publier
```bash
# Voir les tags
git tag --list

# Récupérer les tags
git fetch --tags

# Publier un tag précis
git push origin v2.3.1

# Supprimer un tag (local + remote)
git tag -d v2.3.1
git push origin :refs/tags/v2.3.1
```

> **Tip release** : privilégie les **tags annotés** (`-a`) avec message & signature (voir Chapitre 13).

---

## 🌿 Fork & multi‐remotes (origin/upstream)

### Cas courant
- Tu **forkes** un projet : 
  - `origin` = **ton fork** (écriture)  
  - `upstream` = **dépôt original** (lecture)

**Mise en place :**
```bash
git remote add upstream git@github.com:<org>/<repo>.git
git fetch upstream
# Synchroniser ta main avec upstream/main
git switch main
git pull --rebase upstream main
# Pousser sur ton fork
git push origin main
```

---

## 📦 Clones *shallow* & performance
```bash
# Clone superficiel (limite l'historique)
git clone --depth=20 git@github.com:<user>/<repo>.git

# Une seule branche
git clone --branch main --single-branch git@github.com:<user>/<repo>.git

# Élargir après coup
git fetch --unshallow
```

> **Attention** : certains outils (bisect, recherche approfondie) sont **limités** en shallow.

---

## 💻 VS Code — intégration
- **Source Control** : `Pull`, `Push`, `Fetch` dans la barre.  
- **GitLens** : montre `ahead/behind`, remote, et liens vers GitHub.  
- **Quick Actions** : depuis la vue de branche, `Publish Branch` (push + upstream).

---

## ⚠️ Encadré risques & hygiène
- **`--force` brut** : **risque** d’écraser l’historique distant → préfère `--force-with-lease`.
- **Branches protégées** : `push` direct refusé → passe par **PR**.
- **URLs en clair (HTTPS)** : attention à la **gestion des tokens** ; préfère **SSH** si possible.
- **Divergence non résolue** : pousser en **non‐FF** peut casser des pipelines ; rebase/merge d’abord.
- **Prune non activé** : refs distantes obsolètes encombrent ; **active** `fetch.prune`.

---

## 🧪 Exercices pratiques
1. **Configurer upstream** : crée `feat/login`, `push -u origin feat/login`, vérifie `branch -vv`.
2. **Ahead/behind** : fais 2 commits localement, `status -sb`, puis `rev-list --left-right --count`.
3. **Fetch & prune** : supprime une branche côté GitHub, `fetch --prune`, vérifie disparition de `refs/remotes`.
4. **Pull --rebase** : simule une divergence, résous via `pull --rebase` + `rebase.autoStash=true`.
5. **Refspec ciblé** : `push origin HEAD:refs/heads/review/tmp`, vérifie sur GitHub.
6. **Tags** : crée `v0.1.0`, `push origin v0.1.0`, puis supprime local+remote.

---

## 🧑‍🏫 Théorie & modélisation en **JavaScript**

### 1) Calcul **ahead/behind** (simplifié)
```js
// commitsMain & commitsLocal sont des listes d'IDs (du plus ancien au plus récent)
function aheadBehind(commitsRemote, commitsLocal){
  const setRemote = new Set(commitsRemote);
  const setLocal  = new Set(commitsLocal);
  const behind = commitsRemote.filter(id => !setLocal.has(id)).length;
  const ahead  = commitsLocal.filter(id => !setRemote.has(id)).length;
  return { ahead, behind };
}
```

### 2) RefSpec (mappage src → dst)
```js
function applyPushRefspec(localRef, remoteRef, allowNonFF=false){
  return { src: localRef, dst: remoteRef, nonFFAllowed: !!allowNonFF };
}

const r = applyPushRefspec('refs/heads/feat/login', 'refs/heads/feat/login');
console.log(r.dst); // refs/heads/feat/login
```

### 3) Push sécurisé (lease simplifié)
```js
function safePush(localTip, expectedRemoteTip){
  // Simule --force-with-lease: on n'écrase que si le remote n'a pas avancé
  return {
    canPush: localTip.parent === expectedRemoteTip,
    reason: localTip.parent === expectedRemoteTip ? 'OK' : 'Remote advanced; abort'
  };
}
```

---

## 📎 Glossaire (sélection)
- **Remote** : alias d’un dépôt distant (ex.: `origin`).
- **Upstream** : branche distante **suivie** par une branche locale.
- **Fetch/Pull** : récupérer vs récupérer + intégrer.
- **Push** : envoyer commits vers le remote.
- **Ahead/Behind** : nombre de commits **d’avance** / **de retard**.
- **Refspec** : règle de mappage des refs entre local et distant.
- **Prune** : suppression des refs distantes orphelines.

---

## 📚 Ressources officielles
- `git remote` : https://git-scm.com/docs/git-remote  
- `git fetch` : https://git-scm.com/docs/git-fetch  
- `git pull` : https://git-scm.com/docs/git-pull  
- `git push` : https://git-scm.com/docs/git-push  
- Refspecs : https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain#_refspec  
- Config `push.default` : https://git-scm.com/docs/git-config#Documentation/git-config.txt-pushdefault

---

## 🧾 Résumé des points essentiels — Chapitre 10
- **Remote & URLs** : maîtrise `remote -v`, `add`, `set-url` ; préfère **SSH**.
- **Fetch/Pull** : utilise `fetch --prune` et **`pull --rebase`** + `rebase.autoStash`.
- **Push & sécurité** : `-u` pour upstream, `push.default=simple`, **`--force-with-lease`**.
- **Ahead/Behind** : lisible via `status -sb` + `rev-list` ; **résous la divergence** avant push.
- **Refspecs & Tags** : sais pousser précisément et gérer les **tags** proprement.

---

> 🔜 **Prochain chapitre** : [[11-chapitre-11-forks-pull-requests-code-review]] (sera fourni après validation).
