 
# 📚 Chapitre 6 — **Modules, paquets & organisation du code**

> [!NOTE]
> Dans ce chapitre, on structure le code **proprement** : comprendre les **modules** (`.py`), les **paquets** (dossiers + `__init__.py`), les formes d’`import`, l’idiome `if __name__ == "__main__"`, les **imports relatifs** vs **absolus**, `sys.path`/`PYTHONPATH`, les **alias**, `__all__`, et les **pièges** (imports circulaires, ombrage de noms, chemins). Nous avancerons **lentement**, avec schémas ASCII, exemples complets et bonnes pratiques.

---

## 🎯 Objectifs pédagogiques
- Comprendre ce qu’est un **module** et un **paquet** en Python.  
- Savoir **importer** proprement : `import`, `from … import …`, alias (`as`).  
- Maîtriser `if __name__ == "__main__"` pour rendre un module **exécutable** et **réutilisable**.  
- Organiser un **mini‑projet** avec paquets, imports **absolus** et **relatifs**.  
- Éviter les **pièges** : imports circulaires, `from module import *`, collisions de noms, illusions de chemin.

---

## 🧠 Concepts clés

### 🧠 Module — fichier `.py`
- **Définition** : un **module** est un **fichier Python** (`.py`) qui contient du code (fonctions, classes, constantes).  
- **Pourquoi** : séparer le code en **unités réutilisables**; réduire la taille des fichiers; clarifier les responsabilités.

**Exemple minimal**
```
# fichier: maths_util.py
PI = 3.14159

def aire_disque(r: float) -> float:
    return PI * r * r
```

### 🧠 Paquet — dossier + `__init__.py`
- **Définition** : un **dossier** qui **regroupe** des modules et possède un fichier `__init__.py` (même vide) → **paquet classique**.  
- **Namespace package** (avancé) : possible sans `__init__.py` avec arborescences **découplées**; pour débuter, gardez `__init__.py`.

**Arborescence ASCII**
```
projet/
  app.py               # point d'entrée
  utils/               # paquet
    __init__.py        # peut exposer des API du paquet
    maths_util.py
    texte_util.py
```

### 🧠 `import` et `from … import …`
- `import paquet.module` : importe le **module** et crée un **nom d’accès**.
- `from paquet import module` : importe le **module** dans le **namespace courant**.
- `from paquet.module import nom` : importe **un symbole** du module.
- `as` pour **alias** : `import numpy as np`.

> [!WARNING]
> Évitez `from module import *` : cela **pollue** le namespace et peut **masquer** des noms.

### 🧠 Imports **absolus** vs **relatifs**
- **Absolu** (recommandé) : `from utils.maths_util import aire_disque` — **clair** et robuste.
- **Relatif** (dans paquets) : `from .maths_util import aire_disque` (un point = **même paquet**), `from ..core import x` (deux points = **paquet parent**).

**Schéma**
```
utils/
  __init__.py
  maths_util.py
  texte_util.py
# dans texte_util.py : from .maths_util import aire_disque
```

### 🧠 `__name__ == "__main__"`
- Quand un module est **exécuté directement** (`python app.py`), `__name__` vaut `"__main__"`.  
- Quand un module est **importé**, `__name__` vaut **son chemin** (`paquet.module`).

**Idiomatique**
```
# app.py

def main():
    print("Hello")

if __name__ == "__main__":
    main()  # bloc exécuté seulement en lancement direct
```

> [!TIP]
> Cela permet d’avoir un fichier **à la fois importable et exécutable**.

### 🧠 `sys.path` et `PYTHONPATH` (résolution des modules)
- Python recherche les modules dans : le **répertoire courant**, le paquet **installé**, puis les chemins listés dans `sys.path`.  
- On peut **étendre** la recherche via la **variable d’environnement** `PYTHONPATH` (à utiliser **avec prudence**).  
- Évitez d’insérer des chemins dynamiquement; préférez une **structure de projet** propre et **imports absolus**.

### 🧠 `__init__.py`, `__all__` (API d’un paquet)
- `__init__.py` peut **regrouper** des importations pour **exposer** une API :
```
# utils/__init__.py
from .maths_util import aire_disque, PI
from .texte_util import normalise
__all__ = ["aire_disque", "PI", "normalise"]
```
- `__all__` contrôle **ce qui est importé** par `from utils import *` (déconseillé, mais utile à connaître).

---

## ❓ Pourquoi organiser en modules/paquets ?
- **Lisibilité** : code découpé par **responsabilités**.  
- **Réutilisation** : fonctions/classes disponibles via `import`.  
- **Testabilité** : facilite les **tests unitaires** (chap. 11).  
- **Évolutivité** : structure prête pour **croître** sans s’effondrer.

---

## 🧪 Mini‑projet — paquet utilitaire

### Arborescence cible
```
projet/
  app.py
  utils/
    __init__.py
    maths_util.py
    texte_util.py
```

### Contenu des modules
```
# utils/maths_util.py
PI = 3.14159

def aire_disque(r: float) -> float:
    return PI * r * r

# utils/texte_util.py

def normalise(s: str) -> str:
    return " ".join(s.split()).title()

# utils/__init__.py
from .maths_util import aire_disque, PI
from .texte_util import normalise
__all__ = ["aire_disque", "PI", "normalise"]

# app.py
from utils import aire_disque, normalise

def main():
    print(normalise("  ada   lovelace "))
    print(aire_disque(2))

if __name__ == "__main__":
    main()
```

> [!TIP]
> Lancez `python app.py` depuis le dossier **projet/**. Les imports **absolus** fonctionnent car `projet` est le **répertoire courant**.

---

## 🔧 Pratique guidée

### Imports relatifs dans un paquet
```
# dans utils/texte_util.py
from .maths_util import PI
```

### Alias pour lisibilité
```
import utils.maths_util as mu
print(mu.PI)
```

### Import paresseux (dans une fonction)
```
# Parfois utile pour éviter un import circulaire ou coûteux

def calcule():
    import math
    return math.sqrt(16)
```

> [!NOTE]
> L’import **paresseux** peut réduire le **temps de démarrage** ou **éviter** des dépendances au **chargement**; à utiliser **avec parcimonie**.

---

## ⚠️ Pièges courants (et solutions)

### 1) Imports **circulaires**
```
# a.py
from b import f

def g():
    return f()

# b.py
from a import g

def f():
    return g()
```

> [!WARNING]
> Dépendances **mutuelles** peuvent causer des **ImportError** ou des **noms non initialisés**. **Solution** : extraire les éléments communs dans un **module tiers** (ex. `common.py`) ou **retarder** un import dans une fonction.

### 2) `from module import *`
> [!WARNING]
> **Évitez** : masque les noms, brise l’autocomplétion, rend la lecture **ambiguë**. Préférez des imports explicites.

### 3) Ombrage des noms standards
```
# ⚠️ Ne nommez pas vos modules comme des builtins ou librairies : 'json.py', 'math.py'
# Cela masque le vrai module et cause des erreurs d'import
```

### 4) Illusion de chemin (fichiers de données)
```
# Toujours utiliser 'pathlib' et '__file__' pour localiser des ressources
from pathlib import Path
BASE = Path(__file__).resolve().parent
DATA = BASE / "data" / "config.json"
```

### 5) Import depuis le mauvais répertoire
> [!TIP]
> **Exécutez** vos scripts depuis la **racine du projet** pour que les imports **absolus** (ex. `from utils import ...`) fonctionnent.

---

## 🧮 Organisation de projet (modèle simple)

```
projet/
  app.py
  utils/
    __init__.py
    maths_util.py
    texte_util.py
  tests/
    test_maths_util.py
  requirements.txt
```

- `requirements.txt` : liste des **dépendances** (chap. 0/Annexes) à installer via `pip install -r requirements.txt`.  
- `tests/` : futur chapitre **tests**.

---

## 💡 Astuces de pro
- **Imports absolus** pour clarté et stabilité.  
- **Noms explicites** de modules (`maths_util`, `texte_util`).  
- Séparer **cœur métier** (paquets) et **point d’entrée** (`app.py`).  
- Utiliser `pathlib` + `__file__` pour localiser des **ressources**.  
- Documenter l’API du paquet dans `__init__.py` et éventuellement `__all__`.

---

## 🧪🧮 Mini‑formules (en Python)

### Réexporter une API de paquet
```
# utils/__init__.py
from .maths_util import *
from .texte_util import *
__all__ = ["aire_disque", "PI", "normalise"]
```

### Détection de lancement direct
```
if __name__ == "__main__":
    print("Module lancé directement")
```

### Ajout ponctuel au chemin (à éviter en prod)
```
import sys
sys.path.append("/chemin/vers/autre")
```

---

## 🧩 Exercices (avec indications)

1. **Mini‑paquet utils** : créez `utils/` avec `__init__.py`, `maths_util.py`, `texte_util.py` et un `app.py` qui les utilise via **imports absolus**.  
   *Indications :* structure, `__main__`.

2. **Relatif vs absolu** : dans `texte_util.py`, importez `PI` de `maths_util.py` via import **relatif**, puis testez un import **absolu**.

3. **Éviter circulaires** : simulez une dépendance circulaire et refactorez vers `common.py`.

4. **Ressource locale** : ajoutez un dossier `data/` et chargez un fichier via `pathlib` basé sur `__file__`.

5. **API propre** : utilisez `__init__.py` pour exposer seulement `aire_disque` et `normalise` via `__all__`.

---

## 🧭 Récap — À retenir absolument
- Un **module** est un **fichier `.py`**; un **paquet** est un **dossier** avec `__init__.py`.  
- Préférez les **imports absolus**; les **relatifs** s’emploient **à l’intérieur** des paquets.  
- L’idiome `if __name__ == "__main__"` rend un module exécutable **sans gêner** son import.  
- Évitez `from module import *`, les **imports circulaires** et l’**ombrage** des noms standards.  
- Utilisez `pathlib` + `__file__` pour les **ressources**.

---

## ✅ Checklist de compétence
- [ ] Je sais créer un **module** et un **paquet**.  
- [ ] Je maîtrise `import`, `from … import …`, et les **alias**.  
- [ ] Je comprends `__name__ == "__main__"`.  
- [ ] Je sais organiser un projet minimal avec imports **absolus**.  
- [ ] Je sais éviter/importer proprement pour contourner les **circulaires**.

---

## 🧪 Mini‑quiz

1) Un **paquet classique** requiert :  
   a) un `README`  
   b) un `__init__.py`  
   c) un `setup.py`

2) `from package.module import nom` importe :  
   a) tout le module dans le namespace courant  
   b) seulement `nom`  
   c) ne change rien

3) `if __name__ == "__main__"` est vrai :  
   a) uniquement si le fichier est **importé**  
   b) uniquement si le fichier est **exécuté directement**  
   c) jamais

*Réponses attendues :* 1) b  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Exceptions & gestion d’erreurs** — `try/except/else/finally`, `raise`, stratégies **EAFP vs LBYL**.
