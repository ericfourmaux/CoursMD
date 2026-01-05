---
title: Module Git & GitHub — Utilisation précise (Complet)
tags: [git, github, actions, branches, rebase, pr, codeowners, protection, security, codeql, dependabot, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Git & GitHub — Utilisation **précise**

> [!note]
> **Objectif** : Maîtriser **Git** (ligne de commande) et **GitHub** (workflows collaboratifs, sécurité, CI/CD) avec des pratiques **précises et vérifiables**. Ce module couvre la configuration, les branches, l’historique, les PRs, la protection de branches, **CODEOWNERS**, **Actions**, **Environments & Secrets**, **Dependabot**, **CodeQL**, et les stratégies de revue.

---

## Table des matières
- [1. Git : configuration & bases](#1-git--configuration--bases)
- [2. Branches & stratégies](#2-branches--strategies)
- [3. Historique : merge vs rebase, interactive rebase](#3-historique--merge-vs-rebase-interactive-rebase)
- [4. Réparer & inspecter : reset/reflog/stash/cherry-pick/bisect](#4-reparer--inspecter--resetreflogstashcherry-pickbisect)
- [5. Remotes, forks & upstream](#5-remotes-forks--upstream)
- [6. Tags & Releases](#6-tags--releases)
- [7. GitHub : Pull Requests & Reviews](#7-github--pull-requests--reviews)
- [8. Protection de branches & règles](#8-protection-de-branches--regles)
- [9. CODEOWNERS & politiques de revue](#9-codeowners--politiques-de-revue)
- [10. GitHub Actions : syntaxe & workflows](#10-github-actions--syntaxe--workflows)
- [11. Environments & Secrets](#11-environments--secrets)
- [12. Sécurité des dépendances : Dependabot](#12-securite-des-dependances--dependabot)
- [13. Code scanning : CodeQL](#13-code-scanning--codeql)
- [14. Modèles & automatisations utiles](#14-modeles--automatisations-utiles)
- [15. Exercices guidés avec corrections](#15-exercices-guides-avec-corrections)
- [16. Checklists](#16-checklists)
- [17. Glossaire](#17-glossaire)
- [18. FAQ](#18-faq)
- [19. Références](#19-references)

---

## 1. Git : configuration & bases

```bash
# Identité
git config --global user.name "Votre Nom"
git config --global user.email "vous@exemple.com"

# Éditeur et couleurs
git config --global core.editor "code --wait"
git config --global color.ui auto

# Alias utiles
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate"
```

Bases : `init`, `clone`, `add`, `commit`, `status`, `log`, `diff`, `push`, `pull`. Voir **git-scm** pour la référence complète.

---

## 2. Branches & stratégies

- Branches **courtes** et **thématiques** (`feature/`, `fix/`, `chore/`).
- Tronc : `main` avec **intégrations fréquentes**.
- *Feature branch workflow* + **PRs** systématiques.

```bash
# Créer et passer sur une branche
git switch -c feature/search
# Pousser la branche distante
git push -u origin feature/search
```

---

## 3. Historique : merge vs rebase, interactive rebase

- **merge** : conserve l’historique avec commit de merge.
- **rebase** : réécrit l’historique pour le rendre **linéaire** (à utiliser avant partage).

```bash
# Rebase interactif sur les 6 derniers commits
git rebase -i HEAD~6
# commandes: pick, reword, edit, squash, fixup, drop
```

> [!warning]
> **Rebase réécrit l’historique** : évitez sur des commits **déjà poussés** sans coordination. Utilisez `--continue` / `--abort` en cas de conflits.

---

## 4. Réparer & inspecter : reset/reflog/stash/cherry-pick/bisect

- `reset` : **soft/mixed/hard** selon ce que vous voulez remettre en arrière.
- `reflog` : retrouver des commits « perdus ».
- `stash` : mettre de côté du travail en cours.
- `cherry-pick` : rejouer un commit ciblé.
- `bisect` : trouver le commit fautif par dichotomie.

```bash
# reset 
git reset --soft HEAD~1     # garde le travail dans l’index
git reset --mixed HEAD~1    # défaut, déstage
git reset --hard HEAD~1     # ⚠️ écrase les modifs de travail

# reflog
git reflog

# stash
git stash push -m "en cours: filtre"
git stash list && git stash apply stash@{0}

# cherry-pick
git cherry-pick <sha>

# bisect
git bisect start
```

---

## 5. Remotes, forks & upstream

- **Forks** : travail dérivé ; configurez `upstream` pour synchroniser.

```bash
git remote add upstream https://github.com/org/projet.git
git fetch upstream
git switch main && git merge upstream/main
```

---

## 6. Tags & Releases

```bash
# Tag annoté
git tag -a v1.2.0 -m "Release 1.2.0"
# Pousser
git push origin v1.2.0
```

Publiez une **Release** sur GitHub pour binaires/notes.

---

## 7. GitHub : Pull Requests & Reviews

- PRs : titre clair, description, captures/tests.
- Statuts de review : **comment**, **approve**, **request changes**.
- **Suggestions** en ligne et **résolution** de conversations.

---

## 8. Protection de branches & règles

- Exiger PRs, **approvals**, **status checks**, **commits signés**, **linear history**.
- Restreindre pushes, empêcher delete, merge queue.

> [!tip]
> Les **Rulesets** (org) permettent de réutiliser des politiques à grande échelle.

---

## 9. CODEOWNERS & politiques de revue

- Fichier `CODEOWNERS` (`.github/`, racine ou `docs/`).
- Glob patterns comme `.gitignore` ; **dernière règle** qui matche l’emporte.
- Couplé aux **protected branches** pour exiger approbation des owners.

```gitignore
# .github/CODEOWNERS
*                  @org/all-devs
/docs/             @org/docs
src/**/*.ts        @org/frontend
server/**          @org/backend
```

---

## 10. GitHub Actions : syntaxe & workflows

- Fichiers **YAML** sous `.github/workflows/` ; évènements `on:` ; jobs, steps, runners.

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci && npm test && npm run build
```

---

## 11. Environments & Secrets

- **Environments** (staging/prod) : règles de protection, reviewers, **wait timer**, restrictions de branches.
- **Secrets** : organisation/répo/environnement ; référence via `secrets.*`.

```yaml
jobs:
  deploy:
    environment: production
    steps:
      - run: npm run deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

---

## 12. Sécurité des dépendances : Dependabot

- **Alerts** quand une dépendance vulnérable est détectée.
- **Security updates** : PRs automatiques vers version corrigée.
- **Auto‑triage** pour gérer à l’échelle.

---

## 13. Code scanning : CodeQL

- **Default setup** ou workflow **avancé** avec `github/codeql-action`.
- Langages supportés : C/C++, C#, Go, Java/Kotlin, JS/TS, Python, Ruby, Rust, Swift.

```yaml
name: CodeQL
on:
  push: { branches: [ main ] }
  pull_request: { branches: [ main ] }
jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
    strategy:
      matrix:
        language: [ 'javascript-typescript' ]
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: ${{ matrix.language }} }
      - uses: github/codeql-action/analyze@v3
```

---

## 14. Modèles & automatisations utiles

- **Templates** d’issue/PR (déjà fournis dans ce cursus).
- **Release‑please** / **semantic‑release** (optionnels) pour notes de version.
- **Commitlint** pour conventions de commit.

---

## 15. Exercices guidés avec corrections

> [!info]
> Cliquez pour afficher les corrections.

### Exercice 1 — Interactive rebase
**Objectif** : Nettoyer 5 derniers commits (squash + reword).

<details><summary><strong>Correction</strong></summary>

```bash
git rebase -i HEAD~5
# Remplacer les lignes: squash/fixup/reword selon besoin
# Résoudre conflits éventuels puis:
git rebase --continue
```

</details>

---

### Exercice 2 — reset & reflog
**Objectif** : Annuler un `reset --hard` par erreur.

<details><summary><strong>Correction</strong></summary>

```bash
git reflog
# Revenir au commit listé
git reset --hard <sha>
```

</details>

---

### Exercice 3 — Branch protection
**Objectif** : Exiger PR + 1 approval + checks.

<details><summary><strong>Correction</strong></summary>
Paramétrer **Settings → Branches → Branch protection rule** :
- Require a pull request before merging
- Require approvals (1)
- Require status checks to pass (CI)
- Require signed commits (optionnel)
- Require linear history (optionnel)
</details>

---

### Exercice 4 — CODEOWNERS
**Objectif** : Demander review auto des équipes.

<details><summary><strong>Correction</strong></summary>
Créer `.github/CODEOWNERS` avec patterns cibles (voir exemple plus haut). Les owners seront **auto‑assignés**.
</details>

---

### Exercice 5 — Actions CI
**Objectif** : Créer un workflow `CI` Node.

<details><summary><strong>Correction</strong></summary>
Voir bloc YAML de la section **Actions** (checkout + setup‑node + `npm ci` + `npm test`).
</details>

---

### Exercice 6 — Environments & Secrets
**Objectif** : Déployer vers `production` avec secret.

<details><summary><strong>Correction</strong></summary>
Définir l’**environment** `production` (reviewers/wait timer si besoin). Référencer `secrets.API_KEY` dans le job `deploy`.
</details>

---

### Exercice 7 — Dependabot
**Objectif** : Activer alerts & security updates.

<details><summary><strong>Correction</strong></summary>
Security → Code security → **Enable Dependabot alerts** et **security updates**. Traiter les PRs auto.
</details>

---

### Exercice 8 — CodeQL
**Objectif** : Ajouter workflow d’analyse.

<details><summary><strong>Correction</strong></summary>
Créer `.github/workflows/codeql.yml` (voir exemple). Vérifier les **alerts** dans l’onglet **Security**.
</details>

---

## 16. Checklists

### Git
- [ ] Config correcte (`user.name`, `user.email`)
- [ ] Branches courtes ; PRs systématiques
- [ ] Historique propre (rebase avant push si nécessaire)
- [ ] Maitrise de `reset/reflog/stash/cherry-pick/bisect`

### GitHub
- [ ] PRs descriptives ; reviews structurées
- [ ] Branch protection (PR, approvals, checks, signed commits, linear)
- [ ] CODEOWNERS en place ; auto‑assignation owners
- [ ] Actions CI/CD : workflows stables, secrets en env
- [ ] Dependabot alerts & updates actifs
- [ ] CodeQL scanning actif ; alertes traitées

---

## 17. Glossaire

- **Rebase interactif** : réécriture locale de commits (squash, reword, reorder).
- **Reflog** : registre des mouvements de HEAD ; permet de **retrouver** commits.
- **Protected Branch** : branche avec règles (reviews, checks, signatures).
- **CODEOWNERS** : mapping de fichiers → owners auto pour review.
- **Environment** : contexte de déploiement (règles, secrets, variables).
- **Dependabot** : alertes et mises à jour de dépendances vulnérables.
- **CodeQL** : moteur d’analyse sémantique pour **code scanning**.

---

## 18. FAQ

**Merge ou Rebase pour synchroniser ?**
> Rebase avant partage pour un historique linéaire ; merge pour conserver le graphe complet.

**Comment annuler un reset --hard ?**
> Utilisez `git reflog` puis **reset** vers l’entrée voulue.

**Faut‑il forcer les commits signés ?**
> Recommandé sur branches critiques (authenticité).

---

## 19. Références

- **Git docs** (référence & commandes) : https://git-scm.com/docs/
- **git‑rebase (interactive)** : https://git-scm.com/docs/git-rebase
- **git‑reset** : https://git-scm.com/docs/git-reset
- **GitHub — Pull request reviews** : https://docs.github.com/en/pull-requests/
- **Branch protection rules** : https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- **CODEOWNERS** : https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- **Actions — workflow syntax** : https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- **Actions — deployments & environments** : https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- **Dependabot alerts** : https://docs.github.com/en/code-security/dependabot/dependabot-alerts/configuring-dependabot-alerts
- **CodeQL — code scanning** : https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql

> [!success]
> Ce module **Git & GitHub** fournit une **boîte à outils opérationnelle** pour des dépôts **sécurisés**, **qualitatifs** et **automatisés**.
