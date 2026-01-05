---
title: "Git & GitHub — Cours complet (Syllabus)"
tags: [git, github, cours, débutant, syllabus]
cssclass: syllabus
---

# 📚 Git & GitHub — Syllabus détaillé

> **Public visé :** débutants motivés, intégrateurs, développeurs front-end.  
> **Objectif final :** maîtriser Git (solo & équipe), GitHub (PR, issues, Actions, Pages), publier un projet propre.

## 🗂️ Structure générale

### 🟦 Module 0 — Mise en place & vision
1. **📘 Chapitre 1 — Pourquoi Git ? Pourquoi GitHub ?**  
   Définition de Git (VCS distribué), de GitHub (plateforme), motivations, bénéfices, limites, analogies, cas d’usage concrets.
2. **🔧 Chapitre 2 — Installation, configuration & outils**  
   Git CLI, VS Code, GitHub, SSH vs HTTPS, clés SSH, GPG, configuration globale.
3. **📝 Chapitre 3 — Markdown & bonnes pratiques de docs**  
   README, conventions, badges, tables, snippets, structuration de documentation.

### 🟩 Module 1 — Fondamentaux Git (solo)
4. **📦 Chapitre 4 — Le modèle interne de Git : index, HEAD, objets**  
   Working tree, staging area, blobs/trees/commits/tags, refs, reflog.
5. **✍️ Chapitre 5 — Flux minimal : init → add → commit → log**  
   Statut, ajout sélectif, ignorer, messages de commit (Conventional Commits).
6. **🌿 Chapitre 6 — Branches & HEAD**  
   Création, navigation, renommage, suppression, vues schématiques.
7. **🔗 Chapitre 7 — Fusion (merge) vs réécriture (rebase)**  
   Différences, quand utiliser, conflits et résolutions.
8. **🧳 Chapitre 8 — Stash, amend, restore, reset, revert**  
   Réparer sans perdre : stratégies sûres et risques.
9. **🔍 Chapitre 9 — Diff, blame, bisect : enquêter**  
   Trouver l’origine d’un bug, comparer, analyser l’historique.

### 🟨 Module 2 — Collaborer avec GitHub
10. **☁️ Chapitre 10 — Remotes : origin, fetch, pull, push**  
    Synchronisation locale ↔ distante, branches suivies, flux de travail.
11. **🤝 Chapitre 11 — Forks, Pull Requests & code review**  
    Stratégies de collaboration, PR de qualité, règles de protection.
12. **🗂️ Chapitre 12 — Issues, Projects, Discussions & Templates**  
    Gestion du travail, tri, labels, gabarits d’issues/PR.
13. **🏷️ Chapitre 13 — Tags, Releases & versioning sémantique**  
    SemVer, changelog, release notes, tags légers vs annotés.
14. **⚙️ Chapitre 14 — GitHub Actions (CI/CD) — bases**  
    Workflows YAML, triggers, jobs/steps, secrets, matrice Node.js.
15. **🗺️ Chapitre 15 — GitHub Pages & documentation**  
    Publication de site statique, arborescence docs, images, liens.

### 🟥 Module 3 — Bonnes pratiques & cas avancés (débutant+)
16. **🧭 Chapitre 16 — Stratégies de branches : GitFlow vs Trunk-Based**  
    Comparaison, recommandations selon taille d’équipe et cadence.
17. **📎 Chapitre 17 — Submodules & monorepo**  
    Cas d’usage, pièges, workspaces npm.
18. **📁 Chapitre 18 — Binary, LFS & performance**  
    Suivi de binaires, packfiles, attributs, LFS.
19. **🔒 Chapitre 19 — Sécurité & conformité**  
    Authentification, signature GPG, secrets, Dependabot.
20. **🧩 Chapitre 20 — Hooks, automatisations & conventions**  
    Hooks locaux, Actions, lint/format auto, husky.

### 🟪 Module 4 — Capstone & références
21. **🚀 Chapitre 21 — Projet fil rouge : de zéro à release**  
    Init → README → branches → PR → CI → release → pages.
22. **🧭 Chapitre 22 — Dépannage & anti‑patterns**  
    Pièges fréquents, recettes de sauvetage.
23. **📑 Annexes — Aides‑mémoire & modèles**  
    Cheatsheet, templates (README, PR, Issue, Actions), glossaire.

---

## 🔗 Navigation

- 👉 **Chapitre 1 : Pourquoi Git ? Pourquoi GitHub ?** → [[01-chapitre-1-pourquoi-git-et-github]]
- Les chapitres suivants seront ajoutés au fur et à mesure.

---

## 🧾 Résumé des points essentiels — par chapitre

> Une synthèse pour t’aider à visualiser l’apport de chaque chapitre.

- **📘 Chapitre 1 — Pourquoi Git ? Pourquoi GitHub ?**  
  - Git = système de contrôle de versions **distribué** (historique local complet, commits immuables, branches légères).  
  - GitHub = **plateforme** d’hébergement et de collaboration (PR, issues, Actions, Pages).  
  - Pourquoi : fiabilité, sécurité, collaboration, traçabilité, productivité.  
  - Risques : mauvaise stratégie de branches, messages de commit peu informatifs, secrets dans l’historique.
- **🔧 Chapitre 2 — Installation, configuration & outils**  
  - Installer Git, configurer `user.name`, `user.email`, `init.defaultBranch`, choisir SSH/HTTPS.  
  - Générer une clé SSH, ajouter à GitHub, (optionnel) signature GPG.  
  - Préparer l’environnement : IDE, extensions.
- **📝 Chapitre 3 — Markdown & docs**  
  - README clair, conventions Markdown, liens, images, tableaux, badges.  
  - Templates d’issues/PR pour une collab efficace.
- **📦 Chapitre 4 — Modèle interne**  
  - Working tree / index / commit graph ; objets Git (blob, tree, commit, tag).  
  - `HEAD`, `refs`, `reflog` pour comprendre et réparer.
- **✍️ Chapitre 5 — Flux minimal**  
  - `git init` → `status` → `add` → `commit` → `log`.  
  - `.gitignore` et messages de commit de qualité.
- **🌿 Chapitre 6 — Branches & HEAD**  
  - Créer, basculer, renommer, supprimer ; visualiser l’historique.
- **🔗 Chapitre 7 — Merge vs Rebase**  
  - Merge = commit de jonction ; Rebase = rejouer des commits.  
  - Résoudre les conflits proprement.
- **🧳 Chapitre 8 — Réparer sans perdre**  
  - `stash`, `restore`, `reset` (soft/mixed/hard), `revert`, `amend`, `reflog`.
- **🔍 Chapitre 9 — Enquêter**  
  - `diff`, `blame`, `bisect` pour localiser un bug.
- **☁️ Chapitre 10 — Remotes**  
  - `origin`, `fetch`, `pull` (`--rebase`), `push` et branches suivies.
- **🤝 Chapitre 11 — PR & review**  
  - Ouvrir une PR, checklist, reviewers, règles de protection.
- **🗂️ Chapitre 12 — Gestion de projet**  
  - Issues, Projects, Discussions, labels, templates.
- **🏷️ Chapitre 13 — Releases**  
  - Tags, notes de version, SemVer, changelog.
- **⚙️ Chapitre 14 — Actions**  
  - Workflows YAML, jobs/steps, secrets, matrice Node.
- **🗺️ Chapitre 15 — Pages**  
  - Publier un site statique.
- **🧭 Chapitre 16 — Stratégies**  
  - GitFlow vs Trunk-based : choix éclairé.
- **📎 Chapitre 17 — Submodules & monorepo**  
  - Intégrer/externaliser proprement.
- **📁 Chapitre 18 — LFS & perf**  
  - Gérer binaires, optimiser dépôt.
- **🔒 Chapitre 19 — Sécurité**  
  - Auth, secrets, signatures, dépendances.
- **🧩 Chapitre 20 — Hooks & conventions**  
  - Automatiser la qualité.
- **🚀 Chapitre 21 — Capstone**  
  - De zéro à release et publication.
- **🧭 Chapitre 22 — Dépannage**  
  - Anti-patterns, procédures de sauvetage.
- **📑 Annexes**  
  - Cheatsheet, templates, glossaire.

---

## 📌 Notes

- Chaque chapitre sera livré en fichier **.md compatible Obsidian**, avec icônes, schémas ASCII, snippets de commandes, analogies, exercices, checklists et encadrés risques.
- Les *formules* ou *modélisations* seront représentées en **JavaScript** lorsque pertinent.
