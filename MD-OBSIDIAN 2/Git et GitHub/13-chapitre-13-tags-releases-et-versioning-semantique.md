---
title: "🏷️ Chapitre 13 — Tags, Releases & versioning sémantique"
tags: [git, tags, releases, semver, conventional-commits, changelog, github]
cssclass: chapitre
---

# 🏷️ Chapitre 13 — Tags, Releases & versioning sémantique

> **Objectif pédagogique :** comprendre **les tags** (légers vs annotés), **publier des releases** propres sur GitHub, appliquer le **versioning sémantique (SemVer)** couplé à **Conventional Commits**, **générer** un **CHANGELOG** cohérent et **automatiser** la publication via **GitHub Actions**.

---

## 🧠 Résumé rapide (à garder en tête)
- **Tag** = **référence immuable** vers un commit (marqueur de version). **Annoté** > **léger** pour les releases.
- **SemVer** : `MAJOR.MINOR.PATCH` + **pré-release** (`-alpha.1`) + **build metadata** (`+20251222`).
- **Conventional Commits** : messages standardisés → mappage **automatique** vers **SemVer** (feat → minor, fix → patch, BREAKING → major).
- **Releases GitHub** : notes de version, assets, génération auto possible.
- **Automatisation** : workflow **Actions** (tests → build → tag → release) ; push des **tags**.

---

## 📚 Définitions & concepts

### 🔹 Tags Git
- **Léger (lightweight)** : juste un **nom** pointant vers un commit. 
  ```bash
  git tag v1.2.3          # tag léger
  ```
- **Annoté (annotated)** : objet tag complet (auteur, date, message, signature GPG possible). 
  ```bash
  git tag -a v1.2.3 -m "Release 1.2.3"
  git show v1.2.3         # métadonnées + diff
  ```

**Pourquoi préférer annoté ?**
- Métadonnées **signées** (traçabilité pro), message lisible, support idéal pour **releases**.

### 🔹 Releases (GitHub)
Une **Release** regroupe :
- **Tag** (référence),
- **Notes** (CHANGELOG, highlights, breaking changes),
- **Assets** (archives, binaires, bundles front),
- **Automatisation** (auto‑release notes, Actions).

### 🔹 SemVer (versioning sémantique)
**Format** : `MAJOR.MINOR.PATCH[-pre][+build]`
- **MAJOR** : incompatible API (**BREAKING CHANGE**).
- **MINOR** : fonctionnalité rétro‑compatible (`feat`).
- **PATCH** : correction rétro‑compatible (`fix`).
- **Pré-release** : `-alpha.1`, `-beta.2`, `-rc.1` (avant version finale).
- **Build metadata** : `+20251222`, non ordonnant, informatif.

### 🔹 Conventional Commits (rappel)
Format **type(scope): description** + **footer**.
- Types : `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **BREAKING CHANGE** via `!` (`feat!:`) ou footer `BREAKING CHANGE:`.
- Impact **SemVer** :
  - `BREAKING CHANGE` → **major**,
  - `feat` → **minor**,
  - `fix`/`perf`/`docs` (selon politique) → **patch**.

---

## 💡 Analogies
- **Tag = étiquette d’édition** : tu colles une **étiquette** `v1.2.3` sur un **tirage** du livre (commit).
- **Release = publication** : tu annonces l’édition, son **sommaire** (notes), et tu fournis les **fichiers**.
- **SemVer = règle d’édition** : MAJOR change la **collection**, MINOR ajoute des **chapitres**, PATCH corrige des **typos**.

---

## 🧭 Schémas — tags & flux de release

### ASCII — Historique & tags
```text
main:  o---o---o---o---o
             ^       ^
           v1.2.2   v1.2.3
```

### Mermaid — Flux de publication
```mermaid
flowchart TD
A[Commits (feat/fix)] --> B[Tests & Lint (CI)]
B --> C{BREAKING ?}
C -- Oui --> D[Version MAJOR]
C -- Non --> E{feat ?}
E -- Oui --> F[Version MINOR]
E -- Non --> G[Version PATCH]
F --> H[Tag annoté]
G --> H[Tag annoté]
D --> H[Tag annoté]
H --> I[Release notes]
I --> J[Upload assets]
J --> K[Publish]
```

---

## 🔧 Commandes & pratiques

### Créer & pousser des tags
```bash
# Annoté
git tag -a v1.2.3 -m "Release 1.2.3"
git push origin v1.2.3

# Tous les tags
git push --tags

# Supprimer
git tag -d v1.2.2
git push origin :refs/tags/v1.2.2
```

### Générer un changelog **manuel** (basique)
```bash
# Liste des commits depuis le tag précédent
git log v1.2.2..HEAD --pretty=format:"- %s (%h)" --no-merges
```

### Auto release notes (GitHub)
- GitHub peut **générer** des notes automatiquement en classant PR/commits. 
- Liaison d’issues via `Closes #id` pour que la release **referme** les tickets.

### Aide à la lecture
```bash
git describe --tags --always   # version la plus proche
```

---

## ⚙️ GitHub Actions — pipeline minimal de release

> **But** : sur `main`, lorsque les tests passent et qu’on bump la version, **créer le tag** et **publier** la release.

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*.*.*'  # publier quand un tag SemVer est poussé
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> **Variante** : déclencher un **bump** + tag via un job (ex. `github-script`) ou via outils dédiés. Ici, on se concentre sur la **publication** à partir d’un tag existant.

---

## 🧪 Exercices pratiques
1. **Tag annoté** : crée `v0.1.0` avec message, pousse, puis affiche `git show v0.1.0`.
2. **SemVer mapping** : rédige 5 messages (`feat`, `fix`, `feat!`, `docs`, `perf`) et décide du **bump**.
3. **Changelog** : génère la liste `git log v0.1.0..HEAD` et regroupe par type.
4. **Release GitHub** : ouvre une release avec notes (auto + manuelles) et ajoute un **asset**.
5. **Actions** : crée `release.yml`, pousse un tag `v0.1.1` et vérifie la publication.

---

## ⚠️ Encadré risques & hygiène
- **Tag sur mauvais commit** : vérifie **tests** et **CI** avant de taguer.
- **Version incohérente** : respecte **SemVer** ; n’augmente pas `MAJOR` sans **BREAKING** clair.
- **Changelog trompeur** : reflète **vraiment** les changements ; mentionne **breaking** et **deprecations**.
- **Tags locaux non poussés** : n’oublie pas `git push origin <tag>`.
- **Versions auto sans review** : pipeline doit inclure **validations** (statuses) avant publication.

---

## 🧑‍🏫 Théorie & modélisation en **JavaScript**

### 1) Parser & comparer **SemVer**
```js
function parseSemVer(v){
  const m = v.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if(!m) return null;
  return { major:+m[1], minor:+m[2], patch:+m[3], pre:m[4]||null, build:m[5]||null };
}
function cmpSemVer(a,b){
  for(const k of ['major','minor','patch']){ if(a[k]!==b[k]) return a[k]-b[k]; }
  // pre-release: absence > présence (final > pre)
  if(!a.pre && b.pre) return 1;
  if(a.pre && !b.pre) return -1;
  if(a.pre && b.pre){ return a.pre.localeCompare(b.pre); }
  return 0;
}
```

### 2) Déduire le **bump** depuis des commits (Conventional)
```js
function classifyCommit(msg){
  if(/BREAKING CHANGE|!:\s/.test(msg)) return 'major';
  if(/^feat(\(|:)/.test(msg)) return 'minor';
  if(/^(fix|perf|docs|refactor|test|chore|build|ci)(\(|:)/.test(msg)) return 'patch';
  return null;
}
function nextVersion(current, commitMessages){
  const priority = { major:3, minor:2, patch:1 };
  let bump = 0;
  for(const m of commitMessages){ const c = classifyCommit(m); bump = Math.max(bump, c?priority[c]:0); }
  const v = parseSemVer(current);
  if(bump===3){ return `v${v.major+1}.0.0`; }
  if(bump===2){ return `v${v.major}.${v.minor+1}.0`; }
  if(bump===1){ return `v${v.major}.${v.minor}.${v.patch+1}`; }
  return current; // pas de changement
}
```

### 3) Génération simple de **release notes** depuis commits
```js
function generateNotes(commits){
  const groups = { major:[], minor:[], patch:[], other:[] };
  for(const c of commits){
    const t = classifyCommit(c);
    (t?groups[t]:groups.other).push(c);
  }
  const section = (title, arr) => arr.length?`\n## ${title}\n`+arr.map(x=>`- ${x}`).join('\n'):'';
  return ['BREAKING CHANGES', 'Features', 'Fixes/Other'].map((title, i)=>
    section(title, i===0?groups.major:i===1?groups.minor:[...groups.patch,...groups.other])
  ).join('\n');
}
```

---

## 📎 Glossaire (sélection)
- **Tag** : référence (annotée/légère) vers un commit.
- **Release** : publication liée à un tag (notes + assets).
- **SemVer** : `MAJOR.MINOR.PATCH[-pre][+build]`.
- **Conventional Commits** : convention de messages standardisée.
- **Changelog** : liste des changements par version.

---

## 📚 Ressources officielles
- Git `tag` : https://git-scm.com/docs/git-tag  
- Releases GitHub : https://docs.github.com/en/repositories/releasing-projects-on-github  
- SemVer : https://semver.org/  
- Conventional Commits : https://www.conventionalcommits.org/  
- GitHub Action (gh-release) : https://github.com/softprops/action-gh-release

---

## 🧾 Résumé des points essentiels — Chapitre 13
- **Tags annotés** pour les releases ; **pousser** les tags.
- **SemVer** + **Conventional Commits** → **bump** automatique cohérent.
- **Release notes** : claires, mentionnent **BREAKING**, **features**, **fixes**.
- **Automatisation** : pipeline simple **Actions** basé sur **tags**.

---

> 🔜 **Prochain chapitre** : [[14-chapitre-14-github-actions-ci-cd-bases]] (sera fourni après validation).
