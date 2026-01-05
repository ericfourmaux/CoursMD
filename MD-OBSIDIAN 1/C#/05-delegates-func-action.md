
# 📘 Chapitre 5.1 — Delegates, Func/Action & Lambdas

> **Niveau** : Débutant → Intermédiaire — **Objectif** : comprendre les **délégués** en C# (types fonction), les types génériques **`Func<>` / `Action<>` / `Predicate<>`**, les **lambdas** (expression/statement), les **closures** (capturer des variables), le **multicast** et les bonnes pratiques de **composition**, **testabilité**, et **performance**.

---

## 🎯 Objectifs d’apprentissage
- Définir et utiliser un **délégué** personnalisé; comprendre **méthode-groupe** vs **lambda**.  
- Maîtriser **`Func<T...>`**, **`Action<T...>`** et **`Predicate<T>`** (nomenclature, arité, types).  
- Comprendre les **closures** (capturer variables), **pièges** (`foreach` capture), **`static` lambda** (pas de capture).  
- Composer et **chaîner** des délégués (multicast), savoir **ajouter/retirer** (`+`/`-`) et **Invoke** sécurisé (`?.Invoke`).  
- Utiliser les délégués pour **callbacks**, **stratégies**, et écrire du code **testable** (injection de comportements).

---

## 🧠 Concepts clés

### 🔤 Définition — Délégué
- **Délégué** : **type** qui représente une **signature de méthode**; instance = **référence** vers une méthode (ou lambda).  
- Exemple : `public delegate int Transformer(int x);` → toute méthode `int M(int)` ou lambda **compatible** peut être assignée.

### 🧩 Méthode-groupe vs Lambda
- **Méthode-groupe** : passer `MethodName` directement (sans parenthèses) à un délégué — conversion **implicite**.  
- **Lambda** : fonction **anonyme** `x => x * 2` (expression) ou `x => { ... }` (statement).

### 🧪 `Func` / `Action` / `Predicate`
- **`Func<T1,...,TResult>`** : délégué **avec retour**.  
- **`Action<T1,...,Tn>`** : **sans** retour (`void`).  
- **`Predicate<T>`** : alias de `Func<T,bool>` pour **tests**.

### 🔗 Multicast
- Les délégués **sont immuables**; `d1 + d2` crée un **nouveau** délégué dont l’**invocation list** contient `d1` puis `d2`.  
- Invocation : tous les abonnés **sont appelés**; la valeur de retour est celle du **dernier** (si retour), exceptions **propagent** (à gérer).

### 🧭 Pourquoi c’est important
- **Découplage** : passer un **comportement** (fonction) plutôt qu’une **classe** entière.  
- **Testabilité** : injecter des **stratégies** (ex. `Func<DateTime> now`) et **simuler** dans les tests.  
- **Expressivité** : écrire des APIs **déclaratives** (ex. filtres, transformations, pipelines).

### 🧩 Analogie
- Un **délégué** est un **contrat d’appel** : « appelle n’importe qui qui sait faire *f(x)* »; une **lambda** est une **note autocollante** avec une **mini-fonction** qu’on colle au contrat.

---

## 💡 Exemples C# — fondamentaux

### 1) Délégué personnalisé + méthode-groupe
```csharp
public delegate int Transformer(int x);

static int TimesTwo(int x) => x * 2;

Transformer t = TimesTwo; // méthode-groupe
int r = t(21);            // 42
```

### 2) Lambda (expression/statement) et `Func`
```csharp
Func<int, int> square = x => x * x;     // expression-lambda
Func<int, int> doubleIfEven = x =>      // statement-lambda
{
    if (x % 2 == 0) return x * 2;
    return x;
};
```

### 3) `Action` & `Predicate`
```csharp
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");
Predicate<int> isPositive = n => n > 0; // équivaut à Func<int,bool>
```

### 4) Multicast (`+`, `-`) et `Delegate.Combine`/`Remove`
```csharp
Action pipeline = null!;
void A() => Console.Write("A ");
void B() => Console.Write("B ");

pipeline += A; // A
pipeline += B; // A,B
pipeline -= A; // B

pipeline?.Invoke(); // "B "
```

### 5) Méthode-groupe vs lambda : conversion
```csharp
string ToUpper(string s) => s.ToUpperInvariant();
Func<string,string> f1 = ToUpper;         // méthode-groupe
Func<string,string> f2 = s => s.ToUpperInvariant(); // lambda
```

---

## 🧬 Closures & captures

### 1) Capture de variable
```csharp
Func<int> MakeCounter()
{
    int count = 0;
    return () => ++count; // capture 'count' (durée de vie étendue)
}

var counter = MakeCounter();
Console.WriteLine(counter()); // 1
Console.WriteLine(counter()); // 2
```

### 2) Piège `foreach` (capture de variable de boucle)
```csharp
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.Write(i + " ")); // capture 'i' (même cellule)
}
foreach (var a in actions) a(); // "3 3 3 " (piège)

// Correct: variable locale par itération
actions.Clear();
for (int i = 0; i < 3; i++)
{
    int copy = i;
    actions.Add(() => Console.Write(copy + " ")); // "0 1 2 "
}
foreach (var a in actions) a();
```

### 3) `static` lambda (pas de capture; C# 9+)
```csharp
int factor = 2;
Func<int,int> mul = static x => x * 2; // static: ne capture rien
// mul ne dépend PAS de 'factor'; si capture requise, retirer 'static'
```

---

## 🧰 Délégués dans les APIs du framework

### 1) `Comparison<T>` pour tri
```csharp
var arr = new[] { "Eric", "alice", "Bob" };
Array.Sort(arr, (a,b) => string.Compare(a,b, StringComparison.OrdinalIgnoreCase));
```

### 2) `Predicate<T>` pour filtrer
```csharp
var list = new List<int> { -1, 0, 1, 2 };
list.RemoveAll(n => n <= 0); // garde 1,2
```

### 3) `Func<T,bool>` dans LINQ
```csharp
var names = new[] { "Eric", "Alice", "Bob" };
var shortOnes = names.Where(s => s.Length <= 4).ToList();
```

---

## 🔗 Composition & pipelines

```csharp
Func<int,int> twice = x => x * 2;
Func<int,int> inc   = x => x + 1;

// Composition simple
Func<int,int> twiceThenInc = x => inc(twice(x));
Console.WriteLine(twiceThenInc(3)); // 7
```

**Astuce** : crée des petites fonctions **pures** (sans effets de bord) pour les composer facilement.

---

## 🧱 Schémas ASCII

### A) Invocation list (multicast)
```
Action pipeline
   ├─ A()
   └─ B()
Invoke() → A → B (dans l'ordre d'abonnement)
```

### B) Closure (durée de vie étendue)
```
MakeCounter()
  count = 0 (pile) ──capturé──▶ closure (heap)
  return () => ++count
```

---

## 🔧 Exercices guidés
1. **Strategy** : écris `int Apply(int x, Func<int,int> f)` et teste avec `square`, `twice`, et une lambda `x => x - 3`.  
2. **Pipeline** : compose des `Action` (`Log`, `Audit`) dans un **multicast** et vérifie l’ordre d’exécution.  
3. **Closure compteur** : implémente `MakeCounter()` (ci-dessus) et démontre que chaque appel crée **son propre** état.

```csharp
int Apply(int x, Func<int,int> f) => f(x);

Action Log = () => Console.Write("Log ");
Action Audit = () => Console.Write("Audit ");
Action pipeline = Log + Audit; // multicast
pipeline(); // "Log Audit "

var c1 = MakeCounter();
var c2 = MakeCounter();
Console.WriteLine(c1()); // 1
Console.WriteLine(c1()); // 2
Console.WriteLine(c2()); // 1 (état indépendant)
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
Console.WriteLine(Apply(4, x => x * x) == 16);
Console.WriteLine(Apply(5, x => x * 2) == 10);

var actions = new List<Action>();
for (int i = 0; i < 3; i++) { int copy = i; actions.Add(() => Console.Write(copy + " ")); }
foreach (var a in actions) a(); // "0 1 2 "
```

---

## ⚠️ Pièges fréquents
- **Captures accidentelles** (boucles) → introduisent des **bugs** subtils; préférer **variables locales par itération** ou **`static` lambda**.  
- **Multicast avec retour** : seule la **dernière** valeur est retournée; si toutes comptent, **agrège** manuellement.  
- **Exceptions** dans multicast : **propagent**; **isoler** chaque abonné (try/catch interne) si nécessaire.  
- **Fuites** : un délégué capturant une **instance longue** peut empêcher son GC; **détacher** ou éviter captures inutiles.  
- **Performance** : éviter allocations dans boucles (privilégier méthode-groupe ou lambdas statiques lorsque possible).

---

## 🧮 Formules (en JavaScript)
- **Coût d’un multicast** (naïf) :
```javascript
const costInvoke = (n, c) => n * c; // n abonnés, c coût moyen par abonné
```
- **Composition** (application successive) :
```javascript
const compose = (f,g) => x => g(f(x));
```

---

## 📌 Résumé essentiel
- Les **délégués** sont des **types fonction**; `Func`/`Action` couvrent **90%** des cas (retour vs `void`).  
- Les **lambdas** simplifient l’écriture; attention aux **captures** (utiliser `static` lambda si aucune capture).  
- Le **multicast** permet de chaîner des actions; gère **retours**/**exceptions** explicitement.  
- Les délégués améliorent **découplage** et **testabilité** (stratégies, callbacks).  
- Compose des fonctions **pures** pour créer des **pipelines** clairs et maintenables.
