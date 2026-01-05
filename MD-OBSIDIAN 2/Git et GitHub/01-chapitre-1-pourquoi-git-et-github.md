---
title: "📘 Chapitre 1 — Pourquoi Git ? Pourquoi GitHub ?"
tags: [git, github, débutant, vision, motivations]
cssclass: chapitre
---

# 📘 Chapitre 1 — Pourquoi Git ? Pourquoi GitHub ?

> **Objectif pédagogique :** comprendre ce que sont **Git** et **GitHub**, pourquoi ils existent, ce qu’ils résolvent, et comment ils s’articulent dans un flux de travail moderne. À l’issue de ce chapitre, tu sauras expliquer les bénéfices et les limites, et lire des schémas d’historique de commits.

---

## 🧠 Résumé rapide (à garder en tête)
- **Git** : *système de contrôle de versions distribué* (VCS) → historique complet local, commits immuables, branches légères.
- **GitHub** : *plateforme d’hébergement & collaboration* → Pull Requests, issues, actions CI/CD, pages.
- **Pourquoi** : fiabilité, traçabilité, collaboration, productivité, sécurité.  
- **Quand éviter** : gros binaires sans LFS, secrets dans dépôt, workflows non adaptés.

---

## 📚 Définitions précises

### 🔹 Git (définition formelle)
**Git** est un **système de contrôle de versions distribué**. Il **enregistre des instantanés (snapshots)** des fichiers sous forme d’**objets** (blobs, trees, commits, tags) reliés en **graphe acyclique orienté (DAG)**. Chaque *commit* est identifié par un **hachage** (SHA‑1/2 selon config), calculé sur son contenu et sa métadonnée. Les **branches** sont des **pointeurs légers** vers des commits.

**Propriétés clés :**
- *Distribué* : chaque clone contient **tout l’historique** et peut travailler **hors ligne**.
- *Immutabilité logique* : modifier l’historique **crée de nouveaux commits** (nouveaux hachages), ne réécrit pas en place.
- *Structure en DAG* : chaque commit pointe vers **un ou plusieurs parents** (merge).

### 🔹 GitHub (définition formelle)
**GitHub** est un service d’hébergement de dépôts Git, offrant des **outils de collaboration** : **Pull Requests**, **code review**, **Issues**, **Projects**, **Actions (CI/CD)**, **Pages**. Il fournit une **surcouche sociale et opérationnelle** (permissions, équipes, règles de protection de branches, releases).

---

## ❓ Pourquoi Git ? Pourquoi GitHub ? (le *pourquoi*)

### 🎯 Problèmes résolus par Git
- **Traçabilité** : qui a changé quoi, quand, pourquoi (message de commit, auteur, date). 
- **Sécurité logique** : l’historique est **adressé par contenu** (hachage), ce qui évite des altérations silencieuses.
- **Expérimentation** : **branches** pour isoler des travaux, **merge/rebase** pour intégrer proprement.
- **Performance** : snapshots compactés, delta storage, opérations locales rapides.

### 🤝 Ce que GitHub ajoute
- **Collaboration** : Pull Requests, **review** avec commentaires en ligne, **règles** de protection.
- **Organisation** : Issues, labels, Projects (Kanban), milestones.
- **Automatisation** : GitHub Actions (lint, tests, build, release).
- **Publication** : Releases (notes), Pages (site statique).

---

## 💡 Analogies pour "voir" Git

- **Machine à remonter le temps** : chaque commit est une *photo* de l’état du projet. On peut *revenir* à une photo, comparer des photos, ou *tresser* des fils (merge) pour créer une nouvelle photo combinée.
- **Bibliothécaire des versions** : Git classe chaque édition d’un livre (projet) avec un identifiant unique (hachage), range les exemplaires (commits) sur une étagère (branche), et le catalogue (log) documente l’histoire.
- **Carnet de recettes** : chaque commit est une recette complète. Un merge combine 2 carnets en une recette *annotée*.

---

## 🧭 Schémas ASCII — Historique & branches

```text
(main) o---o---o A
              \
(feature)      o---o B
                   \ 
                    o---o M  (merge commit)
```
- `A`, `B` = commits finaux sur *main* et *feature* ; `M` = **merge commit** avec deux parents.

```text
HEAD -> main
main -> commit(A)
feature -> commit(B)
```

---

## 🔧 Exemples concrets (conceptuels, sans installation)

> Ces exemples sont pour compréhension. La mise en place réelle se fera au **Chapitre 2**.

- **Cycle d’un commit**
  1. Tu modifies des fichiers (*working tree*).
  2. Tu sélectionnes ce qui doit partir dans le prochain commit (**index/staging area**).
  3. Tu crées un **commit** (snapshot + message).
- **Brancher pour une fonctionnalité**
  - Créer une branche `feature/login`, y faire des commits, puis **merge** dans `main` avec review (sur GitHub).

---

## 🧪 Exercices guidés (conceptuels)

1. **Cartographier un petit projet**  
   Liste 3 fonctionnalités et imagine une branche pour chacune. Dessine un schéma ASCII de merges vers `main`.
2. **Rédiger des messages de commit**  
   Écris 5 messages selon *Conventional Commits* (ex.: `feat(ui): ajouter le composant bouton`). Explique pour chaque *pourquoi* le changement.
3. **Identifier les risques**  
   Cite 3 risques (ex.: secrets commités, absence de review, rebase maladroit sur `main`) et comment les éviter.

---

## ✅ Checklist de fin de chapitre

- [ ] Je peux **définir Git** et **GitHub** précisément.  
- [ ] Je comprends **commits**, **branches**, **merge**, **rebase** (au moins conceptuellement).  
- [ ] Je sais **pourquoi** Git/GitHub sont utiles et leurs **limites**.  
- [ ] Je lis un **schéma** d’historique (DAG, merge commit).

---

## ⚠️ Encadré risques & hygiène

- **Secrets dans l’historique** : éviter de compter `.env`, clés API ; utiliser `.gitignore`, `git-secrets`, et revue.  
- **Gros binaires** : privilégier **Git LFS** pour médias volumineux.  
- **Messages vagues** : bannir `fix` ou `update` sans contexte.

---

## 🧑‍🏫 Théorie représentée en JavaScript

> Modéliser l’idée d’un **commit** immuable, d’un **merge** (deux parents), et d’un **DAG** simplifié.

```js
// 🔢 Hachage conceptuel (illustratif) — ne pas utiliser en prod
// Remplace l’idée de SHA par une simple empreinte pour visualiser l'immuabilité.
function toyHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

// 🧱 Commit minimaliste
function makeCommit({ parentHashes = [], tree, author, message, timestamp }) {
  const payload = JSON.stringify({ parentHashes, tree, author, message, timestamp });
  const hash = toyHash(payload);
  return { hash, parentHashes, tree, author, message, timestamp };
}

// 🌿 Branche = pointeur vers un commit
class Branch {
  constructor(name, tip = null) { this.name = name; this.tip = tip; }
  advance(commit) { this.tip = commit; }
}

// 🔗 Merge = commit avec deux parents
function mergeCommits(commitA, commitB, author) {
  const mergedTree = { /* ...résultat conceptuel de fusion des fichiers... */ };
  return makeCommit({
    parentHashes: [commitA.hash, commitB.hash],
    tree: mergedTree,
    author,
    message: `merge: ${commitA.hash.slice(0,7)} + ${commitB.hash.slice(0,7)}`,
    timestamp: Date.now()
  });
}

// 🧭 DAG : on construit un petit graphe puis on calcule un ordre topologique
function topoOrder(commits) {
  // commits: {hash, parentHashes: []}
  const indeg = new Map();
  const children = new Map();
  for (const c of commits) {
    indeg.set(c.hash, (indeg.get(c.hash) || 0) + 0); // ensure key
    for (const p of c.parentHashes) {
      children.set(p, (children.get(p) || new Set()).add(c.hash));
      indeg.set(c.hash, (indeg.get(c.hash) || 0) + 1);
      indeg.set(p, (indeg.get(p) || 0) + 0);
    }
  }
  const queue = [...[...indeg.entries()].filter(([_, d]) => d === 0).map(([h]) => h)];
  const order = [];
  while (queue.length) {
    const h = queue.shift();
    order.push(h);
    for (const ch of children.get(h) || []) {
      indeg.set(ch, indeg.get(ch) - 1);
      if (indeg.get(ch) === 0) queue.push(ch);
    }
  }
  return order; // ordre logique des commits (parents avant enfants)
}

// 🧪 Démonstration d'immuabilité : changer le message change le hash
const base = makeCommit({ parentHashes: [], tree: { files: ["index.html"] }, author: "eric", message: "init", timestamp: 1 });
const amended = makeCommit({ parentHashes: [], tree: { files: ["index.html"] }, author: "eric", message: "init!", timestamp: 1 });
console.log(base.hash !== amended.hash); // true → montre l'impact du contenu sur l'identifiant
```

---

## 📎 Glossaire (mini)
- **VCS (Version Control System)** : outil pour historiser les versions d’un projet.
- **Commit** : instantané de l’état d’un projet + message.
- **Branch** : pointeur vers un commit ; isoler des travaux.
- **Merge** : création d’un commit avec **deux parents** pour combiner des branches.
- **Rebase** : réapplique des commits sur une nouvelle base (réécrit les hachages).
- **Remote** : dépôt distant (ex. GitHub) ; `origin` est le nom courant par défaut.

---

## 📚 Ressources officielles
- Documentation Git : https://git-scm.com/docs  
- Guides GitHub : https://docs.github.com/

---

## 🧾 Résumé des points essentiels — Chapitre 1

- Git = VCS distribué, snapshots, DAG, immutabilité via hachage.  
- GitHub = plateforme de collaboration (PR, issues, Actions, Pages).  
- Bénéfices : traçabilité, collaboration, sécurité logique, performance, expérimentation.  
- Risques : secrets commités, binaires non gérés, messages vagues, flux inadaptés.

---

> 🔜 **Prochain chapitre** : [[02-chapitre-2-installation-configuration-outils]] (sera fourni après validation).
