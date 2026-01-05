
# 📘 Chapitre 8.1 — Tests unitaires & TDD (xUnit / MSTest, Mocks & Coverage)

> **Niveau** : Intermédiaire — **Objectif** : écrire des **tests unitaires** efficaces en C# avec **xUnit** et **MSTest**, pratiquer le **TDD**, utiliser des **mocks/stubs/fakes** (ex. **Moq**, **NSubstitute**), mesurer la **couverture** (**coverlet**), et adopter les **bonnes pratiques** (AAA, nommage, isolation, testabilité).

---

## 🎯 Objectifs d’apprentissage
- Comprendre **TDD** (Red → Green → Refactor) et le cycle **AAA** (*Arrange–Act–Assert*).
- Écrire des tests avec **xUnit** ([`[Fact]`, `[Theory]`, `InlineData`]) et **MSTest** ([`[TestClass]`, `[TestMethod]`]).
- Maîtriser les **test doubles** : **Dummy**, **Stub**, **Fake**, **Mock**, **Spy** — avec **Moq** ou **NSubstitute**.
- Tester **exceptions**, **asynchronisme**, **temps** et **I/O** via **abstractions** (ex. `IClock`).
- Mesurer la **couverture** de code avec **coverlet** (`dotnet test /p:CollectCoverage=true`).
- Utiliser des **assertions** claires (xUnit, **FluentAssertions**) et des **noms** explicites.

---

## 🧠 Concepts clés

### 🔁 TDD — Red → Green → Refactor
1. **Red** : écrire un test **qui échoue** (définit l’intention).  
2. **Green** : coder la **solution minimale** pour faire **passer** le test.  
3. **Refactor** : **nettoyer** le code tout en gardant **vert**.

### 🧩 AAA — Arrange, Act, Assert
- **Arrange** : préparer données/mocks.  
- **Act** : exécuter **l’action** testée.  
- **Assert** : vérifier le **résultat** attendu.

### 🧪 Test doubles
- **Dummy** : paramètre **non utilisé**.  
- **Stub** : **retours prédéfinis**; pas d’assertion sur interactions.  
- **Fake** : implémentation **simplifiée** (ex. mémoire).  
- **Mock** : vérifie **interactions** (ex. appel de méthode).  
- **Spy** : **enregistre** ce qui s’est passé.

### 🧭 Bonnes pratiques
- Tests **isolés**, **déterministes**, rapides (**< 100 ms**).  
- **Nommer** : `Method_Should_DoX_When_Y`.  
- **Un seul** concept par test.  
- Éviter temps réel : injecter `IClock`.  
- Pas de **ordre** entre tests (indépendants).

---

## 💡 xUnit — bases

```csharp
using Xunit;

public class MathUtilsTests
{
    [Fact]
    public void Max_Should_Return_A_When_A_Greater()
    {
        // Arrange
        int a = 10, b = 7;

        // Act
        int result = Math.Max(a, b);

        // Assert
        Assert.Equal(10, result);
    }

    [Theory]
    [InlineData(10, 7, 10)]
    [InlineData(7, 10, 10)]
    [InlineData(3, 3, 3)]
    public void Max_Should_Work_For_Samples(int a, int b, int expected)
    {
        Assert.Equal(expected, Math.Max(a, b));
    }
}
```

**xUnit** n’utilise pas `[TestClass]`/`[TestMethod]` mais **`[Fact]`** (cas simple) et **`[Theory]`** (paramétré). Les **constructeurs** servent à l’init (no `[SetUp]`).

---

## 💡 MSTest — bases

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;

[TestClass]
public class PriceCalculatorTests
{
    [TestMethod]
    public void Calculate_Should_Apply_Discount()
    {
        // Arrange
        var calc = new PriceCalculator(new DiscountPricing());

        // Act
        decimal price = calc.Calculate(100m);

        // Assert
        Assert.AreEqual(90m, price);
    }
}
```

---

## 🔧 Mocks avec **Moq** (ou **NSubstitute**)

### Exemple — vérifier une interaction
```csharp
using Moq;
using Xunit;

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body);
}

public class RegistrationService
{
    private readonly IEmailSender _sender;
    public RegistrationService(IEmailSender sender) => _sender = sender;

    public async Task RegisterAsync(string email)
    {
        // ... validation, persistence
        await _sender.SendAsync(email, "Bienvenue", "Merci pour votre inscription");
    }
}

public class RegistrationServiceTests
{
    [Fact]
    public async Task RegisterAsync_Should_Send_Welcome_Email()
    {
        // Arrange
        var mock = new Mock<IEmailSender>();
        var svc = new RegistrationService(mock.Object);

        // Act
        await svc.RegisterAsync("eric@example.com");

        // Assert (interaction)
        mock.Verify(m => m.SendAsync(
            It.Is<string>(to => to.Contains("@")),
            "Bienvenue",
            It.IsAny<string>()
        ), Times.Once);
    }
}
```

### Variante **NSubstitute**
```csharp
using NSubstitute;
using Xunit;

[Fact]
public async Task Should_Send_Email()
{
    var sender = Substitute.For<IEmailSender>();
    var svc = new RegistrationService(sender);

    await svc.RegisterAsync("eric@example.com");

    await sender.Received(1).SendAsync(
        Arg.Is<string>(s => s.EndsWith("example.com")),
        "Bienvenue", Arg.Any<string>());
}
```

---

## 🧪 Tester les **exceptions** et l’**async**

```csharp
using Xunit;

[Fact]
public void Withdraw_Should_Throw_When_Insufficient()
{
    var acc = new BankAccount("Eric", 100m);
    Assert.Throws<InvalidOperationException>(() => acc.Withdraw(500m));
}

[Fact]
public async Task FetchAsync_Should_Respect_Cancellation()
{
    using var cts = new CancellationTokenSource(10);
    await Assert.ThrowsAsync<TaskCanceledException>(async () =>
    {
        await HttpClientFactory.Create().GetAsync("https://example.com", cts.Token);
    });
}
```

---

## ⏱️ Temps & horloge (testabilité)

```csharp
public interface IClock { DateTime Now { get; } }
public sealed class SystemClock : IClock { public DateTime Now => DateTime.UtcNow; }
public sealed class FakeClock : IClock { public DateTime Now { get; set; } }

public sealed class License
{
    private readonly IClock _clock;
    public License(IClock clock) => _clock = clock;
    public bool IsExpired(DateTime end) => _clock.Now > end;
}

// Test
[Fact]
public void IsExpired_Should_Use_Clock()
{
    var clock = new FakeClock { Now = new DateTime(2025,1,1) };
    var lic = new License(clock);
    Assert.True(lic.IsExpired(new DateTime(2024,12,31)));
}
```

---

## 📏 Assertions **claires** (FluentAssertions)

```csharp
using FluentAssertions;

[Fact]
public void Area_Should_Be_Positive()
{
    var r = new Rectangle(2,3);
    r.Area().Should().BeGreaterThan(0);
    r.Width.Should().Be(2);
    r.Height.Should().Be(3);
}
```

---

## 📈 Couverture de code — **coverlet**

### A) Commande rapide
```bash
# Dans un projet de tests
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput=./TestResults/coverage.xml
```

### B) Fichiers d’exclusion (ex. auto‑généré, DTO)
```xml
<ItemGroup>
  <ExcludeFromCodeCoverage>**/Migrations/*.cs</ExcludeFromCodeCoverage>
</ItemGroup>
```

*(Visualiser avec **ReportGenerator** ou outils CI.)*

---

## 🧱 Schémas ASCII

### A) Cycle TDD
```
[Red] → écrire test qui échoue
  ↓
[Green] → implémentation minimale
  ↓
[Refactor] → amélioration sans casser
```

### B) AAA
```
Arrange → Act → Assert
```

### C) Test doubles
```
Dummy | Stub | Fake | Mock | Spy
```

---

## 🔧 Exercices guidés
1. **TDD** : écris un test `[Theory]` pour `IsValidPassword(string)` (longueur≥8, 1 chiffre), implémente puis **refactorise**.  
2. **Mock** : vérifie qu’un `OrderService` **appelle** `IEmailSender.SendAsync` après `PlaceOrder`.  
3. **Async + Timeout** : teste `DownloadWithTimeoutAsync` (retour `null` en <200ms) avec `CancellationTokenSource`.

```csharp
public class PasswordTests
{
    [Theory]
    [InlineData("Abcdef1g", true)]
    [InlineData("short1", false)]
    [InlineData("NoDigits", false)]
    public void IsValidPassword_Should_Work(string s, bool expected)
    {
        bool ok = PasswordRules.IsValid(s);
        Assert.Equal(expected, ok);
    }
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// xUnit discovery
Assert.True(true);

// MSTest AreEqual
Microsoft.VisualStudio.TestTools.UnitTesting.Assert.AreEqual(2, 1+1);

// FluentAssertions
new [] {1,2,3}.Should().Contain(2).And.HaveCount(3);
```

---

## ⚠️ Pièges fréquents
- **Tests lents** (sleep, I/O réel) → **fakes** ou abstraction (mémoire).  
- **Couplage** aux **horloges** et au **random** → injecter `IClock` / `IRandom`.  
- **Mauvais nommage** : `Test1` — vise des **phrases** explicites.  
- **Assertions multiples** sur **concepts différents** → scinder.  
- **Mocks partout** : préfère **stubs** simples; teste **comportement**, pas impl. interne.  
- **Couverture** élevée mais **tests pauvres** : privilégie **qualité** et **cas pertinents**.

---

## 🧮 Formules (en JavaScript)
- **Temps médian** (naïf) :
```javascript
const median = (arr) => {
  const a = [...arr].sort((x,y)=>x-y);
  const n = a.length;
  return n%2 ? a[(n-1)/2] : (a[n/2-1] + a[n/2])/2;
};
```
- **Score de stabilité** (naïf tests verts)
```javascript
const stability = (passed, total) => passed / Math.max(1, total);
```

---

## 📌 Résumé essentiel
- **TDD** : Red → Green → Refactor; **AAA** pour structurer chaque test.  
- **xUnit/MSTest** : maîtriser cas simples (`[Fact]`/`[TestMethod]`) et paramétrés (`[Theory]`).  
- **Mocks/Stubs** : utiliser **Moq**/**NSubstitute** sans sur‑ingénierie; tester **interactions** pertinentes.  
- **Couverture** : collecter avec **coverlet** et viser **qualité** avant le **pourcentage**.  
- **Lisibilité/Isolation** : noms clairs, pas de dépendances temporelles; tests rapides et déterministes.
