
# 📘 Chapitre 4.3 — Async/Await & Tasks

> **Niveau** : Débutant → Intermédiaire — **Objectif** : comprendre l’**asynchronisme** moderne en C# avec `Task`, `async`/`await`, la **cancellation** (`CancellationToken`), l’**itération asynchrone** (`IAsyncEnumerable<T>`), et les bonnes pratiques (éviter les **deadlocks**, maîtriser le **SynchronizationContext**, limiter la **concurrence**, tests et diagnostics).

---

## 🎯 Objectifs d’apprentissage
- Différencier **I/O non bloquant** (réseau, disque) et **CPU-bound** (calcul intensif) et choisir la bonne approche.
- Utiliser `async`/`await`, comprendre `Task`, `ValueTask`, **propagation des exceptions**.
- Implémenter et respecter la **cancellation coopérative** avec `CancellationToken` / `CancellationTokenSource`.
- Gérer l’**itération asynchrone** (`IAsyncEnumerable<T>`, `await foreach`).
- Éviter les **deadlocks** (ne pas bloquer avec `.Result`/`.Wait()`), comprendre `SynchronizationContext` et `ConfigureAwait(false)`.
- Orchestrer la **concurrence** (`Task.WhenAll/WhenAny`, `SemaphoreSlim`) et **timeout**.
- Diagnostiquer les performances (`Stopwatch`) et comprendre la **comptabilité** ThreadPool.

---

## 🧠 Concepts clés

### 🔀 Asynchrone vs parallèle
- **Asynchrone** : ne **bloque pas** le thread pendant l’attente d’I/O; le **thread** peut faire autre chose.  
- **Parallèle** : plusieurs **threads** exécutent du code **en même temps** (CPU).  
- **Règle** : I/O → **async/await**; CPU-bound → **Task.Run** (avec parcimonie, jamais pour masquer une I/O bloquante mal conçue).

### 🧵 `Task` & `async/await`
- `Task` : **promesse** d’un résultat futur (ou complétée immédiatement).  
- `async`/`await` : sucre syntaxique créant une **machine d’état**; `await` **suspend** la méthode et **reprend** à la complétion.  
- Exceptions : propagées via `await`; sans `await`, la **Task** peut contenir l’exception (observée à l’attente).

### 🛑 Cancellation coopérative
- `CancellationToken` : **signal** d’arrêt; les API async doivent **observer** `ct.IsCancellationRequested` et **lever** `OperationCanceledException` au besoin.  
- **Ne jamais** tuer un thread; **coopérer** via le token.

### 🧭 SynchronizationContext & deadlocks
- UI (WPF/WinForms) possède un **contexte** : le `await` **reprend** souvent sur le **thread UI**.  
- Console/ASP.NET Core : contexte différent ou **null**; `await` reprend généralement sur un **threadpool**.  
- Deadlock classique : appeler `.Result` sur une méthode `async` depuis un **thread avec contexte** → la continuation attend le thread, qui lui-même attend `.Result`. **Solution** : **`await` partout**, ou `ConfigureAwait(false)` dans **librairies**.

### 📶 IAsyncEnumerable<T>
- **Async iterator** : produit des éléments **au fil de l’eau**, avec `await foreach`.  
- Idéal pour **streaming** (réseau, disque) et **pipelines**.

---

## 💡 Exemples C# — bases

### 1) I/O asynchrone : téléchargement avec timeout & cancellation
```csharp
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

async Task<string> DownloadAsync(HttpClient client, string url, CancellationToken ct)
{
    using var resp = await client.GetAsync(url, ct); // peut lever HttpRequestException/TaskCanceledException
    resp.EnsureSuccessStatusCode();
    return await resp.Content.ReadAsStringAsync(ct);
}

async Task<string?> DownloadWithTimeoutAsync(HttpClient client, string url, TimeSpan timeout)
{
    using var cts = new CancellationTokenSource(timeout);
    try { return await DownloadAsync(client, url, cts.Token); }
    catch (OperationCanceledException) { return null; } // timeout ou cancellation
}
```

### 2) CPU-bound : calcul sur un threadpool
```csharp
// À utiliser pour du CPU-bound (ex: compression, image processing)
Task<int> CountPrimesAsync(int n)
{
    return Task.Run(() =>
    {
        int count = 0;
        for (int i = 2; i <= n; i++) if (IsPrime(i)) count++;
        return count;
    });
}

bool IsPrime(int x)
{
    if (x < 2) return false;
    for (int d = 2; d * d <= x; d++) if (x % d == 0) return false;
    return true;
}
```

### 3) Concurrence : `Task.WhenAll`
```csharp
async Task<string[]> FetchAllAsync(HttpClient client, IEnumerable<string> urls, CancellationToken ct)
{
    var tasks = urls.Select(u => DownloadAsync(client, u, ct));
    return await Task.WhenAll(tasks);
}
```

### 4) Limiter la concurrence : `SemaphoreSlim`
```csharp
async Task ProcessWithLimitAsync<T>(IEnumerable<T> items, int maxParallel, Func<T, Task> work)
{
    using var sem = new System.Threading.SemaphoreSlim(maxParallel);
    var tasks = items.Select(async item =>
    {
        await sem.WaitAsync();
        try { await work(item); }
        finally { sem.Release(); }
    });
    await Task.WhenAll(tasks);
}
```

### 5) Async iterator : `IAsyncEnumerable<T>`
```csharp
async IAsyncEnumerable<string> ReadLinesAsync(string path)
{
    using var reader = new System.IO.StreamReader(path);
    string? line;
    while ((line = await reader.ReadLineAsync()) != null)
    {
        await Task.Yield(); // donne la main si longue boucle
        yield return line;
    }
}

async Task DemoAsync()
{
    await foreach (var line in ReadLinesAsync("notes.txt"))
        Console.WriteLine(line);
}
```

### 6) Éviter les deadlocks
```csharp
// Mauvais : bloque le thread appelant et peut deadlocker en UI
var text = DownloadAsync(new HttpClient(), "https://example.com", CancellationToken.None).Result;

// Bon : await partout
var text2 = await DownloadAsync(new HttpClient(), "https://example.com", CancellationToken.None);
```

---

## ⏱️ Mesure & diagnostics
```csharp
var sw = new System.Diagnostics.Stopwatch();
sw.Start();
var result = await CountPrimesAsync(2_000_000);
sw.Stop();
Console.WriteLine($"{result} en {sw.ElapsedMilliseconds} ms");
```

---

## 🧱 Schémas ASCII

### A) Machine d’état `async`
```
Méthode async F()
  ├─ await Op1()
  │    └─ suspend F jusqu'à complétion de Op1
  └─ await Op2()
       └─ reprend F sur le contexte (UI/ThreadPool)
```

### B) Concurrence contrôlée (SemaphoreSlim)
```
Items → [sem.Wait] → work(item) → [sem.Release]
            │        │
            └─ maxParallel tâches simultanées
```

### C) Cancellation
```
cts.Cancel()
   └─ token signalé → opérations observent → OperationCanceledException
```

---

## 🔧 Exercices guidés
1. **Retry avec backoff** : implémente `FetchWithRetryAsync(url, retries, initialDelay)` (exponentiel), cancellation via `ct`.  
2. **Bounded parallelism** : télécharge 20 URLs avec `maxParallel=4` et mesure le **gain** vs séquentiel.  
3. **Flux asynchrone** : lit un gros fichier via `ReadLinesAsync` et calcule la **fréquence** des mots au fil de l’eau.

```csharp
async Task<T> RetryAsync<T>(Func<CancellationToken, Task<T>> op, int retries, TimeSpan initialDelay, CancellationToken ct)
{
    var delay = initialDelay;
    for (int i = 0; i <= retries; i++)
    {
        try { return await op(ct); }
        catch (OperationCanceledException) { throw; }
        catch (Exception) { if (i == retries) throw; }
        await Task.Delay(delay, ct);
        delay = TimeSpan.FromMilliseconds(delay.TotalMilliseconds * 2); // backoff
    }
    throw new InvalidOperationException("Impossible");
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) Timeout de 100 ms (doit retourner null)
var http = new HttpClient();
var r = await DownloadWithTimeoutAsync(http, "https://example.com", TimeSpan.FromMilliseconds(100));
Console.WriteLine(r == null);

// 2) Concurrence limitée
await ProcessWithLimitAsync(Enumerable.Range(1,10), 3, async i =>
{
    await Task.Delay(100);
    Console.Write($"{i} ");
});
Console.WriteLine();

// 3) Async iterator
int lines = 0;
await foreach (var _ in ReadLinesAsync("notes.txt")) lines++;
Console.WriteLine(lines >= 0);
```

---

## ⚠️ Pièges fréquents
- **`.Result`/`.Wait()`** sur des méthodes `async` → risque de **deadlock**; préférer `await`.  
- **Ignorer** la **cancellation** : toujours passer un `CancellationToken` et le **propager**.  
- **Abuser de `Task.Run`** côté serveur (ASP.NET Core) pour I/O → inutile et **contre-productif**; utiliser **I/O async** natif.  
- **Oublier** `ConfigureAwait(false)` dans les **librairies** (pas dans les apps UI) → continuations inutiles sur contexte.  
- **Créer** trop de tâches en parallèle → **saturation** réseau/disque/CPU; limiter via `SemaphoreSlim`.

---

## 🧮 Formules (en JavaScript)

### A) Backoff exponentiel (millisecondes)
```javascript
const backoff = (attempt, initialMs) => initialMs * Math.pow(2, attempt);
```

### B) Temps total estimé avec parallélisme limité
```javascript
// hypot: n travaux, chacun dure d ms, parallélisme p
const totalMs = (n, d, p) => Math.ceil(n / p) * d;
```

### C) Fenêtre glissante (débit)
```javascript
const throughput = (bytes, ms) => (bytes / ms) * 1000; // bytes/s
```

---

## 📌 Résumé essentiel
- **Async/await** fournit un modèle **non bloquant** pour I/O et une écriture **lisible**; `Task`/`ValueTask` portent les résultats et erreurs.  
- Utilise la **cancellation** partout; orchestre la **concurrence** avec `WhenAll`/`SemaphoreSlim`.  
- Évite les **deadlocks** : pas de `.Result`; comprends **SynchronizationContext**; `ConfigureAwait(false)` pour **librairies**.  
- `IAsyncEnumerable<T>` est idéal pour **streaming**; `await foreach` traite au fil de l’eau.  
- **Mesure** (Stopwatch), **limite** le parallélisme, et privilégie l’**I/O async**.
