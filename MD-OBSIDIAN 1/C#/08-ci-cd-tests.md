
# 📘 Chapitre 8.3 — CI/CD des tests (GitHub Actions, matrice, couverture)

> **Niveau** : Intermédiaire — **Objectif** : mettre en place une **intégration continue** pour les **tests .NET** : workflows **GitHub Actions**, **matrix** (OS/.NET), **caching** NuGet, **couverture** (coverlet + ReportGenerator), **artifacts** HTML/XML, **services** (PostgreSQL) pour tests d’intégration, et **garde‑fous** (seuil de couverture, annulation des jobs obsolètes).

---

## 🎯 Objectifs d’apprentissage
- Écrire un **workflow** GitHub Actions pour **build + tests + couverture** sur **push/PR**.
- Utiliser une **matrice** (OS, versions .NET) et **caching** NuGet pour des builds **rapides**.
- Générer un **rapport de couverture** (Cobertura + HTML) et **uploader** comme **artifact**.
- Exécuter des **tests d’intégration** avec un **service DB** (PostgreSQL) sur `ubuntu-latest`.
- **Échouer** la CI si la **couverture** < **seuil** et publier un **résumé** dans `GITHUB_STEP_SUMMARY`.

---

## 🧠 Concepts clés

### 🔧 GitHub Actions (rappels)
- Un **workflow** est un fichier **YAML** dans `.github/workflows/`.
- Un **job** contient des **steps**; on peut définir une **matrix** pour multiplier les exécutions.
- Les **artifacts** conservent des fichiers (rapports) attachés à la run.

### 🧮 Couverture avec **coverlet**
- `dotnet test` supporte `CollectCoverage=true` et formats **Cobertura**/**lcov**/**opencover** via MSBuild.
- **ReportGenerator** produit du **HTML** à partir du rapport Cobertura.

### 🌐 Services pour tests d’intégration
- Sur Linux (`ubuntu-latest`), on peut déclarer des **services** (ex.: **PostgreSQL**) pour fournir une base **réelle** aux tests.

---

## 🏗️ Workflow CI minimal — build, tests et couverture

Crée le fichier `.github/workflows/dotnet-ci.yml` :

```yaml
name: .NET CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  tests:
    name: Tests (matrix)
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ ubuntu-latest, windows-latest, macos-latest ]
        dotnet: [ '8.0.x', '9.0.x' ]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup .NET ${{ matrix.dotnet }}
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ matrix.dotnet }}
          cache: true  # cache NuGet

      - name: Restore
        run: dotnet restore

      - name: Build
        run: dotnet build --configuration Release --no-restore

      - name: Test + Coverage
        run: |
          dotnet test --configuration Release --no-build \
            /p:CollectCoverage=true \
            /p:CoverletOutput=TestResults/coverage/ \
            /p:CoverletOutputFormat=cobertura \
            /p:Exclude=\"[*.Tests]*,[*]Migrations/*\" \
            /p:Threshold=80 \
            /p:ThresholdType=line \
            /p:ThresholdStat=Average

      - name: ReportGenerator (HTML)
        run: |
          dotnet tool install --global dotnet-reportgenerator-globaltool
          reportgenerator \
            -reports:TestResults/coverage/**/coverage.cobertura.xml \
            -targetdir:TestResults/coverage-report \
            -reporttypes:Html;TextSummary
          cat TestResults/coverage-report/Summary.txt >> $GITHUB_STEP_SUMMARY

      - name: Upload coverage artifact
        uses: actions/upload-artifact@v4
        with:
          name: coverage-${{ matrix.os }}-${{ matrix.dotnet }}
          path: TestResults/coverage-report
```

**Points clés** :
- `Threshold` **échoue** la step si la **couverture** moyenne **ligne** < **80%**.
- `TextSummary` est **ajouté** au **Step Summary** (visible dans la run).
- `cache: true` sur `setup-dotnet` active le **cache NuGet**.

---

## 🧪 Job séparé — tests d’intégration avec PostgreSQL (services)

Sur Linux uniquement; on ajoute un **job** dédié qui démarre un **service** PostgreSQL et passe une **chaîne de connexion** aux tests.

```yaml
  integration-tests:
    name: Integration (PostgreSQL)
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: app_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd=\"pg_isready -U test\" \
          --health-interval=10s \
          --health-timeout=5s \
          --health-retries=5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
          cache: true

      - name: Wait for Postgres
        run: |
          for i in {1..30}; do
            pg_isready -h localhost -p 5432 -U test && break
            sleep 2
          done

      - name: Run integration tests
        env:
          ConnectionStrings__Default: Host=localhost;Port=5432;Database=app_test;Username=test;Password=test
          ASPNETCORE_ENVIRONMENT: Test
        run: |
          dotnet test tests/Project.IntegrationTests \
            /p:CollectCoverage=true \
            /p:CoverletOutput=TestResults/coverage/ \
            /p:CoverletOutputFormat=cobertura

      - name: Generate & upload coverage
        run: |
          dotnet tool install --global dotnet-reportgenerator-globaltool
          reportgenerator -reports:TestResults/coverage/**/coverage.cobertura.xml -targetdir:TestResults/coverage-report -reporttypes:Html
        shell: bash
      - uses: actions/upload-artifact@v4
        with:
          name: integration-coverage
          path: TestResults/coverage-report
```

**Conseils** :
- Utilise `ASPNETCORE_ENVIRONMENT=Test` pour **configurer** des services spécifiques.
- **Service containers** ne sont **pas** disponibles sur Windows/macOS runners.

---

## 📝 Publier un **résumé** lisible (Step Summary)

Ajoute une step qui **écrit** un résumé **Markdown** de la run (couverture, durées, projets testés).

```yaml
      - name: Summary
        if: always()
        run: |
          echo "## Résumé des tests" >> $GITHUB_STEP_SUMMARY
          echo "* OS: ${{ matrix.os }}" >> $GITHUB_STEP_SUMMARY
          echo "* .NET: ${{ matrix.dotnet }}" >> $GITHUB_STEP_SUMMARY
          echo "* Rapport HTML: voir artifact \`coverage-${{ matrix.os }}-${{ matrix.dotnet }}\`" >> $GITHUB_STEP_SUMMARY
```

---

## 🧱 Schémas ASCII

### A) Flux CI
```
Push/PR → Workflow YAML
   └─ Job matrix (OS × .NET)
        ├─ Restore/Build
        ├─ Tests + Coverage (fail si < 80%)
        ├─ ReportGenerator (HTML)
        └─ Upload artifacts
```

### B) Intégration avec service DB
```
Job (ubuntu) → services: postgres
   └─ Env: ConnectionStrings__Default
      └─ dotnet test (EF Core, WebApplicationFactory)
```

---

## 🔧 Exercices guidés
1. **Seuil de couverture** : passe `Threshold=90` et vérifie que le job **échoue** si la couverture < 90%.  
2. **Matrix** : ajoute `macos-latest` et compare la **durée** moyenne vs `ubuntu-latest`.  
3. **Artifacts** : ouvre le **rapport HTML** téléchargé et repère les fichiers **non couverts**.

```yaml
# Exemple de seuil strict
/p:Threshold=90 /p:ThresholdType=line /p:ThresholdStat=Average
```

---

## 🧪 Tests / Vérifications (rapides)
```bash
# Lancer la CI sur ta branche
# 1) Ouvre la run → Step Summary affiche la couverture.
# 2) Télécharge l'artifact coverage → index.html montre les détails.
# 3) Force un test à échouer → confirme que la run devient rouge.
```

---

## ⚠️ Pièges fréquents
- **EF InMemory** dans CI : résultats **diffèrent** du SQL → privilégie **SQLite InMemory** ou **PostgreSQL** (service).  
- **Couverture** trop **strict** → flakiness; commencer à **80%** et **monter** progressivement.  
- **Artifacts absents** : chemin de sortie **incorrect**; vérifie `CoverletOutput` et `reportgenerator -reports`.  
- **Cache NuGet** non pris** : assure `cache: true` ou configure `actions/cache` manuellement.  
- **Services sur Windows/macOS** : non supporté; **limiter** aux jobs Linux.

---

## 🧮 Formules (en JavaScript)
- **Temps total CI** estimé (naïf) :
```javascript
const totalTime = (jobs) => jobs.reduce((s, j) => s + j.durationMs, 0);
```
- **Score de stabilité** (runs vertes) :
```javascript
const stability = (green, total) => green / Math.max(1, total);
```

---

## 📌 Résumé essentiel
- Un **workflow** GitHub Actions bien conçu : **matrix**, **cache**, **tests + couverture**, **artifacts** et **résumé**.  
- Les **services** (PostgreSQL) rendent les **tests d’intégration** **fiables**; limiter aux runners Linux.  
- **Coverlet** + **ReportGenerator** fournissent des **rapports** riches; `Threshold` **rend** la qualité **exécutable**.
