# 📘 UML & Design Patterns — Index (Syllabus)

> **Parcours complet pour débutant**, avec exemples JavaScript et schémas ASCII. Chaque chapitre est livré en fichier `.md` prêt pour **Obsidian**.

## 🧭 Vue d’ensemble du parcours
- **Module A — UML Fondations** (Ch. 1–5)
- **Module B — Principes de Conception (SOLID/GRASP)** (Ch. 6)
- **Module C — GoF Design Patterns** (Ch. 7–9)
- **Module D — Intégration & Cas réels en JS/Front** (Ch. 10)
- **Module E — Tests, Qualité & Documentation-as-Code** (Ch. 11)
- **Module F — Sélection, Anti-patterns & Bonnes pratiques** (Ch. 12)
- **🎓 Projet fil rouge + Annexes & Cheatsheets** (Ch. 13–14)

---

## 📒 Table des chapitres

1. [📗 Chapitre 1 — Introduction à UML](./Chapitre_01_Introduction_UML.md)
2. 📄 Chapitre 2 — Use Case (Cas d’utilisation)
3. 🏗️ Chapitre 3 — Diagrammes de classes
4. 🔄 Chapitre 4 — Sequence & Activity
5. 🧩 Chapitre 5 — State, Component & Deployment
6. 🧠 Chapitre 6 — Principes de Conception (SOLID & GRASP)
7. 🛠️ Chapitre 7 — Patterns Créationnels
8. 🧱 Chapitre 8 — Patterns Structurels
9. 🤝 Chapitre 9 — Patterns Comportementaux
10. 🧩 Chapitre 10 — Intégration UML ↔ JS Front (SPA)
11. 🧪 Chapitre 11 — Tests & Qualité (Jest)
12. 🧭 Chapitre 12 — Choisir un Pattern & Anti-patterns
13. 🎓 Chapitre 13 — Projet Fil Rouge (E-commerce)
14. 📚 Chapitre 14 — Annexes & Références

> Les chapitres 2–14 seront fournis au fur et à mesure de ta validation.

---

## 🎯 Objectifs généraux du cours
- **Comprendre UML** comme langage de modélisation standard (structurer, communiquer, documenter).
- **Relier UML au code JavaScript**, en évitant l’ambiguïté.
- **Appliquer les Design Patterns** pour produire du code maintenable, testable et extensible.
- **Savoir choisir** les bons diagrammes/patterns au bon moment.
- **Documenter dans Obsidian**, avec schémas ASCII et snippets JS cohérents.

---

## 🗺️ Résumé des points essentiels — par chapitre

### 1) 📗 Introduction à UML
- UML = **langage de modélisation** (pas d’exécution). Sert à **décrire** structure & comportement.
- Deux familles de diagrammes : **structuraux** (ex. classes, composants) vs **comportementaux** (ex. use case, séquence, activité, état).
- **Pourquoi UML** : clarifier, communiquer, réduire ambiguïtés, documenter, faciliter tests & refactoring.
- Notions clés : **acteurs**, **cas d’utilisation**, **relations** (aperçu), **multiplicités** (aperçu).
- Schémas ASCII simples + JS pour illustrer le lien modèle ↔ code.

### 2) 🧱 Use Case (Cas d’utilisation)
- Définir **frontière du système**, **acteurs** et **scénarios**.
- Relations **include/extend** pour factoriser variantes.
- **Format narratif** (Given/When/Then) pour garder la valeur métier.
- Éviter détails techniques; viser la **valeur utilisateur**.

### 3) 🏗️ Diagrammes de classes
- Maîtriser **classes, attributs, opérations, visibilité**.
- Relations : **association, agrégation, composition, héritage, dépendance**.
- **Multiplicités** (ex. `1..*`) et rôles.
- Cartographier **interfaces** et **types** en JS (objets, modules, prototypes).

### 4) 🔄 Sequence & Activity
- **Séquence** : interactions temporelles, messages sync/async, alternatives.
- **Activité** : flux de contrôle, décisions, forks/joins.
- Mappage aux **promises** et `async/await` en JS.

### 5) 🧩 State, Component & Deployment
- **State Machine** : états, transitions, événements, gardes.
- **Composants** : ports, interfaces, dépendances.
- **Déploiement** : nœuds (client/serveur), artefacts.

### 6) 🧠 Principes (SOLID & GRASP)
- **SOLID** : SRP, OCP, LSP, ISP, DIP.
- **GRASP** : Controller, Creator, Low Coupling, High Cohesion, Polymorphism, Pure Fabrication, Indirection, Protected Variations.
- Correspondance **principes ↔ patterns**.

### 7) 🛠️ Patterns Créationnels
- **Singleton, Factory Method, Abstract Factory, Builder, Prototype**.
- Contrôler l’instanciation, découpler des classes concrètes.

### 8) 🧱 Patterns Structurels
- **Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy**.
- Compatibilité, extension sans modification, réduction mémoire.

### 9) 🤝 Patterns Comportementaux
- **Observer, Strategy, State, Command, Template Method, Chain of Responsibility, Mediator, Memento, Iterator, Visitor**.
- Séparer décisions, orchestration, notification.

### 10) 🧩 UML ↔ JS Front (SPA)
- Du diagramme aux **modules JS**.
- Gestion d’état et flux asynchrones.

### 11) 🧪 Tests & Qualité (Jest)
- Tests unitaires orientés **responsabilités**.
- Mocks/stubs/spies; TDD léger; couverture.

### 12) 🧭 Choix & Anti-patterns
- Éviter **sur-ingénierie**; reconnaître **smells**.
- Arbre de décision **problème → pattern**.

### 13) 🎓 Projet Fil Rouge
- E-commerce modulaire: catalogue, panier, paiement, notifications.
- Documentation & tests.

### 14) 📚 Annexes & Références
- Cheatsheets UML/patterns.
- Outils et templates Obsidian.

---

## 🔗 Conventions du cours
- **Icônes** : 📗 chapitre, 💡 analogie, 🛠️ exercice, ✅ solution, 🔑 notion clé, 🎯 objectifs, 🧩 schéma, 🧠 principe.
- **Code** : **JavaScript uniquement** (ES modules ou Node-like), avec commentaires riches.
- **Schémas** : **ASCII** pour compatibilité universelle.
- **Liens** : relatifs entre fichiers `.md`.
