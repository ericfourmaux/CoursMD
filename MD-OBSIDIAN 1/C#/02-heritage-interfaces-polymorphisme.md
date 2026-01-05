
# 📘 Chapitre 2.2 — Héritage, Interfaces, Polymorphisme

> **Niveau** : Débutant → Intermédiaire — **Objectif** : maîtriser l’**héritage** (classes de base/derivées, `abstract`, `virtual/override`, `sealed`), les **interfaces** (contrats, implémentations explicites, méthodes par défaut), et le **polymorphisme** (substitution LSP, dispatch dynamique) pour construire des API **extensibles** et **testables**.

---

## 🎯 Objectifs d’apprentissage
- Concevoir une **hiérarchie** propre : classe de base **abstraite**, dérivées **spécialisées**, `protected` pour l’extension.
- Utiliser `virtual/override`, `sealed`, `new` (masquage), `base` (chaînage) sans ambiguïtés.
- Programmer **contre des interfaces** (`IService`), y compris **implémentations explicites** et **méthodes par défaut** (C# 8+).
- Appliquer le **polymorphisme** : écrire du code qui accepte un **type abstrait** mais fonctionne avec **n** implémentations.
- Savoir **choisir composition vs héritage** (et éviter les anti-patterns).

---

## 🧠 Concepts clés

### 🧱 Héritage (classique)
- **But** : **réutiliser** et **spécialiser** un comportement commun via une **classe de base**.
- **Classe abstraite** : partiellement implémentée, **non instanciable**; impose des membres `abstract` aux dérivées.
- **Virtual dispatch** : un membre `virtual` **peut être redéfini** (`override`) dans les dérivées; l’appel se résout **à l’exécution** selon l’**objet réel**.
- **`sealed`** : empêche une classe ou un **override** d’être à nouveau redéfinis.
- **`new` (masquage)** : **cache** un membre de la base, *ne le redéfinit pas* (différent d’`override`).

### 🔌 Interfaces
- **Contrat** : liste de membres **sans implémentation** (sauf **méthodes par défaut** C# 8+). Permet **la substitution** (plusieurs classes peuvent le respecter).
- **Implémentation explicite** : lie un membre à l’interface **sans l’exposer** dans l’API publique (accessible via la **référence d’interface**).
- **Méthodes par défaut** : `interface I { void M() { ... } }` → fournit une **implémentation** que les classes peuvent **surcharger**.

### 🌀 Polymorphisme
- **Substitution (LSP)** : tout objet d’un **type dérivé** doit pouvoir remplacer sa **base** **sans surprendre** l’appelant.
- **Programmation orientée contrat** : on consomme un **IService**, pas une **classe concrète**.
- **Variance (avancé)** : `out` (covariance) et `in` (contravariance) sur interfaces génériques et délégués.

### 🧭 Pourquoi c’est important
- Permet de **découpler** : changer une implémentation **sans** toucher le code consommateur.
- Favorise l’**extensibilité** : on **ajoute** des comportements via de **nouvelles classes** plutôt que modifier l’existant (**Open/Closed**).

### 🧩 Analogie
- **Héritage** : une **famille** avec des **traits** communs (classe de base) et des **spécificités** par **enfant** (dérivés).  
- **Interfaces** : un **contrat de travail** : différentes personnes peuvent **signer** le même contrat et **fournir** la prestation.

---

## 💡 Exemples C# — complets et didactiques

### 1) Hiérarchie de formes (abstract + virtual/override)
```csharp
public abstract class Shape
{
    public string Name { get; }
    protected Shape(string name) => Name = name;
    public abstract double Area(); // contrat commun
    public virtual string Describe() => $"Shape: {Name}"; // redéfinissable
}

public sealed class Rectangle : Shape
{
    public double Width { get; }
    public double Height { get; }
    public Rectangle(double w, double h) : base("Rectangle")
    {
        if (w <= 0 || h <= 0) throw new ArgumentOutOfRangeException();
        Width = w; Height = h;
    }
    public override double Area() => Width * Height;
    public override string Describe() => base.Describe() + $", {Width}×{Height}";
}

public class Circle : Shape
{
    public double Radius { get; }
    public Circle(double r) : base("Circle")
    {
        if (r <= 0) throw new ArgumentOutOfRangeException();
        Radius = r;
    }
    public override double Area() => Math.PI * Radius * Radius;
}

// Polymorphisme en action
Shape s1 = new Rectangle(2, 3);
Shape s2 = new Circle(1.5);
Console.WriteLine(s1.Area()); // 6
Console.WriteLine(s2.Area()); // ~7.068...
```

### 2) `new` vs `override` (masquage)
```csharp
public class Base
{
    public virtual string Who() => "Base";
    public string Info() => "Info(Base)"; // non virtual
}

public class Derived : Base
{
    public override string Who() => "Derived"; // override: polymorphique
    public new string Info() => "Info(Derived)"; // masque, selon type statique
}

Base b = new Derived();
Console.WriteLine(b.Who()); // Derived (dispatch dynamique)
Console.WriteLine(b.Info()); // Info(Base) (masquage: type statique Base)
```

### 3) Interfaces (contrat + implémentation explicite + méthode par défaut)
```csharp
public interface INotifier
{
    void Notify(string message);
    // méthode par défaut: C# 8+
    void Validate(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Message requis", nameof(message));
    }
}

public class EmailNotifier : INotifier
{
    // implémentation explicite pour Validate (cachée dans l'API publique)
    void INotifier.Validate(string message)
    {
        if (message.Length < 3) throw new ArgumentException("Trop court");
    }

    public void Notify(string message)
    {
        ((INotifier)this).Validate(message); // accès explicite
        Console.WriteLine($"Email: {message}");
    }
}

public class SmsNotifier : INotifier
{
    public void Notify(string message)
    {
        // utilise la méthode par défaut
        ((INotifier)this).Validate(message);
        Console.WriteLine($"SMS: {message}");
    }
}

// polymorphisme via interface
void Broadcast(IEnumerable<INotifier> notifiers, string msg)
{
    foreach (var n in notifiers) n.Notify(msg);
}
```

### 4) Composition > Héritage (quand c’est préférable)
```csharp
// Mauvais: SpecialList hérite de List<T> pour "ajouter" une contrainte
// Mieux: encapsuler et déléguer
public class LimitedList<T>
{
    private readonly List<T> _inner = new();
    private readonly int _max;
    public LimitedList(int max) { _max = max; }
    public void Add(T item)
    {
        if (_inner.Count >= _max) throw new InvalidOperationException("Capacité atteinte");
        _inner.Add(item);
    }
    public IReadOnlyList<T> Items => _inner;
}
```

### 5) Variance (aperçu)
```csharp
// Covariance: permet d'utiliser une source de Dog là où Animal est attendu
IEnumerable<Dog> dogs = new List<Dog>();
IEnumerable<Animal> animals = dogs; // OK (out)

// Contravariance: comparer Animal avec un comparateur de Dog
IComparer<Dog> dogComparer = Comparer<Dog>.Default;
IComparer<Animal> animalComparer = dogComparer; // OK (in)
```

---

## 🧱 Schémas ASCII

### A) Hiérarchie
```
Shape (abstract)
  ├─ Rectangle (sealed)
  └─ Circle
```

### B) Virtual dispatch (simplifié)
```
Référence statique: Shape s = new Circle(1.5)
Appel: s.Area() ──▶ résolu à l'exécution (vtable) vers Circle.Area()
```

### C) Interface et implémentations
```
INotifier
  ├─ EmailNotifier (Validate explicite)
  └─ SmsNotifier (Validate par défaut)
Broadcast(INotifier[]) → appelle Notify() sans connaître la classe concrète
```

---

## 🔧 Exercices guidés
1. **Paiements** : définis `IPaymentProcessor.Process(decimal amount)` et implémente `CreditCardProcessor`, `PayPalProcessor`. Ajoute `ApplePayProcessor` **sans modifier** le code consommateur (**Open/Closed**).  
2. **LSP** : écris une fonction `PrintArea(Shape s)` et vérifie qu’elle fonctionne **sans condition spéciale** pour `Rectangle`/`Circle`.  
3. **Masquage vs Override** : reproduis l’exemple `Base/Derived`, observe la différence via références `Base` vs `Derived`.

---

## 🧪 Tests / Vérifications
```csharp
// 1) Polymorphisme interface
var procs = new List<IPaymentProcessor> {
    new CreditCardProcessor(), new PayPalProcessor()
};
foreach (var p in procs) Console.WriteLine(p.Process(100m));

// 2) LSP
void PrintArea(Shape s) => Console.WriteLine($"Area={s.Area():F2}");
PrintArea(new Rectangle(2,3));
PrintArea(new Circle(1.5));

// 3) new vs override
Base b = new Derived();
Derived d = new Derived();
Console.WriteLine(b.Info()); // Info(Base)
Console.WriteLine(d.Info()); // Info(Derived)
```

---

## ⚠️ Pièges fréquents
- **Abus d’héritage** (au lieu de **composition**) : rend la hiérarchie rigide, complique la maintenance.  
- **Casser LSP** : une dérivée qui jette `NotSupportedException` pour une méthode **attendue** casse la substitution.  
- **Appels non virtual** dans les **constructeurs** : évite d’appeler des membres **overridables** depuis le **constructeur** (état pas encore prêt).  
- **`new` vs `override`** mal compris : `new` **masque** selon le type **statique**, n’offre pas de polymorphisme.  
- **Interfaces trop grosses** : viole **Interface Segregation**; préfère **plusieurs petites** interfaces.

---

## 🧮 Formules (en JavaScript)
- **Aire du cercle** : `const areaCircle = Math.PI * r * r;`  
- **Aire du rectangle** : `const areaRect = w * h;`

---

## 📌 Résumé essentiel
- **Héritage** : partage un **socle** et **spécialise** via `abstract`, `virtual/override`, `sealed`.  
- **Interfaces** : **contrats** qui favorisent le **découplage**; pense **consommateur** → programme **contre l’interface**.  
- **Polymorphisme** : écris du code **générique** qui accepte un **type abstrait** et fonctionne avec **n** implémentations.  
- Choisis **composition** si l’héritage ne représente pas un **« est-un »** naturel, et segmente tes interfaces (**ISP**).  
- Évite `new` pour « corriger » une base : préfère **override** ou **refactor** la hiérarchie.
