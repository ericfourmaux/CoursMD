
# 📘 Chapitre 16 — Patterns avancés (slots, directives, render functions/JSX)

🎯 **Objectifs**
- Maîtriser **slots scopés**, **directives custom**, **render functions** et **JSX** (optionnel).

🧠 **Concepts**
- **Slot scopé** : passer des **données** du composant enfant au slot.
- **Directive custom** : hooks sur le **DOM** (`mounted`, `updated`).
- **Render function** : UI écrite en **JS** (fine control).

🛠️ **Exemple — directive outside-click**
```ts
export const vOutsideClick = {
  mounted(el, binding) {
    el.__onClickOutside__ = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el.__onClickOutside__)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__onClickOutside__)
  }
}
```

💡 **Analogie**
- Les slots sont des **prises modulaires** : l’enfant expose des **points de connexion** aux parents.

⚠️ **Pièges**
- Directives intrusives ; render functions difficiles à maintenir.

✅ **Bonnes pratiques**
- Documenter l’API des slots (noms, données fournies).

🧩 **Exercice**
- Créez un composant `DataTable` avec slots pour `cell` et `header`.

📝 **Résumé essentiel**
- Les patterns avancés donnent de la **flexibilité** ; utilisez‑les avec **discipline**.


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
