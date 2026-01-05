# Mini-Ebook : Webpack, Git et Tests Unitaires

## 1. Webpack

### Objectif
Comprendre le rôle de Webpack, savoir configurer un projet et optimiser le bundling.

### Concepts clés
- **Bundler** : Regroupe plusieurs fichiers en un seul bundle.
- **Entry** : Point d’entrée de l’application.
- **Output** : Fichier généré après le bundling.
- **Loaders** : Transforment des fichiers (ex. Babel pour JS, CSS loader).
- **Plugins** : Ajoutent des fonctionnalités (minification, génération HTML).
- **Mode** : `development` ou `production`.

### Installation
```bash
npm init -y
npm install webpack webpack-cli --save-dev
```

### Configuration de base
```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};
```

### Optimisation
- **Code splitting** : Séparer le code en chunks.
- **Tree shaking** : Supprimer le code inutilisé.

### Exercice pratique
✅ Créez un projet avec Webpack qui :
- Compile du JavaScript avec Babel.
- Charge du CSS.
- Génère un bundle optimisé en mode production.

---

## 2. Git

### Objectif
Maîtriser les commandes essentielles et adopter un workflow professionnel.

### Concepts clés
- **Repository** : Dossier avec historique.
- **Commit** : Instantané des modifications.
- **Branch** : Ligne de développement parallèle.
- **Merge** : Fusion de branches.
- **Remote** : Dépôt distant (GitHub, GitLab).

### Commandes essentielles
```bash
git init
git add .
git commit -m "Initial commit"
git branch feature-xyz
git checkout feature-xyz
git remote add origin <URL>
git push origin main
```

### Exercice pratique
✅ Créez un repo Git local, ajoutez un fichier `README.md`, créez une branche `feature`, faites un commit et poussez sur GitHub.

---

## 3. Tests Unitaires

### Objectif
Écrire des tests pour garantir la fiabilité du code.

### Concepts clés
- **Test unitaire** : Vérifie une fonction ou un module.
- **Frameworks** : Jest, Mocha.
- **Mocking** : Simuler des dépendances.

### Installation
```bash
npm install --save-dev jest
```

### Exemple de test
```javascript
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');
test('additionne 1 + 2 = 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

### Exécution
```bash
npx jest
```

### Exercice pratique
✅ Créez une fonction `multiply(a, b)`, écrivez un test Jest pour vérifier son fonctionnement et ajoutez un test pour un cas d’erreur.

---

## Projet final
✅ Créez une petite application JavaScript (ex. calculatrice), configurez Webpack pour le bundling, gérez le code avec Git et écrivez des tests unitaires pour les fonctions principales.
