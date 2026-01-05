
# 📘 Chapitre 19 — Internationalisation (🌐 i18n)

🎯 **Objectifs**
- Localiser l’app (fr/en), gérer messages, pluriels, formats.

🧠 **Concepts**
- **Vue I18n** : messages, **formatters** de dates/nombres.
- **Lazy‑loading** des locales.

🛠️ **Exemple — messages**
```js
const messages = {
  fr: { hello: 'Bonjour {name} !' },
  en: { hello: 'Hello {name}!' }
}
```

💡 **Analogie**
- i18n = **interprète** : traduit selon la langue courante.

⚠️ **Pièges**
- Oublier de **typ(er)** les clés ; confliter les clés.

✅ **Bonnes pratiques**
- Centraliser les **messages** ; éviter l’**HTML** dans les messages.

🧩 **Exercice**
- Ajoutez un switch de langue et traduisez deux pages.

📝 **Résumé essentiel**
- i18n **structure** la traduction ; pensez **lazy‑load** et **formatters**.


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
