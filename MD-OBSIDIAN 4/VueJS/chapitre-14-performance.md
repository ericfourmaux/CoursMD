
# 📘 Chapitre 14 — Performance

🎯 **Objectifs**
- Identifier et corriger les **coûts inutiles**.

🧠 **Concepts**
- **Profiling** DevTools, `v-once`, `keep-alive`, **code splitting**, **memoization**.

🛠️ **Exemples — mesures**
```js
function measureRenders(updateFn, loops = 1000) {
  const t0 = performance.now()
  for (let i = 0; i < loops; i++) updateFn(i)
  const t1 = performance.now()
  return t1 - t0
}
```

💡 **Analogie**
- Optimiser, c’est comme **optimiser un trajet** : éviter les **embouteillages** (re-renders) et **découper** le parcours (split).

⚠️ **Pièges**
- Premature optimization ; **dérivées** mal calibrées (computed trop large).

✅ **Bonnes pratiques**
- **Mesurer avant d’agir** ; isoler les composants **bruyants**.

🧩 **Exercice**
- Optimisez une liste avec `virtual scroll` (concept et librairies existantes).

📝 **Résumé essentiel**
- Mesurer, profiler, isoler : performance = **discipline**, pas magie.


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
