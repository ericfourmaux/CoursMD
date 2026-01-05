
# 📘 Chapitre 06 — Formulaires & `v-model` (modificateurs, champs custom)

🎯 **Objectifs**
- Comprendre `v-model` et ses **modificateurs** (`.lazy`, `.number`, `.trim`).
- Construire des **champs custom** intégrant `v-model`.
- Valider côté client (sans lib), introduire **vee-validate**/**Vuelidate**.

🧠 **Concepts**
- `v-model` ≈ sugar pour `:modelValue` + `@update:modelValue`.
- **Deux sens contrôlés** : parent **pousse** une valeur, enfant **émet** les updates.

🧪 **Exemple — champ custom**
```vue
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e:'update:modelValue', v:string): void }>()
function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>
<template>
  <input :value="props.modelValue" @input="onInput" />
</template>
```

🛠️ **Validation (JS)**
```js
function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}
function required(s) { return String(s).trim().length > 0 }
```

💡 **Analogie**
- Comme une **prise jack** : le parent fournit le signal (valeur), l’enfant renvoie les **modulations** (events) de manière normalisée.

⚠️ **Pièges**
- **Muter** la prop `modelValue` dans l’enfant → interdit.
- Oublier les **modificateurs** adaptés (`.number` pour nombres).

✅ **Bonnes pratiques**
- Toujours **documenter** la sémantique du `v-model` custom.
- **Dissocier** état input et validation.

🧩 **Exercice**
- Implémentez un `NumberInput` avec `v-model` + validation min/max.

📝 **Résumé essentiel**
- `v-model` synchronise **proprement** parent ↔ enfant ; encapsulez vos champs.


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
