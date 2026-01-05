
# 📘 Chapitre 15 — SSR & Nuxt 3 (bases)

🎯 **Objectifs**
- Comprendre **SSR** (rendu serveur) et **hydratation**.
- Découvrir les **conventions** de **Nuxt 3**.

🧠 **Concepts**
- **SSR** : HTML généré côté serveur, puis **hydraté** côté client.
- **Nuxt** : framework basé sur Vue pour SSR/SSG avec **conventions** (pages, layouts, data).

🛠️ **Exemple — Nuxt pages**
```
pages/
├─ index.vue
├─ users/[id].vue
```

💡 **Analogie**
- SSR = **photo instantanée** envoyée au client, puis l’app prend vie (hydratation).

⚠️ **Pièges**
- Accéder à `window` côté serveur → erreur.

✅ **Bonnes pratiques**
- Utiliser `useAsyncData` pour les fetch côté serveur ; gérer les **erreurs**.

🧩 **Exercice**
- Créez une page Nuxt qui fetch des posts avec `useAsyncData`.

📝 **Résumé essentiel**
- SSR améliore **SEO/TTFB** ; Nuxt 3 facilite via conventions et helpers.


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
