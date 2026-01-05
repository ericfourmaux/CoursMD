
# 📘 Chapitre 7.2 — Design Patterns essentiels (C#)

> **Niveau** : Intermédiaire — **Objectif** : maîtriser **5 patterns** courants et pragmatiques en C# : **Strategy**, **Factory**, **Adapter**, **Decorator**, **Repository**. Pour chacun : **définition**, **pourquoi**, **analogie**, **exemples C#**, **variantes**, **exercices**, **tests**, **pièges** et **quand ne pas l’utiliser**.

---

## 🎯 Objectifs d’apprentissage
- Savoir **reconnaître** un besoin métier et **choisir** le pattern adapté.
- Implémenter les patterns en **C# moderne** (interfaces, DI, records, immutabilité).
- Respecter **SOLID** (OCP, DIP, SRP) en utilisant les patterns à bon escient.
- Éviter les **anti‑patterns** (sur‑ingénierie, singletons abusifs, abstractions inutiles).

---

## 🧠 Vue d’ensemble
- **Strategy** : encapsule un **comportement** interchangeable derrière une **interface**.
- **Factory** (Simple/Method/Abstract) : **centralise** la **création** d’objets selon un **contrat**.
- **Adapter** : rend **compatibles** deux interfaces **incompatibles**.
- **Decorator** : **enrichit** un comportement **sans** modifier la classe originale.
- **Repository** : **isole** l’accès aux **données** derrière une interface métier (avec prudence).

> 🔗 **SOLID** :
> - Strategy/Decorator → **OCP & DIP**.  
> - Factory → **DIP** (création via abstractions).  
> - Adapter → **SRP** (conversion d’interface).  
> - Repository → **ISP**/**DIP** (contrats fins pour persistance).

---

# 1) Strategy — Comportement interchangeable

### 🧩 Définition
Encapsuler des **variantes d’un algorithme** derrière une **interface**; choisir l’implémentation **au runtime** (ou via DI).

### 🧭 Pourquoi
- **OCP** : ajouter une stratégie **sans modifier** le client.  
- **Testabilité** : injecter des **stubs**/**mocks**.

### 🧩 Analogie
Changer le **bout** d’un **tournevis** (plat/Cruz) selon la **vis** sans changer l’outil.

### 💡 Exemple (C#)
```csharp
public interface IPricingStrategy { decimal Apply(decimal basePrice); }
public sealed class StandardPricing : IPricingStrategy { public decimal Apply(decimal basePrice) => basePrice; }
public sealed class PremiumPricing  : IPricingStrategy { public decimal Apply(decimal basePrice) => basePrice * 1.20m; }
public sealed class DiscountPricing : IPricingStrategy { public decimal Apply(decimal basePrice) => basePrice * 0.90m; }

public sealed class PriceCalculator
{
    private readonly IPricingStrategy _strategy;
    public PriceCalculator(IPricingStrategy strategy) => _strategy = strategy;
    public decimal Calculate(decimal basePrice) => _strategy.Apply(basePrice);
}
```

### 🔧 Variantes
- **Context configurable** (setter ou factory) vs **DI** constructeur.

### 🧪 Test rapide
```csharp
var calc = new PriceCalculator(new PremiumPricing());
Console.WriteLine(calc.Calculate(100m) == 120m);
```

### ⚠️ Pièges
- **Trop** de stratégies → surcharge cognitive; préférer **paramètres** si logique triviale.

---

# 2) Factory — Création centralisée

### 🧩 Définition
Déléguer la **création d’objets** à une **unité dédiée** (factory) pour **encapsuler** construction, configuration et **invariants**.

### 🧭 Pourquoi
- **DIP** : code client dépend de **contrats**, pas de **constructeurs** concrets.  
- **SRP** : isoler la **construction** (complexe) de l’**usage**.

### 🧩 Analogie
Le **service d’immatriculation** fabrique des **plaques** avec les **bonnes normes**; les utilisateurs reçoivent des plaques **valides**.

### 💡 Exemples (C#)

#### a) Simple Factory
```csharp
public static class ParserFactory
{
    public static IParser Create(string contentType) => contentType switch
    {
        "application/json" => new JsonParser(),
        "text/csv" => new CsvParser(),
        _ => throw new NotSupportedException(contentType)
    };
}
```

#### b) Factory Method
```csharp
public abstract class ConnectionFactory
{
    public abstract IDbConnection Create();
}
public sealed class SqlConnectionFactory : ConnectionFactory
{
    public override IDbConnection Create() => new System.Data.SqlClient.SqlConnection("...");
}
```

#### c) Abstract Factory
```csharp
public interface IDataAccessFactory
{
    IDbConnection CreateConnection();
    IDbCommand CreateCommand();
}
```

### 🔧 Variantes
- **Object pool** + factory : réutiliser des instances coûteuses.

### 🧪 Test rapide
```csharp
var f = new SqlConnectionFactory();
Console.WriteLine(f.Create() is IDbConnection);
```

### ⚠️ Pièges
- **Sur‑abstraction** : surcharger de factories pour de simples `new()`.  
- **Fuite** de **détails** (config hard‑codée) → préférer **Options/DI**.

---

# 3) Adapter — Compatibiliser interfaces

### 🧩 Définition
Envelopper un **service existant** pour qu’il **implémente** l’interface **attendue** sans modifier l’original.

### 🧭 Pourquoi
- Intégrer une **lib tierce** sans toucher au code **client**.  
- **SRP** : conversion d’interface isolée.

### 🧩 Analogie
Un **adaptateur de prise** qui permet de brancher un **appareil étranger** sur ta **prise**.

### 💡 Exemple (C#)
```csharp
// Interface attendue
public interface IEmailSender { Task SendAsync(string to, string subject, string body); }

// Lib existante incompatible
public sealed class LegacyMailer
{
    public void Send(string destination, string title, string content) { /* ... */ }
}

// Adapter
public sealed class LegacyMailerAdapter : IEmailSender
{
    private readonly LegacyMailer _legacy;
    public LegacyMailerAdapter(LegacyMailer legacy) => _legacy = legacy;
    public Task SendAsync(string to, string subject, string body)
    { _legacy.Send(to, subject, body); return Task.CompletedTask; }
}
```

### 🔧 Variantes
- **Two‑way adapter** (rare), **Adapter + Facade** pour regrouper plusieurs adaptateurs.

### 🧪 Test rapide
```csharp
IEmailSender sender = new LegacyMailerAdapter(new LegacyMailer());
await sender.SendAsync("eric@example.com", "Hi", "...");
```

### ⚠️ Pièges
- Adapter qui **fuit** des détails → l’interface **perd** son abstraction.

---

# 4) Decorator — Enrichir sans modifier

### 🧩 Définition
Envelopper un **objet** pour **ajouter des responsabilités** (logging, cache, retry) **sans** changer son **code**.

### 🧭 Pourquoi
- **OCP** : étendre **comportement** sans modification.  
- **Combinable** : chaînes de décorateurs (pipeline).

### 🧩 Analogie
Ajouter une **sur‑couverture** (protection, style) à un **canapé** sans refaire la structure.

### 💡 Exemple (C#)
```csharp
public interface IProductRepository
{
    Task<Product?> GetAsync(int id);
    Task AddAsync(Product p);
}

public sealed class ProductRepository : IProductRepository
{
    // ... vers base
    public Task<Product?> GetAsync(int id) => Task.FromResult<Product?>(null);
    public Task AddAsync(Product p) => Task.CompletedTask;
}

public sealed class CachingProductRepository : IProductRepository
{
    private readonly IProductRepository _inner;
    private readonly Dictionary<int, Product?> _cache = new();
    public CachingProductRepository(IProductRepository inner) => _inner = inner;

    public async Task<Product?> GetAsync(int id)
    {
        if (_cache.TryGetValue(id, out var p)) return p;
        p = await _inner.GetAsync(id);
        _cache[id] = p; return p;
    }
    public Task AddAsync(Product p) => _inner.AddAsync(p); // pas décoré ici
}
```

### 🔧 Variantes
- **RetryDecorator**, **LoggingDecorator**, **MetricsDecorator**.

### 🧪 Test rapide
```csharp
var repo = new CachingProductRepository(new ProductRepository());
Console.WriteLine(await repo.GetAsync(1) == await repo.GetAsync(1));
```

### ⚠️ Pièges
- **Empilement** incontrôlé → complexité; documenter l’**ordre** des décorateurs.

---

# 5) Repository — Accès aux données (avec prudence)

### 🧩 Définition
Fournir une **interface métier** pour accéder aux **agrégats**/entités, **isoler** la persistance et faciliter les **tests**.

### 🧭 Pourquoi
- **DIP/ISP** : contrats fins, tests **in‑memory**.

### 🧩 Analogie
Un **guichet** qui expose des **opérations** métier; la **base** reste derrière.

### 💡 Exemple (C#)
```csharp
public interface IOrderRepository
{
    Task<Order?> GetAsync(int id);
    Task<List<Order>> ListAsync(int page, int size);
    Task AddAsync(Order order);
}

public sealed class EfOrderRepository : IOrderRepository
{
    private readonly OrdersDbContext _db;
    public EfOrderRepository(OrdersDbContext db) => _db = db;
    public Task<Order?> GetAsync(int id) => _db.Orders.FindAsync(id).AsTask();
    public Task<List<Order>> ListAsync(int page, int size)
        => _db.Orders.AsNoTracking().OrderBy(o => o.Id).Skip((page-1)*size).Take(size).ToListAsync();
    public async Task AddAsync(Order order) { await _db.Orders.AddAsync(order); await _db.SaveChangesAsync(); }
}
```

### 🔧 Variantes & remarques
- **Spécifications** pour requêtes complexes;  
- Avec EF Core, éviter un **repository générique** trop abstrait; préférer **services** métier clairs.

### 🧪 Test rapide
```csharp
IOrderRepository repo = new EfOrderRepository(new OrdersDbContext(/*...*/));
Console.WriteLine(await repo.GetAsync(1) is Order or null);
```

### ⚠️ Pièges
- **Abstraction excessive** : masque les possibilités **EF Core** (tracking, Include, projections).  
- **Multiplication** d’interfaces génériques → complexité inutile.

---

## 🧱 Schémas ASCII — Cartes mémorielles

### A) Strategy
```
Client → IPricingStrategy
             ├─ StandardPricing
             ├─ PremiumPricing
             └─ DiscountPricing
```

### B) Decorator
```
Client → [CachingProductRepository] → [ProductRepository]
```

### C) Adapter
```
Client (IEmailSender) → LegacyMailerAdapter → LegacyMailer
```

### D) Factory
```
Client → ParserFactory → JsonParser / CsvParser
```

### E) Repository
```
Service métier → IOrderRepository → EfOrderRepository → DbContext
```

---

## 🔧 Exercices guidés
1. **Strategy** : ajoute `BlackFridayPricing` (‑50%) et vérifie que `PriceCalculator` n’est **pas modifié**.  
2. **Factory** : écris une `CompressionFactory` (`gzip`, `brotli`) et mesure le **gain** vs naïf `new()`.  
3. **Adapter** : adapte un service `SmsGateway` (`SendSms`) vers une interface `INotifier.Notify(string)`.  
4. **Decorator** : crée un `LoggingDecorator` pour `IOrderRepository` (temps d’appel via `Stopwatch`).  
5. **Repository** : implémente une méthode `ListByCustomer(string)` avec **AsNoTracking** et **pagination**.

```csharp
public sealed class LoggingOrderRepository : IOrderRepository
{
    private readonly IOrderRepository _inner;
    public LoggingOrderRepository(IOrderRepository inner) => _inner = inner;
    public async Task<Order?> GetAsync(int id)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var r = await _inner.GetAsync(id);
        sw.Stop(); Console.WriteLine($"Get({id}) {sw.ElapsedMilliseconds}ms");
        return r;
    }
    public Task<List<Order>> ListAsync(int page, int size) => _inner.ListAsync(page, size);
    public Task AddAsync(Order order) => _inner.AddAsync(order);
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// Strategy
var calc = new PriceCalculator(new DiscountPricing());
Console.WriteLine(calc.Calculate(100m) == 90m);

// Adapter
INotifier notifier = new SmsGatewayAdapter(new SmsGateway());
await notifier.Notify("Hello");

// Decorator
var repo = new LoggingOrderRepository(new EfOrderRepository(new OrdersDbContext()));
Console.WriteLine(await repo.GetAsync(1) is Order or null);
```

---

## ⚠️ Anti‑patterns & conseils
- **Singleton** tout‑puissant → état global, tests difficiles; préférer **DI** + **Scoped/Transient**.  
- **Factory partout** → complexité inutile; **seulement** où la construction **importe**.  
- **Repository générique** : évite d’**obscurcir** EF Core; expose des **services** centrés **métier**.  
- **Adapter qui fait trop** : reste un **pont**, pas un **service**.

---

## 🧮 Formules (en JavaScript)
- **Coût d’une chaîne de décorateurs** (naïf) :
```javascript
const cost = (n, c) => n * c; // n décorateurs, c coût moyen
```
- **Choix stratégie en fonction d’un score** (ex.):
```javascript
const choose = (score) => score > 80 ? 'Premium' : score < 30 ? 'Discount' : 'Standard';
```

---

## 📌 Résumé essentiel
- **Strategy** : variantes d’algorithme **interchangeables** (OCP, DIP).  
- **Factory** : **centralise** la création et **cache** la complexité.  
- **Adapter** : **compatibilise** interfaces sans toucher le client.  
- **Decorator** : ajoute des fonctionnalités **sans modifier** la classe d’origine.  
- **Repository** : **isole** la persistance, à manier **avec discernement** avec EF Core.  
- Utiliser ces patterns pour **structure** et **extensibilité**, sans sur‑ingénierie.
