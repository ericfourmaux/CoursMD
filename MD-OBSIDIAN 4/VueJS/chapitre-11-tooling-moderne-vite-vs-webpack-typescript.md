
# 📘 Chapitre 11 — Tooling moderne (Vite vs Webpack) & TypeScript

🎯 **Objectifs**
- Comprendre la chaîne **Vite (dev) + Rollup (build)**.
- Typer **props** et **emits** avec TypeScript.

🧠 **Concepts**
- **ESM natif** dans le navigateur pour dev rapide.
- **Rollup** pour bundling performant ; comparaison **Webpack** (legacy, puissant).

🛠️ **TypeScript dans SFC**
```ts
const props = defineProps<{ count: number }>()
const emit = defineEmits<{ (e:'change', v:number): void }>()
```

💡 **Analogie**
- Vite est un **livreur express** qui apporte **uniquement** ce que la page demande.

⚠️ **Pièges**
- Mettre `any` partout → perdre les bénéfices.

✅ **Bonnes pratiques**
- Activer `strict` dans `tsconfig.json` ; typer les **stores**, les **routes**.

🧩 **Exercice**
- Convertir un composant JS en TS et ajouter types stricts aux emits.

📝 **Résumé essentiel**
- Vite accélère le dev ; TS **renforce** la robustesse et l’auto‑complétion.


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
