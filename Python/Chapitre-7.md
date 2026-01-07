 
# 📚 Chapitre 7 — **Exceptions & gestion d’erreurs**

> [!NOTE]
> Dans ce chapitre, nous allons **apprendre à anticiper et traiter les erreurs** proprement : `try/except/else/finally`, `raise`, exceptions **personnalisées**, stratégies **EAFP** (Easier to Ask Forgiveness) vs **LBYL** (Look Before You Leap), et **bonnes pratiques** pour des messages utiles et une propagation maîtrisée. Nous avancerons **lentement**, avec analogies, schémas, exemples, pièges, exercices, et récap.

---

## 🎯 Objectifs pédagogiques
- Comprendre **ce qu’est une exception** et pourquoi Python les utilise.  
- Savoir **intercepter** (`except`), **nettoyer** (`finally`), **compléter** (`else`) et **lever** (`raise`) des exceptions.  
- Concevoir des **exceptions personnalisées** adaptées au domaine.  
- Choisir une stratégie **EAFP** ou **LBYL** selon le contexte.  
- Rédiger des **messages d’erreur** clairs; **propager** ou **envelopper** l’erreur proprement.

---

## 🧠 Concepts clés

### 🧠 Qu’est-ce qu’une exception ?
Une **exception** est un **événement** anormal qui **interrompt** le flux normal d’exécution. Python **remonte** (propagation) l’exception jusqu’à ce qu’un `except` **intercepte** l’erreur.

**Schéma ASCII — propagation**
```
fonction A → appelle B → appelle C
      |                   |
      |                erreur ! (exception)
      |<----------------- remonte (propagation)
      └─ si A ne l'intercepte, l'exception continue à remonter
```

> [!TIP]
> **Pourquoi ?** Les exceptions évitent les **codes de retour** dispersés et fournissent un **canal unique** pour signaler les anomalies.

### 🧠 Bloc `try/except/else/finally`
- `try` : zone **sous surveillance**.  
- `except` : **interception** de types d’exceptions précis.  
- `else` : exécuté **si aucune exception** n’a été levée dans `try`.  
- `finally` : exécuté **toujours** (qu’il y ait eu une exception ou non) — utile pour **libérer/fermer** des ressources.

**Forme générale**
```
try:
    # code potentiellement fautif
except TypeError as e:
    # traitement spécifique
except Exception as e:
    # filet large (à éviter en abus)
else:
    # suite si tout s'est bien passé
finally:
    # nettoyage systématique
```

### 🧠 Lever une exception (`raise`)
On **signale** une erreur avec `raise`. On peut **relancer** l’exception courante (`raise` sans argument) ou **envelopper** (`raise NouveauErreur from e`).
```
if not isinstance(x, int):
    raise TypeError("x doit être un entier")
```

### 🧠 Exceptions personnalisées
Créer une **hiérarchie** d’exceptions **métier** rend les erreurs plus **expressives** et **filtrables**.
```
class AppError(Exception):
    pass

class ValidationError(AppError):
    pass

class ConfigError(AppError):
    pass
```

### 🧠 Stratégies : **EAFP** vs **LBYL**
- **EAFP** : « il est plus facile de demander pardon » — on **tente**, et on **gère** l’exception si elle survient.  
- **LBYL** : « regarder avant de sauter » — on **vérifie** d’abord (conditions), puis on agit.

> [!NOTE]
> **EAFP** est idiomatique en Python (ex. accès dict/attributs), alors que **LBYL** convient aux **interfaces utilisateur** ou aux vérifications **préventives** coûteuses.

---

## ❓ Pourquoi ces notions ?
- Elles permettent de gérer les **aléas** (I/O, réseau, parsing) sans **polluer** la logique métier.  
- Elles favorisent des **messages** utiles et des **rapports** exploitables.  
- Elles évitent des **états corrompus** en libérant correctement les ressources.

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — `try/except` ciblé
```
texte = "123"
try:
    n = int(texte)
except ValueError as e:
    print("Entrée invalide:", e)
else:
    print("Nombre:", n)
```

### Exemple 2 — `finally` pour libérer
```
# Sans 'with' (à titre pédagogique)
f = None
try:
    f = open("data.txt", "w", encoding="utf-8")
    f.write("Bonjour")
except OSError as e:
    print("I/O erreur:", e)
finally:
    if f:
        f.close()  # ferme dans tous les cas
```

### Exemple 3 — Contexte `with` (préféré)
```
from pathlib import Path
p = Path("data.txt")
try:
    with p.open("w", encoding="utf-8") as f:
        f.write("Bonjour")
except OSError as e:
    print("I/O erreur:", e)
```

### Exemple 4 — EAFP dict vs LBYL
```
d = {"nom": "Ada"}
# EAFP
try:
    val = d["age"]
except KeyError:
    val = None

# LBYL
val2 = d["age"] if "age" in d else None
```

### Exemple 5 — Wrap d’exception (chaînage)
```
from json import loads, JSONDecodeError

def parse_payload(s: str) -> dict:
    try:
        return loads(s)
    except JSONDecodeError as e:
        raise ValidationError("JSON invalide") from e
```

### Exemple 6 — Relancer
```
try:
    operation()
except AppError:
    # journaliser puis relancer
    log("erreur métier")
    raise
```

### Exemple 7 — Filtrer par hiérarchie
```
try:
    charger_config()
except ConfigError as e:
    print("Problème de configuration:", e)
except AppError as e:
    print("Autre erreur métier:", e)
```

---

## 🔧 Pratique guidée

### 1) Messages utiles
```
try:
    x = int(input("Entier: "))
except ValueError as e:
    print("Veuillez entrer un entier. Détail:", e)
```

### 2) Validation de paramètres
```

def calc_tva(ht: float, tva: float) -> float:
    if ht < 0:
        raise ValueError("ht doit être >= 0")
    if not (0 <= tva <= 1):
        raise ValueError("tva doit être dans [0, 1]")
    return ht * (1 + tva)
```

### 3) Nettoyage multi‑ressources
```
from contextlib import ExitStack

with ExitStack() as stack:
    f1 = stack.enter_context(open("a.txt", "w", encoding="utf-8"))
    f2 = stack.enter_context(open("b.txt", "w", encoding="utf-8"))
    f1.write("A")
    f2.write("B")
```

### 4) Retenter (retry) simplifié
```
import time

def retry(func, n=3, delay=0.5):
    for i in range(n):
        try:
            return func()
        except Exception as e:
            if i == n - 1:
                raise
            time.sleep(delay)
```

---

## ⚠️ Pièges courants (et solutions)

### 1) Attraper trop large
```
try:
    fragile()
except Exception:  # ⚠️ masque erreurs (ex. bugs de programmation)
    pass
```

> [!WARNING]
> Préférez **exceptions spécifiques**. Si vous attrapez large, **re‑levez** après journalisation ou **limitez** la portée.

### 2) Silencer l’erreur
```
try:
    fragile()
except Exception as e:
    print("Erreur", e)
    # ⚠️ continuer comme si de rien n'était
```

> [!TIP]
> Toujours **décider** : soit **propager**, soit **convertir** en un état clair (valeur par défaut, code d’erreur) — et **journaliser**.

### 3) Perdre la trace (stack) lors du chaînage
```
try:
    charger()
except OSError:
    raise AppError("Chargement impossible")  # ⚠️ sans 'from e'
```

> [!NOTE]
> Utilisez `raise Nouveau from e` pour **conserver la cause** (**trace** exploitable).

### 4) Mélanger contrôle et validation
```
# ⚠️ if complexes au lieu d'attraper l'exception
# ✅ EAFP : essayez l'opération et gérez l'erreur
```

### 5) Oublier `finally`
```
lock.acquire()
try:
    faire()
finally:
    lock.release()  # garantit la libération même en cas d'erreur
```

---

## 💡 Astuces de pro
- **Message** d’erreur : court, **actionnable**, inclure **valeur** fautive (`f"ht={ht}"`).  
- **Hiérarchie** d’exceptions métier : facilite le **filtrage** et l’**API**.  
- **Contexte** (`with`) pour les ressources (fichiers, verrous, connexions).  
- `raise … from e` pour un **diagnostic** complet.  
- Choisissez **EAFP** pour accès dict/attr; **LBYL** pour **UI** ou **pré‑validation**.

---

## 🧪🧮 Mini‑formules (en Python)

### Envelopper proprement
```

def wrap_eof_read(read_func):
    try:
        return read_func()
    except EOFError as e:
        raise AppError("Flux terminé") from e
```

### Valeur sûre au défaut
```

def to_int(s: str, default: int | None = None) -> int | None:
    try:
        return int(s)
    except ValueError:
        return default
```

### Guard + cleanup
```

def process(path: str) -> bool:
    from pathlib import Path
    p = Path(path)
    if not p.exists():
        return False  # LBYL ok ici
    with p.open("r", encoding="utf-8") as f:
        return len(f.read()) > 0
```

---

## 🧩 Exercices (avec indications)

1. **Lecteur JSON robuste** : écrire `read_json(path)` qui renvoie un dict ou **lève** une `ValidationError` avec message clair.  
   *Indications :* `json.load`, `try/except`, `raise … from e`.

2. **Retry** : implémentez `retry(func, n, delay)` (fourni plus haut) et testez‑le avec une fonction qui échoue 2 fois puis réussit.  
   *Indications :* `time.sleep`, compteur.

3. **Nettoyage multi‑ressources** : ouvrir 2 fichiers et garantir leur fermeture même si l’écriture échoue.  
   *Indications :* `with` ou `ExitStack`.

4. **Hiérarchie métier** : créez `AppError`, `ValidationError`, `ConfigError` et **attrapez différemment** dans un script.  
   *Indications :* `except ClassName`.

5. **EAFP vs LBYL** : pour l’accès à une clé de dict et au contenu d’un fichier, écrivez deux versions et comparez.

---

## 🧭 Récap — À retenir absolument
- Les **exceptions** centralisent la **gestion d’erreurs**.  
- `try/except/else/finally` : intercepter, compléter, **nettoyer** systématiquement.  
- `raise` et **exceptions personnalisées** pour des **signaux expressifs**.  
- **EAFP** vs **LBYL** : choisissez selon contexte; Python préfère souvent **EAFP**.  
- Préservez la **trace** (`raise … from e`) et rédigez des **messages clairs**.

---

## ✅ Checklist de compétence
- [ ] Je sais écrire des blocs `try/except/else/finally`.  
- [ ] Je conçois des **exceptions personnalisées** et je les utilise.  
- [ ] Je connais `raise`, `raise from` et la **propagation**.  
- [ ] Je choisis **EAFP** ou **LBYL** selon le cas.  
- [ ] Je rédige des **messages** d’erreur concis et actionnables.

---

## 🧪 Mini‑quiz

1) Le bloc `finally` s’exécute :  
   a) seulement si une exception a eu lieu  
   b) seulement si aucune exception n’a eu lieu  
   c) **toujours**

2) `raise Nouveau from e` :  
   a) **conserve** la cause d’origine  
   b) efface la trace  
   c) ne change rien

3) La stratégie idiomatique en Python pour accès dict/attr est plutôt :  
   a) **EAFP**  
   b) **LBYL**

*Réponses attendues :* 1) c  2) a  3) a

---

> [!NOTE]
> Prochain chapitre : **Fichiers & données — texte, CSV, JSON, binaire** : `open()`, `with`, `pathlib`, encodage, `csv`/`json` et mini‑ETL.
