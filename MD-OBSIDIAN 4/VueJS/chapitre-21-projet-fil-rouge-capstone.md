
# 📘 Chapitre 21 — Projet fil rouge (capstone)

🎯 **Objectifs**
- Assembler **toutes les briques** : Router, Pinia, composables, tests, i18n, perf, déploiement.

🧱 **Brief** — Planificateur de tâches collaboratif
- Auth (mock), CRUD tâches, labels, filtres, drag & drop, vue Kanban, commentaires.
- i18n (fr/en), dark mode, notifications, tests, CI/CD, déploiement.

🧭 **Architecture**
```
src/
├─ router/        # pages : /login, /board, /settings
├─ stores/        # auth, tasks, ui
├─ composables/   # useApi, useTasks, useTheme
├─ components/    # TaskCard, KanbanColumn, Modal
└─ pages/         # Login.vue, Board.vue, Settings.vue
```

🛠️ **Étapes**
1. Initialisation (Vite, TS, alias, ESLint/Prettier).
2. Router + pages + guards.
3. Pinia (auth, tasks).
4. Composables (API, cache simple, retry).
5. UI (composants accessibles, transitions). 
6. Tests (unitaires + E2E).
7. i18n + dark mode.
8. CI/CD + déploiement.

📊 **Performance**
- Splitting par page ; skeletons ; profiling ; éviter recomputes massifs.

🧪🧰 **Qualité**
- Coverage minimale ; tests critiques sur formulaires et drag & drop.

🧩 **Exercice**
- Implémentez le board Kanban avec drag & drop et persistance locale.

📝 **Résumé essentiel**
- Le projet fil rouge consolide **toutes les compétences Vue** dans un cas réaliste.


## 🧭 Légende des icônes
- 📘 **Chapitre**
- 🎯 **Objectifs**
- 🧠 **Concept clé**
- 🔍 **Pourquoi ?**
- 🧪 **Exemple**
- 💡 **Analogie**
- ⚠️ **Pièges**
- ✅ **Bonnes pratiques**
- 🛠️ **Mise en pratique**
- 🧩 **Exercice**
- 📝 **Récap**
- 🔗 **Ressources**
- 🧰 **Outils**
- 🔒 **Sécurité**
- 🚀 **Déploiement**
- 🧪🧰 **Tests & Qualité**
- 🌐 **i18n**
- 🧭 **Architecture**
- ⚙️ **Tooling**
- 📊 **Performance**
- 🧱 **Interop**
