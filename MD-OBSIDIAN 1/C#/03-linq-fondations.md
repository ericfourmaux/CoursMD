
# 📘 Chapitre 3.1 — LINQ fondations

> **Niveau** : Débutant → Intermédiaire — **Objectif** : apprendre à manipuler des données **en mémoire** (LINQ to Objects) avec des **requêtes déclaratives** (syntaxe méthode et requête), comprendre l’**exécution différée**, les **opérateurs fondamentaux** (`Select`, `Where`, `OrderBy`, `GroupBy`, `Join`, `Distinct`, `Take/Skip`, `Aggregate`, etc.), et éviter les **pièges** (ré-énumération, effets de bord, `IEnumerable<T>` vs `IQueryable<T>`).

---

## 🎯 Objectifs d’apprentissage
- Écrire des **requêtes LINQ** en **syntaxe méthode** et **syntaxe requête** (équivalences).  
- Comprendre **exécution différée** vs **matérialisation** (`ToList`, `ToArray`, `ToDictionary`).  
- Manipuler les opérateurs clés : **projection** (`Select`), **filtre** (`Where`), **tri** (`OrderBy/ThenBy`), **groupes** (`GroupBy`), **jointures** (`Join`, `GroupJoin`), **agrégations** (`Count`, `Sum`, `Average`, `Min`, `Max`).  
- Connaître la différence conceptuelle **`IEnumerable<T>`** vs **`IQueryable<T>`** (aperçu).  
- Éviter les **effets de bord** et les **ré-énumérations** coûteuses.

---

## 🧠 Concepts clés

### 🔤 LINQ = Language Integrated Query
- **Définition** : un **ensemble d’opérateurs** standardisés pour interroger **collections** et **séquences** de données en C# de façon **déclarative**.
- Deux **syntaxes** équivalentes :
  - **Méthode** : `source.Where(x => x > 0).Select(x => x * 2)`.
  - **Requête** : `from x in source where x > 0 select x * 2`.

### ⏳ Exécution différée
- La plupart des opérateurs LINQ **ne s’exécutent pas immédiatement** : ils construisent une **pipeline**; l’exécution **a lieu** quand on **itère** (`foreach`) ou **matérialise** (`ToList()`).
- Les opérateurs **terminaux** (agrégations : `Count`, `Sum`, …) déclenchent l’évaluation.

### 📦 `IEnumerable<T>` vs `IQueryable<T>` (aperçu)
- **`IEnumerable<T>`** : **LINQ to Objects** — tout s’exécute **en mémoire** dans .NET.  
- **`IQueryable<T>`** : **LINQ provider** (ex. EF Core) — la requête peut être **traduite** (SQL, OData, …). Certains opérateurs **ne sont pas traduisibles** → attention aux **exceptions** ou au **basculage en mémoire**.

### 🧭 Pourquoi c’est important
- LINQ **simplifie** le code, réduit le **boilerplate** et rend les intentions **claires** (filtrer, projeter, grouper, joindre).  
- Bien comprendre la **différence** entre **construction** et **exécution** évite des **surprises** de performance et de logique.

### 🧩 Analogie
- **Pipeline d’eau** : tu construis des **segments** (filtres, transformations, tri). L’eau (les données) ne **circule** qu’au moment où tu **ouvres le robinet** (itération ou agrégation).

---

## 💡 Données d’exemple (C#)

```csharp
public record Product(int Id, string Name, string Category, decimal Price);
public record Order(int Id, int ProductId, string Customer, DateTime Date, int Quantity);

var products = new List<Product>
{
    new(1, "Laptop Pro", "Hardware", 1599m),
    new(2, "Laptop Air", "Hardware", 1099m),
    new(3, "Mouse", "Accessories", 29.9m),
    new(4, "Keyboard", "Accessories", 79.0m),
    new(5, "Cloud Subscription", "Software", 19.0m)
};

var orders = new List<Order>
{
    new(1, 1, "Eric", new DateTime(2025, 1, 10), 1),
    new(2, 3, "Alice", new DateTime(2025, 1, 12), 2),
    new(3, 5, "Bob",   new DateTime(2025, 1, 15), 12),
    new(4, 2, "Eric",  new DateTime(2025, 2,  2), 1),
    new(5, 4, "Alice", new DateTime(2025, 2,  3), 1)
};
```

---

## 🧪 Opérateurs fondamentaux

### 1) Filtrer — `Where`
```csharp
var accessories = products.Where(p => p.Category == "Accessories");
// exécution différée: rien ne se passe tant qu'on n'itère pas
foreach (var p in accessories)
    Console.WriteLine(p.Name);
```

### 2) Projeter — `Select`
```csharp
var names = products.Select(p => p.Name); // IEnumerable<string>
```

### 3) Trier — `OrderBy/ThenBy`
```csharp
var ordered = products
    .OrderBy(p => p.Category)
    .ThenBy(p => p.Price);
```

### 4) Éviter doubles — `Distinct`
```csharp
var categories = products.Select(p => p.Category).Distinct();
```

### 5) Limiter — `Take/Skip`
```csharp
var top2Expensive = products
    .OrderByDescending(p => p.Price)
    .Take(2);
```

### 6) Agréger — `Count/Sum/Average/Min/Max`
```csharp
int countHardware = products.Count(p => p.Category == "Hardware");
decimal totalRevenue = orders.Join(products, o => o.ProductId, p => p.Id, (o, p) => p.Price * o.Quantity)
                             .Sum();
double avgPrice = products.Average(p => (double)p.Price);
```

### 7) Grouper — `GroupBy`
```csharp
var byCategory = products.GroupBy(p => p.Category);
foreach (var grp in byCategory)
{
    Console.WriteLine($"Catégorie: {grp.Key} (items={grp.Count()})");
    foreach (var p in grp)
        Console.WriteLine("  - " + p.Name);
}
```

### 8) Joindre — `Join` (inner join)
```csharp
var orderLines = orders.Join(
    products,
    o => o.ProductId,
    p => p.Id,
    (o, p) => new { o.Id, p.Name, o.Customer, o.Quantity, p.Price, Total = p.Price * o.Quantity }
);
```

### 9) `GroupJoin` + `DefaultIfEmpty` (Left join simplifié)
```csharp
var leftJoin = products.GroupJoin(
    orders,
    p => p.Id,
    o => o.ProductId,
    (p, os) => new { Product = p, Orders = os.DefaultIfEmpty() }
);
```

### 10) Sélecteurs booléens — `Any/All/Contains`
```csharp
bool hasCheap = products.Any(p => p.Price < 30m);
bool allNamed = products.All(p => !string.IsNullOrWhiteSpace(p.Name));
bool containsMouse = products.Select(p => p.Name).Contains("Mouse");
```

### 11) Sélection unique — `First/FirstOrDefault`, `Single/SingleOrDefault`
```csharp
var firstAccessory = products.FirstOrDefault(p => p.Category == "Accessories"); // peut être null
var singleLaptopPro = products.Single(p => p.Name == "Laptop Pro");              // lève si 0 ou >1
```

### 12) Matérialiser — `ToList/ToArray/ToDictionary`
```csharp
var expensiveList = products.Where(p => p.Price > 100m).ToList();
var byId = products.ToDictionary(p => p.Id);
```

---

## ⏳ Démonstration — Exécution différée

```csharp
var query = products.Where(p => p.Price > 100m);
products.Add(new Product(6, "Monitor", "Hardware", 299m));
// La nouvelle entrée est prise en compte au moment de l'itération
Console.WriteLine(query.Count()); // inclut "Monitor"

// Comparer avec matérialisation immédiate
var snapshot = products.Where(p => p.Price > 100m).ToList();
products.Add(new Product(7, "Dock", "Accessories", 129m));
Console.WriteLine(snapshot.Count); // n'inclut pas "Dock"
```

---

## 🧱 Schémas ASCII

### A) Pipeline LINQ (méthode)
```
source
  .Where( predicate )
  .Select( projection )
  .OrderBy( key )
  .Take( n )
   └──▶ itération / ToList() déclenchent l'exécution
```

### B) `IEnumerable<T>` vs `IQueryable<T>` (idée)
```
IEnumerable<T> (in-memory)           IQueryable<T> (provider)
┌──────────────┐                     ┌────────────────────────┐
│ .NET exécute │                     │ Traduit en requête     │
│ le code C#   │                     │ (ex: SQL pour EF Core) │
└──────────────┘                     └────────────────────────┘
```

---

## 🔧 Exercices guidés
1. **Top clients** : calcule le **top 2** clients par **montant total** commandé (avec `Join` + `GroupBy` + `OrderByDescending`).  
2. **Panier moyen** : calcule le **prix moyen** par **catégorie** (`GroupBy` + `Average`).  
3. **Pagination** : renvoie la page *k* de taille *n* (`OrderBy` + `Skip(n*(k-1))` + `Take(n)`).

```csharp
// 1) Top clients
var clientTotals = orders.Join(products, o => o.ProductId, p => p.Id, (o,p) => new { o.Customer, Total = p.Price * o.Quantity })
                         .GroupBy(x => x.Customer)
                         .Select(g => new { Customer = g.Key, Total = g.Sum(x => x.Total) })
                         .OrderByDescending(x => x.Total)
                         .Take(2)
                         .ToList();

// 2) Panier moyen par catégorie
var avgByCategory = products.GroupBy(p => p.Category)
                            .Select(g => new { Category = g.Key, Avg = g.Average(p => p.Price) })
                            .ToList();

// 3) Pagination générique
IEnumerable<T> Page<T>(IEnumerable<T> source, int pageIndex1Based, int pageSize)
{
    return source.Skip((pageIndex1Based - 1) * pageSize).Take(pageSize);
}
```

---

## 🧪 Tests / Vérifications
```csharp
// Vérifier qu'il y a au moins une commande
Console.WriteLine(orders.Any());

// Total revenu > 0
var totalRevenue = orders.Join(products, o => o.ProductId, p => p.Id, (o, p) => p.Price * o.Quantity).Sum();
Console.WriteLine(totalRevenue > 0);

// La pagination retourne la taille attendue
var page = Page(products.OrderBy(p => p.Id), 1, 2).ToList();
Console.WriteLine(page.Count == 2);
```

---

## ⚠️ Pièges fréquents
- **Ré-énumération** : appeler plusieurs fois `Count()`, `ToList()` sur la **même requête** peut **réexécuter** le pipeline → **cache** les résultats si nécessaire.  
- **Effets de bord** dans `Select/Where` : éviter les `Console.WriteLine` ou mutations; LINQ doit rester **déclaratif**.  
- **`Single` vs `First`** : `Single` lève si 0 ou >1; utiliser `FirstOrDefault` pour **tolérer** absence.  
- **Tri coûteux** : `OrderBy` peut être **cher** sur grandes séquences; limiter via `Take` ou trier tardivement.  
- **`IQueryable<T>`** : certains opérateurs **ne sont pas traduisibles** (ex. méthodes custom) → **évaluer en mémoire** (`AsEnumerable()`) si nécessaire (aperçu; détails en module EF Core).

---

## 🧮 Formules (en JavaScript)
- **Moyenne** : `const average = arr.reduce((s,x)=>s+x,0) / arr.length;`  
- **Somme pondérée** : `const sumWeighted = arr.reduce((s,{v,w})=>s+v*w,0);`  
- **Pagination (indices 1-based)** :
```javascript
const page = (arr, k, n) => arr.slice((k-1)*n, (k-1)*n + n);
```

---

## 📌 Résumé essentiel
- LINQ propose un **pipeline déclaratif** pour filtrer/projeter/joindre/agréger des **séquences**.  
- La plupart des opérateurs sont **différés** : l’exécution a lieu à l’**itération** ou à la **matérialisation**.  
- Connais les opérateurs de base (`Where`, `Select`, `OrderBy`, `GroupBy`, `Join`, agrégations) et leurs **équivalents** en syntaxe requête.  
- Fais attention aux **ré-énumérations** et aux **effets de bord** dans les sélecteurs.  
- **`IEnumerable<T>`** (in-memory) ≠ **`IQueryable<T>`** (provider) : certains opérateurs peuvent être **traduisibles** ou non.
