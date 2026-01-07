 
# 📚 Chapitre 12 — **Mini‑projet #1 : Gestionnaire de tâches (CLI)**

> [!NOTE]
> Dans ce mini‑projet, nous allons concevoir pas à pas un **gestionnaire de tâches en ligne de commande (CLI)**. Objectifs : architecture simple, séparation **I/O** / **métier**, persistance **JSON**, gestion d’erreurs élégante, et une petite **suite de tests**. Nous avancerons **lentement**, avec schémas ASCII, définitions, pourquoi, exemples, pièges, exercices, récap et quiz.

---

## 🎯 Objectifs pédagogiques
- Concevoir une **architecture** claire (modules, fonctions pures vs I/O).  
- Implémenter un **CRUD** minimal : **ajouter**, **lister**, **supprimer**, **marquer terminé**.  
- Persister les données en **JSON** de manière **robuste**.  
- Proposer une **interface CLI** simple (menu ou `argparse`).  
- Ajouter une **suite de tests** unitaires ciblée.  
- Éviter les **pièges** (collisions d’IDs, corruption de fichier, chemins relatifs, horodatage).

---

## 🧠 Concepts clés

### 🧠 Séparation des responsabilités
- **Module métier** : opérations sur tâches (ajout, suppression, mise à jour) **sans I/O**.  
- **Module I/O** : lecture/écriture **JSON**, CLI (`argparse` ou menu).

**Schéma ASCII — architecture**
```
projet/
  app.py          # CLI / point d'entrée
  todo_core.py    # logique métier (pure)
  storage.py      # I/O JSON (lecture/écriture)
  tests/
    test_core.py
```

### 🧠 Modèle de donnée (tâche)
- **Champs** : `id` (int), `titre` (str), `terminee` (bool), `cree_le` (str ISO), `terminee_le` (str ISO|None).

### 🧠 Persistance JSON
- Fichier `todo.json` dans un dossier **data** local au projet.  
- Écriture **atomique** (basique) : écrire dans un fichier temporaire puis renommer (facultatif pour débutant).

### 🧠 CLI : `argparse` vs menu simple
- **Menu** (débutant) : boucle `while` + `input()`.  
- **`argparse`** (plus pro) : commandes `add`, `list`, `done`, `del`.

---

## ❓ Pourquoi cette structure ?
- **Testabilité** : le **core** est testable sans I/O.  
- **Robustesse** : I/O isolée; erreurs traitées où elles surviennent.  
- **Évolutivité** : on peut passer du menu à `argparse` sans toucher au **core**.

---

## 🧪 Exemples de code (complets)

### 1) `todo_core.py` — logique métier (pure)
```
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime

@dataclass
class Tache:
    id: int
    titre: str
    terminee: bool = False
    cree_le: str = field(default_factory=lambda: datetime.now().isoformat(timespec="seconds"))
    terminee_le: Optional[str] = None


def next_id(taches: List[Tache]) -> int:
    return (max((t.id for t in taches), default=0) + 1)


def ajouter(taches: List[Tache], titre: str) -> List[Tache]:
    if not titre.strip():
        raise ValueError("titre vide")
    new = Tache(id=next_id(taches), titre=" ".join(titre.split()))
    return taches + [new]


def terminer(taches: List[Tache], id_: int) -> List[Tache]:
    res = []
    found = False
    now = datetime.now().isoformat(timespec="seconds")
    for t in taches:
        if t.id == id_:
            found = True
            if t.terminee:
                res.append(t)
            else:
                res.append(Tache(id=t.id, titre=t.titre, terminee=True, cree_le=t.cree_le, terminee_le=now))
        else:
            res.append(t)
    if not found:
        raise KeyError(f"id {id_} introuvable")
    return res


def supprimer(taches: List[Tache], id_: int) -> List[Tache]:
    res = [t for t in taches if t.id != id_]
    if len(res) == len(taches):
        raise KeyError(f"id {id_} introuvable")
    return res
```

### 2) `storage.py` — I/O JSON
```
from pathlib import Path
import json
from typing import List
from todo_core import Tache

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
DATA.mkdir(exist_ok=True)
FILE = DATA / "todo.json"


def load() -> List[Tache]:
    if not FILE.exists():
        return []
    try:
        raw = json.loads(FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        # Fichier corrompu -> repartir de vide
        return []
    return [Tache(**obj) for obj in raw]


def save(taches: List[Tache]) -> None:
    payload = [t.__dict__ for t in taches]
    FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
```

### 3) `app.py` — CLI (menu simple)
```
from storage import load, save
from todo_core import ajouter, terminer, supprimer

MENU = """
1) Lister
2) Ajouter
3) Terminer
4) Supprimer
5) Quitter
"""


def main():
    taches = load()
    while True:
        print(MENU)
        choix = input("> ").strip()
        if choix == "1":
            if not taches:
                print("(aucune tâche)")
            else:
                for t in taches:
                    status = "✔" if t.terminee else "✗"
                    print(f"[{t.id}] {status} {t.titre} (créée {t.cree_le})")
        elif choix == "2":
            titre = input("Titre: ")
            try:
                taches = ajouter(taches, titre)
                save(taches)
            except ValueError as e:
                print("Erreur:", e)
        elif choix == "3":
            try:
                id_ = int(input("Id: "))
                taches = terminer(taches, id_)
                save(taches)
            except (ValueError, KeyError) as e:
                print("Erreur:", e)
        elif choix == "4":
            try:
                id_ = int(input("Id: "))
                taches = supprimer(taches, id_)
                save(taches)
            except (ValueError, KeyError) as e:
                print("Erreur:", e)
        elif choix == "5":
            print("Au revoir")
            break
        else:
            print("Choix invalide")

if __name__ == "__main__":
    main()
```

### 4) Tests — `tests/test_core.py`
```
import unittest
from todo_core import ajouter, terminer, supprimer, Tache

class TestCore(unittest.TestCase):
    def test_ajouter(self):
        taches = []
        taches = ajouter(taches, "  faire  le  ménage ")
        self.assertEqual(len(taches), 1)
        self.assertEqual(taches[0].titre, "faire le ménage")

    def test_terminer_supprimer(self):
        taches = [Tache(id=1, titre="demo")]
        taches = terminer(taches, 1)
        self.assertTrue(taches[0].terminee)
        taches = supprimer(taches, 1)
        self.assertEqual(len(taches), 0)

if __name__ == "__main__":
    unittest.main()
```

---

## 🔧 Pratique guidée (variantes)

### Utiliser `argparse` (aperçu)
```
import argparse
from storage import load, save
from todo_core import ajouter, terminer, supprimer

parser = argparse.ArgumentParser(prog="todo")
sub = parser.add_subparsers(dest="cmd", required=True)

p_add = sub.add_parser("add"); p_add.add_argument("titre")
p_done = sub.add_parser("done"); p_done.add_argument("id", type=int)
p_del = sub.add_parser("del"); p_del.add_argument("id", type=int)
sub.add_parser("list")

args = parser.parse_args()

T = load()
if args.cmd == "add":
    T = ajouter(T, args.titre); save(T)
elif args.cmd == "done":
    T = terminer(T, args.id); save(T)
elif args.cmd == "del":
    T = supprimer(T, args.id); save(T)
elif args.cmd == "list":
    for t in T:
        print(t)
```

> [!TIP]
> `argparse` permet une **utilisation scriptée** (`todo add "..."`) et une **aide auto** (`-h`).

---

## ⚠️ Pièges courants (et solutions)

### 1) Chemins relatifs
```
# ✅ utilisez Path(__file__).resolve().parent pour baser 'data/' sur le module
```

### 2) Conflits d’IDs
```
# ✅ calculez next_id sur la liste courante; ne réutilisez pas un id supprimé si vous souhaitez garder l'unicité stricte
```

### 3) Corruption JSON
```
# ✅ attrapez JSONDecodeError et reconstruisez à partir de [] ; journalisez l'incident
```

### 4) Mélange logique/I/O
```
# ✅ core sans I/O pour tester; storage pour JSON; app pour CLI
```

### 5) Double écriture concurrente (avancé)
```
# ✅ sériel en débutant; pour production, envisager lock ou écriture atomique
```

---

## 💡 Astuces de pro
- **Fonctions pures** pour la logique; **I/O** aux **frontières**.  
- **Docstrings** concises et **annotations** de types (`List[Tache]`).  
- **Tests** sur le core : ajout, fin, suppression, cas d’erreur.  
- **Journalisez** (module `logging`) en cas de corruption de fichier.  
- **Structure** de projet claire pour évoluer vers une lib/CLI plus riche.

---

## 🧪🧮 Mini‑formules (en Python)

### ID suivant
```
next_id = max((t.id for t in taches), default=0) + 1
```

### Filtre de tâches terminées
```
terminées = [t for t in taches if t.terminee]
```

### Tri par date de création (ISO)
```
tri = sorted(taches, key=lambda t: t.cree_le)
```

---

## 🧩 Exercices (avec indications)

1. **Recherche** : ajouter une commande pour **rechercher** par **mot‑clé** dans `titre`.  
   *Indications :* `lower()`, `in`, compréhension.

2. **Priorité** : étendre `Tache` avec un champ `prio` (1..5) et un tri par priorité décroissante.  
   *Indications :* `@dataclass(order=True)`, `sort` avec `key`.

3. **Export** : ajouter une commande `export` qui écrit un CSV des tâches.  
   *Indications :* module `csv`, `DictWriter`.

4. **Écriture atomique** : modifier `save` pour écrire dans `todo.tmp` puis `rename`.  
   *Indications :* `Path.write_text`, `Path.rename`.

5. **Tests** : ajouter des tests pour les erreurs (`titre vide`, `id introuvable`).

---

## 🧭 Récap — À retenir absolument
- **Architecture** en modules : core (pur), storage (I/O), app (CLI).  
- **JSON** pour une persistance simple; attraper les erreurs et garder les données **cohérentes**.  
- **CLI** : menu pour débuter, `argparse` pour professionnaliser.  
- **Tests** : sécuriser le core; étendre ensuite aux commandes.

---

## ✅ Checklist de compétence
- [ ] Je sais structurer un **mini‑projet** en modules clairs.  
- [ ] Je lis/écris des **JSON** robustement.  
- [ ] J’implémente un **CRUD** minimal pour tâches.  
- [ ] J’ajoute une **CLI** (menu ou `argparse`).  
- [ ] Je fournis une **suite de tests** pour la logique.

---

## 🧪 Mini‑quiz

1) Où placer la **logique métier** ?  
   a) Dans le module I/O  
   b) Dans le module core (pur)  
   c) Dans `app.py`

2) Pour une persistance simple **lisible** et portable, on choisit :  
   a) `pickle`  
   b) `JSON`  
   c) binaire brut

3) Pour une CLI scriptable avec sous‑commandes, on privilégie :  
   a) boucle `while`  
   b) `argparse`  
   c) `input()` uniquement

*Réponses attendues :* 1) b  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Standard Library pratique** — `datetime`, `math`, `random`, `statistics`, `collections`, `itertools`.
