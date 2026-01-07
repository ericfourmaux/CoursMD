 
# 📚 Chapitre 13 — **Standard Library pratique**

> [!NOTE]
> Ce chapitre vous offre une **boîte à outils** de la **bibliothèque standard** Python, avec un focus pratique : **dates/temps** (`datetime`, `time`), **math** (`math`, `statistics`, `random`), **collections** (`Counter`, `defaultdict`, `deque`, `namedtuple`), et **itertools** (construction de **pipelines**). Nous avançons **lentement et clairement**, avec définitions, pourquoi, analogies, exemples, pièges, exercices, récap et quiz.

---

## 🎯 Objectifs pédagogiques
- Manipuler **dates/temps** (création, formatage, fuseaux horaires).  
- Calculer avec **math** et **statistiques** simples.  
- Générer du **pseudo‑aléatoire** de manière **reproductible**.  
- Utiliser des **structures enrichies** de `collections`.  
- Composer des **itérations puissantes** avec `itertools`.

---

## 🧠 Concepts clés

### 🧠 `datetime` & `time`
- `datetime` : objets **concrets** (date + temps), opérations (addition, différence), **formatage** (`strftime` / `strptime`).  
- `timezone` : gérer l’**offset** et le **temps universel** (`UTC`).  
- `time` : **mesure** du temps (timestamps), **sleep**.

**Schéma ASCII — lignes de temps**
```
UTC -----> local (offset +hh:mm)
aware (avec tz) vs naive (sans tz)
```

> [!TIP]
> Utilisez des `datetime` **aware** en UTC pour stocker; convertissez au **local** pour afficher.

### 🧠 `math`, `statistics`, `random`
- `math` : fonctions mathématiques **fiables** (trigonométrie, log, racines, constantes `pi`/`e`).  
- `statistics` : **moyenne**, **médiane**, **variance**, **écart‑type**.  
- `random` : **pseudo‑aléatoire**; fixez la **seed** pour la **reproductibilité**.

### 🧠 `collections`
- `Counter` : compteur **fréquences**.  
- `defaultdict` : **valeur par défaut** automatique.  
- `deque` : **double‑file** rapide (ajouts/pop aux extrémités).  
- `namedtuple` : tuples **nommés** (légers, immuables).

### 🧠 `itertools`
- Construire des **pipelines** : `chain`, `islice`, `takewhile`, `dropwhile`, `product`, `permutations`, `combinations`, `groupby`, `accumulate`, `tee`.

> [!NOTE]
> Pensez `itertools` comme un **jeu de Lego** pour l’itération.

---

## ❓ Pourquoi ces outils ?
- Ils répondent à **90%** des besoins **quotidiens** sans installer de paquets.  
- Ils sont **performants**, **robustes**, et **bien documentés**.  
- Ils favorisent un code **expressif** et **compact**.

---

## 🧪 Exemples concrets (progressifs)

### `datetime` — créer, formater, parser, tz
```
from datetime import datetime, timezone, timedelta

# maintenant en UTC (aware)
now_utc = datetime.now(timezone.utc)
# format ISO
print(now_utc.isoformat(timespec="seconds"))

# convertir en fuseau local (ex: +01:00)
local = now_utc.astimezone(timezone(timedelta(hours=1)))
print(local.strftime("%Y-%m-%d %H:%M:%S %z"))

# parser texte → datetime
s = "2026-01-07 14:30:00"
parsed = datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
```

### Durées (`timedelta`) & échéances
```
from datetime import timedelta

d = timedelta(days=10, hours=2)
print(d.total_seconds())
# échéance dans 3 jours
deadline = datetime.now(timezone.utc) + timedelta(days=3)
```

### `time` — mesure & pause
```
import time
start = time.perf_counter()
# ... votre code ...
elapsed = time.perf_counter() - start
print(f"{elapsed:.6f}s")

time.sleep(0.1)  # pause 100 ms
```

### `math` — calculs courants
```
import math
print(math.sqrt(2))
print(math.log(8, 2))   # log base 2
print(math.isclose(0.1 + 0.2, 0.3, rel_tol=1e-9))
```

### `statistics` — descriptifs simples
```
import statistics as stats
x = [10, 20, 30, 40]
print(stats.mean(x))
print(stats.median(x))
print(stats.pvariance(x))  # variance population
print(stats.pstdev(x))     # écart-type population
```

### `random` — seed, tirages, choix, permutations
```
import random
random.seed(42)      # reproductible
print(random.random())
print(random.randint(1, 6))
print(random.choice(["a", "b", "c"]))
print(random.sample(range(10), 3))
random.shuffle(x)    # mélange in-place
```

### `collections.Counter` — fréquences
```
from collections import Counter
mots = "Ada aime le code et le code aime Ada".lower().split()
print(Counter(mots))
print(Counter(mots).most_common(2))
```

### `defaultdict` — regroupements simples
```
from collections import defaultdict
par_ville = defaultdict(list)
datas = [("Ada", "Paris"), ("Alan", "Londres"), ("Grace", "Paris")]
for nom, ville in datas:
    par_ville[ville].append(nom)
print(dict(par_ville))
```

### `deque` — file double, fenêtre glissante
```
from collections import deque
q = deque(maxlen=3)
for n in [1, 2, 3, 4]:
    q.append(n)
print(list(q))  # [2, 3, 4]
q.appendleft(0)
print(list(q))  # [0, 2, 3]
```

### `namedtuple` — léger & lisible
```
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])  # immuable
p = Point(3, 4)
print(p.x, p.y)
```

### `itertools` — pipelines puissants
```
import itertools as it

# prendre tant que (< 10)
print(list(it.takewhile(lambda x: x < 10, range(20))))
# enchaîner plusieurs iterables
print(list(it.chain([1, 2], [3], [])))
# combinaisons et produit cartésien
print(list(it.combinations("ABC", 2)))
print(list(it.product([1, 2], ["a", "b"])) )
# accumulate pour sommes cumulées
print(list(it.accumulate([1, 2, 3, 4])))
```

### `groupby` — regrouper (après tri)
```
import itertools as it
mots = sorted(["pomme", "poire", "banane", "pastèque", "abricot"], key=lambda s: s[0])
for lettre, groupe in it.groupby(mots, key=lambda s: s[0]):
    print(lettre, list(groupe))
```

---

## 🔧 Pratique guidée

### Rapport quotidien (dates + stats)
```
from datetime import datetime, timezone
import statistics as stats

now = datetime.now(timezone.utc).isoformat(timespec="seconds")
values = [12, 20, 18, 16, 24]
report = {
    "ts": now,
    "min": min(values),
    "max": max(values),
    "mean": round(stats.mean(values), 2),
}
print(report)
```

### Échantillonnage reproductible
```
import random
random.seed(0)
sample = random.sample(range(100), 5)
print(sample)
```

### Top N mots (Counter + itertools)
```
from collections import Counter
import itertools as it
texte = """Ada aime le code. Le code aime Ada. Le python aime les listes.""".lower()
words = [w.strip(".,") for w in texte.split()]
counts = Counter(words)
print(list(it.islice(counts.most_common(), 3)))
```

---

## ⚠️ Pièges courants (et solutions)

### 1) Dates naïves vs aware
```
# ⚠️ mélanger naive/aware lève TypeError
# ✅ stocker en UTC aware, convertir en affichage
```

### 2) `random` non reproductible
```
# ⚠️ sans seed, résultats variables
# ✅ fixez 'random.seed(...)' pour tests/réplicabilité
```

### 3) `groupby` sans tri préalable
```
# ⚠️ groupby regroupe seulement les **adjacents** égaux
# ✅ trier par la clé avant
```

### 4) Variance/écart‑type population vs échantillon
```
# ⚠️ confondre pvariance (population) et variance (échantillon)
# ✅ choisissez la bonne fonction selon votre cas
```

### 5) Fenêtre `deque(maxlen)` tronque
```
# ⚠️ éléments anciens supprimés
# ✅ comportement voulu pour mémoire limitée
```

---

## 💡 Astuces de pro
- **UTC** internement; `strftime`/`strptime` pour interfaces.  
- `math.isclose` pour comparaisons flottantes.  
- `statistics` pour **indicateurs rapides**.  
- `Counter.most_common(n)` pour **top** éléments.  
- `itertools` pour **pipelines** élégants (penser « Lego »).

---

## 🧪🧮 Mini‑formules (en Python)

### Moyenne mobile simple (deque)
```
from collections import deque

def moving_avg(seq, k):
    q = deque(maxlen=k)
    sums = 0
    for x in seq:
        if len(q) == k:
            sums -= q[0]
        q.append(x)
        sums += x
        if len(q) == k:
            yield sums / k
```

### Fenêtre avec `islice`
```
import itertools as it
window3 = list(it.islice(range(10), 3))  # [0,1,2]
```

### Détection proche
```
import math
math.isclose(a, b, rel_tol=1e-9, abs_tol=0.0)
```

---

## 🧩 Exercices (avec indications)

1. **Horodatage** : écrire une fonction qui renvoie un datetime **UTC aware** formaté ISO.  
   *Indications :* `datetime.now(timezone.utc)`, `isoformat`.

2. **Stats** : calculer moyenne, médiane, écart‑type d’une série; comparer **population** vs **échantillon**.  
   *Indications :* `statistics` (`mean`, `median`, `pvariance`/`variance`).

3. **Top mots** : compter les mots d’un texte et afficher les **N** plus fréquents.  
   *Indications :* `Counter`, `most_common`.

4. **Pipelines** : lire lignes d’un fichier, nettoyer, filtrer par longueur ≥ 3, compter.  
   *Indications :* `itertools`, générateurs (chap. 9).

5. **Combinaisons** : énumérer toutes les paires possibles d’une liste sans répétition.  
   *Indications :* `itertools.combinations`.

---

## 🧭 Récap — À retenir absolument
- **Dates/temps** : stocker en **UTC aware**, convertir pour affichage; `strftime`/`strptime`.  
- **Math/Stats** : `math.isclose`; `mean/median/variance`; choisir **population** ou **échantillon**.  
- **Random** : fixer la **seed** pour reproductibilité.  
- **Collections** : `Counter`, `defaultdict`, `deque`, `namedtuple` pour code expressif.  
- **Itertools** : chaînes, découpages, regroupements pour **pipelines** puissants.

---

## ✅ Checklist de compétence
- [ ] Je crée/parse/formatte des **datetime** (UTC, tz).  
- [ ] Je calcule des **statistiques** simples.  
- [ ] Je génère du **pseudo‑aléatoire** reproductible.  
- [ ] J’utilise `Counter/defaultdict/deque/namedtuple`.  
- [ ] Je compose des **pipelines** avec `itertools`.

---

## 🧪 Mini‑quiz

1) `groupby` fonctionne correctement si :  
   a) les données sont déjà **triées par la clé**  
   b) on passe un `set`  
   c) on utilise `zip`

2) Pour comparer deux flottants, on préfère :  
   a) `a == b`  
   b) `math.isclose(a, b)`  
   c) `round(a, 6) == round(b, 6)`

3) Pour fixer un aléatoire reproductible, on écrit :  
   a) `random.fix()`  
   b) `random.seed(42)`  
   c) `random.lock(42)`

*Réponses attendues :* 1) a  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **(Option) Introduction Data — NumPy, Pandas, Matplotlib**.
