# 🧩 Chapitre 5 — State, Component & Deployment

> **Objectif** : maîtriser la **modélisation d’états** (state machine), la **structuration par composants** (ports, interfaces, dépendances) et la **vue de déploiement** (nœuds, artefacts, connexions). Tout en **ASCII** et **JavaScript uniquement**.

---

## 🎯 Objectifs d’apprentissage
- Définir précisément **état**, **événement**, **transition**, **action d’entrée/sortie**, **garde**.
- Lire/écrire un **diagramme d’états** ASCII et l’implémenter en **JS**.
- Comprendre **composant**, **port**, **interface**, **dépendance**, et modéliser une **architecture modulaire**.
- Décrire une **vue de déploiement** (nœuds client/serveur, artefacts, environnements).
- Éviter les **anti-patterns** (états fantômes, couplage fort, déploiement mal paramétré).

---

## 🔑 Définitions — State Machine
- **État** : situation **persistante** du système (ex. `CREATED`, `PAID`).
- **Événement** : **stimulus** qui **peut déclencher** une transition (ex. `pay`, `ship`).
- **Transition** : passage **d’un état A vers B** suite à un événement; peut avoir **garde** (condition) et **actions** (entrée/sortie).
- **Garde** : **condition booléenne** qui **autorise** ou **interdit** la transition.
- **Actions d’entrée/sortie** : opérations exécutées **à l’entrée** / **à la sortie** d’un état.

### 💡 Pourquoi modéliser en états ?
- **Robustesse** : empêcher des **séquences illégales** (ex. expédier avant payer).
- **Lisibilité** : clarifier le **cycle de vie**.
- **Testabilité** : transitions = **cas de test** explicites.

---

## 🧩 Diagramme d’états (ASCII) — Commande
```
           +-----------+   pay   +--------+   ship   +----------+
[CREATED]--+           +-------> |  PAID  | -------> | SHIPPED  |
           +-----------+         +--------+          +----------+
                 | cancel              | refund            | deliver
                 v                     v                   v
             +--------+            +---------+         +----------+
             |CANCELLED|            |REFUNDED |        |DELIVERED |
             +--------+            +---------+         +----------+
```

**Règles** :
- `pay` autorisé **uniquement** depuis `CREATED`.
- `ship` autorisé **uniquement** depuis `PAID`.
- `deliver` autorisé **uniquement** depuis `SHIPPED`.
- `cancel` autorisé si **non expédié**.
- `refund` autorisé si **payé** mais **non livré**.

---

## 💻 Implémentation JavaScript — State Machine générique
```js
// fsm.js — un micro-FSM table-driven
export class FSM {
  constructor({ initial, states, transitions, onEnter = {}, onExit = {} }) {
    this.state = initial;
    this.states = new Set(states);
    this.transitions = transitions; // { from: { event: { to, guard?, action? } } }
    this.onEnter = onEnter;         // { state: fn(context) }
    this.onExit = onExit;           // { state: fn(context) }
    if (!this.states.has(initial)) throw new Error('État initial invalide');
  }
  can(event, context = {}) {
    const spec = this.transitions[this.state]?.[event];
    if (!spec) return false;
    if (spec.guard && !spec.guard(context)) return false;
    return true;
  }
  send(event, context = {}) {
    const spec = this.transitions[this.state]?.[event];
    if (!spec) throw new Error(`Transition inexistante: ${this.state} --${event}--> ?`);
    if (spec.guard && !spec.guard(context)) throw new Error('Garde refusée');
    // exit action
    if (this.onExit[this.state]) this.onExit[this.state](context);
    // transition action
    if (spec.action) spec.action(context);
    // move state
    const next = spec.to;
    if (!this.states.has(next)) throw new Error('État cible inconnu');
    this.state = next;
    // entry action
    if (this.onEnter[this.state]) this.onEnter[this.state](context);
    return this.state;
  }
}
```

### Spécialisation pour Commande
```js
// order-fsm.js
import { FSM } from './fsm.js';

export function createOrderFSM() {
  return new FSM({
    initial: 'CREATED',
    states: ['CREATED','PAID','SHIPPED','DELIVERED','CANCELLED','REFUNDED'],
    transitions: {
      CREATED: {
        pay: { to: 'PAID', guard: ({ amount }) => amount > 0, action: ({ log }) => log('pay ok') },
        cancel: { to: 'CANCELLED' }
      },
      PAID: {
        ship: { to: 'SHIPPED' },
        refund: { to: 'REFUNDED' }
      },
      SHIPPED: { deliver: { to: 'DELIVERED' } },
    },
    onEnter: {
      PAID: ({ log }) => log('enter PAID'),
      SHIPPED: ({ log }) => log('enter SHIPPED'),
      DELIVERED: ({ log }) => log('enter DELIVERED'),
    },
    onExit: {
      CREATED: ({ log }) => log('exit CREATED'),
    }
  });
}

// usage
const logger = (msg) => console.log(msg);
const fsm = createOrderFSM();
console.log('État initial:', fsm.state);            // CREATED
console.log('peut payer ?', fsm.can('pay', { amount: 20 })); // true
fsm.send('pay', { amount: 20, log: logger });       // -> PAID
fsm.send('ship', { log: logger });                  // -> SHIPPED
fsm.send('deliver', { log: logger });               // -> DELIVERED
```

### Garde & erreurs contrôlées
```js
const f = createOrderFSM();
try {
  f.send('ship'); // erreur: pas possible depuis CREATED
} catch (e) { console.log('Bloqué:', e.message); }
```

---

## 🧮 Formules & validations en JavaScript

### 1) Détection de **transitions ambiguës** (non déterminisme)
Deux transitions **différentes** ne doivent pas être **déclenchées** par le **même événement** dans le **même état**.
```js
function hasAmbiguity(transitions) {
  for (const [state, events] of Object.entries(transitions)) {
    const seen = new Set();
    for (const evt of Object.keys(events)) {
      if (seen.has(evt)) return true; seen.add(evt);
    }
  }
  return false;
}
```

### 2) **Nombre de transitions** sortantes par état
Utile pour **estimer** la **complexité**.
```js
function outDegree(transitions) {
  const deg = {}; for (const s of Object.keys(transitions)) deg[s] = Object.keys(transitions[s]).length; return deg;
}
```

### 3) **Chemins** jusqu’aux états terminaux (DFS)
```js
function pathsToTerminal(transitions, start, terminals) {
  const res = []; const path = [];
  function dfs(state) {
    if (terminals.includes(state)) { res.push([...path, state]); return; }
    const evts = transitions[state] || {};
    if (Object.keys(evts).length === 0) { res.push([...path, state]); return; }
    for (const [evt, { to }] of Object.entries(evts)) {
      path.push(`${state} --${evt}--> ${to}`);
      dfs(to);
      path.pop();
    }
  }
  dfs(start); return res;
}

// exemple
const tr = {
  CREATED: { pay: { to: 'PAID' }, cancel: { to: 'CANCELLED' } },
  PAID: { ship: { to: 'SHIPPED' }, refund: { to: 'REFUNDED' } },
  SHIPPED: { deliver: { to: 'DELIVERED' } }
};
console.log(pathsToTerminal(tr, 'CREATED', ['CANCELLED','REFUNDED','DELIVERED']));
```

---

## 🧱 Composants — Concepts & Notation ASCII
- **Composant** : unité **déployable** qui **encapsule** des **responsabilités**.
- **Port** : **point de communication** (fourni/requis).
- **Interface** : **contrat** exposé/requis par un port.
- **Dépendance** : un composant **utilise** un autre via une **interface**.

### Schéma ASCII — SPA + API (ports & interfaces)
```
+------------------------------------+
|       Front SPA (Boutique)         |
|  [Port fournis]                    |
|    - CatalogUI (IProductsView)     |
|    - CartUI (ICartView)            |
|  [Ports requis]                    |
|    - ProductsPort (IProducts) ----+------------------+
|    - PaymentPort  (IPayment) -----+----+             |
+------------------------------------+    |             |
                                          |             |
                                   +------+-----+  +----+------+
                                   |  API Produits |  | API Paiement |
                                   |  [IProducts]  |  |  [IPayment]  |
                                   +--------------+  +-------------+
```

---

## 💻 Mapping Composants → JavaScript (Ports & Adapters)

### Contrats (interfaces de port)
```js
// ports.js
export const IProducts = { methods: ['list','get'] };
export const IPayment  = { methods: ['pay'] };
export function assertImplements(obj, iface) {
  const ok = iface.methods.every(m => typeof obj[m] === 'function');
  if (!ok) throw new Error('Contrat non respecté');
}
```

### Adapters côté front (fetch)
```js
// adapters/products-http.js
import { IProducts, assertImplements } from './ports.js';
export class HttpProductsAdapter {
  constructor(baseUrl) { this.baseUrl = baseUrl; }
  async list() { const r = await fetch(`${this.baseUrl}/products`); return r.json(); }
  async get(id) { const r = await fetch(`${this.baseUrl}/products/${id}`); return r.json(); }
}
assertImplements(new HttpProductsAdapter('https://api.example'), IProducts);

// adapters/payment-http.js
import { IPayment, assertImplements } from './ports.js';
export class HttpPaymentAdapter {
  constructor(baseUrl) { this.baseUrl = baseUrl; }
  async pay(total) { const r = await fetch(`${this.baseUrl}/pay`, { method:'POST', body: JSON.stringify({ total }) }); return r.json(); }
}
assertImplements(new HttpPaymentAdapter('https://api.example'), IPayment);
```

### Services UI qui **requièrent** des ports
```js
// services/ui-cart.js
import { assertImplements, IProducts, IPayment } from './ports.js';
export class UICartService {
  constructor(productsPort, paymentPort) {
    assertImplements(productsPort, IProducts);
    assertImplements(paymentPort,  IPayment);
    this.products = productsPort; this.payment = paymentPort;
    this.items = [];
  }
  async add(productId) {
    const p = await this.products.get(productId);
    const i = this.items.findIndex(x => x.id === p.id);
    if (i >= 0) this.items[i].qty++; else this.items.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  }
  total() { return this.items.reduce((s, x) => s + x.price * x.qty, 0); }
  async checkout() { const total = this.total(); return this.payment.pay(total); }
}
```

---

## 🛰️ Déploiement — Concepts & ASCII
- **Nœud (Node)** : **environnement d’exécution** (ex. navigateur, serveur).
- **Artefact** : **fichier déployé** (bundle JS, image docker, config).
- **Communication** : protocole entre nœuds (HTTP, WebSocket).

### Vue de déploiement (dev/staging/prod)
```
+----------------------+       +------------------------+       +---------------------+
|   Client (Browser)   | <---> |   Serveur API (Node)   | <---> |   Base de données   |
|  Artefacts:          |       |  Artefacts:            |       |  Artefacts:         |
|  - app.bundle.js     |       |  - api.js (Docker img) |       |  - dumps (stg)      |
|  - config.dev.json   |       |  - config.{env}.json   |       |  - prod data        |
+----------------------+       +------------------------+       +---------------------+
        dev/staging/prod               dev/staging/prod                 dev/staging/prod
```

### Paramétrage (JS) par environnement
```js
export const envConfig = {
  dev:     { baseUrl: 'http://localhost:3000', payments: 'http://localhost:4000' },
  staging: { baseUrl: 'https://staging.api.example', payments: 'https://staging.pay.example' },
  prod:    { baseUrl: 'https://api.example', payments: 'https://pay.example' },
};

export function cfg(env) { return envConfig[env] || envConfig.dev; }
```

---

## 🚫 Anti-patterns
- **États fantômes** : champs modifiés **sans passer par la FSM** → invalide.
- **Transition silencieuse** : changement d’état **sans garde** ni **log**.
- **Composant tentaculaire** (fait tout) : viol de **cohésion**.
- **Couplage fort** : front dépend **directement** d’impléments HTTP sans **ports**.
- **Config hardcodée** : déploiement non reproductible.

---

## ✍️ Atelier — intégration State + Composants + Déploiement

### Schéma ASCII (global)
```
[UI] --(add)--> [UICartService] --(get)--> [ProductsPort] -> [API Produits]
  |                                 \
  |                                  \--(pay)--> [PaymentPort] -> [API Paiement]
  |                                                          
  +--(FSM: CREATED -> PAID -> SHIPPED -> DELIVERED)
```

### Étapes
1. **Configurer** l’environnement (`cfg('dev')`).
2. **Instancier** les **adapters** HTTP avec l’URL de l’environnement.
3. Utiliser `UICartService` et **piloter** le **FSM** de commande.

---

## 🛠️ Exercices

### Exercice 1 — Garde avancée
Ajoute une **garde** à la transition `ship`: autoriser l’expédition **seulement** si l’adresse de livraison est **valide**.

### Exercice 2 — Nouveau port
Crée un port `INotifications` (méthode `notify(message)`) et un **adapter** HTTP. Utilise-le **à l’entrée** de l’état `DELIVERED` pour notifier.

### Exercice 3 — Déploiement
Écris une fonction `resolveEndpoints(env)` qui **retourne** `{ productsUrl, paymentsUrl, notificationsUrl }` selon l’environnement.

---

## ✅ Solutions (suggestions)

### Sol. 1 — Garde `ship`
```js
// ajout dans createOrderFSM()
PAID: {
  ship: { to: 'SHIPPED', guard: ({ address }) => !!address && address.city && address.zip },
  refund: { to: 'REFUNDED' }
}
```

### Sol. 2 — Port notifications + action d’entrée
```js
// ports.js
export const INotifications = { methods: ['notify'] };

// adapters/notifications-http.js
export class HttpNotificationsAdapter {
  constructor(baseUrl) { this.baseUrl = baseUrl; }
  async notify(message) { await fetch(`${this.baseUrl}/notify`, { method:'POST', body: JSON.stringify({ message }) }); return true; }
}

// order-fsm.js (onEnter DELIVERED)
onEnter: {
  DELIVERED: async ({ notifier, log }) => { await notifier.notify('Commande livrée'); log('notifié'); }
}
```

### Sol. 3 — resolveEndpoints
```js
export function resolveEndpoints(env) {
  const c = cfg(env);
  return { productsUrl: c.baseUrl, paymentsUrl: c.payments, notificationsUrl: c.baseUrl + '/notifications' };
}
```

---

## 🧾 Checklist — Chapitre 5
- [ ] Je sais modéliser une **machine d’états** (états, événements, gardes, actions).
- [ ] Je peux **implémenter** une FSM **table-driven** en JS.
- [ ] Je comprends **ports & interfaces** et je sais créer des **adapters**.
- [ ] Je peux dessiner une **vue de déploiement** et **paramétrer** l’environnement.
- [ ] J’évite les **anti-patterns** (états fantômes, couplage fort, config hardcodée).

---

## 🧠 Mini Quiz
1. À quoi sert une **garde** sur une transition ?
2. Différence entre **port fourni** et **port requis** ?
3. Donne un exemple d’**artefact** côté serveur.
4. Pourquoi éviter les **modifications d’état directes** ?

> Réponses attendues : 1) Autoriser/empêcher la transition selon une condition 2) Fourni = exposé par le composant, Requis = dépendance attendue 3) Image Docker, `api.js`, `config.prod.json` 4) Elles contournent les règles/guardes et créent des **états invalides**.

---

## 🗂️ Références internes
- Cf. **Chapitre 2** (Use Cases) pour les **scénarios** qui déclenchent des événements.
- Cf. **Chapitre 3** (Classes) pour **entités/services** liés aux états.
- Cf. **Chapitre 4** (Séquence/Activité) pour **flux** qui traversent les états.
- Cf. **Chapitre 10** (Intégration Front) pour l’assemblage complet en SPA.

---

## 📚 Résumé — Points clés du Chapitre 5
- Les **machines d’états** sécurisent le **cycle de vie** via **transitions** contrôlées.
- Les **composants** structurent l’application avec **ports & interfaces** pour **découpler**.
- La **vue de déploiement** explicite **où** et **comment** tournent les artefacts.
- Le **JavaScript** fournit des patterns simples (table-driven FSM, ports/adapters, config par environnement) pour **coller** à la modélisation UML.
