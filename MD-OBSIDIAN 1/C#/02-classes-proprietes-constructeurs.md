
# 📘 Chapitre 2.1 — Classes, Propriétés, Constructeurs

> **Niveau** : Débutant → Intermédiaire — **Objectif** : comprendre la définition d’une **classe** en C#, la création d’objets (**instances**), l’**encapsulation** via **propriétés**, et la **construction** correcte d’objets avec **constructeurs** (surcharges, validations, immutabilité).

---

## 🎯 Objectifs d’apprentissage
- Définir une **classe** avec des champs et des **propriétés** (auto-implémentées, avec logique, `init`, `get`/`set`).
- Créer des **instances** avec des **constructeurs** (paramétrés, surchargés), et comprendre `this`.
- Appliquer l’**encapsulation** : cacher les détails, exposer une API sûre (validation, lecture seule où nécessaire).
- Utiliser **initialiseurs d’objets** et distinguer **mutable vs immutable** (ex. `record`).
- Choisir les **modificateurs d’accès** appropriés (`public`, `private`, `protected`, `internal`).

---

## 🧠 Concepts clés

### 🧩 Définition — Classe & Objet
- **Classe** : plan (moule) qui décrit la **forme** (données) et le **comportement** (méthodes) d’un type.  
- **Objet**/**Instance** : réalisation concrète de la classe en mémoire (avec ses valeurs propres).

### 🔒 Encapsulation
- **Encapsulation** : protéger les invariants d’un objet en contrôlant l’accès/les modifications via **propriétés** (et non champs publics).  
- **Invariants** : règles toujours vraies (ex. un email valide, un solde non négatif).

### 🏷️ Propriétés
- **Auto-implémentée** : `public string Name { get; set; }`.  
- **Avec logique** (backing field) : permet la **validation**, la **conversion**, la **notification**.  
- **Lecture seule** : `get` public, `set` privé; ou `init` (immutable après initialisation).  
- **`required`** (C# 11) : impose l’initialisation à la création.

### 🧱 Constructeurs
- **But** : garantir qu’un objet commence **dans un état valide** (fixer les invariants).  
- **Surcharge** : plusieurs signatures pour des scénarios différents.  
- **Chaînage** : appeler un autre constructeur avec `: this(...)`.

### 🧭 Pourquoi c’est important
- Un modèle d’objet **solide** évite les bugs en aval (API, base de données, UI).  
- L’encapsulation **réduit le couplage** et augmente la **testabilité**.

### 🧩 Analogie
- Une **classe** est le **plan** d’une maison; le **constructeur** est l’**étape de construction** qui garantit fondations et structure; les **propriétés** sont les **portes/fenêtres** avec des **verrous** (validation) pour contrôler l’accès.

---

## 💡 Exemples complets (C#)

### 1) Classe avec propriétés auto-implémentées
```csharp
public class Client
{
    public required string Name { get; init; }  // doit être fourni à la création
    public string? Email { get; set; }          // valeur nullable
    public DateTime CreatedAt { get; } = DateTime.UtcNow; // lecture seule
}

// Utilisation (initialiseur d’objet)
var c = new Client { Name = "Eric", Email = "eric@example.com" };
```

### 2) Propriété avec validation (backing field)
```csharp
public class BankAccount
{
    private decimal _balance; // backing field

    public string Owner { get; }

    public decimal Balance
    {
        get => _balance;
        private set
        {
            if (value < 0) throw new ArgumentOutOfRangeException(nameof(Balance), "Solde négatif interdit.");
            _balance = value;
        }
    }

    // Constructeur : invariant de départ
    public BankAccount(string owner, decimal initialDeposit = 0m)
    {
        if (string.IsNullOrWhiteSpace(owner)) throw new ArgumentException("Owner requis", nameof(owner));
        if (initialDeposit < 0) throw new ArgumentOutOfRangeException(nameof(initialDeposit));
        Owner = owner;
        Balance = initialDeposit; // passe par la validation
    }

    // Comportement métier
    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        Balance += amount; // valide via setter privé
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (Balance - amount < 0) throw new InvalidOperationException("Solde insuffisant.");
        Balance -= amount;
    }
}

// Utilisation
var acc = new BankAccount("Eric", 100m);
acc.Deposit(50m);
acc.Withdraw(120m);
```

### 3) Surcharge et chaînage de constructeurs
```csharp
public class Rectangle
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double width, double height)
    {
        if (width <= 0 || height <= 0) throw new ArgumentOutOfRangeException("Dimensions positives requises.");
        Width = width; Height = height;
    }

    public Rectangle(double side) : this(side, side) { } // carré

    public double Area() => Width * Height;
}
```

### 4) Immutabilité pratique avec `record`
```csharp
public readonly record struct Coordinates(double Latitude, double Longitude);

public record Person(string FirstName, string LastName)
{
    public string FullName => $"{FirstName} {LastName}";
}

var p = new Person("Eric", "Fourmaux");
// p.FirstName = "Autre"; // interdit : set init-only dans un record positionnel
```

> 🔎 **Note** : `record` favorise les modèles **immuables** et la **comparaison par valeur** (utile pour DTOs). `record struct` combine la sémantique valeur avec immutabilité.

---

## 🧱 Schémas ASCII

### A) Cycle de vie d’un objet
```
Classe BankAccount
         │
         ├─ new BankAccount("Eric", 100m) ─▶ [Instance #A]
         │                                     Owner = "Eric"
         │                                     Balance = 100
         └─ Méthodes: Deposit/Withdraw affectent l'état via validation
```

### B) Modificateurs d’accès
```
public    : visible depuis tous les assemblies (API publique)
internal  : visible dans le même assembly (bibliothèque interne)
protected : visible dans la classe et ses dérivées
private   : visible uniquement dans la classe
```

### C) Propriété avec backing field
```
Balance
  get ─▶ return _balance
  set ─▶ if (value < 0) throw ...
          _balance = value
```

---

## 🔧 Exercices guidés
1. **Person complète** : implémente une classe `Person` avec `FirstName` (required), `LastName` (required), `BirthDate` (required, `DateTime`), et une propriété **calculée** `Age` en années (lecture seule). Valide que `BirthDate` ≤ aujourd’hui.  
2. **Produit** : implémente `Product` avec `Name` (`required`), `Price` (`decimal`, `set` privé, validation ≥ 0), constructeur(s) et une méthode `ApplyDiscount(decimal percent)` avec validation (0–100).  
3. **Immutabilité** : crée un `record` `Money(decimal Amount, string Currency)` et démontre la comparaison par valeur.

```csharp
public class Person
{
    public required string FirstName { get; init; }
    public required string LastName  { get; init; }
    public DateTime BirthDate { get; }

    public int Age
    {
        get
        {
            var today = DateTime.Today;
            int age = today.Year - BirthDate.Year;
            if (BirthDate.Date > today.AddYears(-age)) age--; // corrige si anniversaire pas encore passé
            return age;
        }
    }

    public Person(string firstName, string lastName, DateTime birthDate)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("FirstName requis", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName))  throw new ArgumentException("LastName requis",  nameof(lastName));
        if (birthDate > DateTime.Today) throw new ArgumentOutOfRangeException(nameof(birthDate), "BirthDate futur interdit.");
        FirstName = firstName; LastName = lastName; BirthDate = birthDate;
    }
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) Age calculé
var eric = new Person("Eric", "Fourmaux", new DateTime(1990, 5, 10));
Console.WriteLine(eric.Age >= 0); // true

// 2) BankAccount : garde-fous
var acc = new BankAccount("Eric", 100m);
acc.Deposit(50m);
try { acc.Withdraw(1000m); } catch (InvalidOperationException) { Console.WriteLine("OK: solde insuffisant"); }

// 3) Rectangle (carré)
var r = new Rectangle(2);
Console.WriteLine(r.Area() == 4);

// 4) Record : comparaison par valeur
var m1 = new Money(10m, "EUR");
var m2 = new Money(10m, "EUR");
Console.WriteLine(m1 == m2); // true
```

---

## ⚠️ Pièges fréquents
- **Champs publics** au lieu de **propriétés** : impossible de valider/contrôler (éviter).  
- **Setters** trop permissifs : laissent l’objet dans un état **invalide**.  
- **Collections exposées** directement : préférer `IReadOnlyList<T>` ou exposer des **méthodes** pour modifier.  
- **Oublier le constructeur** nécessaire pour des outils (certaines libs/ORMs attendent un constructeur accessible).  
- **Validation coûteuse** dans un `set` appelé très souvent : déplacer la logique si besoin.

---

## 🧮 Formules (en JavaScript)

### A) Calcul d’âge (approximation correcte jour/mois)
```javascript
const ageYears = (birthDateStr) => {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};
```

### B) Intérêts composés
```javascript
const futureValue = (principal, rate, years) => principal * Math.pow(1 + rate, years);
```

---

## 📌 Résumé essentiel
- Une **classe** définit **données + comportement**; un **constructeur** garantit un **état initial valide**.  
- Les **propriétés** sont le **point d’accès** à l’état : validation, lecture seule, `init`, `required`.  
- **Encapsulation** = API **sûre** : tu préserves les invariants et évites les états incohérents.  
- **Immutabilité** (`record`, `init`) simplifie la **raisonnement** et la **comparaison**.  
- Choisis les **modificateurs d’accès** pour limiter la surface d’attaque et clarifier l’usage.
