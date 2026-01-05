# 🔄 Chapitre 4 — Sequence & Activity Diagrams

> **Objectif** : savoir modéliser les **interactions temporelles** (Sequence) et les **flux de contrôle** (Activity), comprendre **quand** utiliser l’un ou l’autre, et relier ces modèles à du **JavaScript** (sync/async, promises, `async/await`, événements). Inclus : **schémas ASCII**, **formules en JS**, **exercices**, **solutions**, **quiz** et **checklist**.

---

## 🎯 Objectifs d’apprentissage
- Définir précisément les **diagrammes de séquence** et d’**activité**.
- Maîtriser **lifelines**, **messages synchro/asynchro**, **retours**, **fragments** (`alt`, `opt`, `loop`).
- Maîtriser **actions**, **décisions**, **fork/join**, **swimlanes** en Activity.
- Mapper les diagrammes vers du **code JavaScript** (fonctions, promesses, événements).
- Éviter les **anti-patterns** (séquences géantes, activités confuses).

---

## 🔑 Définitions & Positionnement

### Diagramme de **séquence**
Représente **l’ordre temporel** des **messages** échangés entre **instances** (objets, composants). Montre **qui parle à qui**, **quand**, et **dans quel ordre**.

**Éléments clés** :
- **Lifeline** : ligne de vie verticale d’un participant.
- **Message** : flèche horizontale (sync = **appel**, async = **événement** / **promesse**).
- **Retour** : flèche pointillée vers l’expéditeur.
- **Fragments** : blocs `alt` (alternatives), `opt` (optionnel), `loop` (répétition).

### Diagramme d’**activité**
Décrit un **flux de contrôle** (processus), avec des **actions**, **décisions**, **branches**, **parallélismes** (fork/join), **swimlanes** pour responsabilités.

**Éléments clés** :
- **Action** : étape de traitement.
- **Décision/Merge** : choix (`if/else`) et réunion de flux.
- **Fork/Join** : exécutions **parallèles** et synchronisation.
- **Start/End** : début/fin du flux.
- **Swimlanes** : **couloirs** par rôle/responsabilité.

---

## 💬 Pourquoi ces diagrammes ?
- **Séquence** : clarifie les **interactions** inter-objets (idéal pour une **API** ou un **workflow** front). Révèle **couplage** et **ordonnancement**.
- **Activité** : clarifie la **logique procédurale** (process métiers, **conditions**, **boucles** et **parallèles**).

---

## 🧩 Notation ASCII — Séquence

> Convention : lifelines en colonnes verticales (`|`), messages par `-->`, retours par `--..>`, fragments encadrés par `+-----+`.

### Séquence e-commerce (validation → paiement → notification)
```
Participants: Client | UI | Panier | Paiement | Notif

Client       |   UI           |    Panier       |    Paiement     |    Notif
-----------------------------------------------------------------------------
   click "Valider" -->
               --> validerPanier() ------------------------------------------>
               <-- --.. ok --------------------------------------------------

+-------------------- alt (total > 0 ?) --------------------+
| if total == 0                                           |
|   UI --> afficherMessage("Panier vide")                 |
| else                                                    |
|   UI --> payer(total) ---------------------------------> | Paiement
|                               <-- --.. resultat ---------|
|   +---------- alt (paiement ok ?) ----------+            |
|   | if ok                                   |            |
|   |   UI --> notifierClient ------------------------------> Notif
|   |       <-- --.. reçu                                       |
|   | else                                 |            |
|   |   UI --> afficherMessage("Refus")   |            |
|   +--------------------------------------+            |
+-------------------------------------------------------+

```

**Lecture** : le client déclenche la validation; si `total > 0`, tentative de paiement; selon le résultat, notification ou message d’erreur.

---

## 🧩 Notation ASCII — Activité

> Convention : actions `[Action]`, décisions `◇ condition ?`, forks `====` (séparer branches), joins `====` (réunir), swimlanes en colonnes.

### Activité e-commerce (checkout)
```
Swimlanes:  [Client]    |     [Front/UI]       |      [Services]
-----------------------------------------------------------------------
             ◇ Panier vide ?
             |-- yes --> [Afficher message] --> (Fin)
             |-- no  --> [Valider panier]
                               |
                               v
                      ◇ Code promo saisi ?
                      |-- no  --> [Calculer total]
                      |-- yes --> [Appliquer promo] -> [Calculer total]
                               |
                               v
                      [Init paiement]
                               |
                               v
                      ◇ Paiement accepté ?
                      |-- yes --> [Notifier client] --> (Fin)
                      |-- no  --> [Afficher refus] --> [Proposer réessai] --> (Fin)
```

**Lecture** : des **conditions** guident le flux; calcul, paiement, puis finale selon succès/échec.

---

## 🔧 Mapping vers JavaScript

### Synchro vs Asynchro
- **Message synchrone** : **appel de fonction** classique; la suite **attend** la fin.
- **Message asynchrone** : **promesse/événement**; la suite peut **continuer**, et une **callback**/`await` gère le résultat.

### Exemples JS (fil rouge)
```js
// sync: recalcul de total
function recalculerTotal(panier) {
  return panier.total(); // blocant à l'échelle du code, simple calcul
}

// async: paiement simulé (Promise)
function payerAsync(total) {
  return new Promise(resolve => {
    setTimeout(() => {
      const ok = total <= 100; // simple règle
      resolve({ ok, txId: ok ? 'tx_' + Date.now() : null });
    }, 200); // latence simulée
  });
}

// async/await: orchestration séquentielle
async function checkoutSequence(panier, notifier) {
  const total = recalculerTotal(panier);
  if (total === 0) return { ok: false, reason: 'EMPTY' };
  const r = await payerAsync(total); // message asynchrone
  if (r.ok) {
    await notifier('Paiement accepté, tx=' + r.txId);
    return { ok: true, txId: r.txId };
  }
  return { ok: false, reason: 'DECLINED' };
}

// events: simple EventEmitter-like (minimal)
function createEmitter() {
  const handlers = {};
  return {
    on(evt, fn) { (handlers[evt] ||= []).push(fn); },
    emit(evt, data) { (handlers[evt]||[]).forEach(fn => fn(data)); },
  };
}

// usage événementiel
const bus = createEmitter();
bus.on('paiement-ok', (tx) => console.log('Notif OK:', tx));

async function payerEtNotifier(total) {
  const r = await payerAsync(total);
  if (r.ok) bus.emit('paiement-ok', r.txId);
  return r;
}
```

### Fragments (alt/opt/loop) → `if`/`else`/répétitions
```js
async function payerAvecRetry(total, maxRetry = 2) {
  for (let i = 0; i <= maxRetry; i++) {
    const r = await payerAsync(total);
    if (r.ok) return { ok: true, txId: r.txId, retryCount: i };
    // loop fragment: réessayer
  }
  return { ok: false };
}

function appliquerPromoOpt(total, code) {
  // opt: appliquer seulement si code présent
  if (!code) return total;
  return code === 'WELCOME10' ? +(total * 0.9).toFixed(2) : total;
}
```

---

## 🧮 Formules & estimations en JavaScript

### 1) **Temps de réponse** d’une séquence (séquentiel)
Si les étapes **bloquantes** ont des durées `d1, d2, ..., dn`, alors :
```js
function sumSequential(...durations) { return durations.reduce((s, d) => s + d, 0); }
console.log(sumSequential(50, 200, 30)); // 280 ms
```

### 2) **Temps de réponse** avec **parallélisme** (fork/join)
Durée = **max** des branches parallèles (puis **join**).
```js
function parallelTime(...branchDurations) { return Math.max(...branchDurations); }
console.log(parallelTime(120, 80, 200)); // 200 ms
```

### 3) **Durée attendue** avec **probabilités** (activité)
Si une décision a `p` de succès (durée `ds`) et `1-p` d’échec (durée `df`) :
```js
function expectedDuration(p, ds, df) { return p * ds + (1 - p) * df; }
console.log(expectedDuration(0.7, 300, 500)); // 360 ms
```

### 4) **Nombre de chemins** approximatif (activité)
Si `S` étapes et `A` alternatives moyennes par étape :
```js
function approxPaths(S, A) { return S * (1 + A); }
console.log(approxPaths(6, 1)); // 12
```

---

## 🧭 Choisir entre Séquence et Activité
- **Séquence** si l’intérêt est **qui parle à qui** et **dans quel ordre**.
- **Activité** si l’intérêt est **le processus** et les **conditions**.
- Les deux se **complètent** : un **Use Case** (Ch.2) ⇒ **Séquence** pour interactions **micro** et **Activité** pour logique **macro**.

---

## 🚫 Anti-patterns
- **Séquences gigantesques** (difficiles à lire) : scinder par **Use Case**.
- **Messages bavards** qui mélangent **UI** et **métier** : séparer responsabilités.
- **Activités sans décisions** (ligne droite) ou avec **trop** de branches : viser **clarité**.
- **Parallélisme inutile** qui complique la **synchro**.

---

## ✍️ Atelier guidé

### 1) Séquence — ASCII de paiement avec promo optionnelle
```
UI | Panier | Promo | Paiement | Notif
--------------------------------------
UI --> total() -----------------> Panier
<-- --.. 42 --------------------
+------ opt (code promo?) ------+
| UI --> apply(code, 42) -----> Promo
| <-- --.. 37.8 ---------------
+------------------------------+
UI --> payer(37.8) -------------------> Paiement
<-- --.. ok, tx=tx_123 -----------------
UI --> notifier(tx_123) ------------------------------> Notif
<-- --.. reçu ----------------------------------------
```

### 2) Activité — ASCII du checkout avec réessai
```
[Start] -> [Valider panier] -> ◇ Total > 0 ?
   |-- no --> [Message: vide] -> (End)
   |-- yes -> [Init paiement] -> [Tentative]
                ◇ OK ?
                |-- yes --> [Notifier] -> (End)
                |-- no  --> [Proposer réessai] -> [Tentative] (loop max 2)
```

---

## 🛠️ Exercices

### Exercice 1 — Séquence ASCII
Dessine un diagramme de séquence pour **« Ajouter au panier »** avec `alt` (produit indisponible) et `opt` (code promo à la fin de la journée).

### Exercice 2 — Activité ASCII
Dessine un diagramme d’activité pour **« Inscription »** avec décision **email déjà utilisé** et **fork/join** pour **envoi email** + **log analytics** en parallèle.

### Exercice 3 — JavaScript
Implémente `async function processusInscription(user)` qui **valide** les champs (sync), **vérifie** l’email (async), **envoie** l’email (async) et **log** (async), avec **fork/join** (exécuter en parallèle, attendre la fin).

---

## ✅ Solutions (suggestions)

### Solution 3 — JS (fork/join avec Promise.all)
```js
function validateSync(user) {
  if (!user.email || !user.password) throw new Error('Champs manquants');
}

function checkEmailAsync(email) {
  return new Promise(res => setTimeout(() => res(email !== 'used@example.com'), 100));
}

function sendWelcomeAsync(email) {
  return new Promise(res => setTimeout(() => res(true), 150));
}

function logAnalyticsAsync(event) {
  return new Promise(res => setTimeout(() => res(true), 120));
}

async function processusInscription(user) {
  validateSync(user); // action sync
  const ok = await checkEmailAsync(user.email); // décision async
  if (!ok) return { ok: false, reason: 'EMAIL_USED' };
  // fork: envoyer email + log en parallèle
  const [sent, logged] = await Promise.all([
    sendWelcomeAsync(user.email),
    logAnalyticsAsync('signup')
  ]);
  return { ok: sent && logged };
}
```

---

## 🧾 Checklist — Chapitre 4
- [ ] Je distingue **Séquence** (interactions) et **Activité** (processus).
- [ ] Je sais dessiner des **lifelines**, **messages**, **alt/opt/loop**.
- [ ] Je sais modéliser **décisions**, **fork/join**, **swimlanes**.
- [ ] Je mappe vers **JS** (`async/await`, `Promise.all`, événements).
- [ ] Je sais estimer des **temps** et des **chemins** en JS.

---

## 🧠 Mini Quiz
1. Quand préférer un **diagramme de séquence** à un **diagramme d’activité** ?
2. À quoi sert un **fragment `alt`** ?
3. Comment représenter un **fork/join** en JS ?
4. Différence entre **message synchrone** et **asynchrone** ?

> Réponses attendues : 1) Pour mettre en évidence l’ordre des **interactions** 2) Alternatives conditionnelles 3) `Promise.all([...])` 4) Synchrone = bloque l’exécution, Asynchrone = poursuit et reprend via promesse/callback.

---

## 🗂️ Références internes
- Cf. **Chapitre 2** (Use Case) pour les scénarios métiers.
- Cf. **Chapitre 3** (Classes) pour les participants/lifelines.
- Cf. **Chapitre 5** (États/Composants) pour approfondir **machines d’états** & **architecture**.

---

## 📚 Résumé — Points clés du Chapitre 4
- **Séquence** : interactions **dans le temps** (lifelines, messages, fragments).
- **Activité** : **processus** avec **décisions** et **parallélisme**.
- **JavaScript** : `async/await`, `Promise.all`, **bus d’événements** pour coller aux modèles.
- **Formules JS** : somme séquentielle, max parallèle, durée attendue, chemins approximés.
