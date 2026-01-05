
# 📘 Chapitre 2 — CSS Moderne: Box Model, Flexbox, Grid, Responsive

> 🎯 **Objectifs du chapitre**
> - Comprendre la **cascade**, la **spécificité** et l’**héritage** du CSS pour prévoir le rendu.
> - Maîtriser le **box model**, les **unités** (px, em, rem, vw/vh), le **positionnement**, et le **z-index**.
> - Construire des **layouts** robustes avec **Flexbox** et **CSS Grid**.
> - Concevoir une **mise en page responsive** avec **media queries**, **container queries**, **images fluides**, **typographie adaptative**.
> - Utiliser les **variables CSS (custom properties)**, `calc()` et `clamp()`.
> - Appliquer des **transitions/animations** respectueuses (`prefers-reduced-motion`) et penser **performance**.
> - Organiser le CSS avec **BEM** et un **mini design system**.

---

## 🧠 1. La cascade, la spécificité et l’héritage

### 🔍 Définition
- **Cascade**: quand plusieurs règles s’appliquent, le navigateur choisit la **plus spécifique** ou la **plus récente** selon l’ordre et l’origine (user agent, user, author).
- **Spécificité**: score basé sur le sélecteur (inline > id > classe/attribut/pseudo‑classe > élément/pseudo‑élément).
- **Héritage**: certaines propriétés (ex. `color`, `font-family`) se transmettent aux descendants.

### ❓ Pourquoi
Comprendre ces mécanismes évite les **effets de bord** et permet d’écrire un CSS **prévisible** et **maintenable**.

### 💡 Exemple (spécificité)
```css
/* Spécificité: élément */
p { color: #333; }
/* Spécificité: classe */
.article p { color: #111; }
/* Spécificité: id */
#principal .article p { color: #000; }
/* Inline (style="color: red") > tout le reste */
```

### 🗺 Schéma — ordre d’importance
```
inline styles > #id > .classe / [attr] / :hover > tag / ::before
```

### ✅ Bonnes pratiques
- Préférer **classes** aux ids pour le style.
- **Éviter !important**, sauf rares exceptions contrôlées.
- Structurer les sélecteurs **simples et plats**.

---

## 🧠 2. Box Model, overflow et unités

### 🔍 Définition
Chaque élément est une **boîte** composée de: `content` + `padding` + `border` + `margin`.

### 💡 Exemple
```css
* { box-sizing: border-box; } /* plus simple pour raisonner */
.card { width: 300px; padding: 16px; border: 1px solid #ddd; margin: 16px; }
```

### 🗺 Schéma
```
[ margin ]
  [ border ]
    [ padding ]
      [ content ]
```

### 🛠 Unités & usage
- `px` (pixels CSS)
- `em` (relative au **font-size** de l’élément)
- `rem` (relative au **font-size** racine)
- `vw/vh` (viewport width/height)
- `%` (relative au conteneur)

### 💡 Exemple — fluidité
```css
.container { width: min(90vw, 1200px); }
img { max-width: 100%; height: auto; }
```

### ⚠️ Attention
`overflow` contrôle le débordement (`hidden`, `auto`), utile pour les **layouts** et les **composants**.

---

## 🧠 3. Positionnement & stacking context

### 🔍 Définition
- `position: static | relative | absolute | fixed | sticky`.
- **Stacking context**: contexte d’empilement (créé par `position`, `opacity < 1`, `transform`, etc.).

### 💡 Exemple — badge fixé
```css
.badge { position: fixed; top: 1rem; right: 1rem; z-index: 1000; }
```

### 🗺 Schéma
```
Document flow
├─ static/relative (dans le flux)
└─ absolute/fixed (retiré du flux, selon conteneur positionné ou viewport)
```

---

## 🧠 4. Flexbox — Alignements en 1 dimension

### 🔍 Définition
**Flexbox** organise les enfants le long d’un **axe principal** (row/column) avec **alignement** et **distribution**.

### ❓ Pourquoi
Idéal pour des **barres d’outils**, **cartes** et **centrages**, où l’ordre et les tailles s’adaptent.

### 💡 Exemple
```css
.toolbar {
  display: flex;
  align-items: center;         /* alignement transversal */
  justify-content: space-between; /* distribution sur l’axe principal */
  gap: .75rem;
}
```

### 🗺 Schéma
```
Axe principal (row): ← item1 — item2 — item3 →
Axe transversal (column): ↑
                          align-items
                          ↓
```

### ✅ Bonnes pratiques
- Utiliser `gap` plutôt que des marges latérales.
- Préférer `flex: 1` pour expansion simple.
- Éviter de trop jouer avec `order` (risques A11y).

---

## 🧠 5. CSS Grid — Layouts en 2 dimensions

### 🔍 Définition
**Grid** définit des **lignes** et **colonnes**. On place les éléments sur des **cellules** ou **zones**.

### ❓ Pourquoi
Parfait pour des **mises en page complexes** (grilles d’articles, templates) avec alignements **bidimensionnels**.

### 💡 Exemple — grille responsive
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.card { padding: 1rem; border: 1px solid #e5e5e5; }
```

### 🗺 Schéma — zones nommées
```
header header
sidebar main
footer footer
```
```css
.layout {
  display: grid;
  grid-template-areas:
    'header header'
    'sidebar main'
    'footer footer';
  grid-template-columns: 240px 1fr;
}
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

### ✅ Bonnes pratiques
- Utiliser `minmax()` pour gérer les **bornes**.
- `auto-fit` vs `auto-fill` pour la **densité** de colonnes.
- Nommer les **areas** pour la lisibilité.

---

## 🧠 6. Responsive Design — Media & Container Queries

### 🔍 Définition
- **Media queries**: styles selon le **viewport** (`width`, `prefers-color-scheme`, `prefers-reduced-motion`).
- **Container queries**: styles selon la **taille du conteneur** (plus précis que media queries). *Syntaxe moderne*.

### 💡 Exemples
```css
/* Media query pour large screens */
@media (min-width: 768px) {
  .nav { display: flex; }
}

/* Respecter le mode sombre */
@media (prefers-color-scheme: dark) {
  :root { color-scheme: dark; }
  body { background: #121212; color: #eee; }
}

/* Réduire les animations si demandé */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

/* Container query (CQ) */
.container { container-type: inline-size; container-name: cards; }
@container cards (min-width: 600px) {
  .card-list { display: grid; grid-template-columns: repeat(2, 1fr); }
}
```

### ✅ Bonnes pratiques
- **Mobile‑first**: commencer avec styles pour petits écrans, puis `min-width`.
- Utiliser **CQ** pour composants réutilisables indépendants du viewport.
- Tester sur **vrais appareils** et DevTools (émulation).

---

## 🧠 7. Typographie adaptative, `calc()` et `clamp()`

### 🔍 Définition
- `calc()` effectue des **calculs** dynamiques.
- `clamp(min, preferred, max)` borne une valeur **fluide**.

### 💡 Exemple — fluid type
```css
html { font-size: 16px; }
h1 { font-size: clamp(1.75rem, 1rem + 3vw, 3rem); }
```

### 🧮 Formules en JavaScript
```js
// Modular scale typographique (ratio)
const base = 16; // px
const ratio = 1.25; // Major third
function modularScale(step) { return base * Math.pow(ratio, step); }

// Typo fluide entre minSize et maxSize selon viewport
function fluidSize(minSizePx, maxSizePx, minVW = 320, maxVW = 1440, vw) {
  const t = (vw - minVW) / (maxVW - minVW);
  const size = minSizePx + (maxSizePx - minSizePx) * Math.max(0, Math.min(1, t));
  return size; // px
}

// Exemple: taille à 1024px de viewport
console.log('h1 @1024px =', fluidSize(28, 48, 320, 1440, 1024), 'px');
```

---

## 🧠 8. Variables CSS (Custom Properties)

### 🔍 Définition
Les **custom properties** sont des variables **dynamiques** (portées par le DOM, compatibles avec `calc()` et thèmes).

### 💡 Exemple
```css
:root {
  --space-1: 4px; --space-2: 8px; --space-3: 16px;
  --primary: #0b57d0; --text: #1a1a1a; --bg: #ffffff;
}
.button {
  padding: var(--space-2) var(--space-3);
  background: var(--primary);
  color: #fff;
}
```

### ✅ Bonnes pratiques
- Centraliser le **design system** dans `:root`.
- Décliner thèmes (light/dark) via variables.

---

## 🧠 9. Images responsives & aspect-ratio

### 🔍 Définition
- `max-width: 100%` + `height: auto` pour images fluides.
- `aspect-ratio` maintient le ratio d’une boîte (ex. 16/9).

### 💡 Exemple
```css
.thumbnail { aspect-ratio: 16 / 9; object-fit: cover; }
```

### 🧮 Formule en JavaScript — hauteur à ratio fixe
```js
function heightFromWidth(width, ratioWidth = 16, ratioHeight = 9) {
  return width * (ratioHeight / ratioWidth);
}
console.log('Height for 320px width, 16/9 =', heightFromWidth(320), 'px');
```

---

## 🧠 10. Animations & Performance

### 🔍 Définition
- **Transitions** sur `opacity`, `transform` (GPU‑friendly).
- Éviter d’animer `width/height/left/top` (reflow).

### 💡 Exemple
```css
.card { transform: translateZ(0); }
.card:hover { transform: translateY(-2px); transition: transform 200ms ease; }
```

### ⚠️ Attention
Utiliser `will-change` avec parcimonie; tester l’impact.

---

## 🧠 11. Méthodologie BEM & Architecture CSS

### 🔍 Définition
**BEM**: Block, Element, Modifier. Convention de nommage pour des composants **prévisibles**.

### 💡 Exemple
```css
.card {}
.card__title {}
.card--featured {}
```

### ✅ Bonnes pratiques
- Un **block** par composant.
- Les **modifiers** pour variations.
- Éviter l’imbrication profonde de sélecteurs.

---

## 🧠 12. Debug CSS avec DevTools

### 🛠 Outils
- Inspecteur: voir **box model**, règles appliquées et **spécificité**.
- Surbrillance des **grilles** et **flex** dans DevTools.

### 💡 Astuce
Activer la **visualisation Grid/Flex** pour comprendre alignements et gaps.

---

## 🧠 13. Mini Design System — Mise en pratique

### 🔍 Objectif
Construire une page avec palette, espaces, typographie, composants (bouton, carte, alert).

### 💡 Extrait de styles
```css
:root {
  --primary: #0b57d0; --secondary: #ff8a00; --danger: #b00020;
  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px;
  --radius-1: 4px; --radius-2: 8px;
}
.container { width: min(90vw, 1100px); margin: 0 auto; padding: var(--space-3); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); }
.button { padding: var(--space-2) var(--space-3); border-radius: var(--radius-1); }
.card { border: 1px solid #e5e5e5; border-radius: var(--radius-2); padding: var(--space-3); }
.alert { background: var(--danger); color: #fff; padding: var(--space-2); }
```

### 🧪 Exercices
- Créer une **barre de navigation** en Flexbox.
- Construire une **grille de cartes** responsive.
- Ajouter une **typographie fluide** avec `clamp()`.

---

## 🧠 14. Pièges courants & Solutions

- **Hauteurs fixes** → préférer **contenu auto** + `min-height`.
- **Marge qui s’effondre** (margin collapse) → utiliser `padding` sur le parent.
- **`z-index` inefficace** → vérifier le **stacking context** créé (ex. `position`, `transform`).
- **Layout qui casse** → ajouter `minmax(0, 1fr)` pour éviter overflow.

---

## 🧠 15. Check‑list CSS rapide

- [ ] `box-sizing: border-box` global.
- [ ] Layouts en **Flexbox/Grid** avec `gap`.
- [ ] **Mobile‑first** + media/container queries.
- [ ] **Images fluides**, `aspect-ratio`, `object-fit`.
- [ ] **Typo fluide** avec `clamp()`.
- [ ] **Variables CSS** pour palette/espaces.
- [ ] Animations sur `transform/opacity` uniquement.
- [ ] BEM pour nommage et modularité.

---

## 📦 Livrable du chapitre
Une **page** complète:
- En‑tête en **Flexbox** (logo, menu, actions).
- Section cartes en **Grid** responsive.
- Style **mobile‑first** + `@media (min-width)` + **container queries**.
- **Typographie fluide**, variables CSS, thèmes light/dark.

---

## 🔚 Résumé essentiel du Chapitre 2
- La **cascade** et la **spécificité** déterminent la règle appliquée; l’**héritage** véhicule certaines propriétés.
- Le **box model** (content/padding/border/margin) gouverne l’espace; `border-box` simplifie le raisonnement.
- **Flexbox**: 1 dimension, alignements et distribution; **Grid**: 2 dimensions, zones nommées et tracks fluides.
- Le **responsive** moderne combine **media queries** et **container queries**.
- La **typographie** se rend fluide avec `clamp()` (bornes) et peut se calculer en JS.
- Les **variables CSS** centralisent le design system et facilitent les thèmes.
- Les **animations** doivent privilégier `transform/opacity` pour la performance.
- **BEM** aide à structurer un CSS prévisible et réutilisable.

---

> Prochain chapitre: **JavaScript ES6+ (Fondamentaux)** — nous passerons aux bases du langage et au DOM.
