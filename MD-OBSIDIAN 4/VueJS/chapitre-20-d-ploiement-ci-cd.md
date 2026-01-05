
# 📘 Chapitre 20 — Déploiement & CI/CD (🚀)

🎯 **Objectifs**
- Préparer le **build**, configurer **CI/CD**, déployer.

🧠 **Concepts**
- **Sourcemaps**, **env prod**, **Netlify/Vercel**, **Docker** (optionnel).
- **GitHub Actions** : lint/test/build/deploy.

🛠️ **Pipeline (extrait YAML)**
```yaml
name: ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci && npm run test && npm run build
```

💡 **Analogie**
- CI/CD = **chaîne d’assemblage** : tests et contrôle qualité avant livraison.

⚠️ **Pièges**
- Exposer des **secrets** dans le repo.

✅ **Bonnes pratiques**
- Gérer les **envs** par **secrets** ; surveiller après déploiement (logs, métriques).

🧩 **Exercice**
- Ajoutez un pipeline qui exécute lint/test/build sur PR.

📝 **Résumé essentiel**
- CI/CD **automatise** la qualité ; build prod = **assets optimisés**.


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
