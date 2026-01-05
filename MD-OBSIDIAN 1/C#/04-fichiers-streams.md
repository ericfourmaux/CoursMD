
# 📘 Chapitre 4.1 — Fichiers & Streams (System.IO)

> **Niveau** : Débutant → Intermédiaire — **Objectif** : apprendre à **lire/écrire** des **fichiers** et à manipuler des **flux** (streams) en C# : `File`, `Directory`, `Path`, `FileStream`, `StreamReader/StreamWriter`, `BinaryReader/BinaryWriter`, **encodages**, **modes d’ouverture**, **partage**, **async I/O**, **sécurité** et **pièges** courants.

---

## 🎯 Objectifs d’apprentissage
- Comprendre les **chemins** : relatifs/absolus, séparateurs, `Path.Combine`, `Path.GetExtension`, etc.
- Savoir utiliser `File`, `Directory`, `FileInfo`, `DirectoryInfo` pour **tester**, **créer**, **supprimer**, **énumérer**.
- Manipuler des **flux** : `FileStream` (texte/binaire), `StreamReader/Writer` (texte), `BinaryReader/Writer` (binaire).
- Choisir le **mode d’ouverture** (`FileMode`) et le **partage** (`FileShare`) appropriés.
- Gérer les **encodages** et sauter le **BOM** (UTF-8 sans BOM).
- Écrire du **I/O asynchrone** (`ReadAsync/WriteAsync`, `await`) avec `CancellationToken`.
- Éviter les **pièges** : chemins incorrects, ré-encodage, fuite de ressources, locks, exceptions.

---

## 🧠 Concepts clés

### 🗺️ Chemins & plateformes
- **Séparateurs** : `Path.DirectorySeparatorChar` (`'/'` Linux/macOS, `'\'` Windows).  
- **Combinaison sûre** : `Path.Combine(a, b, c)` → évite les concatenations fragiles.  
- **Relatif vs Absolu** : `Path.IsPathRooted(path)` détecte les chemins **absolus**.  
- **Infos** : `Path.GetFileName`, `Path.GetExtension`, `Path.GetDirectoryName`.  
- **Dossier courant** : `Environment.CurrentDirectory`.

### 💾 Fichiers & répertoires
- `File.Exists(path)`, `Directory.Exists(path)` pour vérifier l’existence.  
- **Créer** : `Directory.CreateDirectory(path)`, `File.WriteAllText(...)`.  
- **Supprimer** : `File.Delete(path)`, `Directory.Delete(path, recursive: true)`.  
- **Lister** : `Directory.EnumerateFiles(dir, pattern, SearchOption.AllDirectories)`.

### 🔧 Streams
- **Flux** = canal de lecture/écriture **séquentiel**.  
- `FileStream` : flux vers fichier (binaire ou texte, selon lecteur).  
- `StreamReader/Writer` : lecture/écriture **texte** avec **encodage**.  
- `BinaryReader/Writer` : lecture/écriture **binaire** (types primitifs, buffers).  
- **Buffer** : mémoire intermédiaire pour réduire les appels système.

### 🧭 Pourquoi c’est important
- Un I/O bien conçu est **robuste**, **performant** et **portable**; fondamental pour **logs**, **config**, **import/export**, **ETL**.

### 🧩 Analogie
- Un **stream** est comme un **tuyau** : on laisse passer les **octets** séquentiellement; `StreamReader` est un **robinet** qui convertit les octets en **caractères** selon l’**encodage**.

---

## 💡 Exemples C# — Chemins & fichiers

```csharp
using System;
using System.IO;

string baseDir = Environment.CurrentDirectory;
string reportsDir = Path.Combine(baseDir, "data", "reports");
Directory.CreateDirectory(reportsDir);

string reportPath = Path.Combine(reportsDir, "janvier-2025.txt");
File.WriteAllText(reportPath, "Bonjour, rapport de janvier.\n");

bool exists = File.Exists(reportPath); // true
string name = Path.GetFileName(reportPath); // "janvier-2025.txt"
string ext = Path.GetExtension(reportPath); // ".txt"
```

---

## 📝 Lecture/Écriture **texte** — `StreamReader/StreamWriter`

```csharp
using System.IO;
using System.Text;

string path = Path.Combine(Environment.CurrentDirectory, "notes.txt");
// Écriture texte (UTF-8 sans BOM)
var utf8NoBom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false);
using (var writer = new StreamWriter(path, append: false, encoding: utf8NoBom))
{
    writer.WriteLine("Ligne 1");
    writer.WriteLine("Ligne 2");
}

// Lecture texte
using (var reader = new StreamReader(path, encoding: Encoding.UTF8, detectEncodingFromByteOrderMarks: true))
{
    string? line;
    while ((line = reader.ReadLine()) != null)
        Console.WriteLine(line);
}
```

**Points clés** :
- **BOM** UTF-8 : certains outils ajoutent une **signature** (BOM). `UTF8Encoding(false)` **évite** le BOM.
- `detectEncodingFromByteOrderMarks: true` laisse le lecteur **reconnaître** l’encodage via BOM si présent.

---

## 🔢 Lecture/Écriture **binaire** — `BinaryReader/BinaryWriter`

```csharp
using System;
using System.IO;

string binPath = Path.Combine(Environment.CurrentDirectory, "data.bin");

// Écrire des types primitifs
using (var fs = new FileStream(binPath, FileMode.Create, FileAccess.Write, FileShare.None))
using (var bw = new BinaryWriter(fs))
{
    bw.Write(42);          // int32
    bw.Write(3.14);        // double
    bw.Write(true);        // bool
}

// Lire
using (var fs = new FileStream(binPath, FileMode.Open, FileAccess.Read, FileShare.Read))
using (var br = new BinaryReader(fs))
{
    int a = br.ReadInt32();
    double b = br.ReadDouble();
    bool c = br.ReadBoolean();
    Console.WriteLine($"{a}, {b}, {c}");
}
```

---

## ⚙️ Modes d’ouverture, accès & partage

```csharp
// FileMode: Create, Open, OpenOrCreate, Append, Truncate
// FileAccess: Read, Write, ReadWrite
// FileShare: None, Read, Write, ReadWrite

using var fs = new FileStream(path,
    mode: FileMode.OpenOrCreate,
    access: FileAccess.ReadWrite,
    share: FileShare.Read);
```

**Guides pratiques** :
- **Lecture seule** concurrente : `FileAccess.Read`, `FileShare.Read`.  
- **Écriture exclusive** : `FileAccess.Write`, `FileShare.None`.  
- **Append** (journalisation) : `FileMode.Append` + `StreamWriter(..., append:true)`.

---

## 🚦 Exceptions & sécurité

```csharp
try
{
    using var fs = new FileStream(path, FileMode.Open, FileAccess.Read);
}
catch (UnauthorizedAccessException)
{
    Console.Error.WriteLine("Accès refusé.");
}
catch (FileNotFoundException)
{
    Console.Error.WriteLine("Fichier introuvable.");
}
catch (IOException ex)
{
    Console.Error.WriteLine(ex.Message); // générique I/O (disque plein, lock, etc.)
}
```

**Bonnes pratiques** :
- Toujours **fermer**/**libérer** (`using`) → évite **fuite** et **lock**.
- **Valider** les entrées (chemins, noms) et éviter les **traversées** de répertoire (`..`).
- Gérer la **culture** et l’**encodage** explicitement (UTF-8 par défaut recommandé).

---

## ⚡ I/O **asynchrone**

```csharp
using System.Text;
using System.Threading;
using System.Threading.Tasks;

async Task CopyAsync(string src, string dst, CancellationToken ct)
{
    // Buffer 81_920 (80 KiB) recommandé pour FileStream en .NET modernes
    const int BufferSize = 81_920;
    await using var input  = new FileStream(src, FileMode.Open, FileAccess.Read,  FileShare.Read,  BufferSize, useAsync: true);
    await using var output = new FileStream(dst, FileMode.Create, FileAccess.Write, FileShare.None, BufferSize, useAsync: true);

    byte[] buffer = new byte[BufferSize];
    int read;
    while ((read = await input.ReadAsync(buffer, 0, buffer.Length, ct)) > 0)
    {
        await output.WriteAsync(buffer, 0, read, ct);
    }
}

// Exemple d'utilisation
// await CopyAsync("a.bin", "b.bin", CancellationToken.None);
```

**Points clés** :
- `useAsync: true` permet au runtime d’optimiser les **opérations asynchrones**.
- Toujours passer un **CancellationToken** pour **annuler** proprement.

---

## 🧪 Utilitaires courants

### Temporaire & nettoyage
```csharp
string tempDir = Path.GetTempPath();
string tempFile = Path.Combine(tempDir, Path.GetRandomFileName());
File.WriteAllText(tempFile, "temp");
// ...
File.Delete(tempFile);
```

### Informations & attributs
```csharp
var info = new FileInfo(path);
Console.WriteLine(info.Length); // taille en octets
File.SetAttributes(path, File.GetAttributes(path) | FileAttributes.ReadOnly);
```

### Énumération récursive
```csharp
foreach (var file in Directory.EnumerateFiles(baseDir, "*.log", SearchOption.AllDirectories))
{
    Console.WriteLine(file);
}
```

---

## 🧱 Schémas ASCII

### A) Empilement des streams (texte)
```
[FileStream] ──▶ [Buffer] ──▶ [StreamReader] ──▶ string/char
```

### B) Modes et partage
```
OpenOrCreate + ReadWrite + Share.Read
   └─ autorise plusieurs lecteurs, écriture exclusive
```

---

## 🔧 Exercices guidés
1. **Journalisation** : écris une fonction `Log(string path, string message)` qui ouvre en **append** UTF-8 **sans BOM**, écrit `DateTime.UtcNow` + message, et **crée le dossier** si absent.  
2. **Copie asynchrone** : implémente `CopyAsync(src, dst, ct)` (voir plus haut) et mesure le temps (`Stopwatch`).  
3. **CSV simple** : lis un fichier `data.csv` (séparateur `;`), retourne une liste de tuples `(string name, int age)` avec gestion d’**encodage** et de **lignes invalides**.

```csharp
void Log(string path, string message)
{
    string? dir = Path.GetDirectoryName(path);
    if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
    var utf8 = new System.Text.UTF8Encoding(false);
    using var writer = new StreamWriter(path, append: true, encoding: utf8);
    writer.WriteLine($"{DateTime.UtcNow:O}\t{message}");
}

List<(string name, int age)> ReadCsv(string path)
{
    var result = new List<(string, int)>();
    using var reader = new StreamReader(path, System.Text.Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
    string? line;
    while ((line = reader.ReadLine()) != null)
    {
        var parts = line.Split(';');
        if (parts.Length < 2) continue;
        if (int.TryParse(parts[1], out int age)) result.Add((parts[0], age));
    }
    return result;
}
```

---

## 🧪 Tests / Vérifications (rapides)
```csharp
// 1) Log
string lp = Path.Combine(Environment.CurrentDirectory, "logs", "app.log");
Log(lp, "Démarrage");
Console.WriteLine(File.Exists(lp));

// 2) ReadCsv
string csv = Path.Combine(Environment.CurrentDirectory, "data.csv");
File.WriteAllText(csv, "Eric;35\nAlice;30\nInvalid\n");
var rows = ReadCsv(csv);
Console.WriteLine(rows.Count == 2);
Console.WriteLine(rows[0].name == "Eric" && rows[0].age == 35);
```

---

## ⚠️ Pièges fréquents
- **Concaténer** des chemins avec `"/"` ou `"\\"` au lieu de `Path.Combine`.  
- **Oublier** `using` → locks, fichiers non fermés, **ressources** non libérées.  
- **Encodage** non spécifié : caractères **corrompus** (utiliser UTF-8 par défaut).  
- **Ouvrir** un fichier en `FileShare.None` et tenter de le **lire** en parallèle → **IOException**.  
- **Lire** tout fichier en mémoire (`ReadAllText`) pour des **fichiers volumineux** → préférer **streaming**.

---

## 🧮 Formules (en JavaScript)

### A) Estimation du temps de copie
```javascript
const etaSeconds = (sizeBytes, throughputBytesPerSec) => sizeBytes / throughputBytesPerSec;
```

### B) Taille cumulative
```javascript
const totalSize = (sizes) => sizes.reduce((s, x) => s + x, 0);
```

---

## 📌 Résumé essentiel
- Utilise `Path.Combine` et **interfaces** `File/Directory` pour des opérations fiables.  
- Choisis le **mode** et le **partage** adaptés; pense aux **Locks** et aux **exceptions**.  
- Texte : `StreamReader/Writer` avec **UTF-8 sans BOM**; binaire : `BinaryReader/Writer`.  
- **Async I/O** : `ReadAsync/WriteAsync` avec **buffer** et **CancellationToken**.  
- Ferme/libère toujours les flux et **évite** de charger de gros fichiers en mémoire; **stream** au fil de l’eau.
