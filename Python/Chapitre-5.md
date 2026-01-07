 
# 📚 Chapitre 5 — **Fonctions : conception et bonnes pratiques**

> [!NOTE]
> Dans ce chapitre, nous allons **prendre le temps** d’apprendre à **concevoir**, **écrire** et **utiliser** des **fonctions** en Python, avec une rigueur accessible au **débutant** : paramètres (positionnels, nommés, par défaut, **keyword-only**, **positional-only**), `return`, **portée** (LEGB), **fermetures** (closures), `*args`/`**kwargs`, **docstrings**, **annotations de type**, **valeurs par défaut mutables (piège)**, et **bonnes pratiques**. Vous verrez le **pourquoi** derrière chaque choix, des **analogies**, des **exemples concrets**, et une **checklist** pour code propre.

---

## 🎯 Objectifs pédagogiques
- Savoir **définir** une fonction (`def`), **appeler** et **retourner** des résultats (`return`).  
- Maîtriser les **kinds de paramètres** : positionnels, nommés, **par défaut**, **positional-only** (`/`), **keyword-only** (`*`), et `*args`/`**kwargs`.  
- Comprendre la **portée des noms** (LEGB), `global`, `nonlocal`, et les **fermetures**.  
- Écrire des **docstrings** utiles, ajouter des **annotations de type**, et **tester** des fonctions pures.  
- Éviter les **pièges** : valeurs par défaut **mutables**, **late binding** dans closures, dépendances globales, récursion mal conçue.

---

## 🧠 Concepts clés

### 🧠 Qu’est-ce qu’une fonction ? (définition)
Une **fonction** est un **bloc de code nommé** qui **prend des paramètres** (optionnels), **exécute** des instructions, et **retourne** une valeur (ou `None`). Elle favorise la **réutilisabilité**, la **modularité**, et la **testabilité**.

> [!TIP]
> **Analogie** : une fonction est une **machine** avec **entrées** (paramètres), **mécanisme interne** (corps), et **sortie** (`return`). Elle vous évite de **répéter** la même séquence de gestes.

### 🧠 Signature & paramètres
La **signature** décrit **comment on appelle** la fonction : ordre des paramètres, **types** (via annotations), valeurs par défaut. 

**Paramètres — catégories principales**
- **Positionnels** : fournis par **ordre** (`f(1, 2)`), ex. `def f(a, b): ...`  
- **Nommés** : fournis avec **nom=valeur** (`f(x=1, y=2)`), ex. `def f(x, y): ...`  
- **Par défaut** : `def f(a=10)` — la valeur est utilisée si l’argument est omis.  
- **Positional‑only** (`/`) : doivent être passés **par position**.  
- **Keyword‑only** (`*`) : doivent être passés **par nom**.  
- **Variadiques** : `*args` (tuple d’args positionnels), `**kwargs` (dict d’args nommés).

**Exemple de signature complète**
```
def calc(a, b, /, base=10, *, arrondi=False, precision=2, *args, **kwargs):
    ...
```
- `a, b, /` → **positional‑only**  
- `base=10` → **par défaut**  
- `arrondi`, `precision` après `*` → **keyword‑only**  
- `*args` / `**kwargs` → **variadiques**

### 🧠 `return` et multi‑retours
`return` termine la fonction et renvoie une **valeur** (sinon `None`). On peut renvoyer **plusieurs informations** via un **tuple**.
```
def stats(x):
    return min(x), max(x), sum(x) / len(x)
mn, mx, moy = stats([10, 20, 30])
```

### 🧠 Portée (LEGB) et résolution des noms
**LEGB** : **Local**, **Enclosing** (fonctions englobantes), **Global**, **Builtins**.

**Schéma ASCII — chaîne de recherche des noms**
```
[Local] → [Enclosing] → [Global] → [Builtins]
   |            |            |           |
   +--- si trouvé, on s'arrête. Sinon, on continue --->
```

- `global name` : indique qu’on veut **écrire** dans le nom **global**.  
- `nonlocal name` : indique qu’on veut **écrire** dans le nom de la **fonction englobante** (non global).

> [!WARNING]
> **Piège** : abuser de `global` rend le code **couplé** et difficile à tester. Préférez **passer des paramètres** et **retourner** des valeurs.

### 🧠 Fermetures (closures)
Une **fermeture** est une **fonction** qui **capture** des noms de son **environnement** (Enclosing) pour les réutiliser plus tard.
```
def fabrique_compteur(start=0):
    n = start
    def inc():
        nonlocal n
        n += 1
        return n
    return inc

c = fabrique_compteur(10)
print(c())  # 11
print(c())  # 12
```

> [!TIP]
> **Analogie** : la fermeture garde un **petit sac** d’objets (les variables capturées) qu’elle transporte partout, même hors de leur bloc d’origine.

### 🧠 Fonctions pures vs à effets de bord
- **Pure** : sortie dépend **seulement** des entrées; **aucun effet externe** (pas d’écriture de fichier, pas de mutation globale).  
- **Impure** : peut **modifier** un état externe (fichier, variable globale, I/O).  

> [!NOTE]
> Les fonctions **pures** sont **prévisibles** et **testables**; utilisez‑les pour le cœur **métier**. Encapsulez les **effets de bord** aux **frontières** (lecture/écriture).

### 🧠 Docstrings & annotations de type
- **Docstring** : chaîne immédiatement sous `def`, décrivant **but**, **paramètres**, **retour** et **exemples**.  
- **Annotations** : `def f(x: int) -> float: ...` — aident l’EDI et les outils de type.

**Exemple minimal**
```
def aire_disque(r: float) -> float:
    """Calcule l'aire d'un disque.
    Paramètres:
        r (float): rayon (>= 0)
    Retour:
        float: aire = π * r**2
    """
    import math
    return math.pi * (r ** 2)
```

---

## ❓ Pourquoi ces notions ?
- Les fonctions **structurent** votre programme : elles **séparent** la logique **métier** du **I/O**.  
- Des signatures claires rendent le code **lisible**, **robuste**, et **évolutif**.  
- La compréhension de la **portée** évite des **bugs subtils** (noms masqués, captures inattendues).  
- Les docstrings et types **documentent** et **outillent** vos fonctions.

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — Paramètres par défaut & keyword‑only
```
def prix_total(prix_ht: float, *, tva: float = 0.2, remise: float = 0.0) -> float:
    total = prix_ht * (1 + tva)
    total *= (1 - remise)
    return round(total, 2)

print(prix_total(100))                 # 120.0
print(prix_total(100, tva=0.1))        # 110.0
print(prix_total(100, remise=0.05))    # 114.0
```

> [!TIP]
> Les paramètres **keyword‑only** forcent des appels **lisibles** (`tva=...`, `remise=...`).

### Exemple 2 — Positional‑only
```
# utile pour éviter les mauvaises utilisations de noms (API stable)
def ratio(a, b, /):
    return a / b

print(ratio(10, 2))  # 5.0
# ratio(a=10, b=2)  # ❌ TypeError: positional-only
```

### Exemple 3 — `*args` et `**kwargs`
```
def log(message: str, *values, level: str = "INFO", **meta):
    ligne = f"[{level}] {message}"
    if values:
        ligne += " | " + ", ".join(map(str, values))
    if meta:
        ligne += " | " + ", ".join(f"{k}={v}" for k, v in meta.items())
    print(ligne)

log("Début", 1, 2, 3, level="DEBUG", utilisateur="eric")
```

### Exemple 4 — Séparer cœur métier et I/O
```
# coeur (pur)
def moyenne(notes: list[float]) -> float:
    return sum(notes) / len(notes)

# frontière I/O (impure)
def afficher_moyenne(notes: list[float]) -> None:
    print(f"Moyenne: {moyenne(notes):.2f}")
```

### Exemple 5 — Late binding dans closures (piège & solution)
```
fonctions = []
for i in range(3):
    def f():
        return i  # ⚠️ 'i' sera 2 pour tous, après la boucle
    fonctions.append(f)
print([fn() for fn in fonctions])  # [2, 2, 2]

# ✅ capturer la valeur courante via paramètre par défaut
fonctions = []
for i in range(3):
    def f(i=i):
        return i
    fonctions.append(f)
print([fn() for fn in fonctions])  # [0, 1, 2]
```

### Exemple 6 — Valeurs par défaut **mutables** (piège & solution)
```
# ⚠️ Mauvais : la liste est partagée entre les appels
def ajoute(item, L=[]):
    L.append(item)
    return L

print(ajoute(1))  # [1]
print(ajoute(2))  # [1, 2] (surprise)

# ✅ Bon : valeur par défaut immuable + nouvelle liste
_defaut = object()

def ajoute_bon(item, L=_defaut):
    if L is _defaut:
        L = []
    L.append(item)
    return L

print(ajoute_bon(1))  # [1]
print(ajoute_bon(2))  # [2]
```

### Exemple 7 — Recursion (base & garde)
```
# Factorielle simple (attention aux grandes n)
def fact(n: int) -> int:
    if n < 0:
        raise ValueError("n doit être >= 0")
    if n in (0, 1):
        return 1
    return n * fact(n - 1)
```

> [!WARNING]
> Python **n’optimise pas** la récursion terminale; préférez des **boucles** pour grandes profondeurs.

---

## 🔧 Pratique guidée — écrire des fonctions solides

### 1) Contrats clairs
```
def clamp(x: float, low: float, high: float) -> float:
    """Ramène x dans l'intervalle [low, high]."""
    if low > high:
        raise ValueError("low doit être <= high")
    return max(low, min(x, high))
```

### 2) Gérer les erreurs proprement
```
def safe_div(a: float, b: float, *, default: float | None = None) -> float | None:
    """Divise a par b. Si b=0, renvoie 'default' ou lève une erreur si default=None."""
    if b == 0:
        if default is None:
            raise ZeroDivisionError("b ne doit pas être 0")
        return default
    return a / b
```

### 3) Docstring + types + tests simples
```
def somme_positifs(xs: list[int]) -> int:
    """Somme les entiers positifs.
    >>> somme_positifs([1, -2, 3])
    4
    """
    return sum(x for x in xs if x > 0)
```

### 4) Petites bibliothèques de fonctions pures
```
# transformations simples

def normalise_nom(s: str) -> str:
    return " ".join(s.split()).title()


def pourcentage(part: float, total: float) -> float:
    if total == 0:
        return 0.0
    return 100.0 * part / total
```

---

## ⚠️ Pièges courants (et solutions)

### Ombrage de noms (shadowing)
```
min = 10  # ⚠️ masque la builtin 'min'
# ✅ éviter de nommer comme les builtins (min, max, list, dict, set, sum, ...)
```

### Dépendances globales
```
# ⚠️ difficile à tester
CONFIG = {"seuil": 10}

def filtrer(xs: list[int]) -> list[int]:
    return [x for x in xs if x > CONFIG["seuil"]]

# ✅ passer la config en paramètre

def filtrer_bon(xs: list[int], seuil: int) -> list[int]:
    return [x for x in xs if x > seuil]
```

### Ambiguïtés d’API
```
# ⚠️ paramètres trop permissifs

def span(a, b, step=1):
    ...
# ✅ signature explicite, keyword-only pour éviter erreurs

def span(a: int, b: int, *, step: int = 1) -> list[int]:
    return list(range(a, b, step))
```

---

## 💡 Astuces de pro
- **Fonctions courtes** avec **une responsabilité** claire.  
- **Nommez** vos paramètres **explicitement** (ex. `seuil`, `precision`).  
- Préférez les paramètres **keyword‑only** pour les options (lisibilité).  
- **Docstrings** et **types** dès que la fonction a des cas subtils.  
- **Séparez** logique **pure** et **I/O**; testez la logique indépendamment.  
- Pour des **valeurs par défaut mutables**, fabriquez **une nouvelle instance** à chaque appel.

---

## 🧪🧮 Mini‑formules (en Python)

### Composition de fonctions
```
def compose(f, g):
    return lambda x: f(g(x))

# ex : trim puis upper
trim_upper = compose(str.upper, str.strip)
```

### Moyenne pondérée
```
# moyenne = sum(x_i * w_i) / sum(w_i)

def moyenne_ponderee(xs: list[float], ws: list[float]) -> float:
    return sum(x * w for x, w in zip(xs, ws)) / sum(ws)
```

### Application sûre
```

def try_apply(f, x, default=None):
    try:
        return f(x)
    except Exception:
        return default
```

---

## 🧩 Exercices (avec indications)

1. **Formateur de facture** : écrire `total_facture(lignes, *, tva=0.2, remise=0.0)` qui calcule le total et renvoie un dict avec `ht`, `tva`, `remise`, `ttc`.  
   *Indications :* paramètres keyword‑only, `round`, séparation calcul/affichage.

2. **Compteurs avec closures** : créer `make_counter(start=0)` qui renvoie `inc()` et `dec()` (deux fonctions) partageant le même état interne.  
   *Indications :* `nonlocal`, capturer les noms.

3. **API stable** : écrire une fonction `ratio(a, b, /)` puis une variante avec options keyword‑only (`arrondi`, `precision`).  
   *Indications :* `/` et `*` dans la signature, `round`.

4. **Sans globals** : refactorer une fonction qui lit `CONFIG` globale pour prendre la config en paramètre.  
   *Indications :* injection de dépendance.

5. **Docstring + doctest** : ajouter un doctest à une fonction de votre choix et le valider (dans l’IDE/terminal).

---

## 🧭 Récap — À retenir absolument
- Les **fonctions** rendent le code **modulaire** et **testable**.  
- Maîtrisez la **signature** : positionnels, nommés, **par défaut**, **positional‑only** (`/`), **keyword‑only** (`*`), `*args`/`**kwargs`.  
- Comprenez la **portée LEGB**; limitez `global`, utilisez `nonlocal` avec **parcimonie**.  
- Évitez les **valeurs par défaut mutables** et le **late binding** des closures.  
- Ajoutez **docstrings** et **annotations** pour clarifier et outiller votre code.

---

## ✅ Checklist de compétence
- [ ] Je sais écrire des fonctions **claires** avec `def` et `return`.  
- [ ] J’utilise **keyword‑only** pour options, et je connais `/` pour **positional‑only**.  
- [ ] Je comprends `*args` et `**kwargs`.  
- [ ] Je connais la **portée** (LEGB), `global`, `nonlocal`.  
- [ ] Je sais écrire des **docstrings** et ajouter des **types**.

---

## 🧪 Mini‑quiz

1) Une fonction sans `return` explicite renvoie :  
   a) `True`  
   b) `0`  
   c) `None`

2) Les paramètres **keyword‑only** sont déclarés :  
   a) avant `/`  
   b) après `*`  
   c) uniquement avec `**kwargs`

3) Le mot‑clé pour écrire dans une variable de la fonction englobante est :  
   a) `global`  
   b) `nonlocal`  
   c) `extern`

*Réponses attendues :* 1) c  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Modules, paquets & organisation du code** — nous verrons `import`, `from … import …`, arborescences, paquets et `__name__ == "__main__"`.
