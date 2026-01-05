
# 📘 Chapitre 10 — Styles & Animations (Scoped, CSS Modules, Tailwind, `<transition>`)

🎯 **Objectifs**
- Comprendre **scoped CSS**, **CSS modules**, et options comme **Tailwind**.
- Animer avec `<transition>` et `<transition-group>`.

🧠 **Concepts**
- **Scoped** ajoute des attributs data au DOM pour **isoler** les styles.
- `<transition>` applique des **classes** pendant l’entrée/sortie (`*-enter-*`, `*-leave-*`).

🧪 **Exemple — transition**
```vue
<transition name="fade">
  <p v-if="visible">Bonjour !</p>
</transition>
<style scoped>
.fade-enter-from, .fade-leave-to { opacity: 0 }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease }
</style>
```

💡 **Analogie**
- Les transitions sont des **chorégraphies** : classes = **pas de danse** lors des changements.

⚠️ **Pièges**
- Animer des **propriétés coûteuses** (layout) : préférer `opacity`, `transform`.

✅ **Bonnes pratiques**
- Limiter la durée ; respecter l’**accessibilité** (réduction des animations).

🧩 **Exercice**
- Animez l’apparition/disparition d’alertes ; groupe trié avec `<transition-group>`.

📝 **Résumé essentiel**
- Les styles **scopés** isolent ; les **transitions** améliorent l’UX avec parcimonie.


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
