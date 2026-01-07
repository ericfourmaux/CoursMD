
# 📚 Chapitre 3 — **Contrôle de flux : conditions & boucles**

> [!NOTE]
> Nous allons avancer **lentement et clairement** pour comprendre les **conditions** (`if/elif/else`) et les **boucles** (`for`, `while`). Vous apprendrez la **logique booléenne**, la notion de **truthiness** (valeurs interprétées comme vrai/faux), et les **motifs de boucle** utiles — avec le **pourquoi**, des **analogies**, des **exemples**, des **pièges**, des **exercices**, et un **récap**.

---

## 🎯 Objectifs pédagogiques
- Écrire et structurer des **conditions** avec `if/elif/else`.  
- Maîtriser les **opérateurs** de comparaison (`==`, `!=`, `<`, `<=`, `>`, `>=`) et logiques (`and`, `or`, `not`).  
- Comprendre la **truthiness** : comment Python évalue les objets en booléen.  
- Utiliser les **boucles** `for` et `while`, ainsi que `break`, `continue`, et `else` sur les boucles.  
- Savoir employer `range`, `enumerate`, `zip` pour itérations claires.  
- Reconnaître et éviter les **pièges** : boucles infinies, `==` vs `is`, off‑by‑one, modification d’une liste pendant l’itération.

---

## 🧠 Concepts clés

### 🧠 Condition `if/elif/else` (définition)
Une **condition** est un **embranchement** qui exécute **du code différent** selon la **vérité** d’une expression booléenne.

**Schéma ASCII — flux conditionnel**
```
       condition ?
         ┌─── Oui ───► Bloc A
Entrée ──┤
         └─── Non ───► Bloc B
```

> [!TIP]
> **Pourquoi ?** Les conditions permettent de **prendre des décisions** : valider une saisie, choisir une stratégie, gérer des cas particuliers.

### 🧠 Comparaisons & logique booléenne
- **Comparaisons** : `==`, `!=`, `<`, `<=`, `>`, `>=`.  
- **Logique** : `and` (ET), `or` (OU), `not` (NON).  
- **Évaluation paresseuse (short‑circuit)** : `A and B` n’évalue `B` que si `A` est vrai; `A or B` n’évalue `B` que si `A` est faux.

> [!NOTE]
> Les opérateurs logiques **renvoient la dernière valeur évaluée** (pas nécessairement un booléen). Utile pour **valeurs par défaut** : `x = a or b`.

### 🧠 Truthiness (vérité des objets)
Certaines valeurs sont **fausses** en contexte booléen : `False`, `None`, `0`, `0.0`, `''`, `[]`, `{}`, `set()`. Tout le reste est **vrai**.

> [!TIP]
> **Analogie** : Pensez au **frigo**. S’il est **vide** (liste vide, chaîne vide), il est « faux »; sinon, il est « vrai ». 

### 🧠 Boucles `for` et `while`
- **`for`** : itère **sur un itérable** (liste, chaîne, range, fichier).  
- **`while`** : répète tant qu’une **condition** reste vraie.  
- **Contrôles** : `break` (sortir), `continue` (sauter au tour suivant), `else` (exécuté si la boucle termine **sans** `break`).

**Schéma ASCII — boucle**
```
init → [test] → (vrai) → corps → mise à jour → [test] …
                 (faux) → sortie
```

---

## ❓ Pourquoi ces notions ?
- Elles traduisent la **logique** et le **raisonnement** en algorithmes.  
- Les boucles évitent les **répétitions manuelles** (efficacité, fiabilité).  
- La truthiness permet d’écrire du code **naturel et concis** (ex. `if items:`).

---

## 🧪 Exemples concrets (progressifs)

### Exemple 1 — Validation simple
```
age = 17
if age >= 18:
    print("Accès autorisé")
elif age >= 16:
    print("Accès restreint")
else:
    print("Accès refusé")
```

### Exemple 2 — Combiner conditions
```
prix = 120
carte_membre = True
if prix > 100 and carte_membre:
    print("Réduction appliquée")
```

### Exemple 3 — Truthiness pratique
```
noms = []
if not noms:
    print("Liste vide : rien à traiter")
```

### Exemple 4 — Boucle `for` avec `range`
```
for i in range(3):  # 0, 1, 2
    print(i)
```

### Exemple 5 — `enumerate` pour indices + valeurs
```
fruits = ["pomme", "banane", "poire"]
for idx, fruit in enumerate(fruits, start=1):
    print(idx, fruit)
```

### Exemple 6 — `zip` pour parcours parallèle
```
noms = ["Ada", "Alan"]
notes = [18, 15]
for nom, note in zip(noms, notes):
    print(f"{nom}: {note}")
```

### Exemple 7 — `while` avec garde
```
compteur = 3
while compteur > 0:
    print("Tick", compteur)
    compteur -= 1
print("Fin")
```

### Exemple 8 — `break`, `continue`, `else`
```
# Chercher un élément; si trouvé, arrêter; sinon, rapporter échec
valeurs = [2, 4, 6, 8]
recherche = 5
for v in valeurs:
    if v == recherche:
        print("Trouvé !")
        break
else:
    # exécuté si la boucle s'est terminée sans 'break'
    print("Non trouvé")
```

---

## 🔧 Pratique guidée pas à pas

### 1) Menu texte (mini‑CLI)
```
while True:
    print("1) Lister\n2) Ajouter\n3) Quitter")
    choix = input("> ").strip()
    if choix == "1":
        print("Liste…")
    elif choix == "2":
        print("Ajout…")
    elif choix == "3":
        print("Au revoir")
        break
    else:
        print("Choix invalide")
```

### 2) Filtrer avec conditions
```
notes = [9, 12, 15, 7, 18]
a_bon = []
for n in notes:
    if n >= 10:
        a_bon.append(n)
print(a_bon)
```

### 3) Somme conditionnelle
```
ventes = [100, 0, 200, 50, 0]
# somme des ventes > 0
s = 0
for v in ventes:
    if v > 0:
        s += v
print(s)
```

### 4) Nettoyage en une passe (continue)
```
donnees = ["", "ok", None, "bon", ""]
net = []
for d in donnees:
    if not d:
        continue
    net.append(d)
print(net)
```

### 5) Compteur avec `while` (sentinelle)
```
texte = "Ada;Alan;Edsger;"  # terminaison par ';'
segment = ""
for ch in texte:
    if ch == ";":
        if segment:
            print(segment)
            segment = ""
    else:
        segment += ch
```

---

## ⚠️ Pièges courants (et solutions)

### `==` vs `is`
```
a = [1, 2]
b = [1, 2]
print(a == b)  # True (égalité de valeur)
print(a is b)  # False (objets distincts)
```

> [!WARNING]
> Utilisez `==` pour comparer **les valeurs**; `is` sert à tester **l’identité d’objet** (utile pour `None`).

### Boucle infinie
```
compteur = 1
while compteur > 0:
    # ⚠️ si on n'actualise pas 'compteur', boucle infinie
    compteur -= 1  # ✅ mise à jour
```

### Off‑by‑one (indices)
```
# Parcourir les indices valides d'une liste 'L'
L = [10, 20, 30]
for i in range(len(L)):  # i = 0..len(L)-1
    print(i, L[i])
```

### Modifier une liste en l’itérant
```
L = [1, 2, 3, 4]
for x in L:
    if x % 2 == 0:
        L.remove(x)  # ⚠️ modifie la liste pendant l'itération
print(L)  # résultat inattendu

# ✅ Solution : créer une nouvelle liste ou itérer sur une copie
L = [1, 2, 3, 4]
filtre = [x for x in L if x % 2 != 0]
print(filtre)
```

### `and`/`or` et valeurs non booléennes
```
print("" or "défaut")   # 'défaut'
print("X" and 123)      # 123
```

> [!NOTE]
> Exploitez le **short‑circuit** pour définir des **valeurs par défaut** ou éviter des **erreurs** (ex. `obj and obj.attr`).

### De Morgan (réécriture logique)
```
# not (A or B) == (not A) and (not B)
# not (A and B) == (not A) or (not B)
```

---

## 💡 Astuces de pro
- Préférez `for elem in seq` à `for i in range(len(seq))` (plus **pythonic**).  
- Utilisez `enumerate(seq, start=1)` pour avoir l’**index humain** (à partir de 1).  
- `for … else` pour le **cas « non trouvé »** (recherche, validation).  
- Écrivez des conditions **lisibles** (évitez les négations imbriquées).  
- Commentez le **pourquoi** d’une condition complexe.

---

## 🧪🧮 Mini‑formules (en Python)

### Plage inclusive
```
# de a à b inclus
for i in range(a, b + 1):
    ...
```

### Compter occurrences avec condition
```
# nombre de valeurs > seuil
count = sum(1 for x in xs if x > seuil)
```

### Any / All (tests de groupe)
```
# au moins un vrai
if any(x > 0 for x in xs):
    ...
# tous vrais
if all(x >= 0 for x in xs):
    ...
```

---

## 🧩 Exercices (avec indications)

1. **Validation d’entrée** : lire un entier positif via `input` et **re‑demander** tant que la valeur n’est pas valide.  
   *Indications :* boucle `while`, `try/except` (chap. 7), condition `> 0`.

2. **Recherche dans une liste** : écrire une fonction qui renvoie l’index du premier élément égal à `x` ou `-1` si non trouvé.  
   *Indications :* boucle `for`, `break`, `else`.

3. **Parcours parallèle** : afficher `nom: note` pour deux listes de même longueur.  
   *Indications :* `zip`, gestion de longueurs éventuelles.

4. **Filtre multi‑conditions** : garder les chaînes **non vides** et d’au moins **3** caractères, sans espaces superflus.  
   *Indications :* `strip`, `if`, compréhension de liste.

5. **Compteur de segments** : compter le nombre de mots dans une phrase séparée par espaces multiples.  
   *Indications :* itération sur `split()`, `any/all` pour tests de groupe.

---

## 🧭 Récap — À retenir absolument
- **`if/elif/else`** pour **décider**; combinez comparaisons et logique (`and/or/not`).  
- La **truthiness** transforme les objets vides en **faux** — pratique pour tests rapides.  
- **`for`** parcourt un itérable; **`while`** répète sous condition.  
- `break` sort, `continue` saute, **`else`** s’exécute si **aucun `break`**.  
- Évitez les **boucles infinies** et la **modification** en cours d’itération.

---

## ✅ Checklist de compétence
- [ ] Je sais écrire des **conditions** claires avec `if/elif/else`.  
- [ ] Je maîtrise les **opérateurs** de comparaison et `and/or/not`.  
- [ ] Je comprends la **truthiness** des objets Python.  
- [ ] J’utilise `for`, `while`, `break`, `continue`, `else`.  
- [ ] Je connais `range`, `enumerate`, `zip` pour des boucles propres.

---

## 🧪 Mini‑quiz

1) `A and B` évalue `B` :  
   a) toujours  
   b) seulement si `A` est vrai  
   c) seulement si `A` est faux

2) Le `else` d’une boucle `for` s’exécute :  
   a) toujours  
   b) seulement si un `break` a eu lieu  
   c) seulement si **aucun `break`** n’a eu lieu

3) `[]` en condition `if` est évalué à :  
   a) `True`  
   b) `False`

*Réponses attendues :* 1) b  2) c  3) b

---

> [!NOTE]
> Prochain chapitre : **Structures de données — list, tuple, dict, set** : nous aborderons mutabilité, méthodes clés et pièges de copie.
