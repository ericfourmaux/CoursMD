 
# 📚 Chapitre 9 — **Compréhensions, itérateurs & générateurs**

> [!NOTE]
> Ce chapitre approfondit trois piliers idiomatiques de Python : les **compréhensions** (list/dict/set), les **itérateurs** (et la différence avec les **itérables**), et les **générateurs** avec `yield` (évaluation **paresseuse**). Nous avancerons **lentement**, avec définitions, “pourquoi”, analogies, exemples concrets, pièges, exercices, récap et quiz.

---

## 🎯 Objectifs pédagogiques
- Écrire des **compréhensions** expressives et lisibles (list, dict, set) avec conditions.  
- Comprendre **itérable** vs **itérateur** et manipuler `iter()`, `next()`.  
- Concevoir des **générateurs** (`def ...: yield ...`) pour des **flux paresseux**.  
- Savoir **chaîner** des transformations sans surcharger la mémoire.  
- Éviter les **pièges** (lisibilité, consommation unique, effets de bord).

---

## 🧠 Concepts clés

### 🧠 Compréhensions
- **Définition** : syntaxes **compactes** pour **construire** des collections à partir d’un **itérable** avec une **expression** et des **conditions** optionnelles.
- **Forme générale** :
```
# liste
[EXPR for x in iterable if condition]
# dictionnaire
{KEY_EXPR: VAL_EXPR for x in iterable if condition}
# ensemble
{EXPR for x in iterable if condition}
```

> [!TIP]
> **Pourquoi ?** Plus **concises** et souvent plus **rapides** qu’une boucle, tout en restant **lisibles** si l’expression est **simple**.

### 🧠 Itérable vs Itérateur
- **Itérable** : objet sur lequel on peut **itérer** (par ex. `for`). Il fournit un **itérateur** via `iter(obj)`. Ex.: liste, chaîne, dict, set, range, fichier, générateur.
- **Itérateur** : objet avec la méthode **`__next__()`**; chaque appel renvoie le **prochain** élément, ou lève **`StopIteration`**.

**Schéma ASCII — relation**
```
[Iterable] --iter()--> [Iterator] --next()--> valeur
```

> [!NOTE]
> `for` appelle **implicitement** `iter()` puis `next()` jusqu’à `StopIteration`.

### 🧠 Générateurs & `yield`
- **Définition** : fonctions qui **produisent** une **suite** de valeurs via `yield` et **reprennent** là où elles se sont arrêtées.
- **Pourquoi** : **paresseux** (génèrent à la demande), **peu coûteux** en mémoire, utiles pour **gros fichiers**, **pipelines**, **flux**.

**Schéma ASCII — pipeline paresseux**
```
source → [gen A] → [gen B] → consumer
        yield       yield
```

---

## ❓ Pourquoi ces notions ?
- Elles permettent de **décrire** des transformations **clairement** (compréhensions), d’exploiter le **protocole d’itération** (itérateurs), et d’implémenter des **pipelines** efficaces (générateurs).

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — Compréhensions simples
```
# carrés de 0..9
carres = [x * x for x in range(10)]
# pairs de 0..9
pairs = [x for x in range(10) if x % 2 == 0]
# longueurs de mots
mots = ["Ada", "Lovelace", "Alan"]
longueurs = {m: len(m) for m in mots}
# lettres uniques (sans doublon)
unique = {ch for ch in "banana"}  # {'b', 'a', 'n'}
```

### Exemple 2 — Conditions multiples & if/else dans l’expression
```
# tagger pairs/impairs
etiquettes = ["pair" if x % 2 == 0 else "impair" for x in range(6)]
# filtrer et transformer
clean = [s.strip().title() for s in ["  ada ", " alan", ""] if s.strip()]
```

### Exemple 3 — Itérables & itérateurs
```
seq = [10, 20, 30]
itr = iter(seq)       # obtient l'itérateur
print(next(itr))      # 10
print(next(itr))      # 20
print(next(itr))      # 30
# next(itr) -> StopIteration
```

### Exemple 4 — Générateur simple
```

def compte(n):
    i = 0
    while i < n:
        yield i
        i += 1

for x in compte(3):
    print(x)  # 0, 1, 2
```

### Exemple 5 — Générateur pipeline (lecture gros fichier)
```
from pathlib import Path

def lignes(path):
    with Path(path).open("r", encoding="utf-8") as f:
        for line in f:
            yield line

def nettoie(lignes):
    for l in lignes:
        l2 = l.strip()
        if l2:
            yield l2

def to_ints(lignes):
    for l in lignes:
        try:
            yield int(l)
        except ValueError:
            continue

# Chaînage paresseux
vals = to_ints(nettoie(lignes("data.txt")))
print(sum(vals))  # consomme le flux
```

### Exemple 6 — Générateur avec `yield from`
```

def flatten(listes):
    for L in listes:
        # délégation de sous-iteration
        yield from L

print(list(flatten([[1, 2], [3], []])))  # [1, 2, 3]
```

### Exemple 7 — Itertools (aperçu)
```
import itertools as it
# takewhile : prendre tant que condition vraie
print(list(it.takewhile(lambda x: x < 5, range(10))))  # [0, 1, 2, 3, 4]
# chain : concaténer des iterables
print(list(it.chain([1, 2], [3], [])))  # [1, 2, 3]
```

---

## 🔧 Pratique guidée

### 1) Refactoriser une boucle en compréhension
```
# Avant
res = []
for x in range(10):
    if x % 2 == 0:
        res.append(x * x)
# Après
res = [x * x for x in range(10) if x % 2 == 0]
```

### 2) Dict de comptage (sans Counter)
```
phrase = "Ada aime le code et le code aime Ada"
frequences = {}
for mot in phrase.split():
    m = mot.lower()
    frequences[m] = frequences.get(m, 0) + 1
# compréhension pour les mots > 1
freq2 = {k: v for k, v in frequences.items() if v > 1}
```

### 3) Générateur de blocs (lecture en paquets)
```

def chunks(seq, taille):
    buf = []
    for x in seq:
        buf.append(x)
        if len(buf) == taille:
            yield buf
            buf = []
    if buf:
        yield buf

print(list(chunks(range(7), 3)))  # [[0,1,2],[3,4,5],[6]]
```

### 4) `enumerate`, `zip` + compréhension
```
# étiqueter avec indices (1..)
L = ["a", "b", "c"]
etiquete = [f"{i}:{x}" for i, x in enumerate(L, start=1)]
# fusion parallèle
noms = ["Ada", "Alan"]
notes = [18, 15]
paires = [f"{n}:{no}" for n, no in zip(noms, notes)]
```

---

## ⚠️ Pièges courants (et solutions)

### 1) Lisibilité
```
# ⚠️ éviter les compréhensions trop longues ou imbriquées
# ✅ préférez une boucle claire ou des générateurs nommés
```

### 2) Consommation unique des générateurs
```
G = (x * x for x in range(3))
print(list(G))  # [0, 1, 4]
print(list(G))  # [] (déjà consommé)
```

> [!TIP]
> Recréez le générateur si besoin, ou **materialisez** en liste si la mémoire le permet.

### 3) Effets de bord dans compréhensions
```
# ⚠️ éviter d'appeler des fonctions avec effets de bord dans EXPR
# ✅ garder EXPR **sans surprises**
```

### 4) Fuites de variables (Py3 corrige mais prudence)
```
# En Python 3, la variable de compréhension est locale.
# Évitez les dépendances implicites à l'extérieur.
```

### 5) Générateurs infinis
```
# ⚠️ protégez vos consommateurs (take, limit) pour éviter boucles sans fin
```

---

## 💡 Astuces de pro
- **Nommer** vos générateurs (`def gens...`) pour la **réutilisabilité** et la **lisibilité**.  
- **Chaîner** des petites fonctions/générateurs spécialisés (principe UNIX).  
- Utiliser `itertools` (`chain`, `islice`, `takewhile`, `groupby`) pour composer des **pipelines** puissants.  
- Préférer une **compréhension simple** ou un **générateur** à une boucle complexe.

---

## 🧪🧮 Mini‑formules (en Python)

### Somme filtrée paresseuse
```
# sum consomme le générateur
s = sum(x for x in range(100) if x % 3 == 0)
```

### Première correspondance (EAFP + next)
```
seq = [2, 5, 9, 12]
match = next((x for x in seq if x > 10), None)
```

### Fenêtre glissante (itertools)
```
import itertools as it

def sliding(seq, k):
    it1, it2 = it.tee(seq)
    for _ in range(k - 1):
        next(it2, None)
        it2 = it.chain([None], it2)
    yield from zip(*(it.islice(it1, i, None) for i in range(k)))
```

---

## 🧩 Exercices (avec indications)

1. **Refactorisation** : réécrire une boucle filtrant et transformant des nombres en **compréhension**.  
   *Indications :* `if` dans compréhension, expression courte.

2. **Dict d’inversion** : partir d’une liste et construire un dict qui associe élément → **dernière** position.  
   *Indications :* `enumerate` + compréhension dict.

3. **Pipeline paresseux** : lire un fichier, **nettoyer**, convertir en `int`, filtrer `< 100`, et **somme**.  
   *Indications :* générateurs chaînés, `sum`.

4. **Chunks** : généraliser `chunks` pour accepter n’importe quel **itérable** et retourner des **tuples**.  
   *Indications :* buffer, `yield` final.

5. **Itertools** : utiliser `groupby` pour regrouper des mots par **première lettre** et produire un dict lettre → liste triée.  
   *Indications :* `sorted`, `groupby`, compréhensions.

---

## 🧭 Récap — À retenir absolument
- Les **compréhensions** : expressives et concises; gardez‑les **simples**.  
- **Itérable** vs **Itérateur** : `iter()` fournit l’itérateur, `next()` avance; `for` le fait **implicitement**.  
- Les **générateurs** avec `yield` : **paresseux**, idéaux pour **pipelines** et **gros flux**.  
- Attention à la **consommation unique** et aux **effets de bord**.

---

## ✅ Checklist de compétence
- [ ] Je sais écrire des **list/dict/set** compréhensions avec conditions.  
- [ ] Je distingue **itérable** et **itérateur** et j’utilise `iter`/`next`.  
- [ ] Je crée des **générateurs** pour des flux paresseux.  
- [ ] Je compose des **pipelines** simples (lecture → nettoyage → filtrage → agrégation).  
- [ ] J’évite les compréhensions **trop complexes**.

---

## 🧪 Mini‑quiz

1) `iter(seq)` renvoie :  
   a) une **copie** de `seq`  
   b) un **itérateur**  
   c) `None`

2) Un générateur est **consommé** :  
   a) jamais  
   b) une seule fois  
   c) autant de fois qu’on veut

3) Une compréhension dict s’écrit :  
   a) `{x for x in ...}`  
   b) `{k: v for ...}`  
   c) `dict(...)` uniquement

*Réponses attendues :* 1) b  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Programmation orientée objet (POO)** — classes, `__init__`, attributs, méthodes, composition vs héritage, dunder methods, `@dataclass`.
