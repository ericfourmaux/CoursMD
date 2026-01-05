
# 📘 Chapitre 1.2 — Opérateurs & Expressions

> **Niveau** : Débutant — **Objectif** : maîtriser les opérateurs arithmétiques, logiques, de comparaison, ainsi que le **null-coalescing** `??`, le **null-conditional** `?.`, la priorité des opérateurs et l’écriture d’expressions sûres.

---

## 🎯 Objectifs d’apprentissage
- Utiliser correctement `+ - * / %`, `&& || !`, `== != < > <= >=`.
- Comprendre **priorité** et **associativité** des opérateurs; utiliser les parenthèses pour clarifier.
- Gérer les valeurs **null** avec `??` et `?.` pour éviter des exceptions (`NullReferenceException`).
- Découvrir `checked/unchecked` pour contrôler les **débordements**.

---

## 🧠 Concepts clés

### ➕ Arithmétique & division
- `int / int` effectue une **division entière** (troncature).  
- `double / double` ou `decimal / decimal` pour des divisions **réelles**.

### 🔗 Logique booléenne
- `&&` (ET), `||` (OU) sont **évalués paresseusement** (short-circuit).

### ❓ Null-coalescing et null-conditional
- `a ?? b` : si `a` est `null`, retourne `b`.  
- `a?.Prop` : si `a` est `null`, retourne `null` sans lever d’exception.

### 🧭 Pourquoi c’est important
- Écrire des expressions **précises** et **sûres** évite des bugs (division entière involontaire, nulls non gérés, débordements).

### 🧩 Analogie
- Les opérateurs sont comme des **outils** dans une boîte : l’outil adéquat pour la **bonne tâche**; la **priorité** est l’**ordre d’assemblage** sur une chaîne.

---

## 💡 Exemples (C#)

```csharp
// Division entière vs réelle
int a = 7, b = 2;
int divEntiere = a / b;    // 3
double divReelle = (double)a / b; // 3.5

// Modulo
int reste = 7 % 2; // 1

// Logique (short-circuit)
string s = null;
bool estNonVide = (s != null) && (s.Length > 0); // la 2e condition n'est pas évaluée si s == null

// Null-conditional et coalescing
int? longueur = s?.Length;           // null
int longueurOuZero = s?.Length ?? 0;  // 0

// Comparaisons
bool ok = "abc" == "abc"; // true

// checked pour détecter débordements
checked
{
    int max = int.MaxValue;
    // int x = max + 1; // OverflowException
}
```

---

## 🧱 Schéma ASCII — Priorité des opérateurs

```
Ordre (du plus prioritaire au moins prioritaire):
1. ()  parenthèses
2. ++ -- (préfixe), !, ~, cast
3. *  /  %
4. +  -
5. << >>
6. < > <= >=
7. == !=
8. &
9. ^
10. |
11. &&
12. ||
13. ?? (null-coalescing)
14. ?: (ternaire)
15. =, +=, -=, *=, /=, ...
```

---

## 🔧 Exercices guidés
1. Écris une fonction qui calcule une **moyenne** sûre (ignore `null` et divisions par zéro).  
2. Utilise `??` pour fournir une valeur **par défaut** pour un paramètre facultatif.

```csharp
// 1) Moyenne sûre
double MoyenneSecurisee(params double?[] valeurs)
{
    double somme = 0; int n = 0;
    foreach (var v in valeurs)
    {
        if (v.HasValue) { somme += v.Value; n++; }
    }
    return n == 0 ? 0.0 : somme / n; // éviter division par zéro
}

// 2) Valeur par défaut
int TailleListe(List<int> liste) => (liste?.Count ?? 0);
```

---

## 🧪 Tests / Vérifications
- Vérifie que `MoyenneSecurisee(1.0, null, 3.0)` retourne `2.0`.
- Teste que `TailleListe(null)` retourne `0` (pas d’exception).

---

## ⚠️ Pièges fréquents
- Oublier les **parenthèses** et se tromper de **priorité**.
- `int / int` → résultat entier, pas de décimales.
- Utiliser `==` pour comparer des **références** au lieu des **valeurs** (cas des objets).  
- Ignorer `checked` et dépasser silencieusement la capacité d’un entier.

---

## 🧮 Formules (en JavaScript)
- **Moyenne** : `const mean = arr.reduce((s,x)=>s+x,0) / arr.length;`  
- **Taux de croissance** : `const growth = (final - initial) / initial;`

---

## 📌 Résumé essentiel
- Maîtrise des opérateurs = expressions **précises** et **robustes**.
- `??` et `?.` simplifient la gestion des **null**.
- Toujours **clarifier** avec des parenthèses pour éviter des surprises.
