
# 📘 Chapitre 6.1 — Mémoire : Stack, Heap & Garbage Collector (GC)

> **Niveau** : Intermédiaire — **Objectif** : comprendre le **modèle mémoire** de .NET (C#), la différence **types valeur** vs **types référence**, le fonctionnement du **Garbage Collector** (générations, LOH/POH, finalizers), et les **pratiques** pour réduire les **allocations**, éviter les **boxing**, et écrire du code **prévisible** et **performant**.

---

## 🎯 Objectifs d’apprentissage
- Distinguer **stack** (pile) et **heap** (tas) : **où** et **comment** les données sont stockées.
- Maîtriser **types valeur** (`struct`, `enum`) vs **types référence** (`class`, `string`, `array`) et **boxing/unboxing**.
- Comprendre le **GC générationnel** : **Gen0/Gen1/Gen2**, **Large Object Heap (LOH)** et **Pinned Object Heap (POH)**.
- Utiliser correctement **finalizers** (`~ClassName`), **`IDisposable`** et `using` / `await using`.
- Tirer parti de **Span<T>**, **ReadOnlySpan<T>**, **stackalloc**, **ArrayPool<T>** pour réduire les **allocations**.
- Diagnostiquer les **allocations** (`GC.GetAllocatedBytesForCurrentThread`), mesurer (`Stopwatch`) et éviter les **anti‑patterns** (`GC.Collect()`, captures lourdes, strings immuables mal gérées).

---

## 🧠 Concepts clés

### 🧩 Stack vs Heap
- **Stack** (pile) : mémoire **LIFO** utilisée pour *frames d’appels* et variables locales **de courte durée**. Accès très rapide.  
- **Heap** (tas managé) : stocke les **instances** des **types référence** et parfois des **types valeur** lorsqu’ils sont **capturés** ou **boxés**.  
- **`struct`** (valeur) : souvent **sur la stack**, **copié** par **valeur**; **peut** vivre sur le heap s’il est **champ** d’un objet ou **capturé**.

### 🔤 Types & immutabilité
- **Type valeur** : `struct`, `enum` — **copié** à l’assignation/passage; utile pour **petites données**.  
- **Type référence** : `class`, `string`, `array` — variables stockent une **référence** vers le **heap**.  
- **`string`** est **immutable** : toute concaténation crée **une nouvelle instance**.

### 📦 Boxing / Unboxing
- **Boxing** : convertir un **type valeur** en **`object`** → **allocation** sur le **heap**.  
- **Unboxing** : conversion inverse, **coût** et **risques** de cast.  
- Éviter en utilisant **génériques** (`List<int>` au lieu de `ArrayList`) et en **restant typé**.

### 🧹 GC générationnel
- **Gen0** : allocations **éphémères**; collecté **fréquemment**.  
- **Gen1** : objets **survivants** de Gen0; collecté **moins souvent**.  
- **Gen2** : objets **longue durée**; collecté **rarement**.  
- **LOH** (*Large Object Heap*) : objets **> ~85 000 bytes** (ex. gros tableaux) — collecté avec **Gen2**.  
- **POH** (*Pinned Object Heap*) : pour **objets épinglés** (interop) afin de réduire la **fragmentation**.

### 🧷 Finalizers & `IDisposable`
- **Finalizer** (`~ClassName`) : appelé par le GC **avant** libération → coûteux, **non déterministe**; utiliser **rarement** (ex. wrapper *non‑managé*).  
- **`IDisposable`** + `using` : **libération déterministe** des **ressources** (fichier, socket, handle). Préférer `SafeHandle` plutôt que des finalizers.

### 🧵 Workstation vs Server GC (aperçu)
- **Workstation** : optimisé pour **applications client**; **latence** plus faible.  
- **Server** : **multi‑thread**, optimisé pour **serveurs** (ASP.NET Core) avec **segments** par **core**.

---

## 💡 Exemples C# — mémoire & GC

### 1) Stack vs Heap
```csharp
struct Point { public int X; public int Y; }
class Node { public int Value; public Node? Next; }

void Demo()
{
    // stack : variables locales
    Point p = new Point { X = 1, Y = 2 }; // type valeur

    // heap : instances de classes
    Node n = new Node { Value = 42, Next = null };

    // capture possible (heap) si retournée ou stockée
    var list = new List<Point> { p }; // copie de p dans un objet (heap)
}
```

### 2) Boxing vs génériques
```csharp
// Mauvais : boxing
var arr = new System.Collections.ArrayList();
arr.Add(42); // box de int
int x = (int)arr[0]; // unboxing

// Bon : génériques
var list = new List<int>();
list.Add(42);
int y = list[0]; // pas de boxing
```

### 3) Strings & allocations
```csharp
// Concaténations répétées : coûteuses
string s = "";
for (int i = 0; i < 10000; i++) s += "x"; // crée 10000 strings

// Préférer StringBuilder
var sb = new System.Text.StringBuilder(10000);
for (int i = 0; i < 10000; i++) sb.Append('x');
string ok = sb.ToString();
```

### 4) Finalizer vs IDisposable
```csharp
class BadFinalizer
{
    ~BadFinalizer() { /* libérer ? non déterministe, à éviter */ }
}

sealed class FileHolder : IDisposable
{
    private readonly FileStream _fs;
    public FileHolder(string path) { _fs = File.OpenRead(path); }
    public void Dispose() { _fs.Dispose(); } // déterministe
}

using var fh = new FileHolder("data.bin");
```

### 5) Span<T>, stackalloc (réduction d’allocations)
```csharp
// ref struct: non boxable, stack-only
ReadOnlySpan<char> Slice(string s)
{
    return s.AsSpan().Slice(0, Math.Min(10, s.Length));
}

// stackalloc: buffer sur la stack
Span<int> buffer = stackalloc int[16];
for (int i = 0; i < buffer.Length; i++) buffer[i] = i;
```

### 6) Pooling — ArrayPool<T>
```csharp
var pool = System.Buffers.ArrayPool<byte>.Shared;
byte[] rented = pool.Rent(1024);
try
{
    // ... utiliser le buffer sans allouer
}
finally
{
    pool.Return(rented, clearArray: true); // pour éviter fuite de secrets
}
```

---

## 🧪 Mesure & diagnostics

```csharp
var sw = new System.Diagnostics.Stopwatch();
long before = GC.GetAllocatedBytesForCurrentThread();
sw.Start();
// … workload …
sw.Stop();
long after = GC.GetAllocatedBytesForCurrentThread();
Console.WriteLine($"Allocations: {after - before} bytes, temps: {sw.ElapsedMilliseconds} ms");

// Observer les générations
Console.WriteLine(GC.CollectionCount(0)); // Gen0
Console.WriteLine(GC.CollectionCount(1)); // Gen1
Console.WriteLine(GC.CollectionCount(2)); // Gen2
```

**Outils (aperçu)** : `dotnet-counters`, `dotnet-trace`, PerfView, EventPipe — pour **profiling** en profondeur.

---

## 🧱 Schémas ASCII

### A) Vue d’ensemble
```
           +-------------------+          +-------------------------------+
           |       STACK       |          |              HEAP             |
           +-------------------+          +-------------------------------+
 Appel M() | Frames d'appels   |   refs → | Objets (class, string, array) |
           | Locals (structs)  |          | Gen0 / Gen1 / Gen2 / LOH / POH|
           +-------------------+          +-------------------------------+
```

### B) GC générationnel
```
Allocation → Gen0
Survie → copie/promotion → Gen1 → Gen2
Gros objets (>~85k) → LOH (collecté avec Gen2)
Objets épinglés → POH
```

### C) Boxing
```
int (valeur) ──box──▶ object (référence sur heap)
         └─unbox──▶ int
```

---

## 🔧 Exercices guidés
1. **Sans allocations** : réécris une concaténation lourde avec `StringBuilder` ou `Span<char>` et **mesure** la différence d’allocations.  
2. **Éviter boxing** : remplace une collection non générique (`ArrayList`) par une collection générique et **mesure**.  
3. **Pool** : crée une fonction de copie de fichier qui utilise `ArrayPool<byte>` pour le buffer au lieu d’allouer un tableau à chaque lecture.

```csharp
// 3) Copie avec ArrayPool
async Task CopyPooledAsync(string src, string dst)
{
    const int Size = 81_920;
    var pool = System.Buffers.ArrayPool<byte>.Shared;
    byte[] buf = pool.Rent(Size);
    try
    {
        await using var i = new FileStream(src, FileMode.Open, FileAccess.Read, FileShare.Read, Size, useAsync: true);
        await using var o = new FileStream(dst, FileMode.Create, FileAccess.Write, FileShare.None, Size, useAsync: true);
        int read;
        while ((read = await i.ReadAsync(buf, 0, buf.Length)) > 0)
            await o.WriteAsync(buf, 0, read);
    }
    finally { pool.Return(buf, clearArray: true); }
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) StringBuilder vs +
long a1 = GC.GetAllocatedBytesForCurrentThread();
string s = ""; for (int i = 0; i < 10000; i++) s += "x";
long a2 = GC.GetAllocatedBytesForCurrentThread();
var sb = new System.Text.StringBuilder(10000); for (int i = 0; i < 10000; i++) sb.Append('x');
string s2 = sb.ToString();
long a3 = GC.GetAllocatedBytesForCurrentThread();
Console.WriteLine((a2 - a1) > (a3 - a2)); // true attendu

// 2) Boxing
var arr = new System.Collections.ArrayList(); arr.Add(42); // boxing
var list = new List<int>(); list.Add(42); // pas de boxing
```

---

## ⚠️ Pièges fréquents
- **Appeler `GC.Collect()`** manuellement : perturbe l’heuristique du GC, provoque **pauses** longues; **éviter** sauf diagnostic spécifique.  
- **Finalizers** non nécessaires : coût **élevé**; préférer **`IDisposable`** + `using`.  
- **Objets épinglés** : causent la **fragmentation**; limiter la durée du **pin**.  
- **Concaténations** de `string` dans des boucles : créer des **milliers d’objets**; utiliser **`StringBuilder`** ou **span**.  
- **Boxing** : introduit des **allocations** cachées; utiliser **génériques**.

---

## 🧮 Formules (en JavaScript)
- **Estimation mémoire d’un tableau d’entiers** (naïve) :
```javascript
const arrayBytes = (length) => length * 4; // int32 = 4 octets (hors overhead)
```
- **Taille JSON (texte) vs binaire** (idée) :
```javascript
const textSize = (s) => new TextEncoder().encode(s).length; // UTF‑8
```
- **Coût concaténations** (approx.) :
```javascript
const concatCost = (n, avgLen) => (n * avgLen); // nombre de nouveaux buffers créés
```

---

## 📌 Résumé essentiel
- **Stack** = court terme, **Heap** = instances avec **GC**; comprends **valeur vs référence** et **immutabilité**.  
- Le **GC** est **générationnel** (Gen0/1/2) avec **LOH**/**POH**; évite `GC.Collect()` manuel, préfère **libération déterministe** via `IDisposable`.  
- Réduis les **allocations** : **`StringBuilder`**, **génériques**, **Span/stackalloc**, **ArrayPool**.  
- Mesure et profile : `GC.GetAllocatedBytesForCurrentThread`, `GC.CollectionCount`, Stopwatch, outils .NET.  
- Attention aux **boxings**, **finalizers**, **pinning** et aux **boucles** de concaténation.
