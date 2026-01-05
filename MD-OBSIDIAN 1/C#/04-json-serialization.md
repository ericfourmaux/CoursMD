
# 📘 Chapitre 4.2 — Sérialisation JSON (System.Text.Json)

> **Niveau** : Débutant → Intermédiaire — **Objectif** : apprendre à **sérialiser** et **désérialiser** des objets C# avec **System.Text.Json** : `JsonSerializer`, `JsonSerializerOptions`, **attributs** (`[JsonPropertyName]`, `[JsonIgnore]`, `[JsonInclude]`, `[JsonNumberHandling]`, `[JsonConstructor]`, `[JsonPolymorphic]`, `[JsonDerivedType]`), **converters** custom, **async**, **streaming**, **encodage** UTF-8, **références**, **dates**, **enums**, et **pièges** courants.

---

## 🎯 Objectifs d’apprentissage
- Utiliser `JsonSerializer.Serialize` / `Deserialize` et leurs variantes **async** (`SerializeAsync` / `DeserializeAsync`).
- Configurer `JsonSerializerOptions` : **camelCase**, **indentation**, **case-insensitive**, **ignore null**, **MaxDepth**, **références** (`ReferenceHandler.Preserve`).
- Annoter les modèles avec les **attributs** JSON pour **contrôler** noms, nulls, numéros en string, constructeurs, polymorphisme.
- Gérer **DateTime/DateTimeOffset** (ISO-8601), **Enums** (noms vs entiers), **records**, **immutabilité**.
- Écrire et brancher des **converters** personnalisés (ex. `Money`, `DateTime` format custom).

---

## 🧠 Concepts clés

### 🔤 JSON & UTF-8
- **JSON** est un format **texte** de données clé/valeur. En .NET, **System.Text.Json** travaille nativement en **UTF‑8** (rapide, compact) via `Utf8JsonWriter/Reader` et `JsonSerializer`.

### ⚙️ `JsonSerializer`
- **API principale** pour convertir objets ↔ JSON.  
- **Sérialiser** = transformer un **objet** en **string/stream** JSON.  
- **Désérialiser** = transformer du **JSON** en **objet** typé (`T`).

### 🧰 `JsonSerializerOptions`
- **Contrôle** du rendu et lecture : `PropertyNamingPolicy`, `WriteIndented`, `PropertyNameCaseInsensitive`, `DefaultIgnoreCondition`, `NumberHandling`, `Encoder`, `MaxDepth`, `ReferenceHandler`, `TypeInfoResolver` (avancé).

### 🏷️ Attributs
- `[JsonPropertyName("...")]` → renommer une propriété dans le JSON.  
- `[JsonIgnore]` / `[JsonInclude]` → ignorer ou inclure (ex. champs privés).  
- `[JsonNumberHandling]` → accepter/écrire **nombres** sous forme **string**.  
- `[JsonConstructor]` → choisir le **constructeur** pour désérialiser objets **immutables/records**.  
- `[JsonPolymorphic]` / `[JsonDerivedType]` → **polymorphisme** contrôlé (C#/.NET modernes).

### 🧭 Pourquoi c’est important
- Un JSON **stable** et **prévisible** facilite l’intégration **API**, le **stockage** et les **tests**.  
- Les options et attributs te donnent un **contrôle fin** sans écrire toujours des converters.

### 🧩 Analogie
- **Sérialisation** est comme **emballer** un objet dans une **boîte standard** (JSON) pour l’échanger; les **options** sont les **règles d’emballage** (nommage, étiquettes, fragiles, etc.).

---

## 💡 Exemples C# — bases

```csharp
using System.Text.Json;
using System.Text.Json.Serialization;

public record Product(int Id, string Name, string Category, decimal Price);

var p = new Product(1, "Laptop", "Hardware", 1599m);

// Sérialiser en string
string json = JsonSerializer.Serialize(p);
// Désérialiser
var p2 = JsonSerializer.Deserialize<Product>(json);
```

**Par défaut** :
- Noms **inchangés** (Pas camelCase) → utilise `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` si nécessaire.  
- **Dates** en ISO‑8601, **decimal** et **double** en nombre JSON, **enums** en **entier** (sauf configuration).

---

## 🧰 Options courantes

```csharp
var options = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,   // camelCase
    WriteIndented = true,                                // lisible
    PropertyNameCaseInsensitive = true,                  // lecture souple
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // n'écrit pas les null
    NumberHandling = JsonNumberHandling.AllowReadingFromString,   // accepte nombres en string à la lecture
    MaxDepth = 64,                                       // profondeur max
    ReferenceHandler = ReferenceHandler.Preserve         // références/cycles
};

string s = JsonSerializer.Serialize(p, options);
var p3 = JsonSerializer.Deserialize<Product>(s, options);
```

---

## 🏷️ Contrôle par attributs

```csharp
public record Invoice(
    [property: JsonPropertyName("invoice_id")] int Id,
    [property: JsonPropertyName("customer")] string Customer,
    [property: JsonPropertyName("issued_at")] DateTimeOffset IssuedAt)
{
    [JsonIgnore] public string InternalNote { get; init; } = string.Empty;
}

// Nombres en string
public class Stats
{
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public int Total { get; set; }
}

// Choix du constructeur
public class User
{
    public string Name { get; }
    public int Age { get; }

    [JsonConstructor]
    public User(string name, int age)
    {
        Name = name; Age = age;
    }
}
```

---

## 🧬 Enums en **string** (au lieu d’entiers)

```csharp
public enum Status { Pending, Paid, Cancelled }

public class Payment
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Status Status { get; set; }
}

var options = new JsonSerializerOptions { Converters = { new JsonStringEnumConverter() } };
string j = JsonSerializer.Serialize(new Payment { Status = Status.Paid }, options);
// { "Status": "Paid" }
```

---

## 🕰️ Dates & fuseaux

```csharp
public record Event(string Title, DateTimeOffset Start);
var e = new Event("Launch", DateTimeOffset.Parse("2025-01-15T10:00:00-05:00"));
string j = JsonSerializer.Serialize(e); // ISO-8601 avec offset
var e2 = JsonSerializer.Deserialize<Event>(j);
```

- Préfère **`DateTimeOffset`** pour inclure le **fuseau** (offset).  
- Pour format custom, écris un **converter** spécifique.

---

## 🔄 Polymorphisme contrôlé

```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(Dog), typeDiscriminator: "dog")]
[JsonDerivedType(typeof(Cat), typeDiscriminator: "cat")]
public abstract class Animal { public string Name { get; set; } = string.Empty; }

public class Dog : Animal { public bool Barks { get; set; } }
public class Cat : Animal { public int Lives { get; set; } }

var animals = new Animal[] { new Dog { Name = "Rex", Barks = true }, new Cat { Name = "Mia", Lives = 9 } };
string j = JsonSerializer.Serialize(animals);
// [ {"$type":"dog",...}, {"$type":"cat",...} ]
var back = JsonSerializer.Deserialize<Animal[]>(j);
```

---

## 🧩 Converters personnalisés

### A) `Money` (montant + devise)
```csharp
public readonly record struct Money(decimal Amount, string Currency);

public sealed class MoneyConverter : JsonConverter<Money>
{
    public override Money Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartObject) throw new JsonException();
        decimal amount = 0; string currency = "";
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject) break;
            if (reader.TokenType != JsonTokenType.PropertyName) throw new JsonException();
            string name = reader.GetString()!;
            reader.Read();
            switch (name)
            {
                case "amount": amount = reader.GetDecimal(); break;
                case "currency": currency = reader.GetString()!; break;
                default: reader.Skip(); break; // ignorer propriétés inconnues
            }
        }
        return new Money(amount, currency);
    }

    public override void Write(Utf8JsonWriter writer, Money value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteNumber("amount", value.Amount);
        writer.WriteString("currency", value.Currency);
        writer.WriteEndObject();
    }
}

var options = new JsonSerializerOptions();
options.Converters.Add(new MoneyConverter());
string s = JsonSerializer.Serialize(new Money(19.99m, "EUR"), options);
```

### B) Date format custom
```csharp
public sealed class DateOnlyConverter : JsonConverter<DateTime>
{
    private const string Format = "yyyy-MM-dd";
    public override DateTime Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions opts)
        => DateTime.ParseExact(reader.GetString()!, Format, System.Globalization.CultureInfo.InvariantCulture);
    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions opts)
        => writer.WriteStringValue(value.ToString(Format));
}
```

---

## 📦 Async & Streaming

```csharp
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

await using var fs = File.OpenWrite("products.json");
var products = Enumerable.Range(1, 1000).Select(i => new Product(i, $"P{i}", "Cat", i)).ToList();
await JsonSerializer.SerializeAsync(fs, products, new JsonSerializerOptions { WriteIndented = false });

await using var rs = File.OpenRead("products.json");
var back = await JsonSerializer.DeserializeAsync<List<Product>>(rs);
```

**Points clés** :
- **Streaming** évite de charger de gros JSON **en mémoire** d’un coup.  
- Utilise `await using` avec `FileStream` et **buffer** adéquat.

---

## 🧷 Références & cycles

```csharp
public class Node
{
    public string Name { get; set; } = "";
    public Node? Next { get; set; }
}

var a = new Node { Name = "A" };
var b = new Node { Name = "B", Next = a };
a.Next = b; // cycle

var options = new JsonSerializerOptions { ReferenceHandler = ReferenceHandler.Preserve };
string j = JsonSerializer.Serialize(a, options);
var a2 = JsonSerializer.Deserialize<Node>(j, options);
```

---

## 🧱 Schémas ASCII

### A) Pipeline JSON (sérialisation)
```
Objet C# ──▶ JsonSerializer (options, converters, attributs) ──▶ UTF‑8 ──▶ string/stream
```

### B) Polymorphisme (discriminateur)
```
Animal
  ├─ Dog  → "$type":"dog"
  └─ Cat  → "$type":"cat"
```

---

## 🔧 Exercices guidés
1. **DTO API** : crée un `OrderDto` et sérialise en **camelCase** avec `WriteIndented`, ignore les champs `null`.  
2. **Enum string** : configure **globalement** `JsonStringEnumConverter` et vérifie l’écriture **en noms**.  
3. **Converter** : implémente `DateOnlyConverter` et vérifie round‑trip sur un modèle.

```csharp
var opts = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    WriteIndented = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};
opts.Converters.Add(new JsonStringEnumConverter());

string payload = JsonSerializer.Serialize(new { Status = Status.Paid, Note = (string?)null }, opts);
Console.WriteLine(payload.Contains("\"status\": "")); // camelCase
Console.WriteLine(payload.Contains("\"note\"" ) == false); // ignoré car null
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) Lecture nombres en string
var s1 = "{\"total\":\"42\"}";
var stats = JsonSerializer.Deserialize<Stats>(s1, new JsonSerializerOptions { NumberHandling = JsonNumberHandling.AllowReadingFromString });
Console.WriteLine(stats!.Total == 42);

// 2) Enum string
var pay = JsonSerializer.Serialize(new Payment { Status = Status.Paid }, new JsonSerializerOptions { Converters = { new JsonStringEnumConverter() } });
Console.WriteLine(pay.Contains("\"Paid\""));

// 3) Date converter
var opts2 = new JsonSerializerOptions { Converters = { new DateOnlyConverter() } };
string d = JsonSerializer.Serialize(DateTime.Parse("2025-01-15"), opts2);
Console.WriteLine(d == "\"2025-01-15\"" );
```

---

## ⚠️ Pièges fréquents
- **Profondeur** trop grande (`MaxDepth`) → exceptions ou performance; garder par défaut ou **limiter**.  
- **Noms** incohérents (Pas camelCase) côté client : activer **camelCase**.  
- **Enums** en entier par défaut → activer `JsonStringEnumConverter` si besoin de **lisibilité**/stabilité.  
- **Dates** sans fuseau → préférer `DateTimeOffset`.  
- **Cycles** d’objets → utiliser `ReferenceHandler.Preserve` ou repenser le modèle.  
- **Converters** non enregistrés → oublier `options.Converters.Add(...)`.  
- **Encodage** : si écriture manuelle, utiliser `Utf8JsonWriter` et éviter ré-encodages.

---

## 🧮 Formules (en JavaScript)
- **Taille JSON estimée** (naïf) :
```javascript
const jsonSizeBytes = (obj) => new TextEncoder().encode(JSON.stringify(obj)).length;
```
- **Somme totale** sur payload :
```javascript
const total = (items) => items.reduce((s, x) => s + (x.price * x.qty), 0);
```

---

## 📌 Résumé essentiel
- `JsonSerializer` + `JsonSerializerOptions` couvrent l’essentiel : **camelCase**, **indentation**, **nulls**, **enums**, **nombres en string**, **références**.  
- Les **attributs** contrôlent au cas par cas (`[JsonPropertyName]`, `[JsonIgnore]`, `[JsonNumberHandling]`, `[JsonConstructor]`, polymorphisme).  
- Les **converters** personnalisés débloquent les formats **spéciaux** (dates custom, types valeur).  
- Utilise **async/streaming** pour gros JSON; préfère `DateTimeOffset` pour le **fuseau**; pense à **MaxDepth** et aux **cycles**.
