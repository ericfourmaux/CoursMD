
# 📘 Chapitre 6.2 — Diagnostic & Profiling (Observabilité .NET)

> **Niveau** : Intermédiaire — **Objectif** : diagnostiquer, mesurer et profiler une application .NET/C# avec des **logs**, **métriques** et **traces**. Utiliser `Stopwatch`, `System.Diagnostics` (EventSource, EventCounters, Activity), les outils **CLI** (`dotnet-trace`, `dotnet-counters`, `dotnet-monitor`), comprendre **EventPipe/ETW**, analyser **CPU/GC/allocation**, et adopter de **bonnes pratiques** pour des mesures fiables.

---

## 🎯 Objectifs d’apprentissage
- Instrumenter le code avec **`Stopwatch`** pour mesurer **latence** et **durées**.
- Mettre en place un **logging** structuré (niveau, message, propriétés) via `Microsoft.Extensions.Logging`.
- Exposer et lire des **compteurs** (EventCounters) et des **traces** (Activity) pour **profilage**.
- Utiliser des **outils runtime** : `dotnet-trace`, `dotnet-counters` et `dotnet-monitor`.
- Interpréter **GC/CPU/allocations** et éviter les **artefacts** de mesure (échauffement, JIT, bruit).
- Savoir **quand** recourir à **BenchmarkDotNet** pour micro-benchs.

---

## 🧠 Concepts clés

### 🔭 Observabilité — 3 piliers
- **Logs** : événements **textuels** (souvent structurés).  
- **Métriques** : valeurs **numériques** (taux, compteurs, latences).  
- **Traces** : **corrélation** de requêtes (spans) pour suivre un flux **end-to-end**.

### 🧩 Mesure fiable
- **Échauffement** (warm‑up) : exécuter une **première** fois pour laisser le **JIT** compiler.  
- **Répéter** et prendre **médiane**/**P95** plutôt que moyenne unique.  
- **Isoler** les **I/O** du **CPU** quand on mesure des **algorithmes**.

### ⚙️ EventPipe / ETW (idée)
- **EventPipe** (cross‑platform) → flux d’événements runtime/CLR accessible via `dotnet-trace`.  
- **ETW** (Windows) → traçage système performant.

---

## 🧰 Instrumentation — code

### 1) Mesure simple — `Stopwatch`
```csharp
using System.Diagnostics;

public static class TimeUtils
{
    public static long MeasureMs(Action action)
    {
        var sw = Stopwatch.StartNew();
        action();
        sw.Stop();
        return sw.ElapsedMilliseconds;
    }
}

// Usage
long ms = TimeUtils.MeasureMs(() =>
{
    // workload simulé
    var list = new List<int>();
    for (int i = 0; i < 100_000; i++) list.Add(i);
});
Console.WriteLine($"Durée: {ms} ms");
```

### 2) Logging structuré — `Microsoft.Extensions.Logging`
```csharp
using Microsoft.Extensions.Logging;

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .SetMinimumLevel(LogLevel.Information)
        .AddConsole(); // console logger simple
});

ILogger logger = loggerFactory.CreateLogger("App");
logger.LogInformation("Démarrage {App}", "DiagnosticDemo");
logger.LogWarning("Retry {Count}", 3);
logger.LogError("Erreur {Code}: {Message}", 500, "Internal");
```

### 3) Compteurs — `EventSource` + `EventCounter`
```csharp
using System.Diagnostics.Tracing;

[EventSource(Name = "Demo-Counters")]
public sealed class DemoCounters : EventSource
{
    public static readonly DemoCounters Log = new DemoCounters();
    private readonly EventCounter _reqPerSec;
    private readonly IncrementingEventCounter _bytes;

    private DemoCounters()
    {
        _reqPerSec = new EventCounter("requests-per-second", this);
        _bytes = new IncrementingEventCounter("bytes", this)
        { DisplayName = "Bytes", DisplayRateTimeScale = TimeSpan.FromSeconds(1) };
    }

    public void Report(double rps, long bytes)
    {
        _reqPerSec.WriteMetric(rps);
        _bytes.Increment(bytes);
    }
}

// Usage
DemoCounters.Log.Report(12.3, 4096);
```

### 4) Traces — `Activity` (OpenTelemetry‑friendly)
```csharp
using System.Diagnostics;

var source = new ActivitySource("Demo.Tracing");
using (var activity = source.StartActivity("ProcessOrder"))
{
    activity?.AddTag("user", "eric");
    activity?.AddTag("orderId", 123);
    // travail …
}
```

### 5) Infos GC/Alloc — `GC.GetGCMemoryInfo`
```csharp
var info = GC.GetGCMemoryInfo();
Console.WriteLine($"HeapSize: {info.HeapSizeBytes} bytes; Fragmentation: {info.FragmentedBytes} bytes");
Console.WriteLine($"Compaction: {info.CompactionMode}; HighMemory: {info.HighMemoryLoadThresholdBytes}");
```

---

## 🛠️ Outils CLI (aperçu pratique)

> Ces commandes s’exécutent **en dehors** du code (terminal). Elles capturent des **événements** runtime pour analyse.

### 1) `dotnet-counters` — métriques en temps réel
```bash
# Lister les compteurs disponibles (processus cible)
dotnet-counters monitor -p <PID>
# Exemples de providers utiles: System.Runtime, Microsoft.AspNetCore.Hosting
```

### 2) `dotnet-trace` — traces (EventPipe)
```bash
# Démarrer une capture
dotnet-trace collect -p <PID> -o trace.nettrace
# Arrêter: Ctrl+C, puis analyser le nettrace avec PerfView ou Speedscope (flame graph)
```

### 3) `dotnet-monitor` — observabilité pour ASP.NET Core
```bash
# Démarrer dotnet-monitor (container ou local) pour collecter métriques, logs, dumps
# (configuration via environment variables/secrets)
```

*(Pour une approche micro‑bench, préférer **BenchmarkDotNet** avec attributs `[Benchmark]`, échauffement, etc.)*

---

## 🧱 Schémas ASCII

### A) Triade Observabilité
```
[Logs]  -- texte structuré
[Métriques] -- valeurs/counters
[Traces] -- spans/Activity
    └─► Corrélation & diagnostic end-to-end
```

### B) Flux EventPipe
```
App .NET → Providers (Runtime, System.Runtime, Custom EventSource)
           └─ EventPipe → dotnet-trace → .nettrace → analyse (PerfView/Flamegraph)
```

### C) Mesure fiable
```
Warm-up → Boucles (N) → Échantillons → Tri/Médiane → P95
  └─ éviter I/O et bruit système
```

---

## 🔧 Exercices guidés
1. **Latence API** : mesure (Stopwatch) la durée d’une fonction `Process()` et **journalise** `ms` et `status` via `ILogger`.  
2. **Compteurs** : publie un `requests-per-second` et un flux de **octets** via `EventCounter`/`IncrementingEventCounter`.  
3. **Traces** : entoure `Process()` d’une `Activity` avec tags `user`, `operation`, et **corrèle** deux sous‑opérations (`StartActivity`).

```csharp
long MeasureAndLog(Action work, ILogger logger)
{
    var sw = Stopwatch.StartNew();
    try { work(); logger.LogInformation("status={Status}", "OK"); }
    catch (Exception ex) { logger.LogError(ex, "status=ERR"); }
    finally { sw.Stop(); }
    logger.LogInformation("latency_ms={Ms}", sw.ElapsedMilliseconds);
    return sw.ElapsedMilliseconds;
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) Mesure basique
long t = TimeUtils.MeasureMs(() => Thread.Sleep(50));
Console.WriteLine(t >= 50);

// 2) Activity présent
var src = new ActivitySource("T");
using (var a = src.StartActivity("Op"))
{
    Console.WriteLine(a != null);
}
```

---

## ⚠️ Pièges fréquents
- **Mesures instables** : bruit système, JIT, GC — répéter et **médiane/P95**, isoler le **workload**.  
- **Logs verbeux** en production : coûts I/O; préférer **niveaux** adaptés et **sampling**.  
- **Mesures mêlées** CPU/I/O : confond performance **machine** vs **réseau/disque**.  
- **Profilage intrusif** : certains collecteurs **ralentissent** l’app; utiliser en **diagnostic ciblé**.  
- **Micro‑optimisations** sans données : toujours **mesurer** avant de changer.

---

## 🧮 Formules (en JavaScript)

### A) Médiane d’un tableau trié
```javascript
const median = (arr) => {
  const a = [...arr].sort((x,y)=>x-y);
  const n = a.length;
  return n%2 ? a[(n-1)/2] : (a[n/2-1] + a[n/2])/2;
};
```

### B) P95 (approx) d’un tableau trié
```javascript
const p95 = (arr) => {
  const a = [...arr].sort((x,y)=>x-y);
  const idx = Math.floor(0.95 * (a.length-1));
  return a[idx];
};
```

### C) EMA (exponential moving average)
```javascript
const ema = (prev, value, alpha) => alpha*value + (1-alpha)*prev;
```

---

## 📌 Résumé essentiel
- **Mesure fiable** = warm‑up, répétition, médiane/P95, séparation CPU/I/O.  
- **Logs** + **métriques** + **traces** = triade d’**observabilité**; instrumente avec `ILogger`, `EventSource/EventCounters`, `Activity`.  
- Utilise `dotnet-counters` pour **métriques live**, `dotnet-trace` pour **flammes/traces**, et `dotnet-monitor` pour orchestrer en **prod**.  
- Surveille **GC/allocations** avec `GC.GetGCMemoryInfo` et **évite** d’introduire du **bruit** pendant la mesure.  
- **Mesurer avant d’optimiser** : sinon, risque de micro‑optimisation non pertinente.
