---
title: Chapitre 03 — Composants & SFC (.vue)
tags: [Vue.js, Vue 3, Formation, Débutant]
---


# 📘 Chapitre 03 — Composants & SFC (`.vue`)

🎯 **Objectifs**
- Comprendre la structure **Single File Component** : `<template>`, `<script>`, `<style>`.
- Maîtriser **props**, **emits**, **slots**, et `<script setup>`.

🧠 **Concepts**
- **Props** : entrée **immuable** vers un composant.
- **Emits** : événements **sortants** (ex. `update:modelValue`).
- **Slots** : zones de contenu **injecté** par le parent.
- **`<script setup>`** : syntaxe compacte pour Composition API.

🔍 **Pourquoi ?**
- Encapsulation, **réutilisation**, testabilité.

🧪 **Exemples — bouton accessible**
```vue
<template>
  <button :class="classes" @click="onClick"><slot/> </button>
</template>
<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps<{ variant?: 'primary'|'secondary', disabled?: boolean }>()
const emit = defineEmits<{ (e:'click'): void }>()

const classes = computed(() => {
  const base = 'btn'
  return [base, props.variant ? `btn--${props.variant}` : '', props.disabled ? 'is-disabled' : ''].join(' ')
})

function onClick(e: MouseEvent) {
  if (props.disabled) return
  emit('click')
}
</script>
<style scoped>
.btn { padding: .5rem 1rem; }
.btn--primary { background: #3b82f6; color: white; }
</style>
```

💡 **Analogie**
- Un composant est une **boîte** avec une **prise d’entrée** (props), une **sortie** (events) et des **ports** modulables (slots).

⚠️ **Pièges**
- **Muter** une prop directement → antipattern (utiliser `emit`).
- Slots mal nommés → API floue.

✅ **Bonnes pratiques**
- Documenter props + emits dans le code (types / JSDoc).
- Prévoir des **slots nommés** pour les variations (ex. `header`, `footer`).

🧩 **Exercice**
- Créez un composant `Modal.vue` avec slots `header`, `default`, `footer`.

📝 **Résumé essentiel**
- Les SFC **organisent** le code ; `props/emits/slots` **contractualisent** les composants.


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
