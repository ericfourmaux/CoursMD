 
# 📚 Chapitre 15 — **Concurrence & asynchronisme**

> [!NOTE]
> Ce chapitre introduit les **modèles de concurrence** en Python: **threads** (`threading`), **processus** (`multiprocessing`), et **asynchronisme** (`asyncio`). Vous apprendrez quand utiliser chaque approche (**I/O‑bound** vs **CPU‑bound**), comment **orchestrer** des tâches, gérer **timeouts**/**annulations**, et éviter les **pièges** (partage d'état, blocages, mélange sync/async).

---

## 🎯 Objectifs pédagogiques
- Distinguer **CPU‑bound** (calcul intensif) vs **I/O‑bound** (attentes d'E/S).  
- Utiliser **threads** pour l'I/O et **processus** pour le CPU.  
- Concevoir des coroutines **`async`/`await`** avec **`asyncio`** (boucle d'événements, tâches, `gather`).  
- Gérer **timeouts**, **annulations**, **queues** et **locks**.  
- Éviter les **pièges**: blocage dans une coroutine, data race, deadlocks.

---

## 🧠 Concepts clés

### 🧠 GIL, threads & processus
- **GIL** (Global Interpreter Lock) empêche l'exécution **simultanée** de bytecode Python dans **un** interpréteur — les **threads** sont utiles pour **I/O‑bound**; pour **CPU‑bound**, préférez **`multiprocessing`** (processus distincts).  
- **Threads**: léger partage de mémoire, mais état **concurrent** à protéger (locks).  
- **Processus**: isolation mémoire, coût de **sérialisation** des données.

### 🧠 `asyncio` — asynchronisme coopératif
- **Coroutine** (`async def`) et **`await`** pour suspendre **sans bloquer** la boucle d'événements.  
- **Tâches** (`asyncio.create_task`) pour planifier l'exécution concurrente.  
- **`gather`** pour regrouper plusieurs tâches; **timeouts** avec `wait_for`; **annulation** via `task.cancel()`.

---

## 🧪 Exemples concrets

### Threads — I/O simulée
```python
import threading, time

def telecharge(n):
    print(f"start {n}")
    time.sleep(0.2)  # simule I/O
    print(f"done {n}")

ths = [threading.Thread(target=telecharge, args=(i,)) for i in range(3)]
for t in ths: t.start()
for t in ths: t.join()
```

### Processus — calcul CPU
```python
from multiprocessing import Pool

def f(x):
    # calcul intensif (ex: x**2 avec boucle pour simuler)
    s = 0
    for _ in range(100000): s += x*x
    return s

with Pool(processes=4) as p:
    print(p.map(f, [1,2,3,4]))
```

### Asyncio — tâches concurrentes
```python
import asyncio

async def job(n):
    print("start", n)
    await asyncio.sleep(0.2)
    print("done", n)
    return n

async def main():
    tasks = [asyncio.create_task(job(i)) for i in range(3)]
    results = await asyncio.gather(*tasks)
    print("res:", results)

asyncio.run(main())
```

### Timeouts & annulations
```python
import asyncio

async def slow():
    await asyncio.sleep(2)
    return 42

async def main():
    try:
        r = await asyncio.wait_for(slow(), timeout=0.5)
    except asyncio.TimeoutError:
        print("timeout!")

asyncio.run(main())
```

### Queue & verrou (`Lock`)
```python
import asyncio

async def worker(name, q, lock):
    while True:
        item = await q.get()
        async with lock:
            print(name, "->", item)
        q.task_done()

async def main():
    q = asyncio.Queue()
    lock = asyncio.Lock()
    for i in range(5):
        await q.put(i)
    tasks = [asyncio.create_task(worker(f"W{i}", q, lock)) for i in range(2)]
    await q.join()
    for t in tasks:
        t.cancel()

asyncio.run(main())
```

---

## 🔧 Pratique guidée
- **Choisir la bonne approche**: threads pour I/O, processus pour CPU, asyncio pour **beaucoup d'attentes I/O** sans bloquer.  
- **Isoler l'état**; utiliser **queues** pour communiquer en **async**; **Locks** pour sections critiques.  
- **Composer** avec `gather`, **timeout** avec `wait_for`, **annuler** proprement.

---

## ⚠️ Pièges & solutions
- **Bloquer** une coroutine avec `time.sleep` (sync) — utiliser `await asyncio.sleep`.  
- **Appels bloquants** en async: encapsuler avec `run_in_executor` si nécessaire.  
- **Data races**: protéger l'accès par **Lock** ou design **sans partage**.

---

## 💡 Astuces de pro
- **Mesurer** (profil simple) pour décider threads vs processus vs async.  
- **Limiter** le nombre de tâches; surveiller **timeouts** et **annulations**.  
- **Journaliser** (logging) pour diagnostiquer la concurrence.

---

## 🧪🧮 Mini‑formules
```python
# lancer une fonction bloquante dans l'executor
await asyncio.get_running_loop().run_in_executor(None, fonction_bloquante)

# attendre plusieurs tâches, ignorer exceptions
res = await asyncio.gather(*tasks, return_exceptions=True)
```

---

## 🧩 Exercices
1. Convertir une boucle I/O en **threads**, mesurer le gain.  
2. Écrire un **producteur/consommateur** avec `asyncio.Queue`.  
3. Calculer une opération CPU en **multiprocessing** et comparer au **threading**.  
4. Implémenter un **timeout** autour d'une coroutine lente.  
5. Introduire une **annulation** propre d'une tâche longue.

---

## 🧭 Récap
- Threads: I/O‑bound; Processus: CPU‑bound; Asyncio: I/O massif **non bloquant**.  
- Outils: **tasks**, **gather**, **wait_for**, **Lock**, **Queue**.  
- Pièges: blocage, partage d'état, mélange sync/async.

---

## ✅ Checklist
- [ ] Je différencie I/O‑bound vs CPU‑bound.  
- [ ] Je sais quand utiliser `threading`, `multiprocessing` et `asyncio`.  
- [ ] Je orchestre des tâches `async` avec `await`.  
- [ ] Je gère timeouts/annulations et protège l'état.

---

## 🧪 Mini‑quiz
1) Pour une charge **CPU‑bound**, on préfère:  
   a) `threading`  
   b) `multiprocessing`  
   c) `asyncio`

2) En coroutine, pour « attendre sans bloquer »:  
   a) `time.sleep`  
   b) `await asyncio.sleep`  
   c) `sleep(0)`

3) Pour grouper plusieurs coroutines:  
   a) `asyncio.gather`  
   b) `join_all`  
   c) `await_all`

*Réponses*: 1) b  2) b  3) a

---

> [!NOTE]
> Prochain chapitre: **Packaging, dépendances & livraison**.
