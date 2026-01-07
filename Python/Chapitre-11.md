 
# 📚 Chapitre 11 — **Qualité : tests, debug, style & types**

> [!NOTE]
> Dans ce chapitre, nous posons les **fondations de la qualité logicielle** en Python : **tests** (assert, unittest, doctest; aperçu de pytest), **types** (annotations, `typing`), **style** (PEP 8, docstrings), et **debug** (pdb / IDE). Nous avançons **lentement**, avec définitions, pourquoi, analogies, schémas ASCII, exemples concrets, pièges, exercices, récap et quiz.

---

## 🎯 Objectifs pédagogiques
- Mettre en place des **tests** de base : `assert`, **`unittest`** et **`doctest`**; comprendre l'intérêt de `pytest` (concepts).  
- Écrire des **annotations de types** utiles et connaître `typing` moderne (builtins génériques, `Optional`, `Union`, `Callable`).  
- Respecter la **PEP 8** (nommage, imports, indentation, longueur de ligne) et documenter via **docstrings**.  
- Déboguer pas à pas avec **pdb** (et notions IDE).  
- Éviter les **pièges** : asserts utilisés pour la validation, tests fragiles, mocks excessifs, aléatoire non fixé, types mal inférés.

---

## 🧠 Concepts clés

### 🧠 Tests : pourquoi et comment
- **Pourquoi** : garantir que le code **fonctionne** et **reste correct** lors des changements.  
- **Pyramide** : beaucoup de **tests unitaires** (rapides), quelques **tests d'intégration** et très peu de **tests end‑to‑end**.

**Schéma ASCII**
```
E2E (peu)
Intégration (modéré)
Unitaires (nombreux)
```

### 🧠 `assert` vs `unittest` vs `doctest`
- **`assert`** : vérification **rapide** pendant le dev; **désactivé** avec `python -O`.  
- **`unittest`** : framework **standard** pour suites de tests, `TestCase`, `setUp`, `tearDown`.  
- **`doctest`** : exécute les **exemples** contenus dans les **docstrings** pour s'assurer de leur exactitude.

### 🧠 `pytest` (aperçu)
- Framework de tests **ergonomique** (collecte auto, fixtures, `assert` réécrit). Nous restons sur la **stdlib** ici; **à connaître** conceptuellement.

### 🧠 Types & `typing`
- Les **annotations** n'affectent **pas l'exécution**, elles servent aux **outils** (IDE, **mypy/pyright**).  
- Syntaxe moderne (Py ≥ 3.9) : `list[int]`, `dict[str, float]`, `Optional[int]` ou `int | None`, `Union[str, int]` ou `str | int`, `Callable[[int, int], int]`.

### 🧠 Style & PEP 8
- **Indentation** : 4 espaces; **ligne** ~ 79 (souvent 88 avec formateurs).  
- **Noms** : `snake_case` pour fonctions/variables, `CapWords` pour classes, `ALL_CAPS` pour constantes.  
- **Imports** : une ligne par module, ordre standard lib → tiers → local; pas d'import dans `*`.  
- **Docstrings** : triple guillemets `"""..."""`, premier résumé bref, détails ensuite.

### 🧠 Debug (pdb / IDE)
- **pdb** : `import pdb; pdb.set_trace()` pour **pauser**; commandes clé : `n` (next), `s` (step), `c` (continue), `l` (list), `p var` (print).  
- IDE (ex. VS Code) : **breakpoints**, inspection des variables, pas à pas.

**Schéma ASCII — cycle debug**
```
breakpoint → exécuter → pause → inspecter → corriger → rejouer
```

---

## ❓ Pourquoi ces notions ?
- Les tests **sécurisent** le développement et permettent de **refactorer** sereinement.  
- Les types **clarifient** l'intention et aident les outils à **détecter** des erreurs avant l'exécution.  
- Le style (PEP 8) **uniformise** et **rend lisible**; les docstrings pendent d'**auto‑documentation**.  
- Le debug **accélère** le diagnostic et évite le **guessing**.

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — `assert` et prudence
```
# bon pour dev rapide
x = 10
assert x > 0, "x doit être positif"
# ⚠️ ne pas l'utiliser pour la validation utilisateur :
# 'python -O' supprime les asserts.
```

### Exemple 2 — `unittest` minimal
```
# fichier: test_mathx.py
import unittest

def add(a: int, b: int) -> int:
    return a + b

class TestMathx(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertIsInstance(add(2, 3), int)

    def test_add_neg(self):
        self.assertEqual(add(-1, 1), 0)

if __name__ == "__main__":
    unittest.main()
```

### Exemple 3 — `doctest` dans une docstring
```
# fichier: util.py

def clamp(x: float, low: float, high: float) -> float:
    """Ramène x dans [low, high].
    >>> clamp(10, 0, 5)
    5
    >>> clamp(-1, 0, 5)
    0
    >>> clamp(3, 0, 5)
    3
    """
    return max(low, min(x, high))
```

> [!TIP]
> Lancer : `python -m doctest -v util.py`.

### Exemple 4 — Types modernes : annotations et `typing`
```
from typing import Callable

def apply_twice(f: Callable[[int], int], x: int) -> int:
    return f(f(x))

def incr(y: int) -> int:
    return y + 1

print(apply_twice(incr, 10))  # 12
```

### Exemple 5 — Type narrowing
```
# affiner le type par isinstance
val: int | str = "42"
if isinstance(val, str):
    n = int(val)
else:
    n = val
```

### Exemple 6 — pdb : pause et inspection
```

def somme(xs: list[int]) -> int:
    total = 0
    for i, x in enumerate(xs):
        total += x
        if total < 0:
            import pdb; pdb.set_trace()  # pause
    return total
```

### Exemple 7 — Logging minimal
```
import logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger(__name__)

logger.info("Démarrage")
logger.warning("Attention")
```

---

## 🔧 Pratique guidée

### 1) Sous‑tests et cas multiples
```
import unittest

class TestClamp(unittest.TestCase):
    def test_cases(self):
        for x, low, high, exp in [
            (10, 0, 5, 5),
            (-1, 0, 5, 0),
            (3, 0, 5, 3),
        ]:
            with self.subTest(x=x):
                self.assertEqual(clamp(x, low, high), exp)
```

### 2) Structure de projet de tests
```
projet/
  src/
    util.py
  tests/
    test_util.py
```

### 3) Docstrings & style
```
def aire_disque(r: float) -> float:
    """Calcule l'aire d'un disque.

    Args:
        r: rayon (>= 0)
    Returns:
        Aire: pi * r**2
    """
    import math
    return math.pi * (r ** 2)
```

---

## ⚠️ Pièges courants (et solutions)

### 1) Asserts pour validation utilisateur
```
# ⚠️ 'assert' disparaît avec 'python -O'
# ✅ lever des exceptions explicites (ValueError, TypeError)
```

### 2) Tests fragiles
```
# ⚠️ dépendent de l'ordre, de l'horloge, du réseau
# ✅ isoler, fixer l'aléatoire (seed), utiliser des doubles (fakes)
```

### 3) Sur‑mocking
```
# ⚠️ trop de mocks cassent le réalisme
# ✅ mocker aux frontières (I/O), garder le coeur métier réel
```

### 4) Types mal utilisés
```
# ⚠️ croire que les annotations sont vérifiées à l'exécution
# ✅ utiliser un vérificateur statique (concept) et tests
```

### 5) Chemins/tz
```
# ⚠️ chemins relatifs fragiles; tz naïves
# ✅ 'pathlib' pour chemins; 'datetime.timezone' pour tz (chap. 13)
```

---

## 💡 Astuces de pro
- **TDD léger** : écrire un test simple avant la fonction pour guider l'API.  
- **Nommer** clairement les tests (`test_*`), un **cas** par test.  
- **Logger** plutôt que `print` dans des libs.  
- **Types** sur interfaces publiques; détails internes plus libres.  
- **Docstrings** pour fonctions avec cas subtils et exemples.

---

## 🧪🧮 Mini‑formules (en Python)

### Exécution ciblée d'un fichier de tests
```
python -m unittest tests/test_util.py
```

### Ignorer un test temporairement
```
import unittest

class T(unittest.TestCase):
    @unittest.skip("en cours")
    def test_demo(self):
        self.assertEqual(1, 2)
```

### Graine pseudo‑aléatoire
```
import random
random.seed(0)
```

---

## 🧩 Exercices (avec indications)

1. **Suite de tests** : écrire des tests `unittest` pour une mini lib de calcul (clamp, moyenne, variance).  
   *Indications :* `subTest`, cas limites (listes vides). 

2. **Doctest** : ajouter des doctests à 2 fonctions que vous utilisez souvent; les exécuter.  
   *Indications :* `python -m doctest -v fichier.py`.

3. **Types** : annoter un petit module (types d'arguments et retours); utiliser `Optional`, `Callable`.  
   *Indications :* `int | None`, `Callable[[A], B]`.

4. **Debug** : insérer `pdb.set_trace()` dans une fonction qui boucle et inspecter `locals()`.  
   *Indications :* commandes `n`, `s`, `p`.

5. **Style** : appliquer PEP 8 (noms, indentation, imports) et écrire des **docstrings** Google/Numpy minimalistes.

---

## 🧭 Récap — À retenir absolument
- **Tests** : `assert` (dev), `unittest` (structure), `doctest` (exemples fiables).  
- **Types** : annotations pour outillage; syntaxe moderne (`list[int]`, `int | None`, `Callable`).  
- **Style** : PEP 8, docstrings claires, imports propres.  
- **Debug** : `pdb.set_trace()`, boucles pas à pas; préférer le logger à `print`.

---

## ✅ Checklist de compétence
- [ ] Je sais écrire des tests `unittest` et des `doctests`.  
- [ ] J'utilise des **annotations** compréhensibles (`typing`).  
- [ ] Je respecte la **PEP 8** et j'écris des **docstrings**.  
- [ ] Je sais **déboguer** avec `pdb`.  
- [ ] Je sais éviter des tests **fragiles** et des asserts mal placés.

---

## 🧪 Mini‑quiz

1) Les `assert` sont exécutés :  
   a) toujours  
   b) pas avec `python -O`  
   c) seulement dans `unittest`

2) Les annotations de types :  
   a) changent l'exécution  
   b) servent aux outils  
   c) sont ignorées par tout

3) Pour documenter et tester un exemple dans une docstring, on utilise :  
   a) `doctest`  
   b) `unittest`  
   c) `logging`

*Réponses attendues :* 1) b  2) b  3) a

---

> [!NOTE]
> Prochain chapitre : **Mini‑projet #1 — Gestionnaire de tâches (CLI)** : construire un outil CLI avec persistance JSON et petite suite de tests.
