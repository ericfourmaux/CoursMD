---
title: "🔍 Chapitre 9 — Diff, Blame, Bisect : enquêter"
tags: [git, diff, blame, bisect, enquete, debug, perf, patience, histogram]
cssclass: chapitre
---

# 🔍 Chapitre 9 — Diff, Blame, Bisect : enquêter

> **Objectif pédagogique :** savoir **comparer** précisément des versions (`diff`), **attribuer** et **comprendre** l’origine d’une ligne (`blame`) avec **éthique**, et **localiser** le commit fautif via **recherche binaire** (`bisect`). Tu apprendras à choisir le **bon diff algorithm**, à ignorer des commits de **refactor/formatage**, et à **automatiser** `bisect`.

---

## 🧠 Résumé rapide (à garder en tête)
- **`git diff`** compare **états** (working vs index, index vs HEAD, commit…commit), avec options utiles (`--staged`, `--stat`, `--word-diff`, `--name-status`, `--color-moved`, `-w`).
- **`git blame`** annote chaque **ligne** avec le **commit** et l’**auteur** ; on peut **ignorer** des commits (formatage) via `--ignore-rev` / `--ignore-revs-file`.
- **`git bisect`** trouve le **premier commit fautif** par **recherche binaire** ; peut être **automatisé** avec un script (`bisect run`).

---

## 📚 Définitions précises

### 🔹 `git diff` (comparaison)
**Définition :** affiche les **differences** entre deux **arbres** (working, index, commits). Le diff se fait par **lignes** (ou mots avec `--word-diff`).

**Pourquoi :** comprendre **exactement** ce qui a changé, éviter les **effets de bord**, relire un patch avant commit/merge.

**Exemples clés :**
```bash
# Diff entre working tree et index
git diff

# Diff entre index et HEAD
git diff --cached

# Statistique et fichiers seulement
git diff --stat
git diff --name-only

# Deux commits
git diff HEAD~1 HEAD

# Comparaison par mots (utile pour CSS/JS)
git diff --word-diff

# Ignorer espaces (mise en forme)
git diff -w        # --ignore-all-space
git diff -b        # --ignore-space-change

# Mettre en évidence les lignes déplacées
git diff --color-moved

# Choix d’algorithmes (voir plus bas)
git diff --patience
git diff --histogram
```

> **Bonnes pratiques** : combine `--stat` pour l’aperçu + `--patch` pour le détail ; `--word-diff` est précieux pour micro‑changements CSS/JS.

### 🔹 `git blame` (attribution de lignes)
**Définition :** annote chaque **ligne** d’un fichier avec le **commit** qui l’a introduite (hash, auteur, date).

**Pourquoi :** comprendre **l’intention historique**, **demander** des précisions à la bonne personne, éviter les **régressions**.

**Exemples clés :**
```bash
# Blame simple sur un fichier
git blame src/app.js

# Restreindre au bloc de lignes -L (ex.: lignes 100 à 160)
git blame -L 100,160 src/app.js

# Ignorer un commit de formatage (ex.: Prettier)
git blame --ignore-rev <hash>
# Ignorer une liste dans un fichier
git blame --ignore-revs-file .git-blame-ignore-revs

# Ignorer espaces lors de la détection de mouvement
git blame -w

# Détection des lignes déplacées ou copiées (plus profond)
git blame -C -C src/app.js
# -M pour lignes déplacées, -C pour copies entre fichiers
```

> **Éthique & respect :** `blame` **n’est pas** pour pointer du doigt. Utilise‑le pour **comprendre** et **collaborer** : pose des questions constructives, propose un **correctif**.

### 🔹 `git bisect` (recherche binaire du commit fautif)
**Définition :** exécute une **recherche binaire** dans l’historique pour identifier le **premier commit** qui introduit un **bug** (bad).

**Pourquoi :** réduire drastiquement le **temps de diagnostic** dans un historique long.

**Exemples clés :**
```bash
# Démarrer
git bisect start
# Marquer l'état courant comme mauvais (bug présent)
git bisect bad
# Marquer un ancien commit connu comme bon (sans bug)
git bisect good <hash_bon>
# Git checkout au milieu, toi tu testes (ou script), puis tu dis "good" ou "bad"

# Automatiser avec un script (retour 0=good, non‑0=bad)
git bisect run npm test
# ou: gitleaks/test lint, script bash, etc.

# Revenir à l’état initial
git bisect reset
```

---

## 💡 Analogies
- **Diff = microscope** : tu mets deux échantillons côte à côte pour **voir** chaque variation.
- **Blame = historique des annotations** : comme des **notes** dans la marge signées par les auteurs.
- **Bisect = enquêteur binaire** : tu **coupe** l’intervalle en deux jusqu’à isoler le **coupable**.

---

## 🧭 Schémas ASCII — Bisect & lecture des diffs

### Bisect (réduction par moitiés)
```text
Bon (G)                                     Mauvais (B)
C0 ----- C1 ----- C2 ----- C3 ----- C4 ----- C5 ----- C6
          \________________________/\__________________/
                    test C3                   test C5

Itérations typiques:
1) pick milieu C3 → test (good/bad)
2) si bad → on va à C2 ; si good → on va à C4
3) on répète jusqu'au premier bad
```

### Lecture d’un `diff --word-diff`
```text
- color: {+red+}{-blue-};
+ margin: {+0+};
```

---

## 🔧 Algorithmes de diff — choisir intelligemment

- **myers** (défaut) : optimal LCS classique, parfois trop sensible aux blocs réordonnés.
- **patience** : ignore les lignes communes fréquentes, **excellent** pour refactors (CSS/JS) ; lit les mouvements plus proprement.
- **histogram** : proche de patience, sensible aux **fréquences** ; utile pour gros fichiers avec répétitions.

```bash
git diff --patience
git diff --histogram
```

> **Conseil** : sur des refactors front (reformatage, imports réordonnés), `--patience` ou `--histogram` donnent des diffs **plus parlants**.

---

## 🧪 Exercices pratiques (front‑end)
1. **Comparer deux commits** : fais `git diff --stat HEAD~1 HEAD`, puis `--word-diff` sur `styles.css`. Explique la différence entre `-w` et `--word-diff`.
2. **Blame respectueux** : utilise `git blame -L` sur un bloc JS problématique ; écris un message de PR qui cite le commit et **propose** une correction.
3. **Ignorer les commits de formatage** : crée `.git-blame-ignore-revs` avec le hash d’un gros refactor Prettier, puis `git blame --ignore-revs-file .git-blame-ignore-revs`.
4. **Bisect manuel** : démarre `git bisect`, marque `bad` sur HEAD, `good` sur une release antérieure, teste à chaque étape.
5. **Bisect automatisé** : `git bisect run npm test` sur un repo avec tests ; montre l’ID du premier commit fautif.

---

## ⚠️ Encadré risques & hygiène
- **Diff trompeur** : réordonnements ou formatages peuvent **masquer** le vrai changement → utilise `--word-diff`, `-w`, et **algorithmes** adaptés.
- **Blame accusateur** : ne l’utilise pas pour **reprocher** ; garde une **communication** constructive.
- **Bisect mal renseigné** : marquer un commit **good** alors qu’il est **bad** fausse la recherche ; **reteste** si doute.
- **Ignorer trop de commits** : `.git-blame-ignore-revs` doit rester **ciblé** (formatage massif), pas des corrections fonctionnelles.

---

## 💻 VS Code & outils utiles
- **GitLens** : affiche blame in‑editor ; navigation commits/blocs.
- **Diff editor** : compare deux versions de fichier (sélection dans la sidebar Git).
- **Terminals** intégrés : exécuter `bisect run` et voir la sortie.

---

## 🧑‍🏫 Théorie & modélisations en **JavaScript**

### 1) Diff naïf par lignes
```js
function lineDiff(aText, bText){
  const a = aText.split(/\r?\n/);
  const b = bText.split(/\r?\n/);
  const max = Math.max(a.length, b.length);
  const res = [];
  for(let i=0;i<max;i++){
    const ai=a[i]||""; const bi=b[i]||"";
    if(ai!==bi){ res.push({ line: i+1, from: ai, to: bi }); }
  }
  return res;
}
```

### 2) Word‑diff simplifié (CSS/JS)
```js
function wordDiff(aLine, bLine){
  const a=aLine.split(/\b/), b=bLine.split(/\b/);
  const out=[]; const m=Math.max(a.length,b.length);
  for(let i=0;i<m;i++){
    const ai=a[i]||"", bi=b[i]||"";
    if(ai!==bi){ out.push(`{-${ai}-}{+${bi}+}`); } else { out.push(ai); }
  }
  return out.join("");
}
```

### 3) Bisect binaire (concept)
```js
function bisect(commits, isBad){
  // commits triés du plus ancien au plus récent
  let lo=0, hi=commits.length-1, firstBad=null;
  while(lo<=hi){
    const mid=Math.floor((lo+hi)/2);
    if(isBad(commits[mid])){ firstBad=commits[mid]; hi=mid-1; } else { lo=mid+1; }
  }
  return firstBad; // premier commit où le bug apparaît
}
```

---

## ✅ Checklist de fin de chapitre
- [ ] Je sais **comparer** correctement (working/index/HEAD, commits).
- [ ] J’utilise `--word-diff`, `-w`, `--stat` selon le **contexte**.
- [ ] Je pratique `blame` avec **respect** et sais **ignorer** des refactors.
- [ ] Je sais lancer un **bisect**, manuel et **automatisé** avec un script.
- [ ] Je comprends quand changer **d’algorithme de diff** (`--patience`, `--histogram`).

---

## 📎 Glossaire (sélection)
- **Diff** : comparaison des changements entre deux états.
- **Blame** : attribution ligne‑par‑ligne au commit.
- **Bisect** : recherche binaire du commit fautif.
- **Patience/histogram** : variantes d’algorithmes de diff.
- **Ignore‑revs** : mécanisme pour exclure des commits de blame.

---

## 📚 Ressources officielles
- `git diff` : https://git-scm.com/docs/git-diff  
- `git blame` : https://git-scm.com/docs/git-blame  
- `git bisect` : https://git-scm.com/docs/git-bisect  
- Diff algorithms : https://git-scm.com/docs/git-diff#_generating_diffs_with_algorithm  
- Ignore revs : https://git-scm.com/docs/git-blame#Documentation/git-blame.txt---ignore-rev

---

## 🧾 Résumé des points essentiels — Chapitre 9
- **Diff** : choisis les **bonnes options** et l’**algorithme** adapté pour des refactors.
- **Blame** : outil d’**investigation**, pas de reproche ; `--ignore-revs-file` pour formatages.
- **Bisect** : **binaire** et **rapide** ; automatise avec `bisect run` pour gagner du temps.

---

> 🔜 **Prochain chapitre** : [[10-chapitre-10-remotes-origin-fetch-pull-push]] (sera fourni après validation).
