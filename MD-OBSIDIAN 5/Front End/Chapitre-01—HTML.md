
# 📘 Chapitre 1 — HTML Sémantique & Accessibilité (A11y)

> 🎯 **Objectifs du chapitre**
> - Comprendre la **sémantique HTML** et son impact (SEO, accessibilité, maintenance).
> - Maîtriser les **landmarks**, les **titres**, les **listes**, les **images**, les **tables**, les **formulaires**.
> - Appliquer les **principes WCAG** et **ARIA** (quand et comment) pour une interface **accessible au clavier** et aux lecteurs d’écran.
> - Mettre en place une **page modèle accessible** avec navigation clavier, contrastes suffisants et erreurs formulaires annoncées.

---

## 🧠 1. Qu’est‑ce que la sémantique HTML ?

### 🔍 Définition
La **sémantique HTML** désigne l’usage de **balises dont le nom reflète le rôle** et la signification du contenu (ex. `<header>`, `<nav>`, `<main>`, `<article>`). Cela permet aux **navigateurs**, **moteurs de recherche** et **technologies d’assistance** (lecteurs d’écran) d’**interpréter correctement** la structure et le sens.

### ❓ Pourquoi c’est important
- **Accessibilité**: les lecteurs d’écran s’appuient sur la structure sémantique pour permettre la navigation par régions, titres et listes.
- **SEO**: une structure claire aide les moteurs de recherche à indexer et classer le contenu.
- **Maintenance**: un code sémantique est plus lisible, donc plus facile à faire évoluer.

### 💡 Exemple
**Non sémantique**:
```html
<div id="top"></div>
<div class="menu"></div>
<div class="content">
  <div class="post-title">Titre</div>
  <div class="txt">Du texte…</div>
</div>
```
**Sémantique**:
```html
<header></header>
<nav aria-label="Navigation principale"></nav>
<main>
  <article>
    <h1>Titre</h1>
    <p>Du texte…</p>
  </article>
</main>
```

---

## 🧠 2. Landmarks & Structure globale

### 🔍 Définition
Les **landmarks** sont des régions principales:
- `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<form>`, `<article>`, `<section>`.

### ❓ Pourquoi
Permettent la **navigation rapide** pour les lecteurs d’écran (ex. “sauter au contenu principal”).

### 💡 Exemple de layout sémantique
```html
<body>
  <a class="skip-link" href="#contenu">Aller au contenu principal</a>
  <header>
    <h1>Mon Site</h1>
  </header>
  <nav aria-label="Navigation principale">
    <ul>
      <li><a href="/">Accueil</a></li>
      <li><a href="/blog">Blog</a></li>
    </ul>
  </nav>
  <main id="contenu">
    <article>
      <header>
        <h2>Article 1</h2>
      </header>
      <p>Contenu…</p>
    </article>
  </main>
  <aside aria-label="Informations latérales">
    <section>
      <h3>Newsletter</h3>
      <p>Inscrivez‑vous…</p>
    </section>
  </aside>
  <footer>
    <p>© 2025</p>
  </footer>
</body>
```

### 🗺 Schéma (arbre DOM simplifié)
```
body
├── a.skip-link
├── header
│   └── h1
├── nav
│   └── ul
│       ├── li > a
│       └── li > a
├── main#contenu
│   └── article
│       ├── header > h2
│       └── p
├── aside
│   └── section > h3, p
└── footer > p
```

---

## 🧠 3. Titres (h1–h6) & Sections

### 🔍 Définition
Une **hiérarchie de titres** organise le contenu. **Un seul `<h1>` par page** (hors cas spécifiques), puis des titres de niveaux décroissants.

### ❓ Pourquoi
Permet la **navigation par titres** (lecteurs d’écran) et clarifie la structure pour le SEO.

### 💡 Bonnes pratiques
- Un `<h1>` décrivant le sujet global.
- Des `<h2>` pour les sections majeures, `<h3>` pour les sous‑sections, etc.
- Éviter de sauter des niveaux (ex. passer de `<h2>` à `<h4>` directement).

### 💡 Exemple
```html
<h1>Recettes de cuisine</h1>
<section>
  <h2>Entrées</h2>
  <article>
    <h3>Soupe de potiron</h3>
    <p>…</p>
  </article>
</section>
```

---

## 🧠 4. Listes, Paragraphes, Citations & Figures

### 🔍 Définition & usage
- `<p>` pour les paragraphes.
- `<ul>`/`<ol>` pour les **listes** (éléments `<li>`).
- `<blockquote>` pour les citations longues, `<q>` pour les courtes.
- `<figure>` + `<figcaption>` pour illustrer une image ou un code avec légende.

### 💡 Exemple
```html
<figure>
  <img src="diagramme.png" alt="Diagramme des flux de données" />
  <figcaption>Flux de données entre modules.</figcaption>
</figure>
```

---

## 🧠 5. Images & Attribut `alt`

### 🔍 Définition
L’attribut `alt` **décrit l’image** pour les utilisateurs qui ne peuvent pas la voir.

### ❓ Pourquoi
- Accessibilité (lecteurs d’écran)
- Fallback si l’image ne charge pas
- SEO

### ✅ Bonnes pratiques
- **Informative**: décrire brièvement le contenu.
- **Décorative**: `alt=""` (vide) et **CSS** pour l’esthétique.
- Éviter "image de…" si redondant.

### 💡 Exemple
```html
<img src="avatar-eric.jpg" alt="Portrait d’Eric Fourmaux" />
<img src="ornement.svg" alt="" role="presentation" />
```

---

## 🧠 6. Tables accessibles

### 🔍 Définition
Utiliser `<caption>`, `<thead>`, `<tbody>`, `<tfoot>`, `<th>` avec `scope="col|row"`.

### ❓ Pourquoi
Les lecteurs d’écran annoncent correctement l’en‑tête associé à chaque cellule.

### 💡 Exemple
```html
<table>
  <caption>Statistiques trimestrielles</caption>
  <thead>
    <tr>
      <th scope="col">Trimestre</th>
      <th scope="col">Revenu</th>
      <th scope="col">Coût</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Q1</th>
      <td>120 000 €</td>
      <td>80 000 €</td>
    </tr>
  </tbody>
</table>
```

---

## 🧠 7. Formulaires accessibles

### 🔍 Définition
Un **formulaire accessible** associe chaque champ à un **label**, gère les **états** (`required`, `disabled`, `aria-invalid`) et annonce les **erreurs**.

### ❓ Pourquoi
Le clavier et les lecteurs d’écran doivent pouvoir **comprendre** et **corriger** les erreurs sans obstacle.

### ✅ Bonnes pratiques
- `<label for="id">` relié à l’`id` du champ.
- `autocomplete` adapté (`email`, `name`, `address-line1`, etc.).
- `aria-describedby` pour lier un message d’aide.
- Indication d’erreur avec `aria-invalid="true"` **et** un texte.

### 💡 Exemple
```html
<form aria-labelledby="form-titre">
  <h2 id="form-titre">Inscription</h2>

  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="help-email error-email" />
    <p id="help-email" class="help">Nous n’utiliserons jamais votre email à des fins commerciales.</p>
    <p id="error-email" class="error" hidden>Format d’email invalide.</p>
  </div>

  <button type="submit">Envoyer</button>
</form>
```

### 🛠 Gestion d’erreurs (JS)
```js
const emailInput = document.getElementById('email');
const error = document.getElementById('error-email');

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

emailInput.addEventListener('input', () => {
  const ok = validateEmail(emailInput.value);
  emailInput.setAttribute('aria-invalid', String(!ok));
  error.hidden = ok;
});
```

---

## 🧠 8. Navigation clavier & Focus Management

### 🔍 Définition
La **navigation au clavier** repose sur l’ordre de tabulation, le focus visible et les activations via **Enter/Space**.

### ❓ Pourquoi
Certains utilisateurs naviguent **uniquement au clavier**; le focus doit être logique et visible.

### ✅ Bonnes pratiques
- **Ne pas** utiliser `tabindex` > 0; préférer l’ordre DOM.
- Rendre le **focus visible** (`:focus-visible`).
- Gérer **Enter/Space** pour boutons non‑natifs.

### 💡 Exemple – Lien d’évitement (skip‑link)
```html
<a class="skip-link" href="#contenu">Aller au contenu principal</a>
```

### 🛠 Piège de focus (modale)
```js
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  let idx = 0;
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    idx = e.shiftKey ? (idx - 1 + focusable.length) % focusable.length : (idx + 1) % focusable.length;
    focusable[idx].focus();
  });
}
```

---

## 🧠 9. ARIA: rôles, propriétés et états

### 🔍 Définition
**ARIA** (*Accessible Rich Internet Applications*) étend la sémantique pour les composants **non natifs**.

### ❓ Pourquoi
Quand une balise native ne suffit pas, ARIA **décrit** rôle, état et relations (ex. `aria-expanded`, `aria-controls`).

### ⚠️ Règles d’or
- **N’ajoutez pas ARIA** si une balise native existe.
- **N’overridez pas** la sémantique native.
- Maintenez **synchro** entre l’UI visuelle et les états ARIA.

### 💡 Exemple – Accordéon accessible
```html
<button aria-expanded="false" aria-controls="p1" id="t1">Détails</button>
<div id="p1" hidden role="region" aria-labelledby="t1">Contenu…</div>
```
```js
const btn = document.getElementById('t1');
const panel = document.getElementById('p1');

btn.addEventListener('click', () => {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  panel.hidden = expanded;
});
```

---

## 🧠 10. Contraste des couleurs (WCAG) — Formules en JavaScript

### 🔍 Définition
Le **contraste** mesure la différence de luminosité entre deux couleurs. La norme **WCAG 2.1** recommande:
- **Texte normal**: ratio ≥ **4.5:1**.
- **Texte large (≥ 18pt)**: ratio ≥ **3:1**.

### ❓ Pourquoi
Un contraste insuffisant rend le texte illisible pour de nombreux utilisateurs.

### 🧮 Formule (relative luminance & ratio) en JS
```js
// Convertit une couleur hex en composantes sRGB [0,1]
function hexToRgb01(hex) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  return [r, g, b];
}

// Transforme sRGB en luminance relative selon WCAG
function srgbToLuminance([r, g, b]) {
  const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const R = f(r), G = f(g), B = f(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hex1, hex2) {
  const L1 = srgbToLuminance(hexToRgb01(hex1));
  const L2 = srgbToLuminance(hexToRgb01(hex2));
  const [high, low] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (high + 0.05) / (low + 0.05); // Résultat en ratio (ex. 7.2)
}

console.log('Contraste #000000 vs #ffffff =', contrastRatio('#000000', '#ffffff'));
```

### ✅ Bonnes pratiques
- Tester les couleurs de texte et de fond.
- Éviter texte sur images sans overlay suffisant.
- Utiliser `prefers-color-scheme` pour dark mode, en vérifiant le contraste dans les deux thèmes.

---

## 🧠 11. Attributs utiles & sémantiques supplémentaires

- `lang` sur `<html>` (ex. `fr`) – important pour la prononciation par lecteurs d’écran.
- `title` (à utiliser avec parcimonie) – info supplémentaire, pas pour les tooltips critiques.
- `time datetime="2025-12-21"` – sémantique temporelle.
- `abbr` avec `title` – acronymes.
- `mark` – mise en évidence.
- `data-*` – porter des métadonnées custom.

---

## 🧠 12. Accessibilité dynamique: Live Regions & Annonces

### 🔍 Définition
Les **live regions** (ex. `aria-live="polite"`) permettent d’annoncer des mises à jour dynamiques.

### 💡 Exemple – Notification non bloquante
```html
<div id="notif" aria-live="polite" class="sr-only"></div>
```
```js
function announce(message) {
  const n = document.getElementById('notif');
  n.textContent = message; // Le lecteur d’écran annoncera ce changement.
}
announce('Article ajouté à votre liste');
```

---

## 🧠 13. Outils d’audit et de test A11y

- 🛠 **Chrome DevTools**: onglet **Accessibility** (arbre d’accessibilité).
- 🛠 **Lighthouse**: audit A11y basique.
- 🛠 **axe DevTools**: extension pour détection d’erreurs A11y.
- 🛠 **NVDA/JAWS/VoiceOver**: lecteurs d’écran pour tester.

### 💡 Astuce
Tester **au clavier** (Tab/Shift+Tab, Enter, Space, Esc) et vérifier le **focus visible** partout.

---

## 🧠 14. Page modèle accessible – Exemple complet

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Modèle Accessible</title>
  <style>
    :root { --primary: #0b57d0; --text: #1a1a1a; --bg: #ffffff; }
    body { font-family: system-ui, sans-serif; color: var(--text); background: var(--bg); }
    .skip-link { position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden; }
    .skip-link:focus { left:0; width:auto; height:auto; padding:8px; background:#fff; border:2px solid var(--primary); }
    a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--primary); outline-offset: 2px; }
    .error { color: #b00020; }
    .sr-only { position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden; }
  </style>
</head>
<body>
  <a class="skip-link" href="#contenu">Aller au contenu principal</a>
  <header>
    <h1>Modèle Accessible</h1>
  </header>
  <nav aria-label="Navigation principale">
    <ul>
      <li><a href="#">Accueil</a></li>
      <li><a href="#">Blog</a></li>
    </ul>
  </nav>
  <main id="contenu">
    <article>
      <h2>Présentation</h2>
      <p>Ce modèle illustre les bonnes pratiques A11y.</p>
    </article>
    <section>
      <h2>Formulaire</h2>
      <form aria-labelledby="titre-form">
        <h3 id="titre-form">Contact</h3>
        <label for="nom">Nom</label>
        <input id="nom" name="nom" type="text" autocomplete="name" required />
        <label for="msg">Message</label>
        <textarea id="msg" name="message" aria-describedby="help-msg"></textarea>
        <p id="help-msg" class="help">Expliquez votre demande en quelques phrases.</p>
        <button type="submit">Envoyer</button>
        <div id="notif" aria-live="polite" class="sr-only"></div>
      </form>
    </section>
    <section>
      <h2>Accordéon</h2>
      <button aria-expanded="false" aria-controls="panel-1" id="btn-1">Voir plus</button>
      <div id="panel-1" hidden role="region" aria-labelledby="btn-1">
        <p>Contenu supplémentaire…</p>
      </div>
    </section>
  </main>
  <aside aria-label="Infos">
    <h2>Infos</h2>
    <p>Sidebar…</p>
  </aside>
  <footer>
    <p>© 2025</p>
  </footer>
  <script>
    // Accordéon
    const btn = document.getElementById('btn-1');
    const panel = document.getElementById('panel-1');
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });

    // Annonce
    function announce(message) {
      const n = document.getElementById('notif');
      n.textContent = message;
    }
    announce('Formulaire prêt');
  </script>
</body>
</html>
```

---

## 🧪 15. Exercices guidés

1. **Structure sémantique**: Transformez une page de `<div>`s en landmarks (`header`, `nav`, `main`, etc.).
2. **Titres**: Corrigez une hiérarchie de titres incohérente.
3. **Contraste**: Écrivez un script qui teste le ratio de contraste pour vos couleurs de thème (utilisez la fonction `contrastRatio`).
4. **Formulaires**: Ajoutez `aria-describedby` aux champs et affichez les erreurs de façon accessible.
5. **Accordéon**: Créez un accordéon avec `aria-expanded` et `aria-controls`.
6. **Clavier**: Vérifiez l’ordre de tabulation et rendez le focus visible sur tous les éléments interactifs.

---

## ✅ 16. Check‑list A11y rapide

- [ ] Langue du document (`<html lang="fr">`).
- [ ] Un seul `<h1>` pertinent.
- [ ] Landmarks présents et corrects.
- [ ] Liens descriptifs (éviter « Cliquez ici »).
- [ ] Images avec `alt` (vide si décoratives).
- [ ] Table avec `caption`, `th` + `scope`.
- [ ] Formulaires avec labels, erreurs annoncées.
- [ ] Focus visible et ordre de tabulation logique.
- [ ] Contrastes conformes (≥ 4.5:1).
- [ ] Éléments custom avec rôles/états ARIA cohérents.

---

## 📦 17. Livrable du chapitre
Une **page web** entièrement sémantique et **accessible**:
- Structure: `header`/`nav`/`main`/`aside`/`footer`.
- Formulaire avec labels, aides et gestion d’erreurs.
- Composant accordéon avec ARIA.
- Contrastes vérifiés par script JS.

---

## 🔚 Résumé essentiel du Chapitre 1
- La **sémantique** rend le contenu compréhensible par les machines (lecteurs d’écran, moteurs de recherche) et humains.
- Les **landmarks** (`header`, `nav`, `main`, etc.) structurent la page et facilitent la navigation.
- Une **hiérarchie de titres** claire est cruciale (1 seul `<h1>` + niveaux successifs).
- Les **images** doivent avoir un `alt` pertinent (ou vide si décoratives).
- Les **tables** nécessitent `caption`, `th` + `scope` pour relier entêtes et cellules.
- Les **formulaires**: labels, aides, erreurs annoncées via `aria-describedby`/`aria-invalid`.
- La **navigation clavier** et le **focus visible** sont indispensables.
- **ARIA** n’est utile que lorsque le HTML natif ne suffit pas; gardez les états synchronisés.
- Le **contraste des couleurs** se calcule (WCAG) et doit respecter les ratios recommandés.

---

> Prochain chapitre: **CSS Moderne (Flexbox, Grid, Responsive)** — nous apprendrons à concevoir des mises en page robustes et adaptatives.
