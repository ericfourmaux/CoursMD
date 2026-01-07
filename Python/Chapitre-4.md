
# 📚 Chapitre 4 — **Structures de données : list, tuple, dict, set**

> [!NOTE]
> Ce chapitre détaille les **quatre** structures fondamentales de Python : **liste**, **tuple**, **dictionnaire**, **ensemble**. Nous allons expliquer **ce qu’elles sont**, **pourquoi** les utiliser, **comment** les manipuler, et **quels pièges** éviter. Nous insisterons sur la **mutabilité**, la **copie (superficielle vs profonde)**, les **références**, et quelques **intuitions de complexité** pour raisonner sur la performance.

---

## 🎯 Objectifs pédagogiques
- Comprendre la **nature** et l’**usage** de `list`, `tuple`, `dict`, `set`.  
- Maîtriser **création**, **modification**, **parcours**, **recherche**, **opérations** et **méthodes** clés.  
- Savoir **copier** correctement (référence, copie superficielle, copie profonde).  
- Éviter les **pièges** : **listes mutables**, multiplications de listes, ordre des dictionnaires, tests d’appartenance, et collisions d’objets.

---

## 🧠 Concepts clés (vue d’ensemble)

### 🧠 `list` — liste **muable** ordonnée
- **Définition** : collection **ordonnée** et **muable** d’objets.
- **Pourquoi** : idéale pour des **séquences modifiables** (ajouts, suppressions, tri).
- **Création** : `l = [1, 2, 3]`, `list(iterable)`.
- **Accès** : index (`l[0]`), tranches (`l[1:3]`).
- **Méthodes clés** : `append`, `extend`, `insert`, `pop`, `remove`, `clear`, `index`, `count`, `sort`, `reverse`.

### 🧠 `tuple` — tuple **immuable** ordonné
- **Définition** : séquence **ordonnée** et **immuable**.
- **Pourquoi** : pour des **regroupements stables**, clés de dictionnaire, **retours de fonctions**, 
  et **contrats figés** (ex. coordonnées).  
- **Création** : `t = (1, 2, 3)`, `tuple(iterable)`, **cas singleton** : `(1,)`.

### 🧠 `dict` — dictionnaire (table de hachage)
- **Définition** : association **clé → valeur**; clés **hachables** (immuables typiquement : `str`, `int`, `tuple` immuable).
- **Pourquoi** : **recherche** et **accès** rapides par clé; **modélisation** de structures nommées.
- **Création** : `d = {"a": 1, "b": 2}`, `dict(pairs)`.
- **Méthodes clés** : `get`, `keys`, `values`, `items`, `update`, `pop`, `setdefault`.

### 🧠 `set` — ensemble (sans doublon)
- **Définition** : collection **non ordonnée** d’éléments **uniques**.
- **Pourquoi** : **tests d’appartenance** rapides, **suppression des doublons**, **opérations ensemblistes** (union, intersection…).
- **Création** : `s = {1, 2, 3}`, `set(iterable)`; **ensemble vide** : `set()`.
- **Opérations** : `|` union, `&` intersection, `-` différence, `^` différence symétrique.

---

## ❓ Pourquoi ces structures ?
- Elles répondent à des **besoins distincts** : **ordre** (list/tuple), **association** (dict), **unicité/appartenance** (set).  
- Elles permettent d’écrire un code **clair**, **expressif** et **efficace**.

---

## 🧪 Exemples concrets

### 1) `list` — manipulations de base
```
l = [3, 1, 4]
l.append(1)         # [3, 1, 4, 1]
l.extend([5, 9])    # [3, 1, 4, 1, 5, 9]
l.insert(1, 2)      # [3, 2, 1, 4, 1, 5, 9]
x = l.pop()         # 9, l devient [3, 2, 1, 4, 1, 5]
l.remove(1)         # supprime la première occurrence de 1
l.sort()            # [1, 2, 3, 4, 5]
l.reverse()         # [5, 4, 3, 2, 1]
```

### 2) `tuple` — regroupement et déballage
```
point = (10, 20)
x, y = point      # déballage
constantes = (3.14, 2.718, 1.618)
```

### 3) `dict` — fréquences et accès sécurisé
```
texte = "banane pomme banane kiwi"
frequences = {}
for mot in texte.split():
    frequences[mot] = frequences.get(mot, 0) + 1
# {'banane': 2, 'pomme': 1, 'kiwi': 1}

# Accès tolérant (sans KeyError)
print(frequences.get("orange", 0))  # 0
```

### 4) `set` — doublons et opérations d’ensemble
```
nums = [1, 2, 2, 3, 3, 3]
unique = set(nums)  # {1, 2, 3}
A = {1, 2, 3}
B = {3, 4}
print(A | B)  # union -> {1, 2, 3, 4}
print(A & B)  # intersection -> {3}
print(A - B)  # différence -> {1, 2}
print(A ^ B)  # diff. symétrique -> {1, 2, 4}
```

---

## 🔧 Pratique guidée

### Parcourir proprement
```
# Dictionnaire
user = {"nom": "Ada", "age": 30}
for k, v in user.items():
    print(k, v)

# Ensemble
s = {"a", "b", "c"}
for elem in s:
    print(elem)  # l’ordre n'est pas garanti
```

### Comprehensions (aperçu). Détails au chap. 9
```
# Liste de carrés
carres = [x * x for x in range(5)]  # [0, 1, 4, 9, 16]
# Filtrer pairs
pairs = [x for x in range(10) if x % 2 == 0]
# Dict de longueurs
mots = ["Ada", "Lovelace", "Alan"]
longueurs = {m: len(m) for m in mots}  # {'Ada': 3, 'Lovelace': 9, 'Alan': 4}
# Set de voyelles détectées
s = set("bonjour")
voyelles = {ch for ch in s if ch in "aeiouy"}
```

---

## 🧩 Références, copies et **mutabilité**

### Schéma ASCII — alias vs copie
```
l = [1, 2, 3]
alias = l         # même objet
copie = l.copy()  # nouveau conteneur

# alias et l partagent la même référence
# copie est indépendant (copie superficielle)
```

### Copie superficielle vs **profonde**
```
import copy
L = [[1, 2], [3, 4]]
shallow = L.copy()          # copie superficielle
L[0].append(99)
print(shallow)               # [[1, 2, 99], [3, 4]] (partage des sous‑listes)

deep = copy.deepcopy(L)     # copie profonde
L[1].append(77)
print(deep)                  # [[1, 2, 99], [3, 4]] (indépendant)
```

> [!WARNING]
> **Copie superficielle** du conteneur ≠ copie des **éléments**. Si les éléments sont eux‑mêmes **muables**, ils restent **partagés**.

---

## ⚠️ Pièges courants (et solutions)

### 1) Multiplication de listes et sous‑listes partagées
```
# Mauvais : crée N références vers la même sous‑liste
L = [[0] * 3] * 5
L[0][0] = 1
print(L)  # toutes les lignes affectées

# Bon : compréhension pour des listes indépendantes
L = [[0 for _ in range(3)] for _ in range(5)]
```

### 2) Modifier une liste pendant l’itération
```
L = [1, 2, 3, 4]
for x in L:
    if x % 2 == 0:
        L.remove(x)  # ⚠️ risque de sauter des éléments

# ✅ Faire une nouvelle liste
L = [x for x in L if x % 2 != 0]
```

### 3) Clés de `dict` doivent être hachables
```
# Mauvais :
# d = { [1, 2]: "liste" }  # TypeError : liste non hachable

# Bon : tuple immuable
d = { (1, 2): "coord" }
```

### 4) Ordre des dictionnaires
```
d = {"a": 1, "b": 2}
d["c"] = 3
# En Python moderne, l'ordre d'insertion est conservé.
# Mais ne confondez pas avec un **tri** : utilisez 'sorted(d.items())' si besoin.
```

### 5) Appartenance et `set` vs `list`
```
# Test d'appartenance : O(1) amorti avec set, O(n) avec liste
val = 999
liste = list(range(10000))
ens = set(liste)
print(val in liste)
print(val in ens)
```

> [!TIP]
> Utilisez `set` pour des **recherches d’appartenance** fréquentes; `list` pour conserver l’**ordre** ou les **doublons**.

---

## 🧮 Intuitions de **complexité** (non strictes)

> [!NOTE]
> Il s’agit d’**intuitions** pratiques (cas moyen) — utiles pour **choisir** une structure. Les détails complets seront abordés plus tard.

```
# list
# - indexer l[i] : ~O(1)
# - ajouter à la fin (append) : ~O(1) amorti
# - insérer/supprimer au milieu : ~O(n)

# dict / set (table de hachage)
# - accès par clé / appartenance : ~O(1) amorti
# - parcours complet : O(n)

# tuple : comme list mais **immuable**; utile pour clés de dict
```

---

## 💡 Astuces de pro
- Préférez `dict.get(k, défaut)` pour éviter `KeyError`.  
- `setdefault` pour initialiser une clé : `d.setdefault(k, []).append(x)`.  
- `sorted(d.items(), key=lambda kv: kv[1], reverse=True)` pour **trier par valeur**.  
- Utilisez `tuple` pour des **enregistrements immuables** (coordonnées, paramètres).  
- `list.copy()` ou `l[:]` pour copie superficielle; `copy.deepcopy` pour **imbriqués**.

---

## 🧪🧮 Mini‑formules (en Python)

### Compter fréquences (sans Counter)
```
def freqs(mots):
    f = {}
    for m in mots:
        f[m] = f.get(m, 0) + 1
    return f
```

### Index inversés (dernière occurrence)
```
L = ["a", "b", "a", "c"]
last = {}
for i, x in enumerate(L):
    last[x] = i
# last -> {"a": 2, "b": 1, "c": 3}
```

### Fusion de dictionnaires
```
A = {"a": 1}
B = {"b": 2, "a": 9}
C = {**A, **B}  # priorité à B
```

### Opérations d’ensemble (syntaxe)
```
A = {1, 2, 3}
B = {3, 4}
U = A | B
I = A & B
D = A - B
X = A ^ B
```

---

## 🧩 Exercices (avec indications)

1. **Nettoyage & dédoublonnage** : à partir d’une liste de mots avec espaces et doublons, produire une **liste propre** (sans doublons, ordre conservé).  
   *Indications :* `strip`, `set` pour détecter doublons, mais conserver l’ordre via un `dict` ou parcours.

2. **Fréquences de mots** : écrire `frequences(texte: str) -> dict` qui renvoie un dict **mot → compte** (insensible à la casse).  
   *Indications :* `split`, `lower`, `get`, `replace` pour ponctuation simple.

3. **Fusion intelligente** : fusionner deux dicts en **additionnant** les valeurs pour les clés communes.  
   *Indications :* parcours `items()`, `get`.

4. **Table de translation** : créer un dict pour remplacer `{"é": "e", "à": "a"}` dans un texte.  
   *Indications :* parcourir `str` et reconstruire une **liste de caractères** puis `"".join`.

5. **Opérations ensemblistes** : donnés deux ensembles de tags (A, B), afficher `union`, `intersection`, `différence`, `différence symétrique`.  
   *Indications :* opérateurs `| & - ^`.

---

## 🧭 Récap — À retenir absolument
- **`list`** : ordonnée, **muable**; idéale pour séquences modifiables.  
- **`tuple`** : ordonné, **immuable**; utile pour enregistrements stables et clés de dict.  
- **`dict`** : **clé → valeur**, accès rapide; attention aux **clés hachables**.  
- **`set`** : **unicité** et appartenance rapide; utile pour **doublons** et **opérations d’ensemble**.  
- **Copie** : attention à la **copie superficielle** vs **profonde** sur structures imbriquées.

---

## ✅ Checklist de compétence
- [ ] Je sais **créer** et **manipuler** `list`, `tuple`, `dict`, `set`.  
- [ ] Je comprends **mutabilité** et **références**.  
- [ ] Je sais **copier** correctement (superficiel vs profond).  
- [ ] Je peux **parcourir** et **rechercher** efficacement.  
- [ ] Je connais les **opérations d’ensemble** et la **fusion** de dicts.

---

## 🧪 Mini‑quiz

1) `set([1, 1, 2])` donne :  
   a) `{1, 1, 2}`  
   b) `{1, 2}`  
   c) `[1, 2]`

2) Pour éviter `KeyError`, on utilise :  
   a) `d[k]`  
   b) `d.get(k)`  
   c) `d.pop(k)`

3) `[[0] * 3] * 5` crée :  
   a) 5 lignes **indépendantes**  
   b) 5 **références** vers la **même** ligne  
   c) une erreur

*Réponses attendues :* 1) b  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Fonctions — conception et bonnes pratiques** : signatures, paramètres, portée, fermetures, et pièges de valeurs par défaut **mutables**.
