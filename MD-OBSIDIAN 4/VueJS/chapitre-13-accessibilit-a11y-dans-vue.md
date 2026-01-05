
# 📘 Chapitre 13 — Accessibilité (a11y) dans Vue

🎯 **Objectifs**
- Produire des composants **accessibles** par défaut (clavier, ARIA).

🧠 **Concepts**
- **Rôles** ARIA, **nom accessible**, **focus management**.

🛠️ **Exemple — modale accessible**
```vue
<template>
  <div v-if="open" role="dialog" aria-modal="true" aria-labelledby="title">
    <h2 id="title">Titre</h2>
    <button @click="close">Fermer</button>
  </div>
</template>
```

💡 **Analogie**
- Pensez **chemins balisés** pour tous les utilisateurs (clavier, lecteurs d’écran).

⚠️ **Pièges**
- Enlever le **focus visible** ; pièges des **modales** (scroll, focus trap).

✅ **Bonnes pratiques**
- Respecter la **hiérarchie** des titres ; gérer **Tab/Shift+Tab**.

🧩 **Exercice**
- Implémentez un menu accessible (clavier + aria‑expanded).

📝 **Résumé essentiel**
- L’accessibilité est **non négociable** : rôle, nom, focus, contraste.


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
