
# 📘 Chapitre 18 — Sécurité

🎯 **Objectifs**
- Prévenir **XSS**, gérer **tokens**, et protéger les **routes**.

🧠 **Concepts**
- **XSS** (injection script), **CSP**, **sanitization**.
- **Auth** : JWT, stockage sécurisé (mémoire, cookies HttpOnly).

🛠️ **Sanitization (JS)**
```js
function escapeHtml(s) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return s.replace(/[&<>"']/g, ch => map[ch])
}
```

💡 **Analogie**
- Sécurité = **hygiène** : se laver les mains (échapper), porter un casque (CSP), verrouiller la porte (guards).

⚠️ **Pièges**
- `v-html` sur des contenus non **sanitisés**.

✅ **Bonnes pratiques**
- Utiliser **guards** + **permissions** côté UI ; limiter la surface.

🧩 **Exercice**
- Implémentez une page qui affiche du HTML **sécurisé** depuis une API.

📝 **Résumé essentiel**
- Éviter les **injections** ; protéger routes et tokens ; **CSP** aide à verrouiller.


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
