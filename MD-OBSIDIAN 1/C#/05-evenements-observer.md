
# 📘 Chapitre 5.2 — Événements & Observer

> **Niveau** : Débutant → Intermédiaire — **Objectif** : maîtriser le modèle **événementiel** en C# (`event`, **pattern** `EventHandler`/`EventArgs`, **multicast**, **thread-safety**) et le **patron Observer** via **`IObservable<T>` / `IObserver<T>`**, pour construire des systèmes **réactifs** et **découplés**.

---

## 🎯 Objectifs d’apprentissage
- Déclarer des **événements** avec `event` et le **pattern .NET** (`EventHandler`, `EventArgs`).
- Lever (raise) un événement de façon **sûre** (null-conditional, copie de l’invocation list, `OnXxx` `protected virtual`).
- Comprendre le **multicast**, l’**ordre d’invocation**, et la **gestion des exceptions** côté abonnés.
- Implémenter le **patron Observer** avec `IObservable<T>` / `IObserver<T>` (abonnement, `OnNext`/`OnError`/`OnCompleted`).
- Connaître des **bonnes pratiques** : `EventArgs.Empty`, noms en `XxxChanged`, **désabonnement**, **faibles références** (weak events) et **progression** avec `IProgress<T>`.

---

## 🧠 Concepts clés

### 🔔 Événements (C#)
- **Événement** = **liste d’abonnés** (délégués) sur un **publisher**; chaque abonné est **notifié** quand l’événement est levé.  
- **`event`** restreint l’accès : on peut **s’abonner/désabonner** (`+=`/`-=`), mais **pas remplacer** la liste entière de délégués depuis l’extérieur.

### 🧩 Pattern `EventHandler`
- **Convention .NET** : `event EventHandler? SomethingHappened;` ou `event EventHandler<TEventArgs>?` pour **données associées**.  
- **Signature** : `(object sender, EventArgs e)` — `sender` = **source**, `e` = **données**.

### 🧷 Lever l’événement correctement
- Méthode `protected virtual void OnXxx(EventArgs e)` qui **vérifie** la présence d’abonnés et **invoque** l’événement.  
- **Null-conditional** : `Xxx?.Invoke(this, e)`; pour thread-safety, **copier** la référence locale avant d’invoquer.

### 🧭 Pourquoi c’est important
- Le modèle événementiel et **Observer** réduisent le **couplage** (publisher ne connaît pas les abonnés), améliorent la **testabilité** et favorisent des architectures **réactives**.

### 🧩 Analogie
- Un **événement** est un **journal d’alerte** : plusieurs personnes s’inscrivent (**abonnés**) et reçoivent une **notification** à chaque nouvelle **alerte**.

---

## 💡 Exemples C# — Événements (pattern .NET)

### 1) Événement simple (`EventHandler`)
```csharp
public class TimerService
{
    public event EventHandler? Tick; // sans données

    public void RunOnce()
    {
        // ... logique ... puis notifier
        OnTick(EventArgs.Empty);
    }

    protected virtual void OnTick(EventArgs e)
    {
        // thread-safety: copie locale
        var handler = Tick;
        handler?.Invoke(this, e);
    }
}

// Abonnement
var svc = new TimerService();
svc.Tick += (s, e) => Console.WriteLine("Tick!");
svc.RunOnce();
```

### 2) Événement avec données (`EventHandler<TEventArgs>`)
```csharp
public class PriceChangedEventArgs : EventArgs
{
    public string Product { get; }
    public decimal OldPrice { get; }
    public decimal NewPrice { get; }
    public PriceChangedEventArgs(string product, decimal oldPrice, decimal newPrice)
        => (Product, OldPrice, NewPrice) = (product, oldPrice, newPrice);
}

public class Catalog
{
    private readonly Dictionary<string, decimal> _prices = new();
    public event EventHandler<PriceChangedEventArgs>? PriceChanged;

    public void SetPrice(string product, decimal price)
    {
        _prices.TryGetValue(product, out var old);
        _prices[product] = price;
        if (old != price) OnPriceChanged(new PriceChangedEventArgs(product, old, price));
    }

    protected virtual void OnPriceChanged(PriceChangedEventArgs e)
    {
        var handler = PriceChanged;
        handler?.Invoke(this, e);
    }
}

// Abonnement
var catalog = new Catalog();
catalog.PriceChanged += (s, e) =>
    Console.WriteLine($"{e.Product}: {e.OldPrice} → {e.NewPrice}");

catalog.SetPrice("Laptop", 999m);
catalog.SetPrice("Laptop", 1099m); // déclenche PriceChanged
```

### 3) Désabonnement & gestion des exceptions
```csharp
EventHandler<PriceChangedEventArgs> logger = (s, e) => Console.WriteLine($"Log: {e.Product}");
EventHandler<PriceChangedEventArgs> faulty = (s, e) => throw new Exception("Subscriber error");

catalog.PriceChanged += logger;
catalog.PriceChanged += faulty;

// Isoler les exceptions par abonné
catalog.PriceChanged += (s, e) =>
{
    foreach (Delegate d in ((Catalog)s!).PriceChanged!.GetInvocationList())
    {
        try { d.DynamicInvoke(s, e); }
        catch (Exception ex) { Console.Error.WriteLine(ex.Message); }
    }
};

// Plus tard
catalog.PriceChanged -= logger; // propre
action:
// Si un abonné garde des ressources, envisager IDisposable ou WeakEvent (voir plus bas)
```

> ℹ️ **Note** : En règle générale, c’est le **publisher** qui **invoque** l’événement. Les abonnés sont responsables de **se désabonner** pour éviter les **fuites mémoire** (surtout dans des durées de vie longues).

---

## 🌊 Observer — `IObservable<T>` / `IObserver<T>`

### Définition
- **`IObservable<T>`** : source **observable** sur laquelle on s’abonne via `IDisposable Subscribe(IObserver<T>)`.  
- **`IObserver<T>`** : reçoit `OnNext(T value)`, `OnError(Exception error)`, `OnCompleted()`.

### Implémentation minimale (sans libs externes)
```csharp
public class SimpleSubject<T> : IObservable<T>
{
    private readonly List<IObserver<T>> _observers = new();

    public IDisposable Subscribe(IObserver<T> observer)
    {
        if (!_observers.Contains(observer)) _observers.Add(observer);
        return new Unsubscriber(_observers, observer);
    }

    private class Unsubscriber : IDisposable
    {
        private readonly List<IObserver<T>> _obs;
        private readonly IObserver<T> _observer;
        public Unsubscriber(List<IObserver<T>> obs, IObserver<T> ob)
        { _obs = obs; _observer = ob; }
        public void Dispose() { _obs.Remove(_observer); }
    }

    public void Next(T value)
    {
        foreach (var o in _observers) o.OnNext(value);
    }
    public void Error(Exception ex)
    {
        foreach (var o in _observers) o.OnError(ex);
    }
    public void Completed()
    {
        foreach (var o in _observers) o.OnCompleted();
        _observers.Clear();
    }
}

public class ConsoleObserver<T> : IObserver<T>
{
    public void OnNext(T value) => Console.WriteLine($"Next: {value}");
    public void OnError(Exception error) => Console.Error.WriteLine(error.Message);
    public void OnCompleted() => Console.WriteLine("Completed");
}

// Usage
var subject = new SimpleSubject<int>();
var sub = subject.Subscribe(new ConsoleObserver<int>());
subject.Next(1);
subject.Next(2);
sub.Dispose(); // désabonnement
subject.Next(3); // plus reçu
```

### Points de vigilance
- Toujours **retourner** un `IDisposable` pour **désabonner**.  
- Émettre `OnError` / `OnCompleted` pour **clore** la séquence (contrat).  
- **Pas d’exceptions** depuis `OnNext` : gérer côté observateur pour ne pas arrêter la diffusion.

---

## 🧰 Autres mécaniques utiles

### `IProgress<T>` (rapport d’avancement)
```csharp
void DoWork(IProgress<int> progress)
{
    for (int i = 0; i <= 100; i += 10)
    {
        progress.Report(i);
        System.Threading.Thread.Sleep(10);
    }
}

var p = new Progress<int>(v => Console.WriteLine($"Progress: {v}%"));
DoWork(p);
```

### Weak Events (idée)
- Pour éviter qu’un **abonné** empêche le **GC** du publisher (ou inversement), utiliser un **faible** lien (pattern **weak event**). En WPF, `WeakEventManager` est un support concret; sinon, implémenter un **wrapper** qui **n’entretient pas** de référence forte.

### Event Aggregator (simple)
```csharp
public interface IEvent { }
public record PriceChanged(string Product, decimal OldPrice, decimal NewPrice) : IEvent;

public class EventBus
{
    private readonly Dictionary<Type, List<Delegate>> _handlers = new();
    public void Publish<T>(T evt) where T : IEvent
    {
        if (_handlers.TryGetValue(typeof(T), out var list))
            foreach (var h in list) h.DynamicInvoke(evt);
    }
    public void Subscribe<T>(Action<T> handler) where T : IEvent
    {
        var list = _handlers.GetValueOrDefault(typeof(T)) ?? new List<Delegate>();
        list.Add(handler);
        _handlers[typeof(T)] = list;
    }
}

var bus = new EventBus();
bus.Subscribe<PriceChanged>(e => Console.WriteLine($"Bus: {e.Product} {e.OldPrice}->{e.NewPrice}"));
bus.Publish(new PriceChanged("Laptop", 999m, 1099m));
```

---

## 🧱 Schémas ASCII

### A) Publisher/Subscriber (events)
```
Publisher
  └─ event PriceChanged
      ├─ Subscriber A
      └─ Subscriber B
Raise() → A → B (ordre d'abonnement)
```

### B) Observer
```
Subject (IObservable<T>)
  ├─ Subscribe(Observer1) → IDisposable
  └─ Subscribe(Observer2) → IDisposable
OnNext → Observer1, Observer2
OnError/OnCompleted → tous, puis fin
```

---

## 🔧 Exercices guidés
1. **Notifier** : crée `FileWatcher` qui expose `event EventHandler<FileChangedEventArgs> Changed` et lève l’événement quand un fichier est modifié (simulation par un `SetContent`).  
2. **Observable** : implémente `CounterObservable` émettant `OnNext(i)` chaque 100 ms puis `OnCompleted()` après 10 valeurs; abonne un `ConsoleObserver<int>`.  
3. **Bus** : utilise l’`EventBus` pour router deux types d’événements (`UserLoggedIn`, `OrderPlaced`) vers des handlers distincts.

```csharp
public class FileChangedEventArgs : EventArgs
{
    public string Path { get; }
    public string Content { get; }
    public FileChangedEventArgs(string path, string content)
        => (Path, Content) = (path, content);
}

public class FileWatcher
{
    private string _content = string.Empty;
    public string Path { get; }
    public event EventHandler<FileChangedEventArgs>? Changed;
    public FileWatcher(string path) => Path = path;

    public void SetContent(string newContent)
    {
        var old = _content; _content = newContent;
        if (!string.Equals(old, newContent, StringComparison.Ordinal))
            Changed?.Invoke(this, new FileChangedEventArgs(Path, newContent));
    }
}

public class CounterObservable : IObservable<int>
{
    private readonly List<IObserver<int>> _obs = new();
    public IDisposable Subscribe(IObserver<int> o)
    { if (!_obs.Contains(o)) _obs.Add(o); return new U(_obs, o); }
    private class U : IDisposable { private readonly List<IObserver<int>> _l; private readonly IObserver<int> _o; public U(List<IObserver<int>> l, IObserver<int> o){_l=l;_o=o;} public void Dispose(){_l.Remove(_o);} }

    public async Task RunAsync()
    {
        for (int i = 1; i <= 10; i++)
        {
            foreach (var o in _obs) o.OnNext(i);
            await Task.Delay(100);
        }
        foreach (var o in _obs) o.OnCompleted();
        _obs.Clear();
    }
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) FileWatcher
var fw = new FileWatcher("/tmp/test.txt");
fw.Changed += (s,e) => Console.WriteLine($"Changed: {e.Path}");
fw.SetContent("Hello");
fw.SetContent("Hello"); // pas de notification (pas de changement)
fw.SetContent("World"); // notification

// 2) CounterObservable
var co = new CounterObservable();
var sub = co.Subscribe(new ConsoleObserver<int>());
await co.RunAsync();
sub.Dispose();
```

---

## ⚠️ Pièges fréquents
- **Oublier de se désabonner** → **fuites** mémoire ou callbacks inattendus.  
- **Lever** l’événement depuis un **constructeur** → abonnés **pas encore** attachés; préférer `OnXxx` après initialisation.  
- **Exceptions** côté abonnés non isolées → l’événement **échoue**; encapsuler si nécessaire.  
- **Capturer** des références lourdes dans des **lambdas** d’abonnement → empêche le **GC** (utiliser weak events ou détacher).  
- **IObservable** : ne pas **clore** (`OnCompleted`) ou **signaler erreurs** (`OnError`) rompt le **contrat** des observables.

---

## 🧮 Formules (en JavaScript)
- **Débit de notifications** (naïf) :
```javascript
const notificationsPerSecond = (count, ms) => (count / ms) * 1000;
```
- **Temps total d’invocation** (n abonnés × coût moyen c) :
```javascript
const totalInvokeMs = (n, c) => n * c;
```

---

## 📌 Résumé essentiel
- Les **événements** C# (`event`) et le **pattern EventHandler** fournissent une mécanique **simple** et **standard** pour notifier des changements.  
- Toujours lever via `OnXxx`, utiliser `?.Invoke`, et penser **thread-safety**.  
- Le **patron Observer** (`IObservable<T>`/`IObserver<T>`) modélise des flux **asynchrones** : `OnNext`, `OnError`, `OnCompleted`.  
- Désabonnement, isolation des exceptions, et éventuellement **weak events** sont essentiels pour des systèmes **durables**.
