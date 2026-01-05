
# 📘 Chapitre 2.3 — Génériques & Collections

> **Niveau** : Débutant → Intermédiaire — **Objectif** : comprendre les **génériques** (`T`) et maîtriser les **collections** de .NET (`List<T>`, `Dictionary<TKey,TValue>`, `HashSet<T>`, `Queue<T>`, `Stack<T>`, etc.), leurs **contraintes**, **performances** et **usages**. Écrire des API **fortement typées**, **réutilisables** et **sûres** sans boxing.

---

## 🎯 Objectifs d’apprentissage
- Déclarer des **types/méthodes** génériques (`class Box<T>`, `T Method<T>(...)`).
- Utiliser des **contraintes** : `where T : class/struct/notnull/unmanaged/new()/IComparable<T>`.
- Choisir la **collection** adaptée : `List<T>` (liste), `Dictionary<TKey,TValue>` (map), `HashSet<T>` (ensemble), `Queue<T>` (FIFO), `Stack<T>` (LIFO), `LinkedList<T>` (liste chaînée).
- Comprendre les **complexités** communes (ajout, recherche, suppression) et les implications mémoire.
- Éviter le **boxing** (non-génériques) et maîtriser `IEnumerable<T>` vs `IReadOnlyList<T>`.

---

## 🧠 Concepts clés

### 🧩 Définition — Génériques
- **Générique** = paramètre de type (`T`) qui rend le code **typiquement sûr** et **réutilisable**.  
- **Avantages** : pas de **casting** à l’exécution, pas de **boxing** pour types valeur, **intellisense**/compilation plus fiables.

### 🔐 Contraintes
- `where T : class` (type référence), `struct` (type valeur), `notnull`, `unmanaged` (types valeur non managés), `new()` (constructible sans param.), `SomeInterface`, `BaseClass`.  
- **But** : **borner** les types autorisés pour **garantir** que certaines opérations sont possibles.

### 🧺 Collections
- **Interfaces clés** : `IEnumerable<T>` (itérable), `ICollection<T>` (ajout/retrait, `Count`), `IList<T>` (indexable), `IReadOnlyCollection<T>`, `IReadOnlyList<T>`.  
- **Non génériques (legacy)** : `ArrayList`, `Hashtable` → **à éviter** (boxing/casts).

### 🧭 Pourquoi c’est important
- Des API génériques **flexibles** → moins de duplication, plus de **typage fort** et de **performance**.
- Le bon choix de collection **simplifie** le code et **améliore** les temps d’exécution.

### 🧩 Analogie
- Les **génériques** sont comme des **moules ajustables** : tu fabriques des boîtes de différentes tailles (`Box<int>`, `Box<string>`) avec le **même plan**.

---

## 💡 Exemples C# — génériques

### 1) Classe générique simple
```csharp
public class Box<T>
{
    public T Value { get; }
    public Box(T value) => Value = value;
}

var ibox = new Box<int>(42);
var sbox = new Box<string>("Hello");
```

### 2) Méthode générique + contrainte
```csharp
public static class MathUtils
{
    // max générique (contrainte: comparable)
    public static T Max<T>(T a, T b) where T : IComparable<T>
        => a.CompareTo(b) >= 0 ? a : b;
}

var m1 = MathUtils.Max(10, 7);            // int
var m2 = MathUtils.Max("abc", "abd");     // string
```

### 3) Factory générique
```csharp
public static class Factory
{
    public static T Create<T>() where T : new() => new T();
}

var o = Factory.Create<System.Text.StringBuilder>();
```

### 4) Méthodes d’extension génériques
```csharp
public static class EnumerableExtensions
{
    public static void AddRange<T>(this ICollection<T> target, IEnumerable<T> items)
    {
        foreach (var x in items) target.Add(x);
    }
}

var list = new List<int>();
list.AddRange(new[] {1,2,3});
```

---

## 💼 Collections — usages & performances

### 1) `List<T>`
- **Type** : tableau dynamique (contigu).  
- **Complexité** : `Add` amorti **O(1)** (réallocation parfois), `IndexOf` **O(n)**, accès par index **O(1)**, `Insert` milieu **O(n)**.
- **Usages** : liste ordonnée, accès indexé, parcours rapide.

### 2) `Dictionary<TKey,TValue>`
- **Type** : table de hachage.  
- **Complexité** : `Add`/`TryGetValue` **O(1)** amorti, dépend du **hash** et **capacity**.  
- **Usages** : map clé→valeur; personnaliser égalité via `IEqualityComparer<TKey>`.

### 3) `HashSet<T>`
- **Type** : ensemble, **unicité** des éléments.  
- **Complexité** : `Add`/`Contains` **O(1)** amorti.  
- **Usages** : filtrer doublons, opérations ensemblistes (`UnionWith`, `IntersectWith`).

### 4) `Queue<T>` (FIFO) & `Stack<T>` (LIFO)
- **Type** : structures de file/pile.  
- **Complexité** : `Enqueue/Dequeue` / `Push/Pop` **O(1)**.  
- **Usages** : traitement séquentiel, parcours, algorithmes.

### 5) `LinkedList<T>`
- **Type** : liste doublement chaînée.  
- **Complexité** : insertion suppression au **milieu** **O(1)** (via nœuds), mais **parcours** **O(n)** et **cache** moins efficace.  
- **Usages** : insertions fréquentes au milieu, peu d’accès indexés.

---

## 🧱 Schémas ASCII

### A) Choisir sa collection
```
Problème →
  ├─ Clé→Valeur ? → Dictionary<TKey,TValue>
  ├─ Unicité ? → HashSet<T>
  ├─ Ordre + index ? → List<T>
  ├─ FIFO ? → Queue<T>
  ├─ LIFO ? → Stack<T>
  └─ Insertions internes fréquentes ? → LinkedList<T>
```

### B) Réallocation d’une List
```
Capacity: 4 → Add 5e élément → nouvelle allocation (×2), copie, puis ajout
```

### C) Table de hachage (simplifiée)
```
key ── hash(key) ──▶ index = hash % capacity ──▶ bucket
```

---

## 🧪 Comparaison non-génériques vs génériques

```csharp
// Non générique: boxing + cast
var arr = new System.Collections.ArrayList();
arr.Add(42);      // boxing de int
int a = (int)arr[0]; // cast à l'exécution

// Générique: pas de boxing
var list = new List<int>();
list.Add(42);
int b = list[0]; // sûr à la compilation
```

---

## 🔧 Exercices guidés
1. **Cache** : implémente `Cache<TKey,TValue>` avec `Dictionary<TKey,TValue>`, méthodes `AddOrUpdate`, `TryGet`, limite de **capacity** (retirer le plus ancien via `Queue<TKey>`).  
2. **Set ops** : écris une fonction qui calcule `Union`, `Intersection`, `Difference` sur deux `HashSet<int>`.  
3. **Comparer** : crée un `Dictionary<string,int>` avec un comparateur **insensible à la casse** (`StringComparer.OrdinalIgnoreCase`).

```csharp
public class Cache<TKey,TValue>
{
    private readonly int _capacity;
    private readonly Dictionary<TKey,TValue> _dict = new();
    private readonly Queue<TKey> _order = new();

    public Cache(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        _capacity = capacity;
    }

    public void AddOrUpdate(TKey key, TValue value)
    {
        if (!_dict.ContainsKey(key))
        {
            _order.Enqueue(key);
            if (_dict.Count >= _capacity)
            {
                var oldest = _order.Dequeue();
                _dict.Remove(oldest);
            }
        }
        _dict[key] = value;
    }

    public bool TryGet(TKey key, out TValue value) => _dict.TryGetValue(key, out value!);
}
```

---

## 🧪 Tests / Vérifications
```csharp
// 1) Cache
var cache = new Cache<string,int>(2);
cache.AddOrUpdate("a", 1);
cache.AddOrUpdate("b", 2);
cache.AddOrUpdate("c", 3); // "a" éjecté
Console.WriteLine(cache.TryGet("a", out _) == false);
Console.WriteLine(cache.TryGet("c", out var v) && v == 3);

// 2) Sets
var A = new HashSet<int> {1,2,3};
var B = new HashSet<int> {3,4};
var U = new HashSet<int>(A); U.UnionWith(B);
var I = new HashSet<int>(A); I.IntersectWith(B);
var D = new HashSet<int>(A); D.ExceptWith(B);
Console.WriteLine(string.Join(",", U)); // 1,2,3,4
Console.WriteLine(string.Join(",", I)); // 3
Console.WriteLine(string.Join(",", D)); // 1,2

// 3) Comparateur
var dict = new Dictionary<string,int>(StringComparer.OrdinalIgnoreCase)
{ ["Eric"] = 1 };
Console.WriteLine(dict.ContainsKey("ERIC")); // true
```

---

## ⚠️ Pièges fréquents
- **Modifier** une collection **pendant** une **itération** (`foreach`) → `InvalidOperationException`.  
- Supposer l’**ordre** des éléments dans `HashSet<T>` / `Dictionary<TKey,TValue>` → **non garanti**.  
- Utiliser `List<T>.Contains` pour grandes listes au lieu d’un `HashSet<T>` → **O(n)** vs **O(1)**.  
- Ignorer `IEqualityComparer<T>` : égalités inattendues (ex. casse, culture).  
- Utiliser des **non-génériques** (boxing/casts) → performances et erreurs.

---

## 🧮 Formules (en JavaScript)

### A) Complexités (modélisation simple)
```javascript
// Temps théorique (unités arbitraires)
const O1 = (n) => 1;
const Ologn = (n) => Math.log2(Math.max(1, n));
const On = (n) => n;
const Onlogn = (n) => n * Math.log2(Math.max(1, n));
```

### B) Indice de bucket (hash simplifié)
```javascript
const bucketIndex = (hash, capacity) => hash % capacity;
```

### C) Réallocation (coût amorti)
```javascript
const amortizedAddCost = (n, growthFactor = 2) => {
  // Approximatif : un coût constant + rares copies en O(n) lors des réallocations
  return 1 + Math.log2(Math.max(1, n)) / Math.log2(growthFactor);
};
```

---

## 📌 Résumé essentiel
- Les **génériques** fournissent un **typage fort** et évitent **boxing/casts** → **performance** + **sécurité**.  
- Choisis la **collection** selon le besoin (clé/valeur, unicité, ordre, FIFO/LIFO, insertions internes).  
- Connais les **complexités** pour raisonner: `List<T>` (index O(1), insertion milieu O(n)), `Dictionary`/`HashSet` (O(1) amorti), `Queue/Stack` (O(1)).  
- Applique des **contraintes** pour sécuriser les **méthodes génériques** (`where T : ...`).  
- Utilise des **comparateurs** et évite les **non-génériques** pour garder un code **propre et performant**.
