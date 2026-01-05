# 📚 Appendice — Glossaire, Cheatsheets, Templates & Guides

> **But** : fournir un **référentiel rapide** pour tout le cursus : **glossaire UML**, **cheatsheets JS/Patterns**, **gabarits** (Use Case, Séquence, Activité, Classe, Tests Jest), **guides de refactoring**, **formules & métriques**, et **index des chapitres**.

---

## 🧾 Glossaire UML (résumé pratique)

### Acteur
Entité **externe** (humain/système) qui **interagit** avec le système.

### Cas d’utilisation (Use Case)
Scénario d’**interaction** qui produit une **valeur** pour un acteur. Relations : `include` (obligatoire, réutilisation), `extend` (optionnel, conditionnel), `generalization` (spécialisation).

### Frontière du système
Cadre qui **délimite** ce qui appartient au système vs l’extérieur.

### Diagramme de classes
Représente **structure** (attributs) et **comportements** (opérations). Relations : **association**, **agrégation** (losange vide), **composition** (losange plein), **dépendance**, **généralisation**, **réalisation** (interface).

### Multiplicités
`1`, `0..1`, `1..*`, `0..*`, `m..n` (cardinalités aux extrémités d’associations).

### Diagramme de séquence
Montre **participants (lifelines)**, **messages** (sync/async), **retours** (pointillés), **fragments** `alt`/`opt`/`loop`.

### Diagramme d’activité
Décrit **flux de contrôle** : **actions**, **décisions/merge**, **fork/join** (parallèle), **swimlanes** (couloirs par rôle).

### Diagramme d’états
Machine d’états : **états**, **événements**, **transitions**, **gardes** et **actions d’entrée/sortie**.

### Composants & Déploiement
**Composant** (ports fournis/requis, interfaces), **nœud** (environnement), **artefact** (fichier déployé), **communication** (HTTP, WS).

> Voir : [[Chapitre 2 - Use Cases]], [[Chapitre 3 - Diagrammes]], [[Chapitre 4 - Sequence Activity]], [[Chapitre 5 - State Component Deployment]].

---

## 🧩 Cheatsheets — Principes & Patterns

### SOLID (résumé)
- **SRP** : une **responsabilité** unique par classe/module.
- **OCP** : **ouvert** à l’extension, **fermé** à la modification (utiliser **polymorphisme**).
- **LSP** : sous-types **substituables** sans briser le contrat.
- **ISP** : **segmenter** les interfaces (éviter les interfaces géantes).
- **DIP** : dépendre d’**abstractions** (ports), pas d’implémentations.

### GRASP (exemples)
Information **Expert**, **Creator**, **Controller**, **Low Coupling**, **High Cohesion**, **Polymorphism**, **Pure Fabrication**, **Indirection**, **Protected Variations**.

### GoF — Créationnels
**Singleton**, **Factory Method**, **Abstract Factory**, **Builder**, **Prototype**.

### GoF — Structurels
**Adapter**, **Bridge**, **Composite**, **Decorator**, **Facade**, **Flyweight**, **Proxy**.

### GoF — Comportementaux
**Observer**, **Strategy**, **State**, **Command**, **Template Method**, **Chain of Responsibility**, **Mediator**, **Memento**, **Iterator**, **Visitor**.

> Voir : [[Chapitre 6 - SOLID - GRASP]], [[Chapitre 7 - Patterns Creationnels]], [[Chapitre 8 - Patterns Structurels]], [[Chapitre 9 - Patterns Comportementaux]].

---

## 🔠 Cheatsheet ASCII — Notation rapide

```text
Acteur:            [Client]
Use Case:          [UC: Nom]
Include:           [UC A] --include--> [UC B]
Extend:            [UC A] --extend--> [UC B] (condition)
Classe:            +--------------+\n                   | NomClasse    |\n                   +--------------+\n                   | + pub: T     |\n                   | - priv: T    |\n                   +--------------+\nAssociation:       [A] ---- [B]
Agrégation:        [A] o---- [B]
Composition:       [A] ■---- [B]
Généralisation:    [Parent] --|> [Enfant]
Interface:         <<interface>> NomInterface
Séquence lifelines: colonnes verticales `|` ; messages `-->` ; retours `--..>`
Activité:          [Action] ; Décision `◇` ; Fork/Join `====` ; Swimlanes en colonnes
États:             [STATE_A] --event--> [STATE_B]
Composants:        Ports fournis/requis + interfaces; adapters vers API
Déploiement:       [Browser] <--> [API Node] <--> [DB]
```

---

## 🧱 Templates — Gabarits prêts à l’emploi

### 1) Use Case (texte)
```text
Titre: <Verbe + complément>
Acteur principal: <Nom>
Préconditions (Given):
  - ...
Déclencheur (When):
  - ...
Postconditions (Then):
  - ...
Variantes/Exceptions:
  - ... -> ...
```

### 2) Séquence (ASCII)
```text
Participants: A | B | C
A --> action() ----------------------------------------------> B
<-- --.. retour ---------------------------------------------
+------ alt (condition ?) ------------------------------------+
| if ...  A --> ...                                          |
| else     A --> ...                                         |
+------------------------------------------------------------+
```

### 3) Activité (ASCII)
```text
Swimlanes: [Rôle1] | [Rôle2]
[Start] -> [Action 1] -> ◇ Condition ?
  |-- yes --> [Action 2] -> (End)
  |-- no  --> [Action 3] -> (End)
```

### 4) Classe (ASCII)
```text
+---------------------+
| NomDeClasse         |
+---------------------+
| - attributPrivé: T  |
| + attributPublic: T |
+---------------------+
| + operation(p: T): R|
+---------------------+
```

### 5) Composant (ASCII)
```text
+-----------------------------+
| Composant X                 |
| [Ports fournis]             |
|   - PortA (IFournie)        |
| [Ports requis]              |
|   - PortB (IRequise)        |
+-----------------------------+
```

### 6) Tests Jest — gabarit
```js
describe('Module X', () => {
  beforeEach(() => { /* init */ });
  afterEach(() => { /* cleanup */ });

  test('should do Y', () => {
    expect(true).toBe(true);
  });

  test('async works', async () => {
    const r = await Promise.resolve(42);
    expect(r).toBe(42);
  });
});
```

---

## 🧭 Guides de refactoring (pas-à-pas)

### Guide 1 — Remplacer `if/switch` par **Strategy**
1. **Identifier** les variantes d’algorithme.
2. Créer **stratégies** (`class` ou objets) avec `calc(...)`.
3. Injecter la stratégie dans le **client**.
4. Écrire des **tests** par stratégie.

### Guide 2 — Séparer **UI ↔ HTTP** par **Ports/Adapters** + **Facade**
1. Définir **contrats** `IProducts`, `IPayment`, `INotify`.
2. Implémenter **adapters** HTTP.
3. Orchestrer via **Facade** côté front.
4. Tester avec **mocks** (Chap. 11).

### Guide 3 — Introduire une **FSM**
1. Lister **états** + **transitions** + **gardes**.
2. Implémenter FSM **table-driven**.
3. **Refuser** transitions invalides (exceptions).
4. Tester transitions **positives** et **bloquées**.

### Guide 4 — Réduire couplage par **Mediator**
1. Centraliser **interactions** (UI, Cart, Payment, Notifier).
2. Déplacer **orchestration** dans le médiateur.
3. Mesurer **interactions** avant/après.

---

## 📐 Formules & métriques (rappel)

### Séquence/Parallèle
```js
function sumSequential(...ms){ return ms.reduce((s,d)=>s+d,0); }
function parallelTime(...branches){ return Math.max(...branches); }
```

### Cache (hit rate)
```js
function cacheHitRate(total, hits){ return total>0 ? +(hits/total*100).toFixed(2) : 0; }
```

### Couplage simplifié
```js
function estimateCoupling(js){ const imports=(js.match(/\bimport\b|require\(/g)||[]).length; const http=(js.match(/fetch\(/g)||[]).length; return { imports, http, score: imports+http }; }
```

### Cohésion approximative (LCOM)
```js
function approxLCOM(methodFields){
  const methods = Object.keys(methodFields);
  let shared=0, totalPairs=0;
  for(let i=0;i<methods.length;i++){
    for(let j=i+1;j<methods.length;j++){
      totalPairs++;
      const a = methodFields[methods[i]], b = methodFields[methods[j]];
      const inter = [...a].filter(x=>b.has(x)).length;
      if(inter>0) shared++;
    }
  }
  const LCOM = totalPairs - shared;
  return { totalPairs, sharedPairs: shared, LCOM };
}
```

### Couverture minimale (Use Cases)
```js
function minTestCount(alternatives){ return 1 + (alternatives|0); }
```

---

## 🔗 Index des chapitres (liens Obsidian)

- [[Chapitre 1 - Introduction UML]]
- [[Chapitre 2 - Use Cases]]
- [[Chapitre 3 - Diagrammes]]
- [[Chapitre 4 - Sequence Activity]]
- [[Chapitre 5 - State Component Deployment]]
- [[Chapitre 6 - SOLID - GRASP]]
- [[Chapitre 7 - Patterns Creationnels]]
- [[Chapitre 8 - Patterns Structurels]]
- [[Chapitre 9 - Patterns Comportementaux]]
- [[Chapitre 10 - Integration UML]]
- [[Chapitre 11 - Tests Qualite]]
- [[Chapitre 12 - Choisir Pattern AntiPatterns]]
- [[Chapitre 13 - Projet Fil Rouge]]

---

## ✅ Utilisation
Ajoute ce fichier **Appendice** dans ton **vault Obsidian** pour disposer d’un **aide‑mémoire** central, avec **gabarits**, **formules**, **rappels** et **liens** vers les chapitres.
