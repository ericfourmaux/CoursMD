
# 📘 Chapitre 3.2 — Exceptions & Nullability (références nullables)

> **Niveau** : Débutant → Intermédiaire — **Objectif** : maîtriser la gestion des **exceptions** (`try/catch/finally`, `throw`, filtres, exceptions personnalisées, bonnes pratiques) et comprendre les **références nullables** (C# 8+) : annotations `?`, opérateurs `??`/`?.`, **analyse de flux** du compilateur, **attributs d’annotations** et pièges courants.

---

## 🎯 Objectifs d’apprentissage
- Savoir **lever**, **propager** et **intercepter** correctement des exceptions; choisir **quand** utiliser une exception vs un **retour** (`TryParse`).
- Utiliser `try/catch/finally`, **filtres** `catch (...) when (...)`, **rethrow** correct (`throw;`) et **ressources** (`using`).
- Créer des **exceptions personnalisées** (avec `SerializationInfo`, `InnerException`).
- Activer et utiliser les **références nullables** : `#nullable enable` ou `<Nullable>enable</Nullable>`, comprendre `string?` vs `string`.
- Exploiter les **opérateurs** et **attributs** de nullabilité (`??`, `?.`, `!`, `[NotNullWhen]`, `[MemberNotNull]`, …).

---

## 🧠 Concepts clés

### 🚨 Exception — définition
- **Exception** : objet décrivant une **erreur** ou une **condition anormale**; interrompt le flux normal d’exécution et **remonte** la pile jusqu’à un **catch** ou le **bord** de l’application.
- **Principe** : utiliser les exceptions pour des **situations exceptionnelles**, pas pour le **flux attendu**.

### 🧭 Nullability (C# 8+)
- **Références nullables** : le compilateur analyse la **possibilité** qu’une référence soit `null` et **prévient** (warnings) des **déréférencements** dangereux.
- `string` → **non-nullable** (ne doit pas être `null`).  
- `string?` → **nullable** (peut être `null`).
- **Opérateurs** utiles : `??` (valeur par défaut si `null`), `?.` (accès conditionnel), `!` (**null-forgiving** : supprime le warning mais **n’assure pas** la non-nullité).

### 🔧 Activer les références nullables
- **Au fichier** :
```csharp
#nullable enable
// ... code avec nullability
#nullable disable
```
- **Au projet** (`.csproj`) :
```xml
<PropertyGroup>
  <Nullable>enable</Nullable>
  <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
</PropertyGroup>
```
*(Tu peux passer à `warnings as errors` plus tard pour renforcer la discipline.)*

---

## 💡 Exceptions — usage et patrons

### 1) `try/catch/finally` et rethrow
```csharp
try
{
    DoWork();
}
catch (IOException ex)
{
    // journaliser, enrichir, puis repropager si nécessaire
    Console.Error.WriteLine(ex.Message);
    throw; // rethrow préserve la pile (éviter: throw ex;)
}
finally
{
    Cleanup(); // s'exécute toujours
}
```

### 2) Filtres d’exception (`when`)
```csharp
try
{
    NetworkCall();
}
catch (Exception ex) when (ex is TimeoutException || ex is OperationCanceledException)
{
    Console.WriteLine("Opération stoppée ou expirée.");
}
```

### 3) `using` (ressources) & `IDisposable`
```csharp
using var fs = new FileStream(path, FileMode.Open, FileAccess.Read);
using var reader = new StreamReader(fs);
string content = reader.ReadToEnd();
// libère automatiquement même en cas d'exception
```

### 4) Lever une exception (throw expressions)
```csharp
string Normalize(string? name)
    => name?.Trim() ?? throw new ArgumentNullException(nameof(name));
```

### 5) Exceptions personnalisées
```csharp
[Serializable]
public class DomainRuleViolationException : Exception
{
    public string RuleName { get; }
    public DomainRuleViolationException(string ruleName, string? message = null, Exception? inner = null)
        : base(message ?? $"Règle métier violée: {ruleName}", inner)
        => RuleName = ruleName;

    protected DomainRuleViolationException(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context) : base(info, context)
    {
        RuleName = info.GetString(nameof(RuleName))!;
    }

    public override void GetObjectData(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context)
    {
        base.GetObjectData(info, context);
        info.AddValue(nameof(RuleName), RuleName);
    }
}
```

### 6) Exceptions et `async/await`
```csharp
async Task<string> FetchAsync(HttpClient client, string url, CancellationToken ct)
{
    using var response = await client.GetAsync(url, ct); // exceptions: HttpRequestException, TaskCanceledException
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync(ct);
}

// Note: avec Task.Wait/Result, les exceptions peuvent être enveloppées dans AggregateException.
```

---

## 💼 Nullability — pratique

### 1) Warnings typiques et analyse de flux
```csharp
string? input = Console.ReadLine();
// CS8602: déréférencement possible
int len = input.Length; // ⚠️ warning

// Corriger avec une vérification
if (!string.IsNullOrWhiteSpace(input))
{
    int okLen = input.Length; // pas de warning (analyse de flux)
}
```

### 2) Opérateurs `?.`, `??`, `!`
```csharp
string? s = GetMaybeNull();
int length = s?.Length ?? 0;     // 0 si s == null
int risky = s!.Length;           // supprime le warning (⚠️ si s est null à l'exécution, NullReferenceException)
```

### 3) Attributs d’annotations (System.Diagnostics.CodeAnalysis)
```csharp
using System.Diagnostics.CodeAnalysis;

bool TryGetName(int id, [NotNullWhen(true)] out string? name)
{
    if (id == 0) { name = null; return false; }
    name = "Eric"; return true; // si true → name est non-null
}

public class User
{
    private string? _name;

    [MemberNotNull(nameof(_name))]
    public void Initialize(string name)
    {
        _name = name ?? throw new ArgumentNullException(nameof(name));
    }

    public string Name => _name ?? throw new InvalidOperationException("Non initialisé");
}
```

### 4) Valeurs nullables (`Nullable<T>`, `int?`)
```csharp
int? maybe = null;
int valueOrDefault = maybe ?? -1;
if (maybe is int v) Console.WriteLine(v); // pattern matching extrait la valeur
```

---

## 🧱 Schémas ASCII

### A) Propagation d’une exception
```
DoWork() → Parse() → ReadFile() → FileStream.Open()
                                  └─ IOException levée
            ▲  remonte la pile jusqu'à un catch
```

### B) Nullability — analyse de flux
```
string? s
   ├─ if (s != null) ─▶ s (non-null) dans le bloc
   └─ else ─▶ s (null) dans le bloc else
```

---

## 🔧 Exercices guidés
1. **Parsing sûr** : écris `bool TryParsePrice(string? s, out decimal price)` qui gère `null`, espaces, séparateurs culturels; **ne lance pas** d’exception.  
2. **Guard clauses** : crée `CreateUser(string username, string email)` qui valide non-null, format email, et lève `ArgumentException/ArgumentNullException` avec **messages clairs**.  
3. **Règle métier** : lève `DomainRuleViolationException` si un montant est négatif dans `ApplyCredit(decimal amount)`.

```csharp
bool TryParsePrice(string? s, out decimal price)
{
    price = 0m;
    if (string.IsNullOrWhiteSpace(s)) return false;
    return decimal.TryParse(s, System.Globalization.NumberStyles.Number,
                            System.Globalization.CultureInfo.InvariantCulture, out price);
}

User CreateUser(string username, string email)
{
    if (string.IsNullOrWhiteSpace(username)) throw new ArgumentNullException(nameof(username));
    if (string.IsNullOrWhiteSpace(email)) throw new ArgumentNullException(nameof(email));
    if (!email.Contains('@')) throw new ArgumentException("Email invalide", nameof(email));
    return new User { /* ... */ };
}

void ApplyCredit(decimal amount)
{
    if (amount < 0) throw new DomainRuleViolationException("CreditAmountNegative");
    // ... appliquer le crédit
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
Console.WriteLine(TryParsePrice(null, out _) == false);
Console.WriteLine(TryParsePrice("  ", out _) == false);
Console.WriteLine(TryParsePrice("19.99", out var p) && p == 19.99m);

try { CreateUser("", "x@y"); } catch (ArgumentNullException) { Console.WriteLine("OK: username requis"); }
try { CreateUser("Eric", "x" ); } catch (ArgumentException)    { Console.WriteLine("OK: email invalide"); }

try { ApplyCredit(-1m); } catch (DomainRuleViolationException e) { Console.WriteLine(e.RuleName); }
```

---

## ⚠️ Pièges fréquents
- **`throw ex;`** perd la **pile** d’origine; utiliser **`throw;`** pour **repropager**.  
- **Exceptions pour logique normale** (ex. parsing) → préfère `TryParse` et **retours booléens**.  
- **Null-forgiving `!`** utilisé à tort : supprime le warning mais **n’empêche pas** un `NullReferenceException` à l’exécution.  
- **Catch trop larges** (`catch (Exception)`) qui **masquent** les erreurs; **filtrer** ou **spécifier**.  
- **`IQueryable`** : évaluer une méthode non traduisible côté base → exception ou **pull in memory** (voir Module EF Core).

---

## 🧮 Formules (en JavaScript)
- **Probabilité cumulée d’erreur** (simplifiée, indépendance) :
```javascript
const cumulativeError = (errors) => 1 - errors.reduce((p, e)=> p*(1-e), 1);
// ex: erreurs = [0.01, 0.02] → 1 - (0.99*0.98) ≈ 0.0298
```

---

## 📌 Résumé essentiel
- Utilise les exceptions pour des **situations exceptionnelles**; préfère des **API TryXxx** pour les cas attendus.  
- `try/catch/finally`, filtres `when`, `using` pour libérer les ressources; **rethrow** avec `throw;`.  
- Active les **références nullables** et traite les **warnings** (analyse de flux).  
- Maîtrise `?.`, `??`, `!` et les **attributs** (`[NotNullWhen]`, `[MemberNotNull]`, …) pour documenter les contrats.  
- Écris des messages d’exception **clairs** et **contextualisés**; évite les `catch (Exception)` génériques.
