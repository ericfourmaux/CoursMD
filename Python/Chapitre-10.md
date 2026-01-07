 
# 📚 Chapitre 10 — **Programmation orientée objet (POO)**

> [!NOTE]
> Ce chapitre introduit la **POO** en Python de manière progressive et rigoureuse : **classes**, **objets**, **attributs**, **méthodes**, `__init__`, `self`, **encapsulation**, **composition vs héritage**, **dunder methods** (méthodes spéciales), **`@dataclass`**, **propriétés** (`@property`), et **bonnes pratiques**. Nous avancerons **lentement**, avec définitions, pourquoi, analogies, schémas, exemples concrets, pièges, exercices, récap et quiz.

---

## 🎯 Objectifs pédagogiques
- Comprendre **classes** et **instances**, la convention **`self`** et le rôle de `__init__`.  
- Maîtriser les **attributs d'instance** vs **attributs de classe**.  
- Écrire des **méthodes** : d'instance, **`@classmethod`**, **`@staticmethod`**.  
- Utiliser **encapsulation** et **propriétés** (`@property`) pour des invariants simples.  
- Choisir **composition** vs **héritage** avec discernement.  
- Mettre en oeuvre des **dunder methods** (`__repr__`, `__str__`, `__eq__`, `__lt__`, `__len__`, `__iter__`, `__contains__`, `__enter__/__exit__`).  
- Exploiter **`@dataclass`** pour des objets de données : `field`, `default_factory`, `frozen`, `order`.  
- Éviter les **pièges** : attributs partagés involontaires, héritage excessif, valeurs par défaut mutables.

---

## 🧠 Concepts clés

### 🧠 Classe & objet
- **Classe** : **plan** (blueprint) décrivant **structure** (attributs) et **comportement** (méthodes).  
- **Objet** (instance) : **réalisation** concrète de la classe.

> [!TIP]
> **Analogie** : la **classe** est comme un **plan d'architecte**; l'**objet** est la **maison** construite à partir de ce plan.

### 🧠 `self` et `__init__`
- `self` : **référence** à l'instance courante (passée implicitement aux méthodes d'instance).  
- `__init__(self, ...)` : **constructeur** qui **initialise** l'objet après sa création.

```
class Compte:
    def __init__(self, titulaire: str, solde: float = 0.0):
        self.titulaire = titulaire
        self.solde = float(solde)

    def deposer(self, montant: float) -> None:
        self.solde += montant

    def retirer(self, montant: float) -> None:
        if montant > self.solde:
            raise ValueError("solde insuffisant")
        self.solde -= montant
```

### 🧠 Attributs d'instance vs de classe
- **Instance** : attachés à **chaque objet** (`self.attr`).  
- **Classe** : attachés à la **classe** (`Classe.attr`), **partagés** par les instances.

```
class Compte:
    taux_interet = 0.01  # attribut de classe, partagé
    def __init__(self, titulaire: str):
        self.titulaire = titulaire   # attribut d'instance
```

> [!WARNING]
> Un **objet mutables** en attribut de classe est **partagé**; préférez des **immutables** ou initialisez dans `__init__`.

### 🧠 Méthodes d'instance, de classe et statiques
- **Instance** (par défaut) : prennent `self`.  
- **`@classmethod`** : prennent `cls` (la **classe**).  
- **`@staticmethod`** : ni `self` ni `cls`; **fonction utilitaire** liée à la classe.

```
class Temperature:
    def __init__(self, celsius: float):
        self.celsius = float(celsius)

    @classmethod
    def from_fahrenheit(cls, f: float):
        return cls((f - 32) * 5/9)

    @staticmethod
    def clamp(x: float, low: float, high: float) -> float:
        return max(low, min(x, high))
```

### 🧠 Encapsulation & propriétés (`@property`)
- **Encapsulation** : protéger des **invariants** (ex. solde non négatif).  
- **Propriété** : exposer un **accès lisible** (`obj.attr`) tout en **contrôlant** lecture/écriture.

```
class Compte:
    def __init__(self, titulaire: str, solde: float = 0.0):
        self.titulaire = titulaire
        self._solde = float(solde)

    @property
    def solde(self) -> float:
        return self._solde

    @solde.setter
    def solde(self, value: float) -> None:
        if value < 0:
            raise ValueError("solde doit être >= 0")
        self._solde = value
```

### 🧠 Composition vs héritage
- **Composition** : un objet **contient** d'autres objets (relation **a‑un**).  
- **Héritage** : une classe **spécialise** une autre (relation **est‑un**).

> [!TIP]
> Préférez la **composition** par défaut. Utilisez l'**héritage** pour des **extensions naturelles** et **stables** (ex. polymorphisme d'une famille de formes).

### 🧠 Dunder methods (méthodes spéciales)
Permettent d'intégrer vos objets aux **opérateurs** et **protocoles** Python.

```
class Vecteur:
    def __init__(self, x: float, y: float):
        self.x, self.y = x, y

    def __repr__(self) -> str:
        return f"Vecteur(x={self.x}, y={self.y})"

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"

    def __eq__(self, other) -> bool:
        return isinstance(other, Vecteur) and (self.x, self.y) == (other.x, other.y)

    def __add__(self, other):
        if not isinstance(other, Vecteur):
            return NotImplemented
        return Vecteur(self.x + other.x, self.y + other.y)

    def __len__(self) -> int:
        return 2

    def __iter__(self):
        yield self.x
        yield self.y

    def __contains__(self, value):
        return value in (self.x, self.y)
```

> [!NOTE]
> Retournez **`NotImplemented`** lorsqu'une opération avec un autre type n'a pas de sens; Python tentera la **méthode miroir** ou lèvera une erreur.

### 🧠 Contexte (`__enter__`/`__exit__`) — gestion de ressource
```
class Ressource:
    def __enter__(self):
        print("ouvrir")
        return self
    def __exit__(self, exc_type, exc, tb):
        print("fermer")
        return False  # ne masque pas l'exception

with Ressource() as r:
    print("utiliser")
```

### 🧠 `@dataclass` — objets de données
Simplifie les classes centrées sur **données** : génère `__init__`, `__repr__`, `__eq__`, etc.

```
from dataclasses import dataclass, field

@dataclass(order=True, frozen=False)
class Point:
    x: float
    y: float
    tags: list[str] = field(default_factory=list)

    def norme(self) -> float:
        import math
        return math.sqrt(self.x**2 + self.y**2)
```

> [!WARNING]
> **Piège** : n'utilisez pas de **valeurs par défaut mutables** directement (ex. `tags=[]`). Préférez `field(default_factory=list)`.

---

## ❓ Pourquoi ces notions ?
- La POO aide à **modéliser** des entités réelles (compte, vecteur, commande) avec **responsabilités claires**.  
- Elle favorise **réutilisation** (polymorphisme), **testabilité** et **maintenabilité**.  
- Les dunder methods rendent vos objets **compatibles** avec l'**écosystème** Python (affichage, comparaison, itération, contextes).

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — Compte bancaire (encapsulation + propriété)
```
class Compte:
    def __init__(self, titulaire: str, solde: float = 0.0):
        self.titulaire = titulaire
        self._solde = float(solde)

    @property
    def solde(self) -> float:
        return self._solde

    def deposer(self, montant: float) -> None:
        if montant < 0:
            raise ValueError("montant doit être >= 0")
        self._solde += montant

    def retirer(self, montant: float) -> None:
        if not (0 <= montant <= self._solde):
            raise ValueError("montant invalide")
        self._solde -= montant
```

### Exemple 2 — Composition : Commande et Lignes
```
class Ligne:
    def __init__(self, nom: str, prix: float, qty: int = 1):
        self.nom, self.prix, self.qty = nom, float(prix), int(qty)

    def total(self) -> float:
        return self.prix * self.qty

class Commande:
    def __init__(self):
        self.lignes: list[Ligne] = []

    def ajouter(self, ligne: Ligne) -> None:
        self.lignes.append(ligne)

    def total(self) -> float:
        return sum(l.total() for l in self.lignes)
```

### Exemple 3 — Héritage : Formes géométriques
```
class Forme:
    def aire(self) -> float:
        raise NotImplementedError

class Rectangle(Forme):
    def __init__(self, w: float, h: float):
        self.w, self.h = w, h
    def aire(self) -> float:
        return self.w * self.h

class Cercle(Forme):
    def __init__(self, r: float):
        self.r = r
    def aire(self) -> float:
        import math
        return math.pi * self.r**2
```

### Exemple 4 — Dunder + itération : Vecteur
```
class Vecteur:
    def __init__(self, x: float, y: float):
        self.x, self.y = x, y
    def __repr__(self) -> str:
        return f"Vecteur(x={self.x}, y={self.y})"
    def __iter__(self):
        yield self.x
        yield self.y
```

### Exemple 5 — `@dataclass` pour objet de données
```
from dataclasses import dataclass, field

@dataclass
class Client:
    nom: str
    email: str
    tags: list[str] = field(default_factory=list)
```

---

## 🔧 Pratique guidée

### 1) Propriété et invariant
```
class Thermostat:
    def __init__(self, celsius: float = 20.0):
        self._c = float(celsius)
    @property
    def celsius(self) -> float:
        return self._c
    @celsius.setter
    def celsius(self, value: float) -> None:
        if not (-50.0 <= value <= 70.0):
            raise ValueError("hors plage")
        self._c = value
```

### 2) Factory `@classmethod`
```
class Url:
    def __init__(self, scheme: str, host: str, path: str = "/"):
        self.scheme, self.host, self.path = scheme, host, path
    @classmethod
    def from_string(cls, s: str):
        scheme, rest = s.split("://", 1)
        host, *paths = rest.split("/", 1)
        path = "/" + paths[0] if paths else "/"
        return cls(scheme, host, path)
```

### 3) Contexte personnalisé
```
class FileAppender:
    def __init__(self, path: str):
        self.path = path
    def __enter__(self):
        self.f = open(self.path, "a", encoding="utf-8")
        return self
    def __exit__(self, exc_t, exc, tb):
        self.f.close()
        return False
    def append(self, line: str) -> None:
        self.f.write(line + "\n")
```

---

## ⚠️ Pièges courants (et solutions)

### 1) Attributs de classe mutables partagés
```
class Mauvais:
    cache = {}  # partagé !
```
> [!WARNING]
> Initialisez les conteneurs **dans `__init__`** pour chaque instance.

### 2) Surcharge sans respecter le contrat
```
class Base:
    def aire(self) -> float:
        raise NotImplementedError
class Bad(Base):
    def aire(self) -> int:  # type/contrat incohérent
        return 0
```
> [!TIP]
> Respectez la **signature** et le **sens** (polymorphisme). Utilisez des **tests**.

### 3) Héritage excessif
```
# ⚠️ plusieurs niveaux d'héritage inutile compliquent la MRO
# ✅ préférez composition, ou une hiérarchie **plate** et claire
```

### 4) Valeurs par défaut mutables (dataclass)
```
from dataclasses import dataclass, field
@dataclass
class Bad:
    items: list[int] = []  # ⚠️ partagé
@dataclass
class Good:
    items: list[int] = field(default_factory=list)  # ✅
```

### 5) `__eq__` sans `__hash__`
```
# ⚠️ objets mutables hashables peuvent casser des sets/dicts
# ✅ si vous définissez __eq__, réfléchissez à l'identité et au hash
```

---

## 💡 Astuces de pro
- **Responsabilités uniques** : une classe doit avoir un **rôle clair**.  
- **Composition d'abord**, **héritage** si naturel et stable.  
- **`@property`** pour invariants légers; sinon exposez une **méthode** explicite.  
- **`@dataclass`** pour les **DTO** (objets de données).  
- Implémentez seulement les **dunder nécessaires**; gardez les objets **simples**.

---

## 🧪🧮 Mini‑formules (en Python)

### Aire de formes (polymorphisme)
```
shapes = [Rectangle(2, 3), Cercle(1.5)]
total = sum(s.aire() for s in shapes)
```

### Norme de vecteur
```
import math
v = Vecteur(3, 4)
n = math.sqrt(sum(c*c for c in v))  # 5.0
```

### Filtrage d'objets
```
clients = [Client("Ada", "ada@x"), Client("Alan", "alan@y")]
emails = [c.email for c in clients]
```

---

## 🧩 Exercices (avec indications)

1. **Banque** : étendre `Compte` avec **découvert autorisé** et **propriété** `solde_net` (solde - découvert utilisé).  
   *Indications :* invariants, setters.

2. **Panier** : implémentez `Commande` avec **remise** et **TVA** configurables.  
   *Indications :* composition `Ligne`, total détaillé.

3. **Formes** : ajoutez `Triangle` avec aire `base*hauteur/2` et démontrez le **polymorphisme**.  
   *Indications :* même interface `aire()`.

4. **Vecteur** : complétez `Vecteur` avec `__add__`, `__mul__` (scalaire) et tests d'égalité.  
   *Indications :* `NotImplemented`, `__repr__`.

5. **Dataclass** : créez une dataclass `Produit` avec `default_factory` pour `tags` et une méthode `prix_ttc(tva)`.  
   *Indications :* `field`, `round`.

---

## 🧭 Récap — À retenir absolument
- **Classe** = plan; **objet** = instance. `self` référence l'instance; `__init__` initialise.  
- Attributs **d'instance** vs **de classe** : ne partagez pas de mutables en classe.  
- Méthodes : d'instance, **`@classmethod`**, **`@staticmethod`**.  
- **Encapsulation** avec `@property` pour invariants légers.  
- **Composition** > **héritage** (par défaut).  
- **Dunder methods** intègrent vos objets aux protocoles Python.  
- **`@dataclass`** simplifie les objets de données; attention aux **mutables**.

---

## ✅ Checklist de compétence
- [ ] Je sais définir une **classe** avec `__init__` et des **méthodes**.  
- [ ] Je distingue **attributs d'instance** et **de classe**.  
- [ ] J'utilise `@property` pour des **invariants** simples.  
- [ ] Je choisis **composition** ou **héritage** selon le besoin.  
- [ ] Je maîtrise l'essentiel des **dunder** et **`@dataclass`**.

---

## 🧪 Mini‑quiz

1) `@classmethod` reçoit :  
   a) `self`  
   b) `cls`  
   c) rien

2) Un attribut de classe **mutable** est :  
   a) propre à chaque instance  
   b) **partagé** par les instances  
   c) interdit

3) Pour un objet de **données** avec listes par défaut, on écrira :  
   a) `tags = []`  
   b) `tags = field(default_factory=list)`  
   c) `tags: list[str]`

*Réponses attendues :* 1) b  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Qualité — tests, debug, style & types** : `assert`, `unittest`, `doctest`, PEP 8, annotations (`typing`), debug pas à pas.
