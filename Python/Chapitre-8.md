 
# 📚 Chapitre 8 — **Fichiers & données : texte, CSV, JSON, binaire**

> [!NOTE]
> Dans ce chapitre, nous apprenons à **lire** et **écrire** des données depuis/vers des **fichiers** : texte, **CSV**, **JSON**, et binaire. Nous verrons `open()`, le **context manager** `with`, **encodage** (UTF‑8), les **différences de nouvelles lignes** (Unix/Windows), `pathlib` pour les **chemins**, et un **mini‑ETL** (transformer un CSV en JSON). Le tout, lentement, avec exemples, pièges et bonnes pratiques.

---

## 🎯 Objectifs pédagogiques
- Comprendre l’ouverture/fermeture et la **gestion sûre** des fichiers (`with`).  
- Lire/écrire des **fichiers texte** avec encodage adapté (UTF‑8).  
- Manipuler des **CSV** avec le module standard `csv`.  
- Sérialiser/désérialiser du **JSON** avec le module standard `json`.  
- Utiliser **`pathlib`** pour des **chemins portables**.  
- Connaître les **pièges** : encodage, nouvelles lignes, chemins relatifs, sécurité de `pickle`.

---

## 🧠 Concepts clés

### 🧠 `open()` et context manager `with`
- `open(path, mode, encoding=...)` ouvre un fichier. **Toujours** fermer, ou utiliser `with` qui **ferme automatiquement**.
- Modes courants : `"r"` lecture, `"w"` écriture (écrase), `"a"` ajout, `"rb"`/`"wb"` binaire.

**Schéma ASCII — cycle de vie**
```
open -> lire/écrire -> close
        ^            |
        |            v
      with assure le close automatique
```

### 🧠 Encodage & nouvelles lignes
- **Encodage** : préférez `encoding="utf-8"` (texte international).  
- **Nouvelles lignes** : `\n` (Unix), `\r\n` (Windows). Python **normalise** en lecture; en écriture, respectez le format selon besoin.

### 🧠 `pathlib` pour chemins
- `from pathlib import Path`  
- `Path(__file__).resolve().parent` pour localiser un dossier **courant** du module.  
- Opérations : `/` pour joindre, `.exists()`, `.is_file()`, `.glob()`.

### 🧠 CSV vs JSON
- **CSV** : tabulaire, **ligne/colonne**, adaptés aux **tableurs**; schema implicite.  
- **JSON** : hiérarchique, **clé/valeur**, **listes/objets**, bien pour API et configuration.

> [!TIP]
> **Choix** : CSV pour **table** régulière; JSON pour **structures** imbriquées ou **listes d’objets**.

---

## ❓ Pourquoi ces notions ?
- Les fichiers sont **omniprésents** : journaux, imports/exports, rapports, configuration.  
- Une gestion **robuste** des encodages et des ressources évite des **bugs subtils** et des **fuites**.  
- Savoir **transformer** (ETL) vous rend **autonome** pour intégrer et nettoyer des données.

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — Lecture texte (UTF‑8)
```
from pathlib import Path
p = Path("notes.txt")
with p.open("r", encoding="utf-8") as f:
    contenu = f.read()
print(contenu)
```

### Exemple 2 — Écriture texte
```
from pathlib import Path
p = Path("journal.txt")
with p.open("w", encoding="utf-8") as f:
    f.write("Ligne 1\n")
    f.write("Ligne 2\n")
```

### Exemple 3 — Lecture **ligne par ligne**
```
from pathlib import Path
p = Path("journal.txt")
with p.open("r", encoding="utf-8") as f:
    for ligne in f:
        print(ligne.rstrip("\n"))
```

### Exemple 4 — CSV : lecture dictée
```
import csv
from pathlib import Path
p = Path("ex.csv")
with p.open("r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)  # {'nom': 'Ada', 'age': '30'}
```

> [!NOTE]
> `newline=""` évite que Python modifie les nouvelles lignes; le module `csv` gère lui‑même les fins de ligne.

### Exemple 5 — CSV : écriture
```
import csv
from pathlib import Path
p = Path("ex.csv")
colonnes = ["nom", "age"]
donnees = [
    {"nom": "Ada", "age": 30},
    {"nom": "Alan", "age": 25},
]
with p.open("w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=colonnes)
    writer.writeheader()
    writer.writerows(donnees)
```

### Exemple 6 — JSON : sérialiser/désérialiser
```
import json
from pathlib import Path
p = Path("config.json")
conf = {"theme": "dark", "version": 1}
# écriture
p.write_text(json.dumps(conf, ensure_ascii=False, indent=2), encoding="utf-8")
# lecture
conf2 = json.loads(p.read_text(encoding="utf-8"))
```

> [!TIP]
> `ensure_ascii=False` garde les **accents**; `indent=2` formate **lisiblement**.

### Exemple 7 — Binaire (images, zip)
```
from pathlib import Path
p = Path("image.bin")
# écriture binaire
with p.open("wb") as f:
    f.write(b"\x00\x01\x02")
# lecture binaire
with p.open("rb") as f:
    data = f.read()
```

### Exemple 8 — Détection/gestion d’encodage (basique)
```
# Si vous recevez un fichier d'origine inconnue
from pathlib import Path
p = Path("mystere.txt")
try:
    txt = p.read_text(encoding="utf-8")
except UnicodeDecodeError:
    # tentative de secours
    txt = p.read_text(encoding="latin-1")
```

---

## 🔧 Mini‑ETL — **CSV → JSON** (nettoyage et transformation)

**Objectif** : lire un `CSV` de personnes (`nom`, `age`, `ville`), **nettoyer** les champs, **convertir** en `JSON`.

```
import csv, json
from pathlib import Path

csv_path = Path("personnes.csv")
json_path = Path("personnes.json")

result = []
with csv_path.open("r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        propre = {
            "nom": " ".join(row["nom"].split()).title(),
            "age": int(row["age"]) if row["age"].strip() else None,
            "ville": row["ville"].strip(),
        }
        result.append(propre)

json_path.write_text(
    json.dumps(result, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
print(f"Écrit {len(result)} enregistrements dans", json_path)
```

> [!TIP]
> Séparez la **lecture** (I/O), le **nettoyage** (logique pure), et la **écriture** (I/O). Cela facilite les **tests**.

---

## ⚠️ Pièges courants (et solutions)

### 1) Encodage incorrect
```
# UnicodeDecodeError si encodage inadapté
# ✅ explicitez 'encoding' et prévoyez une stratégie de secours
```

### 2) `newline` et CSV
```
# ✅ toujours 'newline=""' avec module csv pour éviter doubles lignes sur Windows
```

### 3) Chemins relatifs fragiles
```
# ✅ préférez 'pathlib' et des chemins basés sur '__file__'
```

### 4) `pickle` (sécurité)
```
# ⚠️ ne chargez jamais un pickle non fiable (exécution de code possible)
# ✅ utilisez JSON/CSV pour des données de confiance partagée
```

### 5) Mélanger str/bytes
```
# ⚠️ ouvrez en 'rb' pour binaire et 'r' avec encoding pour texte
```

---

## 💡 Astuces de pro
- `pathlib.Path.write_text()` et `.read_text()` pour des **helpers** concis.  
- `json.dumps(..., ensure_ascii=False, indent=2)` pour des **fichiers lisibles**.  
- `csv.DictReader/DictWriter` pour éviter l’indexation de colonnes par position.  
- **Valider** les données (types, valeurs) avant écriture.  
- Journaliser les **erreurs** et **compter** les éléments traités.

---

## 🧪🧮 Mini‑formules (en Python)

### Normaliser les fins de ligne
```
# transformer CRLF en LF dans un texte
s = s.replace("\r\n", "\n")
```

### Charger un JSON sûr (avec défaut)
```
import json

def load_json_safe(path: str, default=None):
    from pathlib import Path
    p = Path(path)
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default
```

### Écrire un CSV trié
```
import csv

def write_sorted_csv(path: str, rows: list[dict], *, key: str):
    from pathlib import Path
    if not rows:
        return
    cols = list(rows[0].keys())
    rows_sorted = sorted(rows, key=lambda r: r.get(key))
    with Path(path).open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows_sorted)
```

---

## 🧩 Exercices (avec indications)

1. **Log journalier** : écrire une fonction qui ajoute une ligne horodatée (`YYYY‑MM‑DD HH:MM`) dans `journal.txt`.  
   *Indications :* `datetime`, `Path`, mode `"a"`.

2. **CSV → JSON** : transformer un `CSV` de produits (`id`, `nom`, `prix`) en `JSON` propre (types corrects, noms normalisés).  
   *Indications :* `DictReader`, nettoyage, `json.dumps`.

3. **Nettoyage d’encodage** : écrire une fonction qui tente `utf‑8` puis `latin‑1` et journalise l’encodage utilisé.  
   *Indications :* `try/except UnicodeDecodeError`.

4. **Lister fichiers** : lister tous les `*.csv` dans un dossier et retourner leur taille en octets.  
   *Indications :* `Path.glob("*.csv")`, `.stat().st_size`.

5. **Binaire** : écrire/relire un petit **buffer** binaire et vérifier l’égalité.  
   *Indications :* `rb`/`wb`.

---

## 🧭 Récap — À retenir absolument
- Utiliser **`with open(...)`** pour fermer automatiquement les fichiers.  
- Préciser **`encoding="utf-8"`** pour le texte; **`newline=""`** avec **`csv`**.  
- **`pathlib`** pour des chemins **portables** et lisibles.  
- **CSV** pour tabulaire; **JSON** pour structures et API.  
- Éviter **`pickle`** sur des sources non fiables.

---

## ✅ Checklist de compétence
- [ ] Je sais ouvrir/fermer des fichiers en sécurité avec `with`.  
- [ ] Je gère **encodage** et **nouvelles lignes** correctement.  
- [ ] Je lis/écris des **CSV** avec `DictReader/DictWriter`.  
- [ ] Je lis/écris des **JSON** proprement (`ensure_ascii=False`, `indent`).  
- [ ] J’utilise **`pathlib`** pour les chemins et j’évite `pickle`.

---

## 🧪 Mini‑quiz

1) Pour écrire un CSV sur Windows sans double fin de ligne, il faut :  
   a) `newline=None`  
   b) `newline=""`  
   c) rien

2) Une lecture texte internationale recommandée :  
   a) `open(path, "r")`  
   b) `open(path, "r", encoding="utf-8")`  
   c) `open(path, "rb")`

3) Pour joindre des chemins de façon portable, on utilise :  
   a) `os.path.join` uniquement  
   b) `Path(...) / "sous" / "chemin"`  
   c) concaténation de chaînes

*Réponses attendues :* 1) b  2) b  3) b

---

> [!NOTE]
> Prochain chapitre : **Compréhensions, itérateurs & générateurs** — expressivité et **évaluation paresseuse** (`yield`, `iter`, `next`).
