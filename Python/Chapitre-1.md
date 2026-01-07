
# 📚 Chapitre 1 — Bases du langage : **types, variables, opérations**

> [!NOTE]
> Ce chapitre est conçu pour débuter **en douceur** tout en allant **au fond des choses**. Nous avancerons lentement, avec des analogies, des exemples concrets, et des explications rigoureuses.

---

## 🎯 Objectifs pédagogiques
- Identifier et manipuler les **types primitifs** : `int`, `float`, `str`, `bool`, `None`.  
- Comprendre **variables**, **affectation**, **référence** et **mutabilité**.  
- Maîtriser **opérations arithmétiques**, **opérations sur chaînes**, **conversions de type**.  
- Savoir utiliser `print()` et `input()`, commenter efficacement, et éviter les **pièges courants** (division entière vs flottante, arrondis, etc.).

---

## 🧠 Concepts clés

### 🧠 Type de données (définition)
Un **type** décrit **la nature** et **le comportement** d’une valeur : quelles opérations sont possibles et comment elle est représentée. En Python, les principaux types de base sont :
- `int` — entiers (ex. `-3`, `0`, `42`)  
- `float` — nombres à virgule flottante (ex. `3.14`, `-0.001`)  
- `str` — chaînes de caractères (texte)  
- `bool` — booléens (`True` ou `False`)  
- `NoneType` — valeur spéciale `None` qui signifie « absence de valeur »

> [!TIP]
> **Pourquoi c’est important ?** Connaître le type permet de **prédire les opérations valides** (addition, concaténation, comparaison) et d’éviter des erreurs de type.

### 🧠 Variables, affectation et référence
- Une **variable** est un **nom** qui **référence** une valeur en mémoire.  
- L’**affectation** (`=`) **lie** un nom à une valeur **sans copier** la valeur.  
- La **référence** est le « lien » entre le nom et l’objet en mémoire.

**Schéma ASCII (références)**
```
n = 5      # 'n' ---> [ 5 ] (objet int)
m = n      # 'm' ---> (référence vers le même objet que 'n')

# Après m = n, 'm' et 'n' pointent vers le même int 5 (les ints sont immuables)
```

### 🧠 Mutabilité vs immutabilité
- **Immuable** : l’objet **ne peut pas être modifié** après création (ex. `int`, `float`, `str`, `tuple`).  
- **Muable** : l’objet **peut être modifié** (ex. `list`, `dict`, `set`).

> [!WARNING]
> **Piège** : confondre affectation et copie. Sur les objets muables, deux variables peuvent référencer **le même objet** : modifier l’une **modifie l’autre**.

### 🧠 Littéraux et conversions
- **Littéral** : notation directe d’une valeur (ex. `42`, `3.14`, `'Bonjour'`, `True`, `None`).  
- **Conversions** : `int('10')`, `float('3.5')`, `str(42)`, `bool(0)`.

> [!NOTE]
> `bool(x)` renvoie `False` pour `0`, `0.0`, `''`, `[]`, `{}`, `None` et `True` sinon (notion de **truthiness** détaillée au Chapitre 3).

---

## ❓ Pourquoi ces notions ?
- Elles constituent **le socle** pour tout programme : si on sait **ce qu’on manipule**, on peut raisonner correctement.  
- Elles évitent les **erreurs invisibles** (arrondis, copies implicites, conversions automatiques).  
- Elles facilitent la **lecture** et la **maintenance** du code.

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — Calcul de moyenne (arithmétique de base)
```
notes = [12, 15, 10]
# Formule en Python : moyenne = somme / nombre d'éléments
moyenne = sum(notes) / len(notes)
print(moyenne)  # 12.333333333333334
```

> [!TIP]
> ⚙️ **Formule (en Python)** : `sum(seq) / len(seq)` est la **définition** opérationnelle de la moyenne simple.

### Exemple 2 — Concaténation de chaînes (texte)
```
prenom = "Ada"
nom = "Lovelace"
identite = prenom + " " + nom
print(identite)  # Ada Lovelace
```

### Exemple 3 — Conversion et formatage
```
age = 30
msg = f"Vous avez {age} ans."  # f-string (formatage moderne)
print(msg)
```

### Exemple 4 — Booléens et comparaisons
```
a = 5
b = 8
print(a < b)       # True
print(a == 5)      # True
print(a != b)      # True
```

---

## 🔧 Pratique guidée pas à pas

### 1) Entrées et sorties
```
nom = input("Votre nom : ")
print("Bonjour,", nom)
```

> [!WARNING]
> `input()` renvoie **toujours une chaîne** (`str`). Pour un entier : `int(input(...))`. Pour un flottant : `float(input(...))`.

### 2) Conversions et garde-fous
```
texte = "3.14"
pi = float(texte)  # conversion sûre si le texte est bien un nombre
print(pi)
```

### 3) Calculs et arrondis
```
x = 0.1 + 0.2
print(x)       # 0.30000000000000004 (flottants binaires)
print(round(x, 2))  # 0.3
```

> [!NOTE]
> Les **flottants** sont représentés en binaire ; certaines fractions décimales n’ont pas de représentation exacte, d’où des **petites erreurs**.

### 4) Commentaires et lisibilité
```
# Ceci est un commentaire explicatif
resultat = (5 + 3) * 2  # parenthèses pour clarifier l’intention
print(resultat)
```

---

## ⚠️ Pièges courants (et solutions)

### Division entière vs flottante
```
print(5 / 2)   # 2.5 (division flottante)
print(5 // 2)  # 2   (division entière -> plancher)
```

> [!TIP]
> Utilisez `//` pour des **indices** ou des **quantités discrètes** (ex. pages), et `/` pour des **mesures continues**.

### Comparer `==` vs `is`
```
print(1000 == 1000)  # True (égalité de valeur)
# 'is' teste l'identité d'objet (même référence en mémoire)
```

### Chaînes immuables
```
texte = "abc"
# texte[0] = 'A'  # ❌ Erreur : immuable
texte = "A" + texte[1:]  # ✅ créer une nouvelle chaîne
```

### Copie vs référence (sur listes)
```
l = [1, 2, 3]
alias = l         # référence au même objet
copie = l.copy()  # nouvelle liste (copie superficielle)

alias.append(4)
print(l)      # [1, 2, 3, 4]
print(copie)  # [1, 2, 3]
```

> [!WARNING]
> **Copie superficielle** (= un niveau) : les éléments référencés (s’ils sont muables) restent partagés. Pour des structures imbriquées, voir `copy.deepcopy` (chap. 4).

---

## 💡 Astuces de pro (utiles dès le début)

- **Noms explicites** : `total`, `moyenne`, `compte_utilisateurs` > `t`, `m`, `cu`.  
- **f-strings** pour formatage moderne : `f"{variable:.2f}"` pour 2 décimales.  
- **Parenthèses** pour clarifier la **précédence** des opérations.  
- **Commentaires** : expliquer le **pourquoi**, pas le **quoi**.  
- **Immutabilité** : favorise la **sécurité** et la **prévisibilité**.

---

## 🧪🧮 Formules & mini-théories (exprimées en Python)

### Moyenne arithmétique
```
# moyenne de n valeurs x1..xn
x = [x1, x2, x3]  # remplacer par vos données
moyenne = sum(x) / len(x)
```

### Distance absolue
```
# |a - b|
a = 10
b = 4
distance = abs(a - b)  # 6
```

### Arrondi bancaire (approx.)
```
# Arrondi à 2 décimales
val = 2.675
print(round(val, 2))  # 2.67 ou 2.68 selon représentation binaire
```

> [!NOTE]
> Les **flottants** ne sont pas décimaux. Pour des montants financiers, utilisez `decimal.Decimal` (standard library, chap. 13).

---

## 🧩 Exercices (avec indications)

1. **Convertisseur de degrés** : lire une température en Celsius (via `input`) et afficher en Fahrenheit.  
   - Formule : `F = C * 9/5 + 32`.  
   - Indices : conversion `float(input(...))`, f-string pour formatage.

2. **Concaténation sécurisée** : demander prénom et nom, afficher `"Nom, Prénom"` même si l’utilisateur entre des espaces superflus.  
   - Indices : `strip()`, `title()`.

3. **Statistiques rapides** : calculer moyenne, min, max d’une liste de notes.  
   - Indices : `sum`, `len`, `min`, `max`, `round`.

4. **Analyse de booléens** : tester différentes valeurs avec `bool()` (`0`, `""`, `[]`, `{}`, `None`, `"Texte"`) et commenter.

> [!TIP]
> Commencez par écrire **en clair** ce que vous voulez (en commentaires), puis traduisez en **Python**.

---

## 🧭 Récap — À retenir absolument

- Les **types** définissent ce que l’on peut faire avec une valeur.  
- Une **variable** **référence** un objet ; l’affectation ne **copie** pas.  
- Certains types sont **immuables** (`int`, `float`, `str`), d’autres **muables** (`list`, `dict`).  
- Connaître la différence **`/` vs `//`** et les **limites des flottants**.  
- Documenter, nommer clairement, et **tester** ses hypothèses par de petits exemples.

---

## ✅ Checklist de compétence

- [ ] Je sais distinguer `int`, `float`, `str`, `bool`, `None`.  
- [ ] Je comprends ce qu’est une **référence** et la **mutabilité**.  
- [ ] Je peux convertir proprement les types (`int`, `float`, `str`).  
- [ ] Je sais formater l’affichage avec **f-strings**.  
- [ ] Je connais les risques liés aux **flottants** et au **`//`**.

---

## 🧪 Mini-quiz

1) `input()` renvoie :  
   a) `int`  
   b) `str`  
   c) `float`  

2) `5 // 2` vaut :  
   a) `2.5`  
   b) `2`  
   c) `3`  

3) Sur une liste `l`, `alias = l` fait :  
   a) une copie indépendante  
   b) une nouvelle référence vers le **même** objet  
   c) une copie profonde

*Réponses attendues :* 1) b  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Chaînes de caractères & formatage** — nous irons plus loin sur Unicode, slicing, et f-strings avancées.

