
# 📘 Chapitre 8.2 — Tests d’intégration & Fixtures (xUnit, EF Core, WebApplicationFactory)

> **Niveau** : Intermédiaire — **Objectif** : écrire des **tests d’intégration** réalistes en C#/.NET : **xUnit fixtures** (classe/collection), **base de données de test** (EF Core **InMemory** vs **SQLite In‑Memory** vs **Testcontainers**), **ASP.NET Core TestServer** via **WebApplicationFactory**, **isolation des données**, **seed**, **auth** et **tests HTTP** end‑to‑end.

---

## 🎯 Objectifs d’apprentissage
- Structurer une **suite d’intégration** avec **xUnit** : `IClassFixture<T>`, `ICollectionFixture<T>`, **shared context**.
- Tester **API ASP.NET Core** avec **WebApplicationFactory<Program>** et un **HttpClient** réel (TestServer).
- Brancher EF Core sur une **DB de test** : InMemory (rapide), **SQLite InMemory** (transactions), **Testcontainers** (PostgreSQL/SQL Server).
- Isoler **données/état** par **test** (reset, transactions, scope DI) et **seeder**.
- Tester **auth/claims** et **erreurs** (codes HTTP, validations, exceptions middleware).

---

## 🧠 Concepts clés

### 🧪 Test d’intégration vs test unitaire
- **Unitaire** : une classe/méthode **isolée** (mocks).  
- **Intégration** : plusieurs **composants réels** ensemble (ex. contrôleur + EF Core + pipeline HTTP) → vise **comportement**.

### 🧰 xUnit Fixtures
- **`IClassFixture<T>`** : fixture **par classe** (instanciée une fois, partagée par les tests de la classe).  
- **`ICollectionFixture<T>`** : fixture **partagée** entre **plusieurs classes** (collection).  
- **But** : partager **coûts** (ex. démarrer un conteneur DB), **config** (WebApplicationFactory), **seed**.

### 🌐 WebApplicationFactory & TestServer
- **`WebApplicationFactory<Program>`** crée un **TestServer** et un **HttpClient** pour tester **end‑to‑end** sans réseau; on peut **surcharger** la configuration (`ConfigureServices`, `ConfigureWebHost`).

### 🗃️ EF Core — options de DB de test
- **InMemory provider** : ultra rapide, mais **pas** un vrai SQL (moteur mémoire sans contraintes).  
- **SQLite In‑Memory** : vrai SQL en mémoire; supporte **transactions** et **migrations** (connexion **ouverte** à garder).  
- **Testcontainers** : DB **réelle** dans Docker (PostgreSQL/SQL Server), parfaite pour **fiabilité**, plus **lente**.

---

## 🏗️ Organisation du projet de tests (suggestion)

```
src/
  MyApi/
    Program.cs
    Data/
      AppDbContext.cs
    Endpoints/
      ProductsEndpoints.cs

tests/
  MyApi.IntegrationTests/
    MyApiFactory.cs           // WebApplicationFactory custom
    DatabaseFixture.cs        // gestion DB test
    ProductsTests.cs          // suite de tests
```

---

## 💡 Exemple — API minimale + EF Core

```csharp
// Program.cs (API minimale)
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddEndpointsApiExplorer().AddSwaggerGen();
var app = builder.Build();

app.MapGet("/products/{id:int}", async (int id, AppDbContext db) =>
{
    var p = await db.Products.FindAsync(id);
    return p is null ? Results.NotFound() : Results.Ok(p);
});

app.MapPost("/products", async (Product p, AppDbContext db) =>
{
    db.Products.Add(p); await db.SaveChangesAsync();
    return Results.Created($"/products/{p.Id}", p);
});

app.Run();

public record Product(int Id, string Name, decimal Price);
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{ public DbSet<Product> Products => Set<Product>(); }
```

---

## 🧪 WebApplicationFactory — customisation pour tests

```csharp
// MyApiFactory.cs
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;

public class MyApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Remplacer la DB réelle par SQLite InMemory
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null) services.Remove(descriptor);

            var conn = new SqliteConnection("DataSource=:memory:");
            conn.Open(); // garder ouverte pendant toute la vie du serveur

            services.AddDbContext<AppDbContext>(o => o.UseSqlite(conn));

            // Créer la base de test + seed
            using var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
            db.Products.AddRange(new Product(1, "Laptop", 999m), new Product(2, "Mouse", 29.9m));
            db.SaveChanges();
        });
    }
}
```

> 🔎 **Note** : avec **SQLite In‑Memory**, **garde la connexion ouverte** pendant la vie du serveur de test; sinon la base disparaît.

---

## 🧰 xUnit — class fixture pour le `HttpClient`

```csharp
// ProductsTests.cs
public class ProductsTests : IClassFixture<MyApiFactory>
{
    private readonly HttpClient _client;
    public ProductsTests(MyApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Get_Should_Return_200_And_Product()
    {
        var res = await _client.GetAsync("/products/1");
        Assert.True(res.IsSuccessStatusCode);
        var json = await res.Content.ReadFromJsonAsync<Product>();
        Assert.Equal("Laptop", json!.Name);
    }

    [Fact]
    public async Task Post_Should_Create_Resource()
    {
        var payload = new Product(10, "Keyboard", 79m);
        var res = await _client.PostAsJsonAsync("/products", payload);
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var location = res.Headers.Location;
        Assert.NotNull(location);
        var created = await _client.GetFromJsonAsync<Product>(location!.ToString());
        Assert.Equal("Keyboard", created!.Name);
    }
}
```

---

## 🧩 EF Core InMemory — rapide mais limité

```csharp
// DatabaseFixture.cs (option InMemory)
public class DatabaseFixture
{
    public DbContextOptions<AppDbContext> Options { get; }
    public DatabaseFixture()
    {
        Options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        using var db = new AppDbContext(Options);
        db.Products.Add(new Product(1, "Laptop", 999m));
        db.SaveChanges();
    }
}

public class RepositoryTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture _fx;
    public RepositoryTests(DatabaseFixture fx) => _fx = fx;

    [Fact]
    public async Task Find_Should_Return_Product()
    {
        using var db = new AppDbContext(_fx.Options);
        var p = await db.Products.FindAsync(1);
        Assert.NotNull(p);
    }
}
```

> ⚠️ **Limites** : le provider **InMemory** ne respecte **pas** les contraintes SQL (relations, clés, `Include`, `GroupBy` traduit, etc.). Pour comportement plus proche, préférer **SQLite In‑Memory** ou **Testcontainers**.

---

## 🧱 Fixtures de **collection** (partager une DB conteneur)

```csharp
// PostgresTestContainerFixture.cs (exemple schématique)
public class PostgresTestContainerFixture : IAsyncLifetime
{
    public string ConnectionString { get; private set; } = string.Empty;
    private IContainer? _container;

    public async Task InitializeAsync()
    {
        // Démarrer un conteneur Postgres (pseudo-code; utiliser Testcontainers for .NET)
        // _container = new PostgreSqlBuilder().WithImage("postgres:16").Build();
        // await _container.StartAsync();
        // ConnectionString = _container.GetConnectionString();
    }

    public async Task DisposeAsync()
    {
        if (_container is not null) await _container.StopAsync();
    }
}

[CollectionDefinition("postgres")] public class PostgresCollection : ICollectionFixture<PostgresTestContainerFixture> { }

[Collection("postgres")] public class OrdersIntegrationTests
{
    private readonly PostgresTestContainerFixture _fx;
    public OrdersIntegrationTests(PostgresTestContainerFixture fx) => _fx = fx;
    // … utiliser _fx.ConnectionString pour un DbContext réel et tests d’intégration robustes
}
```

---

## 🔐 Auth & claims en tests

```csharp
// Exemple: ajouter un handler d’auth test dans ConfigureTestServices
services.AddAuthentication("Test")
    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => {});

// Puis utiliser le client avec un header
authClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");
```

---

## 🧱 Schémas ASCII

### A) Pile de test API
```
xUnit Test → WebApplicationFactory → TestServer → HttpClient → Pipeline ASP.NET Core → DbContext (SQLite InMemory)
```

### B) Fixtures (classe vs collection)
```
IClassFixture<MyApiFactory>  → partage par classe
ICollectionFixture<DbFx>     → partage cross-classes
```

---

## 🔧 Exercices guidés
1. **CRUD** : ajoute `DELETE /products/{id}` et teste `204 NoContent` + absence en DB.  
2. **Validation** : poste un produit **sans nom** → attends `400 BadRequest` (model validation).  
3. **Auth** : protège `POST /products` par un **policy**; en test, utilise le **handler** d’auth **Test** et vérifie `401/403`.

```csharp
[Fact]
public async Task Delete_Should_Remove_Entity()
{
    var client = _client; // via fixture
    var res = await client.DeleteAsync("/products/2");
    Assert.Equal(HttpStatusCode.NoContent, res.StatusCode);
    var notFound = await client.GetAsync("/products/2");
    Assert.Equal(HttpStatusCode.NotFound, notFound.StatusCode);
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) OK → 200
var ok = await _client.GetAsync("/products/1");
Assert.True(ok.IsSuccessStatusCode);

// 2) Création
var res = await _client.PostAsJsonAsync("/products", new Product(99, "X", 1m));
Assert.Equal(HttpStatusCode.Created, res.StatusCode);

// 3) NotFound
Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync("/products/999")).StatusCode);
```

---

## ⚠️ Pièges fréquents
- **EF InMemory** ≠ SQL : comportements divergents (requêtes, contraintes). Utilise **SQLite InMemory** ou **Testcontainers** pour fiabilité.  
- **Réutiliser** une **connexion SQLite InMemory** **fermée** : la DB disparaît; **garder ouverte** pendant le test.  
- **Couplage** aux **données seed** non isolées : reset entre tests (transactions, recreate DB).  
- **Tests flakys** : dépendances externes (réseau, horloge); préférer conteneurs et **fakes** pour services tiers.

---

## 🧮 Formules (en JavaScript)
- **Temps total estimé** pour N tests d’intégration (naïf) :
```javascript
const totalMs = (n, avgMs) => n * avgMs;
```
- **Taux de réussite** :
```javascript
const passRate = (passed, total) => passed / Math.max(1, total);
```

---

## 📌 Résumé essentiel
- **xUnit fixtures** partagent **coût** et **config**; `IClassFixture` pour la classe, `ICollectionFixture` pour **cross‑classes**.  
- **WebApplicationFactory** + **TestServer** → **HttpClient** réaliste pour tester **pipeline** et **endpoints**.  
- Choisir la **DB de test** : InMemory (rapide, limitée), **SQLite InMemory** (SQL réel), **Testcontainers** (fiabilité maximale).  
- **Isolation** + **seed** sont essentiels; pense **auth/claims** et **codes HTTP**.
