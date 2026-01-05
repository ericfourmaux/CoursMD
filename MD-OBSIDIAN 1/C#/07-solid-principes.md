
# 📘 Chapitre 7.1 — SOLID, DRY, KISS (Qualité de code)

> **Niveau** : Intermédiaire — **Objectif** : maîtriser les **principes SOLID** et les heuristiques **DRY**/**KISS** pour écrire du code **lisible**, **testable**, **extensible** et **robuste** en C#. Chaque principe est détaillé avec **définition**, **pourquoi**, **analogie**, **exemples concrets**, **exercices** et **pièges** à éviter.

---

## 🎯 Objectifs d’apprentissage
- Comprendre et appliquer les **5 principes SOLID** : SRP, OCP, LSP, ISP, DIP.
- Savoir **éviter la duplication** (DRY) et **garder la simplicité** (KISS) sans sur‑ingénierie.
- S’approprier les **patterns** courants (Strategy, Factory, Adapter) pour respecter SOLID.
- Améliorer **testabilité**, **maintenabilité** et **évolutivité** d’un projet C#.

---

## 🧠 Concepts clés — Vue d’ensemble

- **SOLID** :
  1. **SRP** (Single Responsibility Principle) : une classe a **une seule raison de changer**.
  2. **OCP** (Open/Closed Principle) : **ouverte** à l’extension, **fermée** à la modification.
  3. **LSP** (Liskov Substitution Principle) : les sous‑types doivent pouvoir **remplacer** leur base **sans surprise**.
  4. **ISP** (Interface Segregation Principle) : préférer **plusieurs petites interfaces** à une grosse.
  5. **DIP** (Dependency Inversion Principle) : **dépendre d’abstractions**, pas de détails.
- **DRY** : *Don’t Repeat Yourself* — centraliser la **connaissance** pour éviter incohérences.
- **KISS** : *Keep It Simple, Stupid* — privilégier la **simplicité** (code, API, design).

---

## 1) SRP — Single Responsibility Principle

### 🧩 Définition
Une classe/module doit avoir **une seule responsabilité** (une raison de changer).

### 🧭 Pourquoi
- Diminue le **couplage** et facilite les **tests**.
- Localise les **changements** → réduction des **effets de bord**.

### 🧩 Analogie
Un **couteau** qui fait **tout** (tournevis, marteau, règle…) fait **mal** tout. Un **outil dédié** est **meilleur** et **plus sûr**.

### 💡 Exemples (C#)

```csharp
// Mauvais: classe "Dieu" mélange tout: logique métier + I/O + formatage
public class ReportService
{
    public string GenerateReport() { /* logique */ return "R"; }
    public void SaveToFile(string path, string content) { File.WriteAllText(path, content); }
    public string ToHtml(string content) { return $"<html><body>{content}</body></html>"; }
}

// Bon: séparation des responsabilités
public class ReportGenerator { public string Generate() => "R"; }
public class FileStorage { public void Save(string path, string content) => File.WriteAllText(path, content); }
public class HtmlFormatter { public string Format(string content) => $"<html><body>{content}</body></html>"; }
```

---

## 2) OCP — Open/Closed Principle

### 🧩 Définition
Les entités doivent être **ouvertes à l’extension** et **fermées à la modification**.

### 🧭 Pourquoi
- Évite le **churn** de code stable.
- Permet d’ajouter des **comportements** sans risquer de casser l’existant.

### 🧩 Analogie
Un **port USB** : tu **branches** des périphériques **sans** changer l’ordinateur.

### 💡 Exemples (C#)

```csharp
// Mauvais: switch qui grandit sans fin à chaque produit
public decimal PriceFor(string product, decimal basePrice)
{
    switch (product)
    {
        case "Standard": return basePrice;
        case "Premium": return basePrice * 1.2m;
        // ... à chaque nouveauté, on modifie ici
        default: return basePrice;
    }
}

// Bon: Strategy pattern (extension par nouveaux types)
public interface IPricingStrategy { decimal Apply(decimal basePrice); }
public class StandardPricing : IPricingStrategy { public decimal Apply(decimal basePrice) => basePrice; }
public class PremiumPricing  : IPricingStrategy { public decimal Apply(decimal basePrice) => basePrice * 1.2m; }

public class PriceCalculator
{
    private readonly IPricingStrategy _strategy;
    public PriceCalculator(IPricingStrategy strategy) => _strategy = strategy;
    public decimal Calculate(decimal basePrice) => _strategy.Apply(basePrice);
}
// Extension = ajouter une classe IPricingStrategy sans toucher PriceCalculator
```

---

## 3) LSP — Liskov Substitution Principle

### 🧩 Définition
Un sous‑type doit pouvoir **se substituer** à son type de base **sans altérer** la **logique attendue**.

### 🧭 Pourquoi
- Garantit le **polymorphisme fiable**.
- Évite les **surprises** (exceptions, préconditions renforcées, postconditions affaiblies).

### 🧩 Analogie
Si tu remplaces une **prise** par une **prise compatible**, tout **fonctionne** sans adapter tes appareils.

### 💡 Exemples (C#)

```csharp
public abstract class Shape { public abstract double Area(); }
public class Rectangle : Shape { public double W { get; } public double H { get; } public Rectangle(double w,double h){W=w;H=h;} public override double Area()=>W*H; }
public class Circle : Shape { public double R { get; } public Circle(double r){R=r;} public override double Area()=>Math.PI*R*R; }

// LSP: PrintArea ne doit pas connaître les dérivées
void PrintArea(Shape s) => Console.WriteLine($"Area={s.Area():F2}");
```

**Anti‑exemple** : un sous‑type qui **jette** `NotSupportedException` pour une méthode **attendue** casse LSP.

---

## 4) ISP — Interface Segregation Principle

### 🧩 Définition
Préférer **interfaces petites** et **cohérentes** à des interfaces **globales** ("gros menus") que tout le monde ne peut implémenter proprement.

### 🧭 Pourquoi
- Diminue le **couplage** et la **coercition** d’implémentations inutiles.
- Simplifie **tests** et **mocking**.

### 🧩 Analogie
Des **menus** spécialisés pour chaque **métier** au lieu d’un **méga‑menu** avec tout.

### 💡 Exemples (C#)

```csharp
// Mauvais: interface fourre-tout
public interface IRepository<T>
{
    T Get(int id);
    void Add(T item);
    void Update(T item);
    void Delete(int id);
    IEnumerable<T> Query(string filter);
}

// Bon: interfaces fines
public interface IReadable<T> { T Get(int id); IEnumerable<T> Query(string filter); }
public interface IWritable<T> { void Add(T item); void Update(T item); void Delete(int id); }
```

---

## 5) DIP — Dependency Inversion Principle

### 🧩 Définition
Les **haut niveaux** ne doivent pas dépendre des **détails bas niveaux**; tous **dépendent d’abstractions**.

### 🧭 Pourquoi
- **Découplage** → testabilité, substitution.
- Permet l’**injection de dépendances** (DI) et la configuration.

### 🧩 Analogie
Un **contrat** (interface) au lieu de dépendre d’une **personne** spécifique.

### 💡 Exemples (C#)

```csharp
public interface IEmailSender { Task SendAsync(string to, string subject, string body); }
public class SmtpEmailSender : IEmailSender { public Task SendAsync(string to,string subject,string body){ /* SMTP */ return Task.CompletedTask; } }

public class RegistrationService
{
    private readonly IEmailSender _sender;
    public RegistrationService(IEmailSender sender) => _sender = sender; // dépend de l'abstraction
    public async Task RegisterAsync(string email)
    {
        // ... logique
        await _sender.SendAsync(email, "Bienvenue", "Merci de vous être inscrit");
    }
}
```

---

## 🔗 DRY — Don’t Repeat Yourself

### 🧩 Définition
Éviter la **duplication de connaissance** : une règle métier, une configuration, un mapping ne doit exister qu’en **un seul endroit**.

### 🧭 Pourquoi
- Diminue les **incohérences** et le **coût** de maintenance.

### 💡 Exemples (C#)

```csharp
// Mauvais: validation du mot de passe dupliquée
bool IsValidPasswordA(string s) => s.Length >= 8 && s.Any(char.IsDigit);
bool IsValidPasswordB(string s) => s.Length >= 8 && s.Any(char.IsDigit);

// Bon: centraliser
static class PasswordRules
{
    public static bool IsValid(string s) => s.Length >= 8 && s.Any(char.IsDigit);
}
```

---

## ✂️ KISS — Keep It Simple, Stupid

### 🧩 Définition
Choisir la **solution la plus simple** qui **fonctionne** et peut **évoluer**.

### 🧭 Pourquoi
- Réduit les **bogues**.
- Améliore la **lisibilité** et la **vitesse** de développement.

### 💡 Exemples
- **Éviter** la métaprogrammation complexe pour une logique triviale.
- Préférer un **`foreach` lisible** à une chaîne de LINQ **obscure** si la lisibilité chute.

---

## 🧱 Schémas ASCII — Cartes mentales

### A) OCP via Strategy
```
PriceCalculator → IPricingStrategy
                     ├─ StandardPricing
                     └─ PremiumPricing
Extension = ajouter une classe; pas de modification du calculateur
```

### B) DIP & DI
```
RegistrationService → IEmailSender
                          ├─ SmtpEmailSender
                          └─ MockEmailSender (tests)
```

### C) ISP
```
IReadable<T>    IWritable<T>
   └─ ReadSvc      └─ WriteSvc
```

---

## 🔧 Exercices guidés
1. **Refactor SRP** : extrais stockage et formatage d’une classe "Dieu" vers des services dédiés; écris un test unitaire pour `ReportGenerator.Generate()`.  
2. **OCP** : remplace un `switch` prix par **Strategy** et ajoute une nouvelle stratégie `DiscountPricing`.  
3. **ISP** : scinde un repository monolithique en interfaces fines, puis adapte les services.  
4. **DIP** : injecte `IClock` (`DateTime Now()`) pour simplifier les tests d’un service qui dépend de l’heure.

```csharp
public interface IClock { DateTime Now(); }
public class SystemClock : IClock { public DateTime Now() => DateTime.UtcNow; }
public class FakeClock : IClock { private DateTime _t; public FakeClock(DateTime t){_t=t;} public DateTime Now()=>_t; }
```

---

## 🧪 Tests / Vérifications

```csharp
// SRP: tester uniquement la logique de génération (sans I/O)
var gen = new ReportGenerator();
string r = gen.Generate();
Console.WriteLine(!string.IsNullOrWhiteSpace(r));

// OCP: ajouter une stratégie sans modifier le calculateur
var calc = new PriceCalculator(new PremiumPricing());
Console.WriteLine(calc.Calculate(100m) == 120m);

// DIP: substituer la dépendance pour tester
IClock clock = new FakeClock(new DateTime(2025,1,1));
Console.WriteLine(clock.Now() == new DateTime(2025,1,1));
```

---

## ⚠️ Pièges fréquents
- **Sur‑découpage** (SRP extrême) → éparpillement et complexité inutile.
- **Fausse OCP** : multiplier les stratégies inutilement; évaluer la **valeur** ajoutée.
- **LSP** mal compris : dérivés qui **restreignent** les préconditions ou changent des **invariants**.
- **Interfaces géantes** (ISP violé) : rendent les implémentations **fragiles**.
- **DIP** sans **abstraction pertinente** : interfaces « cargo‑cult » sans bénéfices.
- **DRY** mal placé : factoriser du **code accidentel** → complexité; DRY s’applique à la **connaissance**.
- **KISS** oublié : sur‑ingénierie et patterns **non justifiés**.

---

## 🧮 Formules (en JavaScript)
- **Indice de duplication** (naïf) :
```javascript
const duplicationIndex = (occurrences, unique) => (occurrences - unique) / Math.max(1, occurrences);
```
- **Complexité cyclomatique** (approximée) :
```javascript
const cyclomatic = (edges, nodes, components=1) => edges - nodes + 2*components;
```
- **Couplage afférent/efférent** (idée) :
```javascript
const instability = (afferent, efferent) => efferent / Math.max(1, (afferent + efferent));
```

---

## 📌 Résumé essentiel
- **SOLID** guide la **structure** du code : SRP (une responsabilité), OCP (extension), LSP (substitution fiable), ISP (interfaces fines), DIP (abstractions).  
- **DRY/KISS** guident la **mise en œuvre** : moins de duplication, plus de simplicité.  
- **Patterns** (Strategy, Factory, Adapter) aident à respecter SOLID **sans sur‑ingénierie**.  
- Priorise **lisibilité**, **tests**, **évolutivité**; mesure la complexité et évite les **anti‑patterns**.
