
# 📘 Chapitre 4 — Algorithmique & Structures de Données en JavaScript

> 🎯 **Objectifs du chapitre**
> - Comprendre et **mesurer** la complexité temporelle et spatiale (**Big‑O**), avec des exemples et formules en **JavaScript**.
> - Maîtriser les **structures de données** essentielles: Array, Object/Map, Set, Pile (Stack), File (Queue), Liste chaînée, Deque, **Heap (file de priorité)**.
> - Implémenter les **algorithmes** classiques: recherche linéaire/binaire, tris (insertion, sélection, merge sort, quicksort), **parcours** (DFS/BFS), **récursion** et **programmation dynamique**.
> - Appliquer des **patterns** (deux pointeurs, fenêtre glissante, hashage) pour résoudre efficacement des problèmes courants.
> - Produire une **bibliothèque d’algos** testable en JS et savoir **benchmark** correctement.

---

## 🧠 1. Notation Big‑O — Comprendre la croissance

### 🔍 Définition
La **notation Big‑O** décrit la **limite supérieure** de la croissance du **nombre d’opérations** (ou de la mémoire) en fonction de la taille d’entrée `n`. Elle **abstrait** les constantes et les termes de plus faible ordre.

### ❓ Pourquoi
- Comparer des **solutions** indépendamment du matériel.
- Prévoir l’**échelle** (scalabilité) quand `n` devient grand.

### 💡 Analogies
- **Autoroute**: la capacité (Big‑O) indique comment le temps de trajet croît avec le nombre de véhicules `n`. Les feux, limitations (constantes) varient, mais l’**ordre de grandeur** prime.
- **Cuisine**: cuisiner `n` plats avec un plan linéaire (`O(n)`), ou en divisions/combinaisons (`O(n log n)`), etc.

### 🧮 Formules en JavaScript (croissances usuelles)
```js
const O = {
  constant: (n) => 1,
  linear: (n) => n,
  quadratic: (n) => n * n,
  cubic: (n) => n ** 3,
  log: (n) => Math.log2(Math.max(1, n)),
  nlogn: (n) => n * Math.log2(Math.max(1, n)),
};
// Exemple: comparer les ordres de grandeur
for (const n of [10, 100, 1000]) {
  console.log(n, {
    O1: O.constant(n), On: O.linear(n), Onlogn: Math.round(O.nlogn(n)), On2: O.quadratic(n)
  });
}
```

### ✅ Tableau (ordre croissant)
- `O(1)` < `O(log n)` < `O(n)` < `O(n log n)` < `O(n^2)` < `O(n^3)` < `O(2^n)` < `O(n!)`

### ⚠️ Subtilités
- **Constantes** comptent pour des `n` **petits**.
- **Cache** CPU, **allocation mémoire** et **JIT** peuvent varier; Big‑O reste **théorique**.

---

## 🧠 2. Mesurer le temps en JavaScript — Benchmarking

### 🔍 Principe
Utiliser `performance.now()` pour mesurer des **intervalles**; répéter plusieurs fois, éliminer l’outlier et **éviter la suppression de code** par le JIT.

### 💡 Harness de benchmark
```js
function bench(label, fn, { warmup = 100, runs = 200 } = {}) {
  // Warmup pour JIT
  for (let i = 0; i < warmup; i++) fn();
  const times = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    const res = fn(); // éviter dead code: utiliser res
    const t1 = performance.now();
    times.push(t1 - t0);
    if (typeof res === 'number') { // empêcher optimisation excessive
      // Petite opération sur res
      Math.sqrt(res);
    }
  }
  times.sort((a,b)=>a-b);
  const mid = times[Math.floor(times.length/2)];
  console.log(`${label}: médiane = ${mid.toFixed(3)} ms (runs=${runs})`);
  return mid;
}
```

### ⚠️ Bonnes pratiques
- Mesurer sur **profil réaliste** (taille de `n`, structure de données).
- **Désactiver** extensions/breakpoints; exécuter plusieurs **séries**.

---

## 🧠 3. Structures de données fondamentales

### 📦 Array (tableau)
- **Indexation** O(1), `push/pop` O(1) amorti, `shift/unshift` O(n).
- **Parcours** O(n), **recherche** naïve O(n).
```js
const arr = [3,1,4];
arr.push(1);   // O(1)
arr.shift();   // O(n)
arr.includes(4); // O(n)
```

### 📦 Object vs Map & Set
- **Object**: clés **string/symbol**, prototype, risque de collisions.
- **Map**: clés **de tout type**, **ordre d’insertion**, itérations optimisées.
- **Set**: collection d’éléments **uniques**.
```js
// Comptage de fréquences (hash)
function freq(xs) {
  const m = new Map();
  for (const x of xs) m.set(x, (m.get(x) || 0) + 1);
  return m;
}
```

### 📦 Pile (Stack)
- LIFO (Last In, First Out): `push`, `pop` O(1).
```js
class Stack {
  constructor(){ this.s = []; }
  push(x){ this.s.push(x); }
  pop(){ return this.s.pop(); }
  peek(){ return this.s[this.s.length-1]; }
}
```

### 📦 File (Queue) — Deux piles (amorti O(1))
```js
class Queue {
  constructor(){ this.in=[]; this.out=[]; }
  enqueue(x){ this.in.push(x); }
  dequeue(){ if(!this.out.length){ while(this.in.length) this.out.push(this.in.pop()); }
             return this.out.pop(); }
  get size(){ return this.in.length + this.out.length; }
}
```

### 📦 Liste chaînée (Singly Linked List)
```js
class Node { constructor(val, next=null){ this.val=val; this.next=next; } }
class LinkedList {
  constructor(){ this.head=null; }
  prepend(val){ this.head = new Node(val, this.head); }
  find(val){ let cur=this.head; while(cur){ if(cur.val===val) return cur; cur=cur.next; } return null; }
}
```
- **Insertion** en tête O(1), **recherche** O(n).

### 📦 Deque (double‑ended queue)
```js
class Deque {
  constructor(){ this.left=[]; this.right=[]; }
  pushLeft(x){ this.left.push(x); }
  pushRight(x){ this.right.push(x); }
  popLeft(){ if(!this.left.length) while(this.right.length) this.left.push(this.right.shift()); return this.left.pop(); }
  popRight(){ if(!this.right.length) while(this.left.length) this.right.unshift(this.left.pop()); return this.right.pop(); }
}
```

### 📦 Heap (File de priorité) — **Binary heap**
```js
class MinHeap {
  constructor(){ this.h=[]; }
  push(x){ this.h.push(x); this.#up(this.h.length-1); }
  pop(){ if(!this.h.length) return undefined; const top=this.h[0];
         const x=this.h.pop(); if(this.h.length){ this.h[0]=x; this.#down(0); } return top; }
  #up(i){ while(i){ const p=(i-1)>>1; if(this.h[p] <= this.h[i]) break; [this.h[p],this.h[i]]=[this.h[i],this.h[p]]; i=p; } }
  #down(i){ for(;;){ const l=i*2+1, r=l+1; let m=i;
    if(l<this.h.length && this.h[l] < this.h[m]) m=l;
    if(r<this.h.length && this.h[r] < this.h[m]) m=r;
    if(m===i) break; [this.h[i],this.h[m]]=[this.h[m],this.h[i]]; i=m; }
  }
}
```
- `push`/`pop` **O(log n)**.

---

## 🧠 4. Recherche — linéaire & binaire

### 🔍 Recherche linéaire
- Parcours séquentiel **O(n)**.
```js
function linearSearch(xs, target){
  for (let i=0;i<xs.length;i++) if (xs[i]===target) return i;
  return -1;
}
```

### 🔍 Recherche binaire (tableau **trié**)
- Diviser pour chercher **O(log n)**.
```js
function binarySearch(xs, target){
  let lo=0, hi=xs.length-1;
  while (lo<=hi){
    const mid=(lo+hi)>>1;
    if (xs[mid]===target) return mid;
    if (xs[mid]<target) lo=mid+1; else hi=mid-1;
  }
  return -1;
}
```

---

## 🧠 5. Tris — propriétés & implémentations

### 🔍 Stabilité
Un tri **stable** conserve l’ordre relatif des éléments égaux (utile pour **multi‑clés**).

### 📦 Insertion sort (stable) — **O(n^2)**
```js
function insertionSort(a){
  for(let i=1;i<a.length;i++){
    const x=a[i]; let j=i-1;
    while(j>=0 && a[j]>x){ a[j+1]=a[j]; j--; }
    a[j+1]=x;
  }
  return a;
}
```

### 📦 Selection sort (instable) — **O(n^2)**
```js
function selectionSort(a){
  for(let i=0;i<a.length;i++){
    let m=i;
    for(let j=i+1;j<a.length;j++) if(a[j]<a[m]) m=j;
    [a[i],a[m]]=[a[m],a[i]];
  }
  return a;
}
```

### 📦 Merge sort (stable) — **O(n log n)**, **O(n)** espace
```js
function mergeSort(a){
  if(a.length<=1) return a.slice();
  const mid=a.length>>1;
  const left=mergeSort(a.slice(0,mid));
  const right=mergeSort(a.slice(mid));
  const res=[]; let i=0,j=0;
  while(i<left.length && j<right.length){
    if(left[i]<=right[j]) res.push(left[i++]); else res.push(right[j++]);
  }
  return res.concat(left.slice(i), right.slice(j));
}
```

### 📦 Quicksort (pivot) — **O(n log n)** moyen, **O(n^2)** pire
```js
function quickSort(a, lo=0, hi=a.length-1){
  if(lo>=hi) return a;
  const p = partition(a, lo, hi);
  quickSort(a, lo, p-1);
  quickSort(a, p+1, hi);
  return a;
}
function partition(a, lo, hi){
  const pivot=a[hi]; let i=lo;
  for(let j=lo;j<hi;j++) if(a[j]<pivot){ [a[i],a[j]]=[a[j],a[i]]; i++; }
  [a[i],a[hi]]=[a[hi],a[i]]; return i;
}
```

### 🧮 Estimations en JS
```js
// Comparer n log n vs n^2
function steps_nlogn(n){ return Math.round(n * Math.log2(Math.max(1,n))); }
function steps_n2(n){ return n*n; }
console.log(1000, { nlogn: steps_nlogn(1000), n2: steps_n2(1000) });
```

---

## 🧠 6. Récursion & Programmation Dynamique (PD)

### 🔍 Récursion
- **Cas de base** + **cas récursif**. Risque de **stack overflow** si la profondeur est grande.

### 💡 Fibonacci naïf vs mémoïsation
```js
// Naïf: O(φ^n) ~ exponentiel
function fibNaive(n){ return (n<=1) ? n : fibNaive(n-1) + fibNaive(n-2); }

// Mémoïsation: O(n)
function fibMemo(){
  const memo = new Map([[0,0],[1,1]]);
  return function f(n){ if(memo.has(n)) return memo.get(n);
    const v = f(n-1) + f(n-2); memo.set(n, v); return v; };
}
const fib = fibMemo();
```

### 💡 Tabulation (bottom‑up)
```js
function fibTab(n){
  if(n<=1) return n; const dp = new Array(n+1).fill(0);
  dp[1] = 1; for(let i=2;i<=n;i++) dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
}
```

### 💡 Problème du rendu de monnaie (min pièces) — PD
```js
function minCoins(amount, coins){
  const INF = 1e9; const dp = new Array(amount+1).fill(INF); dp[0]=0;
  for(const c of coins){
    for(let a=c; a<=amount; a++) dp[a] = Math.min(dp[a], dp[a-c] + 1);
  }
  return dp[amount] >= INF ? -1 : dp[amount];
}
```

---

## 🧠 7. Graphes & Arbres — parcours DFS/BFS

### 🔍 Représentation
- **Adjacency list**: `Map<Node, Array<Node>>`.
- Complexité **O(V+E)** pour les parcours.

### 💡 BFS (file) — plus court chemin non pondéré
```js
function bfs(graph, start){
  const q = [start], seen = new Set([start]);
  const order = [];
  while(q.length){
    const v = q.shift(); order.push(v);
    for(const w of (graph.get(v) || [])) if(!seen.has(w)){ seen.add(w); q.push(w); }
  }
  return order;
}
```

### 💡 DFS (pile) — parcours en profondeur
```js
function dfs(graph, start){
  const st=[start], seen=new Set([start]), order=[];
  while(st.length){
    const v=st.pop(); order.push(v);
    for(const w of (graph.get(v)||[]).slice().reverse()) if(!seen.has(w)){ seen.add(w); st.push(w); }
  }
  return order;
}
```

### 💡 Arbres — traversals (BST)
```js
class BSTNode { constructor(k){ this.k=k; this.l=null; this.r=null; } }
class BST {
  constructor(){ this.root=null; }
  insert(k){ this.root = this.#ins(this.root,k); }
  #ins(n,k){ if(!n) return new BSTNode(k); if(k<n.k) n.l=this.#ins(n.l,k); else n.r=this.#ins(n.r,k); return n; }
  has(k){ let n=this.root; while(n){ if(k===n.k) return true; n = k<n.k ? n.l : n.r; } return false; }
}
function inorder(n, visit){ if(!n) return; inorder(n.l,visit); visit(n.k); inorder(n.r,visit); }
function preorder(n, visit){ if(!n) return; visit(n.k); preorder(n.l,visit); preorder(n.r,visit); }
function postorder(n, visit){ if(!n) return; postorder(n.l,visit); postorder(n.r,visit); visit(n.k); }
```

---

## 🧠 8. Patterns d’optimisation — Deux pointeurs & Fenêtre glissante

### 💡 Deux pointeurs (tableau trié) — Somme cible
```js
function twoSumSorted(a, target){
  let i=0, j=a.length-1;
  while(i<j){
    const s=a[i]+a[j];
    if(s===target) return [i,j];
    if(s<target) i++; else j--;
  }
  return null;
}
```

### 💡 Fenêtre glissante — plus longue sous‑chaîne sans répétition
```js
function longestUniqueSubstr(s){
  const pos = new Map(); let start=0, best=0;
  for(let i=0;i<s.length;i++){
    const ch=s[i]; if(pos.has(ch) && pos.get(ch)>=start) start = pos.get(ch)+1;
    pos.set(ch,i); best = Math.max(best, i-start+1);
  }
  return best;
}
```

### 💡 Hashing — Two Sum (non trié) en **O(n)**
```js
function twoSum(xs, target){
  const idx = new Map();
  for(let i=0;i<xs.length;i++){
    const x=xs[i], y=target-x;
    if(idx.has(y)) return [idx.get(y), i];
    idx.set(x,i);
  }
  return null;
}
```

---

## 🧪 9. Exercices guidés

1. **Big‑O**: Donnez la complexité de chaque fragment (simple boucle, double boucle, boucle + binaire).
2. **Benchmark**: Comparez `insertionSort` vs `mergeSort` sur des tableaux de 1000, 5000, 10000.
3. **Structure**: Implémentez une **Deque** efficace et testez `pushLeft/pushRight` en O(1) amorti.
4. **Recherche**: Écrivez `binarySearchRange` pour trouver **première** et **dernière** occurrence.
5. **Tri**: Implémentez un **quicksort** avec pivot aléatoire; mesurez les temps.
6. **PD**: Modifiez `minCoins` pour retourner **les pièces utilisées** (reconstruction).
7. **Graphes**: Écrivez BFS pour retourner la **distance** depuis `start` (niveau par niveau).
8. **Arbres**: Ajoutez `remove(k)` et **rotation** à votre BST (bonus AVL/Red‑Black — aperçu).

---

## ✅ 10. Check‑list Algorithmique

- [ ] Identifiez la **taille d’entrée** `n` et les opérations dominantes.
- [ ] Choisissez une **structure** adaptée (Map/Set pour lookup, Heap pour priorité).
- [ ] Préférez `O(n log n)` ou mieux aux algos `O(n^2)` pour listes grandes.
- [ ] Utilisez des **patterns** (fenêtre glissante, deux pointeurs, hash).
- [ ] Mesurez avec `performance.now()` **et** des tailles réalistes.
- [ ] Vérifiez la **stabilité** du tri si nécessaire (multi‑clés).
- [ ] Évaluez les **trade‑offs** temps/espace (mémoïsation, tabulation).

---

## 📦 11. Livrable du chapitre
Une **bibliothèque JS** `algos.js` contenant:
- `linearSearch`, `binarySearch`
- `insertionSort`, `selectionSort`, `mergeSort`, `quickSort`
- `Stack`, `Queue`, `LinkedList`, `MinHeap`
- `bfs`, `dfs`, `longestUniqueSubstr`, `twoSum`
- Un script `bench.js` avec le **harness** de benchmark.

---

## 🔚 Résumé essentiel du Chapitre 4
- **Big‑O** fournit un **cadre** pour raisonner sur l’**évolutivité**; concentrez‑vous sur les **termes dominants**.
- Mesurez avec `performance.now()` en **répétant** et en **neutralisant le JIT** (warmup, anti dead‑code).
- Les **structures** (Map/Set/Heap) offrent des opérations plus rapides que des tableaux selon le besoin (lookup, priorité).
- **Recherche binaire** nécessite des données triées; **O(log n)** vs **O(n)** pour linéaire.
- Les **tris** efficaces sont **merge sort** et **quicksort** (`O(n log n)`); choisissez selon **stabilité**, **mémoire**, **distribution** des données.
- La **récursion** doit avoir des **cas de base**; optimisez avec **mémoïsation** ou **tabulation** (PD).
- Les **parcours** de graphes/arbre (BFS/DFS) coûtent **O(V+E)**; choisissez selon **objectif** (distance vs exploration).
- Les **patterns** (deux pointeurs, fenêtre glissante, hash) transforment des approches naïves en solutions **linéaires**.

---

> Prochain chapitre: **POO, S.O.L.I.D, MVC & Design Patterns** — architecture de code, principes de responsabilité et patrons classiques appliqués au Front.
