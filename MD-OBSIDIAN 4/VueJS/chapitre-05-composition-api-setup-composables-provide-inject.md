
# 📘 Chapitre 05 — Composition API (setup, composables, provide/inject)

🎯 **Objectifs**
- Organiser la logique dans des **composables** (`useX`).
- Utiliser les **hooks** de cycle (`onMounted`, `onUnmounted`).
- Partager des valeurs via **provide/inject**.

🧠 **Concepts**
- `<script setup>` exécute **une fois** par instance pour déclarer l’état/les effets.
- **Composables** : fonctions réutilisables retournant **état**, **actions**, **computed**.
- **provide/inject** : DI simple pour **thème**, **config**, **store local**.

🧪 **Exemple — useCounter**
```ts
import { ref, computed } from 'vue'
export function useCounter(initial = 0) {
  const n = ref(initial)
  const isEven = computed(() => n.value % 2 === 0)
  const inc = (step = 1) => (n.value += step)
  const dec = (step = 1) => (n.value -= step)
  return { n, isEven, inc, dec }
}
```

🧪 **Exemple — provide/inject (thème)**
```ts
// provider
import { provide } from 'vue'
provide('theme', 'dark')

// receiver
import { inject } from 'vue'
const theme = inject('theme', 'light')
```

💡 **Analogie**
- Les composables sont des **modules de logique** que l’on **branche** sur les composants.

⚠️ **Pièges**
- Effets non nettoyés → **fuites mémoire** (utiliser `onUnmounted`).

✅ **Bonnes pratiques**
- Préfixer par `use` ; retourner des **refs/computed/actions** nommés clairement.

🧩 **Exercice**
- Écrivez `useFetch(url)` avec état `loading/error/data` et annulation.

📝 **Résumé essentiel**
- La Composition API **structure** la logique et **facilite** la réutilisation.


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
