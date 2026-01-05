---
title: "🪵 Chapitre 16 — Stratégies de branches : GitFlow vs Trunk‑Based"
tags: [git, branches, workflow, gitflow, trunk-based, releases, hotfix, feature-flags, ci-cd]
cssclass: chapitre
---

# 🪵 Chapitre 16 — Stratégies de branches : GitFlow vs Trunk‑Based

> **Objectif pédagogique :** comparer **GitFlow** et **Trunk‑Based Development** (TBD), comprendre leurs **forces/faiblesses**, savoir **quand choisir** l’un ou l’autre, mettre en place des **règles d’équipe** (noms de branches, PR, CI/CD), gérer **releases** & **hotfix**, et utiliser des **feature flags** pour livrer souvent sans casser.

---

## 🧠 Résumé rapide (à garder en tête)
- **GitFlow** : branches longues (`develop`, `release/*`, `hotfix/*`, `feature/*`) → **cadence de release planifiée**, **stabilité** accrue, mais **overhead** (merges multiples).
- **Trunk‑Based** : une **branche principale** (`main`) + **branches très courtes** → **déploiements fréquents**, **simplicité**, nécessite **CI solide**, **feature flags** et **discipline**.
- **Front‑end moderne** : souvent **TBD + PR obligatoires + squash** sur `main`, avec **release tags** (+ **release branches** si maintenance LTS).

---

## 📚 Définitions & concepts

### 🔹 GitFlow (modèle historique)
- Branches clés :
  - `main` : releases en production.
  - `develop` : intégration continue des features.
  - `feature/*` : développement d’une fonctionnalité.
  - `release/*` : stabilisation avant mise en prod.
  - `hotfix/*` : correctifs urgents à partir de `main`.
- Mécanique : feature → merge sur `develop` ; avant release, créer `release/x.y.z`, corriger/linter ; fusionner sur `main` **et** `develop` ; tag `vX.Y.Z`. Hotfix : partir de `main`, fusionner vers `main` **et** `develop`.

**Avantages** :
- Cadre **rigoureux** pour organisations avec **cycles de release**.
- **Isolation** nette des phases (développement vs stabilisation).

**Limites** :
- **Complexité** des merges (double fusion), **divergences** fréquentes.
- **Latence** d’intégration, risque de **big‑bang merges**.

### 🔹 Trunk‑Based Development (TBD)
- `main` (ou `trunk`) représente la **source de vérité** ; on crée des **petites branches jetables** (durée courte : heures/jours), on **ouvre une PR**, **CI** doit être **verte**, on **merge** (souvent **squash**) rapidement.
- Les **features non prêtes** sont placées derrière des **feature flags** (activation par configuration), limitant les branches longues.

**Avantages** :
- **Flux rapide** (petites PR), **conflits réduits**, **log linéaire**.
- Favorise **CI/CD** "+ release train" (versions fréquentes). 

**Limites** :
- Requiert **discipline** (tests/lint), **revues serrées**, **flags** bien gérés.
- Moins adapté aux **grosses intégrations** qui nécessitent de longues stabilisations (à compenser via flags et *canary releases*).

---

## 🧭 Schémas ASCII — comparaison visuelle

### GitFlow
```text
(main) o─────o─────o─────────o───────o (tags)
         \             \      
(develop) o───o───o───o───o───o───o───o
             \         \        \ 
(feature)      o──o      o──o     o──o
                \         \        \
(release/1.4)     o───o───o─────────o → merge → main + develop

(hotfix/1.4.1) o──o → merge → main + develop
```

### Trunk‑Based Development
```text
(main) o─o─o─o─o─o─o─o (petites PR squash, CI verte)
          \  \  \  \
(feature)  o  o  o  o → merge rapide → main (flags off jusqu’au go)
```

---

## 🎛️ Quand choisir quoi ? (repères pratiques)
- **GitFlow** si :
  - releases **planifiées**, **audits**/compliance, **produit critique** (longue stabilisation).
  - équipe préfère **gates** formels (release branch, UAT).
- **TBD** si :
  - objectif = **fréquence de déploiement** élevée (CI/CD), **petites features**.
  - culture **DevEx** : tests, lint, PR petites, **rebase/pull --rebase**, **squash**.
- **Hybride** : TBD quotidien + **release tags** ; créer **release/x.y** uniquement pour **maintenance** (LTS), **hotfix** via cherry‑pick.

---

## 🔧 Règles d’équipe (exemple front‑end)
- **Noms** : `feat/*`, `fix/*`, `docs/*`, `chore/*` ; **kebab‑case** clair (`feat/auth-login-form`).
- **PR** : petites (≤ ~300 lignes modifiées), **description claire**, **CI verte**, **review 1+**.
- **Merge** : **Squash & merge** par défaut ; exceptionnellement **rebase & merge** si nécessaire.
- **Pull** : `git pull --rebase` ; pas de merge commit lors des pulls.
- **Protection** : `main` protégée (required reviews, status checks).
- **Flags** : obligatoires pour features longues ; rollout progressif.

---

## 🚑 Releases, tags & hotfix
- **Release tags** (`vX.Y.Z`) sur `main` (voir Chap. 13).
- **Release branches** (`release/X.Y`) uniquement si **support** prolongé ; sinon tags suffisent.
- **Hotfix** : 
  1) patch sur `main` (PR courte), 
  2) tag `vX.Y.Z+1`, 
  3) si LTS : **cherry‑pick** sur `release/X.Y`.

**Commande utile** :
```bash
git cherry-pick <hash-du-fix>
```

---

## 🛠️ Feature flags — livrer sans branches longues
- Stocker les flags en **config** (JSON, env, remote config).
- Activer en **canary** (ex.: 5% utilisateurs), **rollback** rapide.
- Coupler avec **metrics** (erreurs, perf) pour décider du **go‑live**.

**Exemple de fichier de config** :
```json
{
  "features": {
    "login_v2": false,
    "checkout_express": true
  }
}
```

---

## ⚙️ Automatisations (CI/CD)
- **Checks obligatoires** : lint + tests + build + bundle size.
- **Release train** : cadence (ex. hebdo) → couper tag, publier **release notes** (auto + manuel).
- **Bots** : étiqueter PR (size, domain), rappeler `feat` vs `fix`.

---

## ⚠️ Encadré risques & hygiène
- **Branches longues** (GitFlow mal appliqué) → **divergences** et merges pénibles.
- **TBD sans flags** → **features à moitié finies** exposées ; activer **guards**.
- **Force‑push** sur PR partagée → coordination + `--force-with-lease`.
- **Hotfix mal répliqué** → oublis ; tenir une **checklist** (main + release + tag + notes).

---

## ✅ Checklist décisionnelle
- [ ] Cadence souhaitée : **rapide** (TBD) ou **calée** (GitFlow).
- [ ] CI : **verte & rapide** (tests/lint) ; **environnements** (preprod, canary).
- [ ] Flags : mécanisme en place (config, rollout, rollback).
- [ ] Protection : `main` protégée ; PR **petites** ; **squash** par défaut.
- [ ] Releases : tags clairs ; branches **LTS** seulement si besoin.

---

## 🧪 Exercices pratiques
1. **TBD** : crée `feat/navbar-a11y` → PR courte → **squash merge** sur `main` ; flag `navbarA11y=true` pour canary.
2. **GitFlow** : simule un cycle `release/1.4` depuis `develop`, corrige 2 bugs, merge vers `main` + `develop`, tag `v1.4.0`.
3. **Hotfix** : corrige un bug critique sur `main`, tag `v1.4.1`, puis `cherry-pick` sur `release/1.4`.
4. **Policy** : écris une page `CONTRIBUTING.md` listant noms de branches, PR, squash, flags.

---

## 🧑‍🏫 Théorie & modélisations en **JavaScript**

### 1) **Feature flag** : garde‑fou d’activation
```js
function isEnabled(flags, key, userPercent = 100){
  const v = flags[key];
  if (typeof v === 'boolean') return v; // ON/OFF
  if (typeof v === 'number') return userPercent <= v; // pourcentage rollout
  return false;
}
console.log(isEnabled({ login_v2: false }, 'login_v2')); // false
console.log(isEnabled({ checkout: 5 }, 'checkout', 3)); // true (3% ≤ 5%)
```

### 2) **Release train** (cadence simplifiée)
```js
function nextReleaseDate(startISO, cadenceDays = 7){
  const d = new Date(startISO);
  d.setDate(d.getDate() + cadenceDays);
  return d.toISOString().slice(0,10);
}
console.log(nextReleaseDate('2025-12-22', 7)); // ex.: 2025-12-29
```

### 3) **Validation de PR** (heuristique simplifiée)
```js
function prIsHealthy(changedLines, ciGreen, reviewers){
  const smallEnough = changedLines <= 300; // règle d'équipe
  const hasReview = reviewers >= 1;
  return smallEnough && ciGreen && hasReview;
}
console.log(prIsHealthy(250, true, 1)); // true
console.log(prIsHealthy(800, true, 2)); // false (trop grosse)
```

---

## 📎 Glossaire (sélection)
- **GitFlow** : modèle de branches avec `develop`, `release/*`, `hotfix/*`, `feature/*`.
- **TBD (Trunk‑Based)** : développement sur une branche principale avec **branches courtes**.
- **Feature flag** : interrupteur runtime qui masque/active une fonctionnalité.
- **Release train** : cadence régulière de sorties.
- **Cherry‑pick** : réappliquer un commit sur une autre branche.

---

## 📚 Ressources utiles
- *GitFlow* (concept d’origine de Vincent Driessen) — recherche "A successful Git branching model" pour l’article fondateur.
- *Trunk‑Based Development* — bonnes pratiques publiques (site communautaire TBD).  
- Feature flags — blogs d’outils (LaunchDarkly, Unleash) pour patterns d’activation/rollback.

---

## 🧾 Résumé des points essentiels — Chapitre 16
- **GitFlow** : utile pour cycles formels, mais plus **lourd**.
- **TBD** : **livraisons fréquentes**, nécessite **CI** solide + **feature flags**.
- **Front** : privilégier **TBD + PR** petites + **squash**, tags de release ; **release branches** uniquement pour LTS.
- **Hotfix** : patch sur `main` + tag ; cherry‑pick si maintenance.

---

> 🔜 **Prochain chapitre** : [[17-chapitre-17-outils-qualite-precommit-eslint-prettier-husky]] (sera fourni après validation).
