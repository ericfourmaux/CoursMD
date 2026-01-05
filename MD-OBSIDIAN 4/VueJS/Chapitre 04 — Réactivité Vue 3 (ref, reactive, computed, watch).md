---
title: Chapitre 04 — Réactivité Vue 3 (ref, reactive, computed, watch)
tags: [Vue.js, Vue 3, Formation, Débutant]
---


# 📘 Chapitre 04 — Réactivité Vue 3 (ref, reactive, computed, watch)

🎯 **Objectifs**
- Maîtriser `ref`, `reactive`, `computed`, `watch` et `watchEffect`.
- Comprendre **dépendances**, **effets**, et **pièges de déstructuration**.

🧠 **Concepts**
- `ref(value)` : enveloppe réactive avec `.value`.
- `reactive(obj)` : proxy réactif d’un **objet**.
- `computed(fn)` : valeur **dérivée** mémorisée.
- `watch(source, cb)` : observe une ou plusieurs **sources**.

🔍 **Pourquoi ?**
- Déclarer des **formules** et **relations** ; minimiser les **recalculs**.

🧪 **Exemples — dérivée et agrégation**
```ts
import { ref, reactive, computed, watch } from 'vue'

const items = reactive([
  { price: 10, qty: 2 },
  { price: 5, qty: 3 },
])

const total = computed(() => items.reduce((s, it) => s + it.price * it.qty, 0))

const taxRate = ref(0.2)
const totalWithTax = computed(() => Math.round(total.value * (1 + taxRate.value)))

watch(total, (newVal, oldVal) => {
  console.log('Total changé', { oldVal, newVal })
})
```

💡 **Analogie (cellules calculées)**
- `computed` = cellule calculée : dépend de **sources** et se met à jour **automatiquement**.

⚠️ **Pièges**
- **Déstructurer** un objet réactif (`const { a } = obj`) → **perte** de réactivité.
- Utiliser `reactive` pour des **primitifs** (préférer `ref`).

✅ **Bonnes pratiques**
- Garder les **sources minimales** (évite recomputes).
- Préférer `watchEffect` pour **effets** simples dépendant implicitement.

🧪 **Mesure de performance (JS)**
```js
function bench(fn, loops = 1e5) {
  const t0 = performance.now()
  for (let i = 0; i < loops; i++) fn()
  const t1 = performance.now()
  return Math.round(t1 - t0)
}
```

🧩 **Exercice**
- Implémentez un compteur avec `ref`, un `computed` qui affiche `pair/impair`, et un `watch` qui log les changements.

📝 **Résumé essentiel**
- `ref`/`reactive` pour l’**état** ; `computed` pour les **dérivées** ; `watch` pour les **effets**.


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
