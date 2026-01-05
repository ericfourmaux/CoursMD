
# 📘 Chapitre 1.1 — Types & Variables (valeur vs référence)

> **Niveau** : Débutant — **Objectif** : comprendre le système de types de C#, déclarer des variables correctement, distinguer les **types valeur** des **types référence**, et éviter les pièges courants (immutabilité des `string`, conversions, culture/format).

---

## 🎯 Objectifs d’apprentissage
- Reconnaître les principaux **types primitifs** (`int`, `double`, `bool`, `char`) et les **types usuels** (`string`, `DateTime`, `decimal`).
- Comprendre la différence fondamentale **types valeur** (stockés principalement sur la stack, copiés par valeur) vs **types référence** (pointeurs vers heap, partagent la même instance).
- Manipuler les **conversions** (implicites, explicites, `TryParse`), et le **formatage** (culture, `InvariantCulture`).
- Utiliser `var` intelligemment (inférence **locale**, pas dynamique), et choisir les types selon le **domaine** (ex. `decimal` pour monnaie).
- Éviter les **boxing/unboxing** involontaires, et comprendre l’**immutabilité** de `string`.

---

## 🧠 Concepts clés

### 🔤 Système de types C#
- **Type** : définit **structure** et **comportement** des valeurs (taille, opérations autorisées). Ex : `int` est un entier 32 bits signé.
- **Type valeur** : `struct`, `enum` — copie **par valeur**, allocation fréquente sur la **stack**.
- **Type référence** : `class`, `string`, `array` — variables stockent une **référence** vers une instance sur le **heap**.
- **Immutabilité** : `string` ne peut pas être modifiée en place → toute opération crée une **nouvelle** instance.

### 🧭 Pourquoi c’est important
- Comprendre **copie vs partage** d’objets évite des bugs subtils (mutations inattendues).
- Choisir le type correct améliore **précision** (ex. `decimal` pour €/$), **performance** (moins d’allocations), et **lisibilité**.

### 🧩 Analogie
- **Types valeur** : comme des **post-it** que tu dupliques (chaque copie est indépendante).
- **Types référence** : comme des **plans d’une maison** : plusieurs personnes tiennent une **copie du plan** (référence), mais la **maison unique** peut être modifiée et tous voient le changement.

---

## 💡 Exemples concrets (C#)

```csharp
// Déclarations et initialisations
int age = 30;                 // type valeur
double temperature = 21.5;    // type valeur
bool isActive = true;         // type valeur
char initiale = 'E';          // type valeur

string nom = "Eric";          // type référence (immutable)
DateTime maintenant = DateTime.Now; // type valeur (struct)
decimal prix = 19.99m;        // préférer decimal pour monnaie

// Inférence locale avec var (type fixé à la compilation)
var compteur = 0;             // compteur est int
var message = "Bonjour";      // message est string

// Conversion explicite et TryParse
string input = "42";
int valeur;
bool ok = int.TryParse(input, out valeur); // pas d'exception si input invalide

// Immutabilité des string
string s = "abc";
s += "def"; // crée une NOUVELLE string "abcdef"

// Piège : comparer des strings avec options culturelles
bool egaux = string.Equals("café", "CAFE", StringComparison.InvariantCultureIgnoreCase);
```

---

## 🧱 Schéma ASCII — Stack vs Heap

```
+---------------------+             +-------------------------------+
|       STACK         |             |              HEAP             |
+---------------------+             +-------------------------------+
| age: 30 (int)       |             | [obj#1] string "Eric"         |
| prix: 19.99m        |  ----->     | [obj#2] string "Bonjour"       |
| message: ref ------ |------------>| [obj#3] class Client { ... }   |
| client: ref ------- |------------>|                                 |
+---------------------+             +-------------------------------+
```

- Sur la **stack** : valeurs **directes** (`int`, `decimal`, `DateTime`).  
- Sur le **heap** : **instances** des classes/`string`/tableaux; les variables stack contiennent des **références**.

---

## 🔧 Exercices guidés
1. **Types appropriés** : choisis les types pour ces données → (nom, âge, prix, date de commande, statut actif).  
2. **Conversions sûres** : écris une fonction qui lit une string utilisateur et retourne un `int?` (nullable) avec `TryParse`.  
3. **Immutabilité** : concatène 1000 fragments de texte; compare `+` vs `StringBuilder`.

```csharp
// 2) Conversion sûre
int? LireEntier(string s)
{
    if (int.TryParse(s, out var n)) return n;
    return null;
}

// 3) StringBuilder pour éviter les allocations
var sb = new System.Text.StringBuilder();
for (int i = 0; i < 1000; i++) sb.Append("x");
string resultat = sb.ToString();
```

---

## 🧪 Tests / Vérifications
- Vérifie que `LireEntier("abc")` retourne `null`.  
- Mesure le temps de concaténation `+` vs `StringBuilder` avec `System.Diagnostics.Stopwatch`.

```csharp
var sw = new System.Diagnostics.Stopwatch();
sw.Start();
string t = "";
for (int i = 0; i < 10000; i++) t += "x"; // très coûteux
sw.Stop();
Console.WriteLine($"+ : {sw.ElapsedMilliseconds} ms");
```

---

## ⚠️ Pièges fréquents
- Utiliser `float/double` pour **monnaie** → erreurs d’arrondi cumulées. Préférer `decimal`.
- Croire que `var` est **dynamique** : non, le type est déterminé à la **compilation**.
- Oublier l’**immutabilité** des strings et créer trop d’objets.
- Ignorer la **culture** (`InvariantCulture`) pour les conversions et formats.

---

## 🧮 Formules (en JavaScript)
- **Indice de masse corporelle (IMC)** : `const bmi = weight / (height * height);`  
- **Arrondi** : `const rounded = Math.round(value * 100) / 100;`

---

## 📌 Résumé essentiel
- Les **types valeur** sont copiés, les **références** pointent vers des instances partagées.
- `string` est **immutable** : utilise `StringBuilder` pour des concaténations massives.
- Choisis le **type** selon le **domaine** (ex. `decimal` pour monnaie).  
- Utilise `TryParse` pour des **entrées robustes** et **InvariantCulture** pour des formats prévisibles.
