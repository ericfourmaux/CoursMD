# 🧪 Chapitre 11 — Tests & Qualité (Jest)

> **Objectif** : apprendre à écrire des **tests unitaires** et **d’intégration** efficaces en **JavaScript** avec **Jest**, utiliser **mocks/stubs/spies**, tester l’**asynchrone**, organiser les **suites**, mesurer la **qualité** (couverture, complexité) et relier les tests aux **patterns** vus précédemment.

---

## 🎯 Objectifs d’apprentissage
- Structurer un **projet de tests** (répertoires, conventions, nommage).
- Maîtriser les **assertions Jest** (`expect`), les **hooks** (`beforeEach/afterEach`).
- Savoir créer des **mocks**, **stubs** et **spies** (`jest.fn`, `jest.spyOn`).
- Tester l’**asynchrone** (`async/await`, timers, promesses).
- Couvrir des **patterns** : Strategy, Observer, Command, Facade, FSM.
- Comprendre **coverage**, **complexité**, et appliquer des **formules JS** utiles.

---

## 📦 Organisation — Arbre ASCII
```
project/
  src/
    domain/
    infra/
    controllers/
    facade/
  tests/
    unit/
      cart.service.spec.js
      price.strategy.spec.js
      event.bus.spec.js
    integration/
      checkout.facade.int.spec.js
      order.fsm.int.spec.js
  jest.config.js
```

**Conventions** : fichiers de test suffixés `.spec.js` (unitaires) et `.int.spec.js` (intégration).

---

## 🧱 Test Pyramid (ASCII)
```
     [ UI / E2E ]        (rares, coûteux)
        /\
       /  \
[ Intégration ]          (quelques)
      /\
     /  \
[ Unitaires ]            (nombreux, rapides)
```

**Idée** : plus on monte, plus c’est **lent** et **fragile**; miser sur les **unitaires** bien pensés.

---

## 🔑 Bases Jest — Assertions & Hooks

### Assertions
```js
// exemples
expect(2 + 2).toBe(4);
expect({ a: 1 }).toEqual({ a: 1 });
expect([1,2,3]).toContain(2);
expect(() => { throw new Error('x'); }).toThrow('x');
```

### Hooks
```js
let cart; 
beforeEach(() => { cart = { items: [], add(p,q=1){ this.items.push({ ...p, qty:q }); }, total(){ return this.items.reduce((s,x)=>s+x.price*x.qty,0); } }; });
afterEach(() => { cart = null; });
```

---

## 🧰 Mocks, Stubs, Spies

### `jest.fn()` (mock function)
```js
const fakePay = jest.fn(async (total) => ({ ok: total <= 100, tx: 'tx_' + Date.now() }));
expect(await fakePay(80)).toEqual(expect.objectContaining({ ok: true }));
expect(fakePay).toHaveBeenCalledTimes(1);
```

### `jest.spyOn()` (espionner une méthode)
```js
const service = { getPrice: async (id) => 20 };
const spy = jest.spyOn(service, 'getPrice');
await service.getPrice('p1');
expect(spy).toHaveBeenCalledWith('p1');
```

### Stubs (remplacer dépendances)
```js
const productsPort = { get: jest.fn(async (id) => ({ id, name: 'Tee', price: 20 })) };
```

---

## 🔄 Tester l’asynchrone

### `async/await`
```js
async function payer(total){ return { ok: total <= 100, tx: 'tx_'+Date.now() }; }

test('paiement async ok', async () => {
  const r = await payer(80);
  expect(r.ok).toBe(true);
});
```

### Timers (fake)
```js
jest.useFakeTimers();
function delay(ms){ return new Promise(res => setTimeout(res, ms)); }

test('delay 200ms', async () => {
  const p = delay(200);
  jest.advanceTimersByTime(200);
  await expect(p).resolves.toBeUndefined();
});
```

---

## 🧩 Tests — Patterns du fil rouge

### 1) Strategy (prix)
```js
class BlackFridayStrategy { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0) * 0.7; } }
class PriceCalculator { constructor(strategy){ this.strategy=strategy; } calc(items){ return this.strategy.calc(items); } }

test('BlackFridayStrategy applique -30%', () => {
  const items = [{ price: 10, qty: 2 }]; // total 20
  const calc = new PriceCalculator(new BlackFridayStrategy());
  expect(calc.calc(items)).toBe(14);
});
```

### 2) Observer (bus d’événements)
```js
function createBus(){ const h = {}; return { on(e,f){ (h[e] ||= []).push(f); }, emit(e,d){ (h[e]||[]).forEach(f => f(d)); } }; }

test('bus notifie les abonnés', () => {
  const bus = createBus();
  const log = jest.fn();
  bus.on('cart:updated', log);
  bus.emit('cart:updated', { total: 10 });
  expect(log).toHaveBeenCalledWith({ total: 10 });
});
```

### 3) Command (undo)
```js
class Cart { constructor(){ this.items=[]; } add(p){ this.items.push(p); } remove(id){ this.items = this.items.filter(x=>x.id!==id); } }
class AddItemCommand { constructor(cart,p){ this.cart=cart; this.p=p; } execute(){ this.cart.add(this.p); } undo(){ this.cart.remove(this.p.id); } }

test('AddItemCommand undo retire item', () => {
  const cart = new Cart(); const cmd = new AddItemCommand(cart, { id:'p1' });
  cmd.execute(); expect(cart.items.length).toBe(1);
  cmd.undo(); expect(cart.items.length).toBe(0);
});
```

### 4) Facade (checkout)
```js
class CheckoutFacade { constructor({ cart, payment, notifier }){ this.cart=cart; this.payment=payment; this.notifier=notifier; }
  async run(code){ let t=this.cart.total(); if(code==='WELCOME10') t=+(t*0.9).toFixed(2); const r=await this.payment.pay(t); if(r.ok) await this.notifier.send(`Paid ${t}`); return r; } }

test('facade appelle payment et notifier en cas de succès', async () => {
  const cart = { total: () => 20 };
  const payment = { pay: jest.fn(async () => ({ ok: true, tx: 'tx_1' })) };
  const notifier = { send: jest.fn(async () => true) };
  const facade = new CheckoutFacade({ cart, payment, notifier });
  const r = await facade.run('WELCOME10');
  expect(r.ok).toBe(true);
  expect(payment.pay).toHaveBeenCalledWith(18);
  expect(notifier.send).toHaveBeenCalledWith('Paid 18');
});
```

### 5) FSM (transitions)
```js
class FSM { constructor({ initial, transitions }){ this.state=initial; this.t=transitions; }
  can(evt, ctx){ const s=this.t[this.state]?.[evt]; return !!s && (!s.guard || s.guard(ctx)); }
  send(evt, ctx){ const s=this.t[this.state]?.[evt]; if(!s || (s.guard && !s.guard(ctx))) throw new Error('refus'); this.state=s.to; return this.state; } }

test('FSM pay puis ship', () => {
  const f = new FSM({ initial: 'CREATED', transitions: { CREATED:{ pay:{ to:'PAID', guard:({ total })=> total>0 } }, PAID:{ ship:{ to:'SHIPPED' } } } });
  expect(f.can('pay', { total: 10 })).toBe(true); f.send('pay', { total: 10 });
  expect(f.state).toBe('PAID'); f.send('ship'); expect(f.state).toBe('SHIPPED');
});
```

---

## 🧮 Mesures & Formules en JavaScript

### 1) Couverture minimale (Use Case alternatifs)
```js
function minTestCount(alternatives){ return 1 + (alternatives|0); }
```

### 2) Complexité cyclomatique (approx naïve)
```js
function cyclomatic(js){ const decisions=(js.match(/\bif\b|\bswitch\b|\?|&&|\|\|/g)||[]).length; return 1 + decisions; }
```

### 3) Temps moyen d’un test async (N runs)
```js
async function avgAsyncTime(fn, runs=10){ const t0=performance.now(); for(let i=0;i<runs;i++){ await fn(); } const t1=performance.now(); return +( (t1-t0)/runs ).toFixed(2); }
```

### 4) Taux de faux positifs/negatifs (estimation)
```js
function estimateErrorRates(total, falsePos, falseNeg){ return { fp: +(falsePos/total*100).toFixed(2), fn: +(falseNeg/total*100).toFixed(2) }; }
```

---

## ⚙️ Jest — Configuration minimale
```js
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  verbose: true,
  // collectCoverage: true,
  // collectCoverageFrom: ['src/**/*.js'],
};
```

**Commandes** (indicatives) :
```
# lancer les tests
npx jest
# avec couverture
npx jest --coverage
# filtrer par nom
npx jest -t "facade"
```

> Remarque : les commandes sont **indicatives** pour ta configuration; adapte selon ton runner.

---

## 🧭 Bonnes pratiques
- **Isoler** la logique métier des **I/O** (mocks pour HTTP, timers, files).
- Un test = **un comportement** (éviter tests fourre-tout).
- **Nommer** clairement (`should ...` / `when ... then ...`).
- **Désactiver** les side-effects (logs, timers) ou les **contrôler** (spies).
- **Éviter** de tester l’**implémentation** (tester le **contrat** / résultat observables).
- **Refactorer** sans casser les tests (SOLID/GRASP aide à découpler).

---

## 🚫 Anti-patterns
- Tests qui **duplicquent** le code (fragiles au refactor).
- Tests qui dépendent d’un **ordre** caché d’événements.
- Mocks **trop lourds** (difficiles à maintenir).
- Couverture **haute** mais **qualité basse** (assertions faibles).

---

## ✍️ Atelier — Exercices

### Exercice 1 — Mocks
Écris un test de **Facade** qui **mock** `payment.pay` pour renvoyer un **échec**, et vérifie que `notifier.send` n’est **pas** appelé.

### Exercice 2 — Spies
Espionne `CartService.total()` via `jest.spyOn` et vérifie le **nombre** d’appels pendant `CheckoutController.pay()`.

### Exercice 3 — Async & Timers
Écris un test qui valide qu’un `retry(fn, 2)` **réessaie** deux fois si la première **promesse** rejette.

### Exercice 4 — FSM
Ajoute une **garde** sur `ship` (adresse valide) et écris un test qui **rejette** la transition si `address.zip` est manquant.

---

## ✅ Solutions (suggestions)

### Sol. 1 — Mock échec paiement
```js
const cart = { total: () => 20 };
const payment = { pay: jest.fn(async () => ({ ok: false })) };
const notifier = { send: jest.fn(async () => true) };
const facade = new CheckoutFacade({ cart, payment, notifier });
const r = await facade.run();
expect(r.ok).toBe(false);
expect(notifier.send).not.toHaveBeenCalled();
```

### Sol. 2 — Spy sur total
```js
const bus = { emit: jest.fn() };
const cart = { total: jest.fn(() => 20) };
const facade = { cart, run: jest.fn(async () => ({ ok: true, tx: 't' })) };
const fsm = { can: () => true, send: jest.fn() };
const ctl = new CheckoutController({ bus, facade, orderFSM: fsm });
await ctl.pay(null);
expect(cart.total).toHaveBeenCalledTimes(1);
```

### Sol. 3 — Retry
```js
async function retry(fn, max=2){ for(let i=0;i<=max;i++){ try{ return await fn(); } catch(e){ if(i===max) throw e; } } }

test('retry appelle 3 fois au total si 2 échecs', async () => {
  const seq = [Promise.reject(new Error('A')), Promise.reject(new Error('B')), Promise.resolve('OK')];
  let i = 0; const fn = () => seq[i++];
  await expect(retry(fn, 2)).resolves.toBe('OK');
});
```

### Sol. 4 — FSM garde ship
```js
const f = new FSM({ initial: 'PAID', transitions: { PAID:{ ship:{ to:'SHIPPED', guard:({ address })=>!!address&&!!address.zip } } } });
expect(() => f.send('ship', { address: {} })).toThrow('refus');
expect(f.send('ship', { address: { zip: 'H2X' } })).toBe('SHIPPED');
```

---

## 🧾 Checklist — Chapitre 11
- [ ] Je sais structurer **tests unitaires** vs **intégration**.
- [ ] J’utilise `expect`, `beforeEach/afterEach`, `jest.fn`, `jest.spyOn`.
- [ ] Je teste l’**asynchrone** (promesses, timers).
- [ ] Je sais couvrir les **patterns** clés (Strategy, Observer, Command, Facade, FSM).
- [ ] Je mesure **coverage**, **complexité**, et j’améliore mes tests.

---

## 🧠 Mini Quiz
1. Différence entre **mock** et **spy** ?
2. Comment tester une **promesse** qui **rejette** en Jest ?
3. À quoi sert `beforeEach` ?
4. Pourquoi éviter de tester les **détails d’implémentation** ?
5. Donne un exemple d’anti-pattern **test**.

> Réponses attendues : 1) Mock = **remplace** une dépendance; Spy = **observe** une méthode réelle 2) `await expect(promise).rejects.toThrow(...)` 3) Préparer l’**état** commun des tests 4) Fragile au refactor, prendre le **contrat observable** 5) Test qui duplique l’algorithme, ou dépend d’un ordre implicite.

---

## 🗂️ Références internes
- Cf. **Chapitre 2** (Use Cases) → scénarios = cas de test.
- Cf. **Chapitres 6–9** (principes & patterns) → structurer tests par **responsabilités**.
- Cf. **Chapitre 10** → controllers/facade/FSM pour tests d’intégration.

---

## 📚 Résumé — Points clés du Chapitre 11
- Les tests **unitaires** vérifient des **comportements isolés**; les tests **d’intégration** valident les **interactions**.
- **Jest** fournit `expect`, **mocks/stubs/spies**, **hooks** et un écosystème pour l’**asynchrone**.
- Testez les **patterns** clés (Strategy, Observer, Command, Facade, FSM) pour garantir la **robustesse**.
- Utilisez des **formules JS** (couverture minimale, complexité, temps moyen) pour **piloter** la qualité.
