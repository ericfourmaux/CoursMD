
# 📘 Chapitre 15 — Projet Fil Rouge (Capstone)

> 🎯 **Objectif du capstone**
> Construire une **application Kanban complète** (Vue 3 + TypeScript + Pinia + Router + Webpack + Jest + CI + déploiement) avec **drag & drop**, **recherche/filtre**, **persistance**, **tests**, **pipeline CI**, et une **démo publique**.

---

## 🧠 1. Spécification fonctionnelle

### 🔍 Vue d’ensemble
Une application **Kanban** pour gérer des tâches en colonnes: **Backlog**, **En cours**, **Terminé** (colonnes configurables). Chaque **carte** de tâche contient:
- **Titre**, **description** (Markdown basique, optionnel)
- **Échéance** (date), **priorité** (`low` | `medium` | `high`)
- **Labels** (couleur + nom)
- **Assigné** (utilisateur)
- **Checklist** (cases à cocher)
- **Commentaires** (texte + horodatage)

### 🎛️ Fonctionnalités clés
- **Drag & Drop** des cartes entre colonnes (HTML5 DnD)
- **Recherche** et **filtres** (par label, assignee, priorité, date)
- **Tri** par échéance/priorité
- **Persistance** locale (LocalStorage) + option **API mock**
- **Raccourcis clavier**: `N` nouvelle tâche, `/` focus recherche
- **Thème** **light/dark**

### 🧩 Bonus (optionnels)
- **i18n** (fr/en)
- **Import/Export** JSON
- **Pièces jointes** (lien URL)

---

## 🧱 2. Architecture & dossiers

```
kanban/
  src/
    assets/
    components/
      board/
        Column.vue
        TaskCard.vue
      common/
        Button.vue
        Modal.vue
    composables/
      useDragDrop.ts
      usePersist.ts
    routes/
      index.ts
    stores/
      board.ts
      ui.ts
      users.ts
    services/
      storage.ts
      seed.ts
    views/
      BoardView.vue
      TaskView.vue
      SettingsView.vue
    App.vue
    main.ts
  public/
    index.html
  tests/
    unit/
      stores.board.test.ts
      components.TaskCard.test.ts
      views.BoardView.test.ts
  tsconfig.json
  webpack.dev.js
  webpack.prod.js
  jest.config.ts
  .eslintrc.cjs
  .prettierrc
  package.json
  README.md
```

---

## 🧾 3. Modèles de données (TypeScript)

```ts
// src/types.ts
export type Priority = 'low' | 'medium' | 'high';
export type Label = { id: string; name: string; color: string };
export type ChecklistItem = { id: string; text: string; done: boolean };
export type Comment = { id: string; text: string; authorId: string; createdAt: string };
export type User = { id: string; name: string; avatarUrl?: string };
export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO
  priority: Priority;
  labelIds: string[];
  assigneeId?: string;
  checklist: ChecklistItem[];
  comments: Comment[];
};
export type Column = { id: string; name: string; taskIds: string[] };
export type BoardState = { columns: Column[]; tasks: Record<string, Task>; labels: Record<string, Label>; users: Record<string, User> };
```

---

## 🗃️ 4. Pinia — store Kanban

```ts
// src/stores/board.ts
import { defineStore } from 'pinia';
import { nanoid } from 'nanoid';
import type { BoardState, Task, Column, Priority } from '@/types';
import { persist } from '@/services/storage';

const DEFAULT_COLS: Column[] = [
  { id: 'col-backlog', name: 'Backlog', taskIds: [] },
  { id: 'col-progress', name: 'En cours', taskIds: [] },
  { id: 'col-done', name: 'Terminé', taskIds: [] },
];

export const useBoardStore = defineStore('board', {
  state: (): BoardState => ({ columns: DEFAULT_COLS, tasks: {}, labels: {}, users: {} }),
  getters: {
    columnById: (s) => (id: string) => s.columns.find(c => c.id === id),
    taskById: (s) => (id: string) => s.tasks[id],
  },
  actions: {
    seed(data: Partial<BoardState>) { Object.assign(this.$state, data); persist.save(this.$state); },
    addTask(title: string) {
      const id = nanoid();
      this.tasks[id] = { id, title, priority: 'medium', labelIds: [], checklist: [], comments: [] } as Task;
      this.columns[0].taskIds.unshift(id); // Backlog
      persist.save(this.$state);
      return id;
    },
    moveTask(taskId: string, toColumnId: string, toIndex?: number) {
      for (const col of this.columns) {
        const i = col.taskIds.indexOf(taskId);
        if (i !== -1) col.taskIds.splice(i, 1);
      }
      const target = this.columns.find(c => c.id === toColumnId)!;
      const idx = toIndex ?? target.taskIds.length;
      target.taskIds.splice(idx, 0, taskId);
      persist.save(this.$state);
    },
    setPriority(taskId: string, p: Priority) { this.tasks[taskId].priority = p; persist.save(this.$state); },
    setAssignee(taskId: string, userId?: string) { this.tasks[taskId].assigneeId = userId; persist.save(this.$state); },
    addComment(taskId: string, text: string, authorId: string) {
      const c = { id: nanoid(), text, authorId, createdAt: new Date().toISOString() };
      this.tasks[taskId].comments.push(c);
      persist.save(this.$state);
    },
  },
});
```

---

## 💾 5. Persistance (LocalStorage)

```ts
// src/services/storage.ts
const KEY = 'kanban-state-v1';
export const persist = {
  load<T>(): T | null {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  save<T>(state: T) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  },
};
```

---

## 🌱 6. Données de départ (seed)

```ts
// src/services/seed.ts
import type { BoardState } from '@/types';
export const seedData: Partial<BoardState> = {
  labels: {
    'lab-ux': { id: 'lab-ux', name: 'UX', color: '#a855f7' },
    'lab-bug': { id: 'lab-bug', name: 'Bug', color: '#ef4444' },
  },
  users: {
    'u-eric': { id: 'u-eric', name: 'Eric Fourmaux' },
    'u-alice': { id: 'u-alice', name: 'Alice' },
  },
};
```

---

## 🧭 7. Router — vues & navigation

```ts
// src/routes/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
const BoardView = () => import('@/views/BoardView.vue');
const TaskView = () => import('@/views/TaskView.vue');
const SettingsView = () => import('@/views/SettingsView.vue');

export const routes: RouteRecordRaw[] = [
  { name: 'board', path: '/', component: BoardView, meta: { title: 'Kanban' }},
  { name: 'task', path: '/task/:id', component: TaskView, meta: { title: 'Tâche' }},
  { name: 'settings', path: '/settings', component: SettingsView, meta: { title: 'Paramètres' }},
];

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) });
router.afterEach((to) => { if (to.meta?.title) document.title = `${to.meta.title} — Kanban`; });
export default router;
```

---

## 🧩 8. Composants — Column & TaskCard

```vue
<!-- src/components/board/Column.vue -->
<template>
  <section class="column" :aria-label="name" :data-col="id" @dragover.prevent @drop="onDrop">
    <header class="column__header">
      <h3>{{ name }}</h3>
    </header>
    <ul class="column__list" role="list">
      <li v-for="(tid, idx) in taskIds" :key="tid" draggable="true" @dragstart="onDragStart(tid, idx)">
        <TaskCard :task-id="tid" />
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import TaskCard from './TaskCard.vue';
const props = defineProps<{ id: string; name: string; taskIds: string[] }>();
const store = useBoardStore();
function onDragStart(tid: string, fromIndex: number){
  const dt = (event as DragEvent).dataTransfer!; dt.setData('text/taskId', tid); dt.setData('text/fromCol', props.id); dt.setData('text/fromIdx', String(fromIndex));
}
function onDrop(e: DragEvent){
  const tid = e.dataTransfer!.getData('text/taskId');
  const toCol = props.id; store.moveTask(tid, toCol);
}
</script>
<style scoped>
.column{ background:#f6f6f6; padding:.75rem; border-radius:8px; }
.column__list{ list-style:none; padding:0; display:grid; gap:.5rem; }
</style>
```

```vue
<!-- src/components/board/TaskCard.vue -->
<template>
  <article class="card" :class="priorityClass" @click="open">
    <header>
      <h4>{{ task.title }}</h4>
      <span v-if="task.dueDate" class="due">{{ new Date(task.dueDate).toLocaleDateString() }}</span>
    </header>
    <footer>
      <span v-for="lid in task.labelIds" :key="lid" class="label" :style="{ background: labels[lid]?.color }">{{ labels[lid]?.name }}</span>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useBoardStore } from '@/stores/board';
import { useRouter } from 'vue-router';
const props = defineProps<{ taskId: string }>();
const store = useBoardStore();
const router = useRouter();
const task = computed(()=> store.taskById(props.taskId));
const labels = store.labels;
const priorityClass = computed(()=> `p-${task.value.priority}`);
function open(){ router.push({ name:'task', params:{ id: props.taskId } }); }
</script>
<style scoped>
.card{ background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:.5rem; cursor:pointer; }
.card .label{ color:#fff; border-radius:4px; padding:.1rem .35rem; margin-right:.25rem; font-size:.75rem; }
.p-high{ border-left:4px solid #ef4444 }
.p-medium{ border-left:4px solid #f59e0b }
.p-low{ border-left:4px solid #10b981 }
.due{ font-size:.75rem; color:#6b7280 }
</style>
```

---

## 🔎 9. Recherche & filtres

```ts
// src/stores/ui.ts
import { defineStore } from 'pinia';
export const useUiStore = defineStore('ui', {
  state: () => ({ q: '', filterLabelIds: [] as string[], filterAssigneeId: undefined as string | undefined }),
});
```

```vue
<!-- extrait de BoardView.vue -->
<input aria-label="Rechercher" v-model="ui.q" placeholder="Rechercher (/)" @keydown.slash.prevent="focusSearch" />
```

---

## 🧪 10. Tests (Jest + Vue Testing Library)

```ts
// tests/unit/stores.board.test.ts
import { setActivePinia, createPinia } from 'pinia';
import { useBoardStore } from '@/stores/board';

describe('board store', () => {
  beforeEach(()=> setActivePinia(createPinia()));
  it('ajoute et déplace une tâche', () => {
    const s = useBoardStore();
    const id = s.addTask('Écrire README');
    expect(s.columns[0].taskIds).toContain(id);
    s.moveTask(id, 'col-progress');
    expect(s.columns[1].taskIds).toContain(id);
  });
});
```

```ts
// tests/unit/components.TaskCard.test.ts
import { render, screen } from '@testing-library/vue';
import { createPinia } from 'pinia';
import TaskCard from '@/components/board/TaskCard.vue';
import { useBoardStore } from '@/stores/board';

test('affiche titre et labels', async () => {
  const pinia = createPinia();
  render(TaskCard, { global: { plugins: [pinia] }, props: { taskId: 't1' } });
  const s = useBoardStore();
  s.seed({ tasks: { t1: { id:'t1', title:'Demo', priority:'low', labelIds:['lab-ux'], checklist:[], comments:[] } }, labels:{ 'lab-ux': { id:'lab-ux', name:'UX', color:'#a855f7' } } });
  expect(await screen.findByText(/Demo/)).toBeInTheDocument();
  expect(screen.getByText(/UX/)).toBeInTheDocument();
});
```

---

## 🧰 11. CI (GitHub Actions) & Déploiement

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage }
  deploy:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci && npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🧑‍💻 12. Scripts npm & Tooling

```json
{
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js",
    "lint": "eslint \"src/**/*.{ts,vue}\"",
    "format": "prettier --write \"src/**/*.{ts,vue,css,md}\"",
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

---

## ♿ 13. Accessibilité & UX

- **A11y**: rôles `list`/`listitem`, focus visible, labels pour boutons, **skip‑link** vers `<main>`.
- **DnD**: fournir **alternatives** clavier (boutons *Déplacer vers…*) pour accessibilité.
- **Couleurs**: vérifier **contraste** (WCAG AA), thème dark.

---

## 🚀 14. Performance & Qualité

- **Lazy‑loading** des vues (`import()`)
- **SplitChunks** & `runtimeChunk`
- **Images** optimisées, fonts `font-display: swap`
- **Lighthouse** ≥ 90 (Perf/A11y/Best Practices/SEO)

---

## 🌍 15. i18n (bonus)

- Fichier `i18n.ts` + messages `fr`/`en`
- Composant `LanguageSwitcher`

---

## 📄 16. README — structure conseillée

- **Titre & badges** (CI, déploiement)
- **Description** du projet & capture d’écran
- **Stack**: Vue 3, TS, Pinia, Router, Webpack, Jest
- **Getting started** (dev/build/test)
- **Architecture** & conventions
- **Déploiement** (lien live)
- **Licence**

---

## 🛣️ 17. Roadmap & jalons

1. **Jour 1–2**: setup (stack, tooling, seed, store, routes)
2. **Jour 3–4**: UI Board + DnD + persistance
3. **Jour 5**: Recherche/filtre + TaskView
4. **Jour 6**: Tests unitaires + couverture ≥ 80%
5. **Jour 7**: CI + déploiement + README final

---

## 🧪 18. Exercices guidés

1. **DnD**: Ajoutez le *drop index* pour insérer en position précise.
2. **Filtre**: Filtre combiné (label + assignee + priorité).
3. **Checklist**: Comptage d’avancement (barre de progression). 
4. **Commentaires**: Ajoutez suppression/édition et tests.
5. **Export/Import**: JSON du board; vérifiez la validation.
6. **Shortcut**: `N` nouvelle tâche focuse le titre (accessibilité).

---

## ✅ 19. Check‑list finale du capstone

- [ ] Démo publique déployée (GH Pages/Netlify/Vercel)
- [ ] CI verte (lint/build/tests)
- [ ] Couverture **≥ 80%**
- [ ] Lighthouse **≥ 90** sur *Perf/A11y/Best Practices/SEO*
- [ ] README complet + badges + capture
- [ ] Code **typé** strict (TS), stores isolés, composants modulaires
- [ ] Accessibilité clavier + focus + contrastes

---

## 📦 Livrables

- **Repo GitHub public** (code + README + CI)
- **Démo déployée** (URL)
- **CHANGELOG** (option), **tags** release v1.0.0

---

## 🔚 Résumé essentiel du Chapitre 15
- Tu as consolidé l’ensemble du parcours en réalisant une **application Kanban** complète, testée, déployée et documentée.
- L’architecture **Vue 3 + TS + Pinia + Router** avec un pipeline **Webpack + Jest + CI** est **professionnelle** et **réutilisable**.
- Le **livrable** est **portfolio‑ready** et démontre tes compétences front **de A à Z**.

