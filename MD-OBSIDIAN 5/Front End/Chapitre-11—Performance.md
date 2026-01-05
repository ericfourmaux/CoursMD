
# 📘 Chapitre 11 — Performance Web, Accessibilité Avancée & SEO

> 🎯 **Objectifs du chapitre**
> - Comprendre et **mesurer** les **Core Web Vitals** (FCP, LCP, CLS, INP) et autres métriques (TTI, TBT, TTFB).
> - Mettre en place un **profilage** avec **DevTools** et **Web APIs** (`PerformanceObserver`).
> - Appliquer des **optimisations** concrètes (images, fonts, scripts, cache, resource hints, bundling/splitting).
> - Approfondir l’**accessibilité** (focus management, modales, lecteurs d’écran, formulaires complets, navigation clavier).
> - Améliorer le **SEO côté front** (métadonnées, Open Graph/Twitter Cards, **JSON‑LD**, canonical, robots) et comprendre **SPA vs SSR/SSG**.
> - Produire un **audit** avec **plan d’actions** mesurable.

---

## 🧠 1. Core Web Vitals & métriques clés

### 🔍 Définitions
- **FCP (First Contentful Paint)**: instant où le **premier contenu** (texte/image) est peint.
- **LCP (Largest Contentful Paint)**: temps pour afficher le **contenu principal** le plus grand (image/texte block).
- **CLS (Cumulative Layout Shift)**: **stabilité visuelle** (somme des *layout shifts*).
- **INP (Interaction to Next Paint)**: latence **de l’interaction** la plus lente (remplace FID).

**Autres métriques**: **TTFB** (Time to First Byte), **TBT** (Total Blocking Time), **TTI** (Time to Interactive).

### ✅ Seuils (indications)
- **LCP**: *bon* ≤ 2.5s, *à améliorer* ≤ 4s, *mauvais* > 4s.
- **CLS**: *bon* ≤ 0.1, *à améliorer* ≤ 0.25, *mauvais* > 0.25.
- **INP**: *bon* ≤ 200ms, *à améliorer* ≤ 500ms, *mauvais* > 500ms.

> ⚠️ Les seuils sont des **repères**; validez sur **profils d’appareils/réseaux** réels.

---

## 🧠 2. Mesurer avec `PerformanceObserver` (JS)

### 💡 Exemple — LCP, CLS, INP
```js
// LCP
const poLCP = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('[LCP]', entry.startTime.toFixed(0), 'ms', entry);
  }
});
poLCP.observe({ type: 'largest-contentful-paint', buffered: true });

// CLS — accumulation des layout shifts
let clsValue = 0;
const poCLS = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value; // entry.value = impact fraction * distance fraction
      console.log('[CLS cumul]', clsValue.toFixed(3));
    }
  }
});
poCLS.observe({ type: 'layout-shift', buffered: true });

// INP (latence max d'interaction)
let inp = 0;
const poINP = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    inp = Math.max(inp, entry.processingEnd - entry.startTime);
    console.log('[INP]', Math.round(inp), 'ms');
  }
});
poINP.observe({ type: 'event', buffered: true, durationThreshold: 0 });
```

### 🧮 Formule CLS (intuition en JS)
```js
// Impact fraction = surface instable / surface viewport
// Distance fraction = distance du déplacment / dimension viewport
function clsContribution(impactFraction, distanceFraction){
  return impactFraction * distanceFraction; // à sommer sur les shifts
}
console.log('Exemple CLS contrib:', clsContribution(0.3, 0.5)); // 0.15
```

---

## 🧠 3. Profilage & Audit

### 🛠 Outils
- **Chrome DevTools**: onglet **Performance** (timeline), **Performance Insights**.
- **Lighthouse** (intégré DevTools): audits de **Perf**/**A11y**/**SEO**.
- **Coverage** (DevTools): code utilisé vs **dead code**.

### 💡 Méthode d’audit
1. Profil en **mode mobile** (CPU ralenti ×4, réseau 3G/4G simulé).
2. Identifier **LCP** (élément et ressource); mesurer **CLS**.
3. Lister scripts lourds (bundle, **long tasks**) et **blocking** (TBT).
4. Cibler images non optimisées, fonts, CSS bloquant, **render‑blocking** JS.
5. Prioriser actions: **impact** × **effort**.

---

## 🧠 4. Optimisations Images

### ✅ Bonnes pratiques
- Formats modernes: **AVIF/WebP** avec fallback si nécessaire.
- **Responsive**: `srcset`, `sizes`, **lazy‑loading** (`loading="lazy"`).
- **Dimensionner** explicitement (éviter CLS), utiliser `aspect-ratio`.
- **CDN** images (redimensionnement à la volée).

### 💡 Exemple
```html
<img
  src="/img/hero-800.webp"
  srcset="/img/hero-480.webp 480w, /img/hero-800.webp 800w, /img/hero-1200.webp 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  alt="Bannière du produit"
  loading="lazy"
  width="1200" height="600"
/>
```

---

## 🧠 5. Optimisations Fonts

### ✅ Bonnes pratiques
- **Preload** de la police principale: `<link rel="preload" as="font" crossorigin>`.
- `font-display: swap` ou `optional` pour limiter **FOIT**.
- **Subset** (latin, fr) pour réduire taille.

### 💡 Exemple
```html
<link rel="preload" as="font" href="/fonts/Inter-400.woff2" type="font/woff2" crossorigin>
<style>
@font-face { font-family: Inter; src: url(/fonts/Inter-400.woff2) format('woff2'); font-display: swap; }
body { font-family: Inter, system-ui, sans-serif; }
</style>
```

---

## 🧠 6. Scripts, Bundling, Code Splitting

### ✅ Stratégies
- **ESM** + **tree‑shaking**; éviter **side effects**.
- **Split** par routes/feature; **lazy‑load**.
- **Déférer** les scripts (`type="module" defer`) et **préconnect** aux domaines externes.

### 💡 Resource hints
```html
<link rel="preconnect" href="https://api.example.com" crossorigin>
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="prefetch" href="/route-lente.js" as="script">
<link rel="preload" href="/critical.css" as="style">
```

### 🧮 Estimation temps de download (JS)
```js
function dlTimeMs(sizeKB, netMbps=10){
  const bits = sizeKB * 1024 * 8;
  return Math.round(bits / (netMbps * 1e6) * 1000);
}
console.log('Téléchargement 300KB @10Mbps ≈', dlTimeMs(300), 'ms');
```

---

## 🧠 7. CSS & rendu

### ✅ Bonnes pratiques
- Inline du **CSS critique** (Above‑the‑fold), le reste **deferred**.
- **Reduce** animations coûteuses; privilégier `transform`/`opacity`.
- **Containment** (`contain`) pour isoler le rendu.

### 💡 Exemple
```html
<link rel="preload" href="/critical.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/critical.css"></noscript>
```

---

## 🧠 8. Cache HTTP & Storage

### ✅ Bonnes pratiques
- **Cache‑Control** avec durées adaptées; **immutable** pour assets versionnés.
- **ETag**/**Last‑Modified** pour HTML/API.
- **Service Worker** (aperçu) pour cache offline.

### 💡 Exemple (HTTP headers)
```
Cache-Control: public, max-age=31536000, immutable
ETag: "abc123"
```

---

## 🧠 9. Accessibilité avancée (A11y)

### ✅ Focus management & modales
- **Piège de focus** dans modales; **restore** du focus à la fermeture.
- **Skip‑link** au contenu principal.

### 💡 Modale accessible
```html
<button id="open">Ouvrir</button>
<div id="modal" role="dialog" aria-modal="true" aria-labelledby="mt" hidden>
  <h2 id="mt">Paramètres</h2>
  <button id="close">Fermer</button>
</div>
<script>
const open = document.getElementById('open');
const close = document.getElementById('close');
const modal = document.getElementById('modal');
let lastFocus;
open.addEventListener('click', () => {
  lastFocus = document.activeElement; modal.hidden = false;
  modal.querySelector('button')?.focus();
});
close.addEventListener('click', () => {
  modal.hidden = true; lastFocus?.focus();
});
</script>
```

### ✅ Lecteurs d’écran & Live regions
- Utiliser `aria-live="polite|assertive"` pour **notifications**.
- Eviter les contenus **dynamiques** non annoncés.

### ✅ Formulaires complets
- Labels associés, aides (`aria-describedby`), **erreurs** (`aria-invalid`) annoncées.
- **Ordre de tabulation** naturel, `:focus-visible` pour **focus**.

---

## 🧠 10. SEO côté Front

### ✅ Métadonnées essentielles
```html
<title>Nom de la page</title>
<meta name="description" content="Résumé pertinent (≤ 160 caractères)">
<link rel="canonical" href="https://exemple.com/page">
<meta name="robots" content="index,follow">
```

### 💡 Open Graph & Twitter Cards
```html
<meta property="og:title" content="Titre partage">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://exemple.com/og.jpg">
<meta name="twitter:card" content="summary_large_image">
```

### 💡 Données structurées (JSON‑LD)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Guide de performance Web",
  "author": { "@type": "Person", "name": "Eric" },
  "datePublished": "2025-12-21",
  "image": "https://exemple.com/og.jpg"
}
</script>
```

### 🧠 SPA vs SSR/SSG
- **SPA**: rendu côté client; nécessite **hydration** et **pré‑rendu**/rendering côté serveur pour SEO (ou **dynamic rendering**).
- **SSR/SSG** (ex. Nuxt, Next): HTML **pré‑rendu**, meilleur SEO et **TTI** parfois plus rapide; attention au **coût de hydration**.

---

## 🧠 11. Performance & A11y: Plan d’actions type

### 📋 Actions
1. **Images**: AVIF/WebP, `srcset`, `lazy`, dimensions fixées.
2. **Fonts**: preload + `font-display`; subset.
3. **JS**: splitting, `preconnect`, removal de **dead code**, **defer**.
4. **CSS**: critical inline, animations optimisées.
5. **Cache**: headers agressifs pour assets, ETag pour HTML.
6. **A11y**: focus management, erreurs formulaires, live regions.
7. **SEO**: meta + JSON‑LD + canonical.

### 🧮 Budgets (JS)
```js
// Exemple de suivi simple des budgets
const budgets = { jsInitialKB: 200, imgTotalKB: 1000 };
function withinBudget(current, budget){ return current <= budget; }
console.log('JS initial OK?', withinBudget(180, budgets.jsInitialKB));
```

---

## 🧪 12. Exercices guidés

1. **Observer**: Ajoutez `PerformanceObserver` pour LCP/CLS/INP, consignez en console et identifiez l’élément LCP.
2. **Images**: Convertissez les images héro en WebP + `srcset/sizes`; mesurez le gain.
3. **Fonts**: Ajoutez `preload` + `font-display`; observez l’effet sur FCP.
4. **Splitting**: Scindez une route lourde; mesurez le gain avec Coverage.
5. **A11y**: Implémentez une modale accessible (piège de focus + restore + rôle).
6. **SEO**: Ajoutez metadata + Open Graph + JSON‑LD à une page.
7. **Plan**: Définissez un **plan d’actions** priorisé et refaites l’audit.

---

## ✅ 13. Check‑list Performance • A11y • SEO

- [ ] LCP ≤ 2.5s sur mobile (réel), CLS ≤ 0.1, INP ≤ 200ms.
- [ ] Images **responsives**, dimensions fixes, **lazy‑load**.
- [ ] Fonts **preload** + `font-display`.
- [ ] JS initial sous **budget**, splitting actif, **dead code** supprimé.
- [ ] CSS critique inline; animations à base de `transform`/`opacity`.
- [ ] Focus management, **skip‑link**, erreurs formulaires annoncées.
- [ ] Meta (title/description), Open Graph/Twitter, **JSON‑LD**, canonical.
- [ ] Cache headers et CDN si possible.

---

## 📦 Livrable du chapitre
Un **audit** (DevTools/Lighthouse) + **plan d’optimisation** appliqué à l’app Vue: images, fonts, splitting, hints, A11y, SEO, avec **mesures avant/après**.

---

## 🔚 Résumé essentiel du Chapitre 11
- Les **Web Vitals** (LCP/CLS/INP) guident l’optimisation **centrée utilisateur**.
- Mesurez avec `PerformanceObserver` et **DevTools**; ciblez **long tasks** et **render‑blocking**.
- Les **images**, **fonts**, **JS/CSS** et **cache** sont les leviers majeurs.
- L’**accessibilité** avancée (focus/modales/lecteurs d’écran) et le **SEO** (meta/JSON‑LD) s’intègrent au **pipeline**.
- Un **plan d’actions** priorisé avec **budgets** permet de pérenniser les gains.

---

> Prochain chapitre: **Git, GitHub, Branching & CI** — stratégies de branches, PR, **GitHub Actions** (lint, build, tests) et versioning sémantique.
