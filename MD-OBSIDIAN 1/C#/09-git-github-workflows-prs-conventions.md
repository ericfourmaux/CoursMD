
# 📘 Chapitre 9.1 — Git & GitHub : workflows, PRs & conventions

> **Niveau** : Intermédiaire — **Objectif** : maîtriser **Git** et **GitHub** au quotidien : branches, **workflows** d’équipe, **Pull Requests**, **code review**, **GitHub Actions**, **protection de branches**, **Conventional Commits**, **SemVer**, **templates** et **automatisations**. Contient des exemples prêts à l’emploi (.NET), des checklists et des exercices.

---

## 🎯 Objectifs d’apprentissage
- Utiliser Git avec aisance : **commit**, **branch**, **merge/rebase**, **tags**, **conflicts**.
- Choisir et appliquer une **stratégie de branches** (Trunk-Based vs Git Flow) adaptée.
- Créer des **PRs** efficaces et pratiquer des **revues de code** constructives.
- Mettre en place des **workflows CI** (GitHub Actions) avec **tests**, **couverture** et **règles d’approbation**.
- Normaliser les **commits** (Conventional Commits), **versions** (SemVer) et **CHANGELOG**.
- Sécuriser et gouverner : **branch protection**, **CODEOWNERS**, **secrets**, **Dependabot**.

---

## 🧠 Concepts clés — Git

- **Repository** (dépôt) : historique, branches, tags.
- **Zones** : *working directory* → *staging* (index) → *commit*.
- **Branches** : pointeurs vers des suites de commits.
- **Merge** vs **Rebase** :
  - `merge` crée un commit de fusion (préserve l’historique).  
  - `rebase` rejoue les commits au-dessus d’une autre base (historique linéaire).
- **Tags** : marqueurs (souvent versions SemVer : `v1.2.0`).
- **Conflicts** : divergences à résoudre manuellement (outils : `git mergetool`, IDE).

### Commandes usuelles
```bash
# Initialiser, config de base
git init
git config user.name "Eric Fourmaux"
git config user.email "eric@example.com"

# Cycle de travail
git status
git add .
git commit -m "feat(api): add products endpoint"

# Branches
git switch -c feature/products  # créer et changer
git switch main                  # revenir
git merge feature/products       # fusionner dans main

# Rebase (sur main)
git fetch origin
git rebase origin/main

# Tags & version
git tag v1.0.0
git push origin v1.0.0
```

---

## 🧭 Stratégies de branches

### Trunk-Based Development (TBD)
- **Principe** : un **tronc** (`main`) toujours **intégrable**; petites branches **courtes** (≤ 1–3 jours), **PRs petites**, intégration **fréquente**.
- **Avantages** : faible drift, **déploiements fréquents**, facilité de **rollback**.

### Git Flow (classique)
- Branches : `main`, `develop`, **features**, **release**, **hotfix**.
- **Avantages** : structuration forte pour versions **packagées**.
- **Inconvénients** : plus de **complexité**, risque de **long-lived branches**.

👉 **Recommandation** : pour une API/produit moderne **déployé en continu**, préférer **TBD**; pour produits avec cycles **versionnés** formels, **Git Flow** convient.

---

## 🏷️ Conventional Commits & SemVer

### Conventional Commits (extraits)
- `feat:` nouvelle fonctionnalité.  
- `fix:` correction de bug.  
- `docs:`, `refactor:`, `test:`, `chore:` etc.  
- **Scope** facultatif : `feat(api): ...`  
- **BREAKING CHANGE** dans le corps pour rupture.

### Semantic Versioning (SemVer)
- `MAJOR.MINOR.PATCH` → ex. `1.4.2`.  
- **MAJOR** : rupture, **MINOR** : features rétro-compatibles, **PATCH** : fixes.

### Exemple de message
```text
feat(auth): support OAuth2 login

BREAKING CHANGE: remove legacy basic-auth endpoint
```

### Générer CHANGELOG (idée)
- Utiliser un outil (ex. *conventional-changelog*) ou une action CI pour produire `CHANGELOG.md` à partir des commits.

---

## 🔐 Gouvernance GitHub

- **Branch protection** :
  - exiger **status checks** (CI verte), **reviews** (≥1), **no force-push**, **no direct push** sur `main`.
- **CODEOWNERS** : assigner automatiquement **reviewers**.
- **Issue/PR templates** : guider la description.
- **Secrets** : stockés dans **GitHub Secrets**; ne jamais les commiter.
- **Labels/Projects** : suivre **état**, **priorités**.

### Exemples de templates
**.github/PULL_REQUEST_TEMPLATE.md**
```md
## Description

## Changements
- [ ] Tests ajoutés
- [ ] Docs mises à jour

## Checklist
- [ ] CI verte
- [ ] Conventions de commit respectées
- [ ] Relecture effectuée
```

**.github/ISSUE_TEMPLATE/bug_report.md**
```md
---
name: Bug report
title: "[BUG] "
labels: [bug]
---
**Décrire le bug**
**Étapes pour reproduire**
**Comportement attendu**
**Logs / captures**
```

**CODEOWNERS**
```text
# Reviews obligatoires sur l'API
/api/ @team-api
```

---

## ⚙️ CI (GitHub Actions) — .NET

**.github/workflows/ci.yml**
```yaml
name: CI
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
          cache: true
      - run: dotnet restore
      - run: dotnet build --configuration Release --no-restore
      - run: |
          dotnet test --configuration Release --no-build \
            /p:CollectCoverage=true \
            /p:CoverletOutput=TestResults/coverage/ \
            /p:CoverletOutputFormat=cobertura
      - name: Report
        run: |
          dotnet tool install --global dotnet-reportgenerator-globaltool
          reportgenerator -reports:TestResults/coverage/**/coverage.cobertura.xml \
            -targetdir:TestResults/coverage-report -reporttypes:Html;TextSummary
          cat TestResults/coverage-report/Summary.txt >> $GITHUB_STEP_SUMMARY
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: TestResults/coverage-report
```

**Branch protection** (à configurer dans *Settings → Branches*)
- Required status checks : `CI / build-test`.
- Required reviewers : `>= 1`.
- Désarmer : **Allow force pushes**/**Allow deletions**.

---

## 🔧 Qualité & hooks

- **.editorconfig** : uniformiser formatage.
- **dotnet format** : vérifie format/C# style.
- **Git hooks** : `pre-commit`, `pre-push` pour lint/tests.

**.editorconfig (extrait)**
```ini
root = true
[*.cs]
indent_size = 4
csharp_style_var_for_built_in_types = true:suggestion
end_of_line = lf
charset = utf-8
```

**Hook pre-push (bash)**
```bash
#!/usr/bin/env bash
set -e
# .git/hooks/pre-push (rendre exécutable)
dotnet test --configuration Release
```

---

## 🤝 Pull Requests & Code Review — checklists

### Conseils PR
- **Petite** (≤ 300 lignes modifiées), **focus** sur un sujet.
- **Titre** clair + **description** + **captures** si UI.
- **Tests** inclus, **docs** mises à jour.
- **Draft PR** au début; **Ready for review** quand CI **verte**.
- **Merge** : **Squash** recommandé (historique propre).

### Checklist reviewer
- Respect des **conventions** (commits, style, naming).
- Tests **passent**, couverture acceptable.
- Pas de **secrets**, pas de **hard‑code**.
- Complexité raisonnable, **pas** de duplication.
- **Performance**/sécurité ok, **erreurs** gérées.

---

## 🧱 Schémas ASCII

### A) Flux PR (TBD)
```
feature/* → PR → CI (tests+lint) → Review(s) → Squash Merge → main → Release/tag
```

### B) Git Flow (simplifié)
```
feature → develop → release → main
                   └─ hotfix → main
```

### C) Pipeline CI
```
Checkout → Setup .NET → Restore → Build → Test+Coverage → Report → Artifact
```

### D) Message Conventional Commit
```
<type>(<scope>): <subject>

<body>

BREAKING CHANGE: <details>
```

---

## 🔧 Exercices guidés
1. **Repo prêt** : initialiser `.editorconfig`, `CODEOWNERS`, templates PR/Issue, CI, **branch protection**.  
2. **TBD** : créer `feature/add-auth`, ouvrir PR **draft**, pousser 2–3 commits **Conventional**; passer **Ready for review** une fois **CI verte**.  
3. **Git Flow** : créer `release/1.2.0`, ajouter tag, merger vers `main`, créer **hotfix** et **merge back** vers `develop`.
4. **Hooks** : ajouter `pre-push` qui lance `dotnet test`; vérifier blocage si test rouge.

---

## 🧪 Tests / Vérifications (rapides)
```bash
# 1) Lint/format
dotnet tool install -g dotnet-format
~/.dotnet/tools/dotnet-format --verify-no-changes

# 2) Conventions commits (ex. lint local)
echo "feat(api): list products" | grep -E "^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .+"

# 3) CI visible
# vérifier dans GitHub → Pull Request → Checks : CI verte et coverage report
```

---

## ⚠️ Pièges fréquents
- **Force-push** sur branches partagées → pertes d’historique; éviter sur `main`.
- **Long-lived branches** → conflits massifs; privilégier **PRs fréquentes**.
- **Secrets** commités → rotation immédiate et purge; utiliser **Secrets**/**Variables** GitHub.
- **Binary lourds** dans Git → préférer **Git LFS**.
- **Messages flous** : difficile de produire un **CHANGELOG** utile.
- **Tests absents** : CI verte trompeuse; ajouter **couverts** + seuil minimal.

---

## 🧮 Formules (en JavaScript)

### A) Lead time (naïf)
```javascript
const leadTimeDays = (createdAt, mergedAt) => (new Date(mergedAt) - new Date(createdAt)) / (1000*60*60*24);
```

### B) Cycle time (naïf)
```javascript
const cycleTimeDays = (firstCommitAt, mergedAt) => (new Date(mergedAt) - new Date(firstCommitAt)) / (1000*60*60*24);
```

### C) Change failure rate
```javascript
const changeFailureRate = (failedDeploys, totalDeploys) => failedDeploys / Math.max(1, totalDeploys);
```

---

## 📌 Résumé essentiel
- **Git** : branches courtes, rebase/merge maîtrisés, tags versionnés.
- **Workflows** : choisir TBD vs Git Flow selon le produit.
- **PRs** : petites, testées, décrites; **Squash Merge** recommandé.
- **CI GitHub** : tests+couverture → checks requis; **branch protection**, **CODEOWNERS**.
- **Conventions** : **Conventional Commits**, **SemVer**, **CHANGELOG**; hooks et formatage pour la qualité.
