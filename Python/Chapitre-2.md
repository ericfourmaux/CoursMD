
# 📚 Chapitre 2 — **Chaînes de caractères & formatage**

> [!NOTE]
> Dans ce chapitre, nous allons **prendre le temps** de comprendre en profondeur les **chaînes de caractères** en Python : leur nature **immuable**, la **manipulation** par indexation et tranches (slicing), les **méthodes** utiles, **Unicode & encodage**, et le **formatage** moderne avec les **f-strings**. Chaque notion est expliquée avec un **pourquoi**, des **analogies**, des **exemples concrets**, et des **pièges à éviter**.

---

## 🎯 Objectifs pédagogiques
- Comprendre ce qu’est une **chaîne** (`str`) : **séquence immuable** de caractères Unicode.  
- Savoir **indexer**, **découper** (slicing), **parcourir** et **mesurer** une chaîne.  
- Maîtriser les **méthodes** essentielles : `strip`, `split`, `join`, `replace`, `find`, `startswith`, `endswith`, `lower`, `upper`, `title`, `casefold`, etc.  
- Connaître **Unicode**, l’**encodage UTF-8**, et la différence entre **texte (`str`)** et **octets (`bytes`)**.  
- Formater du texte avec les **f-strings** (alignement, largeur, précision, `!r`, `{var=}`) et `str.format()`.  
- Éviter les **pièges** : hors bornes, espaces invisibles, normalisation Unicode, concaténation en boucle.

---

## 🧠 Concepts clés

### 🧠 Qu’est-ce qu’une chaîne (`str`) ?
Une **chaîne** est une **séquence immuable** de **caractères Unicode**. Cela signifie :
- **Séquence** : on peut **accéder** à chaque caractère par **index** et **itérer** sur la chaîne.  
- **Immuable** : une fois créée, une chaîne **ne peut pas être modifiée**. Toute « modification » produit **une nouvelle chaîne**.  
- **Unicode** : un caractère est un **point de code** abstrait (pas un octet). L’**encodage** (ex. `UTF-8`) convertit ce point de code en **octets** pour le stockage/transmission.

> [!TIP]
> **Analogie** : Imaginez une **collier** de perles (caractères). Vous pouvez **compter** les perles, **regarder** chacune (index), **couper** des segments (slicing). Mais vous **ne pouvez pas changer** une perle sur place : vous devez **fabriquer un nouveau collier**.

### 🧠 Indexation & Slicing (tranches)

**Schéma ASCII — indices et tranches**
```
texte = "Python"
# Indices :  P   y   t   h   o   n
#            0   1   2   3   4   5
# Indices - : -6 -5 -4 -3 -2 -1

# Slicing général : texte[start:stop:step]
# - start inclusif, stop exclusif, step (pas) optionnel
```

> [!NOTE]
> **Stop exclusif** : `texte[0:2]` retourne les indices `0` et `1` (pas `2`). Cette règle **évite les off-by-one** et simplifie les concaténations.

### 🧠 Unicode & encodage
- `str` gère **Unicode** (ex. `"é", "漢", "🙂"`).  
- `bytes` est une séquence d’**octets** (valeurs 0–255).  
- **Encodage** : `b = s.encode('utf-8')` (str → bytes).  
- **Décodage** : `s = b.decode('utf-8')` (bytes → str).

> [!WARNING]
> **Piège** : confondre `str` et `bytes`. Les méthodes de chaînes ne s’appliquent pas sur `bytes` de la même façon. Toujours **décoder** les octets avant de traiter le texte.

### 🧠 `repr()` vs `str()`
- `str(x)` : représentation **lisible** pour l’utilisateur.  
- `repr(x)` : représentation **non ambigüe** pour le développeur (souvent utilisable comme littéral Python).  
- En f-string : `f"{x!r}"` force `repr`.

---

## ❓ Pourquoi c’est important ?
- En pratique, **tout programme** manipule du **texte** : logs, fichiers, requêtes web, CSV, etc.  
- Comprendre Unicode/encodage **évite des bugs** (caractères accentués, emojis, langues non-latines).  
- Savoir formater proprement **améliore la lisibilité** et la **qualité** des sorties (rapports, messages, interfaces).

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — Indexation et tranches
```
texte = "Python"
print(texte[0])      # 'P'
print(texte[-1])     # 'n'
print(texte[1:4])    # 'yth'
print(texte[:2])     # 'Py'
print(texte[2:])     # 'thon'
print(texte[::2])    # 'Pto'
print(texte[::-1])   # 'nohtyP' (renverse)
```

### Exemple 2 — Méthodes de nettoyage & découpe
```
brut = "  Bonjour,  monde \t\n"
propre = brut.strip()          # retire espaces/tabs/nouvelles lignes aux extrémités
mots = propre.replace(",", "").split()  # ['Bonjour', 'monde']
recompose = "-".join(mots)     # 'Bonjour-monde'
```

### Exemple 3 — Tests de préfixe/suffixe
```
nom_fichier = "rapport_2025.csv"
print(nom_fichier.startswith("rapport_"))  # True
print(nom_fichier.endswith(".csv"))         # True
```

### Exemple 4 — Texte ↔ octets (UTF-8)
```
s = "café"
b = s.encode("utf-8")   # b'caf\xc3\xa9'
s2 = b.decode("utf-8")  # 'café'
```

### Exemple 5 — Formatage avec f-strings
```
pi = 3.1415926535
print(f"π ≈ {pi:.3f}")      # π ≈ 3.142
print(f"|{pi:>10.3f}|")     # aligné à droite sur 10 colonnes
x = 42
print(f"Valeur: {x!r}")     # utilise repr -> '42'
print(f"Debug: {x=}")       # Python ≥ 3.8 -> 'x=42'
```

### Exemple 6 — Concaténation efficace
```
# Évitez: concaténation répétée dans une boucle
fragments = ["a", "b", "c"]
texte = "".join(fragments)  # plus efficace et idiomatique
```

---

## 🔧 Pratique guidée pas à pas

### 1) Voir, mesurer, parcourir
```
s = "Bonjour"
print(len(s))          # 7
for ch in s:
    print(ch)
```

### 2) Nettoyer un nom complet
```
nom_complet = "  ada   lovelace  "
nom_propre = " ".join(nom_complet.split()).title()  # 'Ada Lovelace'
```

### 3) Extraire et recomposer
```
chemin = "/usr/local/bin/python"
base = chemin.split("/")[-1]    # 'python'
repertoire = "/".join(chemin.split("/")[:-1])
```

### 4) Comparaison insensible à la casse
```
a = "straße"   # allemand
b = "STRASSE"
print(a.lower() == b.lower())     # parfois insuffisant
print(a.casefold() == b.casefold())  # recommandé pour Unicode
```

> [!TIP]
> **`casefold()`** est une version plus agressive de `lower()` adaptée aux comparaisons **Unicode** (utile pour l’internationalisation).

### 5) Normalisation Unicode
```
import unicodedata
s1 = "e\u0301"   # 'e' + accent aigu combinant
s2 = "é"          # caractère précomposé
print(len(s1), len(s2))
print(unicodedata.normalize("NFC", s1) == unicodedata.normalize("NFC", s2))
```

> [!WARNING]
> Des chaînes **visuellement identiques** peuvent différer en **combinaisons** de points de code. La **normalisation** (`NFC`, `NFD`) est cruciale pour la comparaison et le stockage cohérent.

### 6) Échapper les caractères spéciaux
```
chemin_win = "C:\\Users\\Ada\\Documents"
print(chemin_win)
raw = r"C:\Users\Ada\Documents"  # chaîne brute (raw string)
print(raw)
```

> [!NOTE]
> Les **chaînes brutes** (`r"..."`) n’interprètent pas les séquences d’échappement `\n`, `\t`, etc., mais attention : elles **ne peuvent pas terminer** par un seul `\`.

---

## ⚠️ Pièges courants (et solutions)

### Hors bornes et tranches vides
```
texte = "Hi"
# texte[5] -> IndexError (hors bornes)
print(texte[5:10])  # '' (tranche vide, aucune erreur)
```

### Confusion `str` vs `bytes`
```
# Mauvais : mélanger str et bytes
# s + b  # TypeError

# Bon : encoder/décoder
b = "é".encode("utf-8")
s = b.decode("utf-8")
```

### Concaténation en boucle
```
# Mauvais :
res = ""
for i in range(1000):
    res += str(i)

# Bon :
res = "".join(str(i) for i in range(1000))
```

### Espaces invisibles & Unicode
```
texte = "Prix\u00A0: 10€"  # \u00A0 = espace insécable
print(texte)
print(texte.replace("\u00A0", " "))
```

> [!TIP]
> Les **espaces insécables**, les **caractères zéro‑largeur** ou **combinants** peuvent perturber la recherche et l’affichage. **Nettoyez** ou **normalisez** selon le contexte.

### `title()` approximatif
```
print("l'ami de bob".title())  # "L'Ami De Bob" (peut être incorrect selon les règles typographiques)
```

> [!NOTE]
> Les méthodes de casse (`upper`, `lower`, `title`) sont **génériques**. Pour des règles linguistiques fines, il faut une **bibliothèque** dédiée.

---

## 💡 Astuces de pro
- **`" ".join(s.split())`** pour **normaliser** les espaces internes.  
- **`casefold()`** pour comparaisons **insensibles à la casse** en Unicode.  
- **`unicodedata.normalize("NFC", s)`** pour **comparer/stocke** de manière fiable.  
- **`"".join(parts)`** au lieu de `+` en boucle.  
- **F-strings** pour un formatage **lisible et concis**.

---

## 🧪🧮 Formules (exprimées en Python)

### Centrage manuel (alignement)
```
texte = "Titre"
largeur = 20
# Formule : gauche = (largeur - len(texte)) // 2
# droite = largeur - len(texte) - gauche
pad_g = (largeur - len(texte)) // 2
pad_d = largeur - len(texte) - pad_g
centre = " " * pad_g + texte + " " * pad_d
```

### Formatage numérique
```
val = 1234.5678
fmt = f"{val:,.2f}"  # séparateur de milliers selon locale inactive -> souvent ','
# Pour forcer un séparateur : remplacer après coup ou utiliser locale (chap. 13)
```

### Détection de palindrome (basique)
```
def est_palindrome(s: str) -> bool:
    s_net = "".join(ch for ch in s.lower() if ch.isalnum())
    return s_net == s_net[::-1]
```

---

## 🧩 Exercices (avec indications)

1. **Nettoyage de nom** : écrire une fonction `nettoie_nom(s)` qui :  
   - supprime espaces superflus (internes/externes),  
   - applique `title()`,  
   - remplace les espaces insécables par des espaces ordinaires.  
   *Indications :* `split`, `join`, `strip`, `replace("\u00A0", " ")`, `title()`.

2. **Création de slug** (`"Mon Titre à Éxémple"` → `"mon-titre-a-exemple"`) :  
   *Indications :* `casefold()`, filtrer `isalnum()` ou remplacer non‑alnum par `-`, normaliser Unicode.

3. **Alignement de colonnes** : afficher trois colonnes (`nom`, `age`, `ville`) alignées :  
   *Indications :* f-strings avec spécificateurs (`:<15`, `:>3`).

4. **Compteur de mots** : compter les occurrences de chaque mot dans une phrase.  
   *Indications :* `split()`, `lower()`, `replace()` pour ponctuation, `collections.Counter` (chap. 13).

5. **Bytes vs str** : écrire `to_utf8_bytes(s)` qui renvoie `bytes`, et `from_utf8_bytes(b)` qui renvoie `str`, avec gestion d’erreur (`try/except`).

---

## 🧭 Récap — À retenir absolument
- Une **chaîne** est une **séquence immuable** de **caractères Unicode**.  
- **Indexation** et **slicing** suivent la règle **stop exclusif**.  
- Différencier **`str`** (texte) et **`bytes`** (octets) ; **encoder/décoder** avec UTF‑8.  
- Utiliser les **méthodes** adaptées (`strip`, `split`, `join`, `replace`, `find`, etc.).  
- Préférer les **f-strings** pour un formatage **lisible** et **puissant**.  
- **Normaliser** Unicode et **casefold** pour comparaisons fiables.

---

## ✅ Checklist de compétence
- [ ] Je sais indexer et découper (`s[i]`, `s[a:b:c]`).  
- [ ] Je distingue `str` et `bytes` et je sais `encode`/`decode`.  
- [ ] Je maîtrise `strip/split/join/replace/find`.  
- [ ] J’utilise des **f-strings** avec largeur/alignement/précision.  
- [ ] Je connais `casefold` et la **normalisation Unicode**.

---

## 🧪 Mini-quiz

1) `s[::-1]` :  
   a) renvoie `s` inchangé  
   b) renvoie `s` à l’envers  
   c) lève une erreur

2) `b = s.encode('utf-8')` produit :  
   a) une `str`  
   b) des `bytes`  
   c) une liste d’entiers

3) Pour comparer des chaînes Unicode de manière insensible à la casse, on utilise préférentiellement :  
   a) `lower()`  
   b) `upper()`  
   c) `casefold()`

*Réponses attendues :* 1) b  2) b  3) c

---

> [!NOTE]
> Prochain chapitre : **Contrôle de flux — conditions & boucles** : nous verrons `if/elif/else`, `for`, `while`, et la notion de **truthiness**.
