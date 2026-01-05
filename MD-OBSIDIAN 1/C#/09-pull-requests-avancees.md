
# 📘 Chapitre 9.2 — Pull Requests avancées : templates, CODEOWNERS, auto‑merge, stratégies de merge & checklist

> **Niveau** : Intermédiaire — **Objectif** : professionnaliser tes **Pull Requests** (PR) sur GitHub : **templates** et formulaires, **CODEOWNERS**, **auto‑merge**, **règles de protection** des branches, **stratégies de merge** (merge commit, squash, rebase), **checks** requis et **checklists** de revue. Contient des exemples prêts à l’emploi, schémas, exercices et pièges.

---

## 🎯 Objectifs d’apprentissage
- Structurer des PR **claires et actionnables** (template, captures, liaisons d’issues).  
- **Router** automatiquement des **reviewers** avec **CODEOWNERS**.  
- Activer et maîtriser **auto‑merge** et les **règles** de protection (checks, approbations, conversations résolues).  
- Choisir la **stratégie de merge** adaptée (**Squash**, **Merge commit**, **Rebase merge**).  
- Utiliser **labels**, **draft PR**, **checks CI** et **résumés** pour fluidifier la collaboration.

---

## 🧠 Concepts clés

### 🔄 Cycle de vie d’une PR
1. **Draft PR** → ébauche avec contexte; CI peut tourner mais avis *work in progress*.  
2. **Ready for review** → CI **verte**, description & captures; demandes de revue (auto via CODEOWNERS ou manuelles).  
3. **Reviews** → *commentaires*, *suggestions*, *approbations* ou *change requested*.  
4. **Checks requis** → lint, build, tests, couverture; toutes **vertes** avant merge.  
5. **Merge** → stratégie choisie; **delete branch** et fermeture des issues liées.

### 🛡️ Protection & garde‑fous
- **Required status checks** (CI), **Required reviewers**, **Dismiss stale approvals** (révoque approbations après push), **Require conversation resolution**, **Require linear history**, **Require signed commits**, **Restrict who can push**.

### 🤖 Auto‑merge
- Permet de **fusionner automatiquement** dès que les **conditions** sont réunies (approbations + checks verts + conversations résolues).  
- Choix de la **stratégie** (souvent **Squash** en projets applicatifs).

### 🧭 Stratégies de merge
- **Squash merge** : compresse tous les commits de la PR en **un** commit sur `main`. *Propre, lisible; idéal pour TBD.*  
- **Merge commit** : garde l’historique complet; utile pour **repos open‑source** ou traces détaillées.  
- **Rebase merge** : rejoue commits sur la base; historique **linéaire** sans commit de merge; requiert **discipline**.

---

## 📝 Templates & formulaires de PR/Issue

### A) Template de PR (*.github/pull_request_template.md*)
```md
## Objet
Explique brièvement le **pourquoi** et le **quoi**.

## Changements
- [ ] Code
- [ ] Tests
- [ ] Docs / README
- [ ] UI (captures ci-dessous si applicable)

## Comment tester
Étapes, datasets, commandes.

## Impacts / risques
Performance, sécurité, compatibilité, migration.

## Liens
Fixes #123; Relates to #456
```

### B) Issue forms (exemple bug) — *.github/ISSUE_TEMPLATE/bug.yml*
```yaml
name: Bug report
labels: [bug]
body:
  - type: textarea
    id: description
    attributes:
      label: Description
      description: Décris le bug observé
      placeholder: ...
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Étapes pour reproduire
      placeholder: 1) ... 2) ...
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version
      placeholder: 1.2.3
```

---

## 👥 CODEOWNERS — router les bons reviewers

**Fichier :** `CODEOWNERS` à la racine ou sous `.github/`.
```text
# Propriété par domaine
/api/           @team-api
/web/           @team-web
/docs/          @tech-writers

# Fichiers critiques
Dockerfile      @platform-team
**/*.csproj     @build-masters
```
> Quand une PR touche `api/`, **@team-api** est automatiquement **assigné** en reviewers.

---

## ⚙️ Activer auto‑merge & stratégies

### A) UI (réglages du repo)
- **Settings → General** : activer **Allow auto-merge**; autoriser **Squash**, **Merge commit**, **Rebase** selon ta politique.  
- **Settings → Branches → Branch protection rules** :
  - Require a pull request before merging (≥ **1** approval).  
  - Require status checks to pass before merging (sélectionner **CI**).  
  - Require conversation resolution.  
  - Dismiss stale pull request approvals when new commits are pushed.  
  - Require linear history (optionnel, si **rebase** policy).

### B) CLI — activer l’auto‑merge sur une PR (ex. squash)
```bash
# Pré‑requis: GitHub CLI (gh) authentifié
# Activer auto‑merge (squash) et supprimer la branche une fois fusionnée
gh pr merge --auto --squash --delete-branch
```

---

## 🔧 Checks CI & résumés

### A) Exemple de job CI (extrait)
```yaml
name: CI
on:
  pull_request:
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
      - name: Summary
        if: always()
        run: |
          echo "## Résumé PR" >> $GITHUB_STEP_SUMMARY
          echo "Tests + couverture générés." >> $GITHUB_STEP_SUMMARY
```
> Déclare ce job comme **Required status check** dans **Branch protection**.

---

## 🧭 Politiques recommandées (équipes produit)
- **Squash merge par défaut** (historique lisible).  
- **Draft PR** tôt, **petites PR** (≤ **300** lignes modif.).  
- **Au moins 1–2 reviews** et **checks** obligatoires.  
- **Conventions** : Conventional Commits; lier les **issues**; **CHANGELOG**.

---

## ✅ Checklist de revue (reviewers)
- **Compréhension** : but clair, contexte, captures si UI.  
- **Correctness** : tests passent; cas limites couverts; erreurs gérées.  
- **Qualité** : lisibilité, duplication (DRY), complexité raisonnable, noms explicites.  
- **Sécurité & perf** : secrets absents; allocations et I/O; requêtes SQL; XSS/CSRF si web.  
- **Compatibilité** : migrations, breaking changes mentionnées.  
- **Docs** : README, commentaires, exemples mis à jour.

---

## 🧱 Schémas ASCII

### A) Flux PR avancé
```
feature/* ──▶ Draft PR
             └─▶ CI (checks) ──▶ Ready for review ──▶ Reviews (approve/request changes)
                                 └─▶ Auto‑merge (Squash) ──▶ Delete branch ──▶ Tag/Release
```

### B) Choix de stratégie de merge
```
Squash       :  commits PR → 1 commit sur main (lisible)
Merge commit :  commits PR + commit de fusion (trace complète)
Rebase merge :  commits rejoués sur main (linéaire, exige discipline)
```

---

## 🔧 Exercices guidés
1. **CODEOWNERS** : crée des règles par répertoires; ouvre une PR qui touche `api/` et observe les reviewers auto.  
2. **Auto‑merge** : active **Allow auto‑merge**, puis lance `gh pr merge --auto --squash` sur une PR **verte**.  
3. **Branch protection** : impose **Required status checks** (CI), **Required reviewers ≥1**, **Require conversation resolution**; vérifie qu’un merge est **bloqué** si une conversation est ouverte.  
4. **Template** : ajoute `pull_request_template.md`; ouvre une PR et complète chaque section.  
5. **Stratégie** : mesure lisibilité de l’historique avec **Squash** vs **Merge commit** sur 3 PRs successives.

---

## 🧪 Tests / Vérifications (rapides)
```bash
# 1) CODEOWNERS actif → reviewers auto visibles dans la PR
# 2) PR avec conversation non résolue → bouton Merge indisponible
# 3) CI rouge → PR non mergeable (required checks)
# 4) Auto‑merge activé → la PR se fusionne dès que les conditions sont remplies
```

---

## ⚠️ Pièges fréquents
- **Force‑push** après approbation → déclenche **Dismiss stale approvals**; re‑review nécessaire.  
- **Rebase sauvage** → perd les liens de commentaires par commit; préviens l’équipe avant.  
- **Merge d’une PR volumineuse** (>1000 LOC) → risque de régressions; découper en **petites PR**.  
- **Checks incomplets** (pas de tests/perf/sécu) → qualité trompeuse; étendre la CI.  
- **CODEOWNERS trop large** → surcharge reviewers; cibler par **domaine**.  
- **Auto‑merge** sans règles strictes → *rouler* des changements non revus; impose **checks** & **reviews** requis.

---

## 🧮 Formules (en JavaScript)
- **Taux d’adoption des PR petites** :
```javascript
const smallPrRate = (small, total) => small / Math.max(1, total);
```
- **Temps de cycle PR** (naïf) :
```javascript
const cycleTimeDays = (createdAt, mergedAt) => (new Date(mergedAt) - new Date(createdAt)) / (1000*60*60*24);
```

---

## 📌 Résumé essentiel
- **Templates + CODEOWNERS** structurent et routent les PR.  
- **Auto‑merge** accélère, mais uniquement avec **checks** & **reviews** obligatoires.  
- **Squash** favorise un historique **propre**; **Merge commit** garde toute la trace; **Rebase** crée un fil **linéaire**.  
- **Branch protection** et **conversations résolues** garantissent un merge **sain**; vise des **PR petites** et **claires**.
