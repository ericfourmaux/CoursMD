
# 📘 Chapitre 1.4 — Méthodes & Portée

> **Niveau** : Débutant — **Objectif** : définir des méthodes claires, comprendre la **portée** des variables, les modificateurs (`static`, `readonly`), les paramètres (`in/out/ref`), la **surcharge** et les **méthodes d’extension**.

---

## 🎯 Objectifs d’apprentissage
- Écrire des **signatures** de méthodes propres (nommage, paramètres, valeur de retour).
- Comprendre la **portée** (bloc, méthode, classe, namespace) et l’**ombrage**.
- Utiliser `ref`, `out`, `in` lorsque c’est **justifié**.
- Créer des **méthodes d’extension** pour enrichir des types.

---

## 🧠 Concepts clés

### 🔧 Méthode
- **Définition** : un **bloc** de code nommé qui prend des **paramètres** et retourne **une valeur** ou `void`.
- **Surcharge** : mêmes noms, **paramètres différents**.
- **Extension** : méthode **statique** dans une **classe statique** avec le premier paramètre précédé de `this`.

### 📍 Portée
- Variables **locales** : visibles **dans le bloc** `{ ... }` où elles sont déclarées.
- Membres **de classe** : visibles via l’instance ou statiquement (`static`).
- **Masquage** : une variable locale peut **masquer** un champ.

### 🧭 Pourquoi c’est important
- Des méthodes bien conçues **réduisent la complexité**, améliorent la **réutilisabilité** et la **testabilité**.

### 🧩 Analogie
- Une méthode est comme une **recette** : ingrédients (paramètres), étapes (corps), plat servi (valeur de retour).

---

## 💡 Exemples (C#)

```csharp
// Surcharges
int Add(int a, int b) => a + b;
double Add(double a, double b) => a + b;

// Paramètres ref/out/in
void Increment(ref int x) { x++; }
bool TryDivide(double a, double b, out double result)
{
    if (b == 0) { result = 0; return false; }
    result = a / b; return true;
}
void ReadOnlyOp(in int x)
{
    // x est en lecture seule dans cette méthode
    Console.WriteLine(x);
}

// Méthode d'extension
public static class StringExtensions
{
    public static bool IsNullOrWhiteSpace(this string? s)
        => string.IsNullOrWhiteSpace(s);

    public static string ToSlug(this string s)
        => s.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-");
}

// Utilisation
string titre = "Bonjour Le Monde";
bool vide = titre.IsNullOrWhiteSpace(); // false
string slug = titre.ToSlug();           // "bonjour-le-monde"
```

---

## 🧱 Schéma ASCII — Portée & durée de vie

```
Classe MyClass
{
    int champ = 0;        // portée: MyClass

    void M()
    {
        int local = 1;    // portée: M (entre { })
        {
            int inner = 2; // portée: bloc interne
        }
        // inner n'est plus visible ici
    }
}
```

---

## 🔧 Exercices guidés
1. Écris une surcharge `Add` pour additionner des **collections** (`IEnumerable<int>`).  
2. Crée une **extension** `Capitalize()` pour `string` (majuscule initiale, reste inchangé).

```csharp
// 1) Addition de collections
int Add(System.Collections.Generic.IEnumerable<int> seq)
{
    int s = 0; foreach (var x in seq) s += x; return s;
}

// 2) Extension Capitalize
public static class MoreStringExtensions
{
    public static string Capitalize(this string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        if (char.IsUpper(s[0])) return s;
        return char.ToUpperInvariant(s[0]) + s.Substring(1);
    }
}
```

---

## 🧪 Tests / Vérifications
- `Add(new[]{1,2,3})` retourne `6`.  
- `"bonjour".Capitalize()` retourne `"Bonjour"`.

---

## ⚠️ Pièges fréquents
- Abuser de `ref/out` → augmente le **couplage**, complique la lecture; préférer **retours** clairs.  
- Écrire des méthodes trop **longues** → extraire en **méthodes privées**.
- Méthodes d’extension qui masquent des comportements **métiers** → bien choisir le **nom**.

---

## 🧮 Formules (en JavaScript)
- **Somme** : `const sum = arr.reduce((s,x)=>s+x,0);`

---

## 📌 Résumé essentiel
- Des **méthodes** petites et bien nommées améliorent la **lisibilité** et la **testabilité**.  
- Comprends la **portée** : variables locales ≠ champs.  
- Les **extensions** enrichissent les types sans modifier leur définition.
