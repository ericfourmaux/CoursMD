---
title: "15 — Politiques, accessibilité, UX et mobile"
tags: ["Web Audio API", "autoplay", "gesture", "resume", "suspend", "visibilitychange", "A11y", "ARIA", "keyboard", "volume", "mobile", "battery", "latence", "permissions", "UX"]
icon: "📘"
created: "2025-12-21"
---

# 📘 15 — Politiques, accessibilité, UX et mobile

> 🎯 **Objectif du chapitre** : Concevoir une expérience **fiable** et **inclusive** avec la Web Audio API : respecter les **politiques d’autoplay**, gérer `resume()`/`suspend()` et la **visibilité** de la page, proposer une **UX** claire (bouton "Activer le son", états, erreurs), appliquer des **bonnes pratiques A11y** (clavier, ARIA, limites de volume, feedbacks visuels), et tenir compte des **spécificités mobile** (latence, batterie, interruptions, orientation).

---

## 🧠 Politiques d’autoplay & gestes utilisateur

- **Principe** : la plupart des navigateurs **interdisent** le démarrage audio **sans interaction explicite**. Il faut déclencher `ctx.resume()` dans un **gestionnaire d’événement utilisateur** (`click`, `touchstart`, `keydown`).
- **Recommandation** : afficher un **bouton** explicite “🎵 Activer le son” dès le premier écran, et ne rien jouer tant qu’il n’a pas été activé.

### 🔧 Bouton "Activer le son" (robuste)
```html
<button id="enable-audio" aria-label="Activer le son">🎵 Activer le son</button>
<div id="status" role="status" aria-live="polite"></div>
<script>
const ctx = new (window.AudioContext || window.webkitAudioContext)();
let initialized = false;

async function initAudioOnce(){
  if (initialized) return;
  try {
    // Exemple minimal: init graphe silencieux pour "amorcer" le contexte
    const osc = ctx.createOscillator();
    const gain = ctx.createGain(); gain.gain.value = 0; // silence
    osc.connect(gain).connect(ctx.destination);
    await ctx.resume(); // doit être dans le handler utilisateur
    osc.start(); osc.stop(ctx.currentTime + 0.05);
    initialized = true;
    status.textContent = 'Audio activé';
    enableBtn.disabled = true;
  } catch (e) {
    status.textContent = 'Échec de l’activation: ' + e.message;
  }
}

const enableBtn = document.getElementById('enable-audio');
const status = document.getElementById('status');
enableBtn.addEventListener('click', initAudioOnce);
// Option: clavier
enableBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') initAudioOnce(); });
</script>
```

> 💡 **Astuce** : si tu utilises un framework (Vue/React), place la logique d’activation dans un composable/hook global (ex. `useAudioEngine()`), et **désactive** les éléments UI qui dépendraient de l’audio tant que le contexte n’est pas `running`.

---

## 🧠 `resume()` / `suspend()` & états du contexte

- **États** : `running` (actif), `suspended` (pause), `closed` (définitif).
- **Usage** :
  - `ctx.resume()` pour **reprendre** après une interaction.
  - `ctx.suspend()` pour **mettre en pause** (économie CPU/batterie).
  - `ctx.close()` pour **libérer** (à la fermeture de l’app).

### 🔧 Gestion du transport (Play/Pause fiable)
```js
const ctx = new AudioContext();
let playing = false;

async function play(){
  if (ctx.state !== 'running') await ctx.resume();
  // Démarrer sources/schedulers ici
  playing = true;
}

async function pause(){
  await ctx.suspend();
  // Arrêter timers UI/Worker si besoin
  playing = false;
}
```

> 💡 **Astuce** : après `suspend()`, `currentTime` **n’avance plus**. Lors de la reprise, **recalcule** les temps de planification (chap. 6) pour éviter les ratés.

---

## 🧠 Visibilité de page & cycle de vie

- **`visibilitychange`** : quand l’onglet devient **caché**, certains navigateurs **suspendent** les contextes ou réduisent les timers; adapte ton **lookahead** ou suspends l’audio.
- **Focus**/**blur** : à la **perte** de focus, évite de jouer des sons non essentiels.

### 🔧 Gestion de la visibilité
```js
function handleVisibility(ctx){
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      // Option: réduire renders UI ou suspendre l’audio
      // await ctx.suspend();
    } else {
      // Option: reprendre
      // await ctx.resume();
    }
  });
}
handleVisibility(ctx);
```

---

## 🧠 UX : états, erreurs, et feedbacks

- **États clairs** : indiquer si l’audio est **activé**, **en pause**, ou **indisponible**.
- **Erreurs** : afficher un message **lisible** (ex. permission refusée, activation impossible) avec **instructions**.
- **Feedbacks** : barre de **VU** visuelle plutôt qu’un bip inutile.

### 🔧 Exemple de gestion des erreurs d’activation
```js
async function enableAudio(ctx){
  try {
    await ctx.resume();
    ui.setStatus('Audio activé');
  } catch (e) {
    ui.setStatus('Impossible d’activer l’audio. Essayez de cliquer le bouton ou vérifiez les paramètres du navigateur.');
  }
}
```

---

## 🧠 Accessibilité (A11y) 

- **Clavier** : toutes les fonctions audio doivent être **actionnables** au **clavier** (Tab, Entrée, Espace).
- **ARIA** : utiliser rôles (`button`, `status`), `aria-live` pour les changements d’état.
- **Limites de volume** : plafonner le **master** (ex. `≤ 0.9`) et éviter les **pics** soudains (enveloppes).
- **Feedbacks alternatifs** : affichages visuels (VU, animations), **sous‑titres** / **transcriptions** pour contenu audio informatif.
- **Couleurs & contraste** : respecter un **contraste** suffisant pour les indicateurs audio.

### 🔧 Limiteur simple (anti‑pics) sur la sortie
```js
const master = ctx.createGain(); master.gain.value = 0.9;
const comp = ctx.createDynamicsCompressor();
comp.threshold.value = -12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
// Chaîne finale: mixBus.connect(comp).connect(master).connect(ctx.destination);
```

> 💡 **Astuce** : bannis les **sons inattendus** au chargement; propose un **pré‑écoute silencieuse** via VU ou un **indicateur visuel**.

---

## 🧠 Mobile : latence, batterie, interruptions

- **Latence** : varie selon l’appareil; évite les **chaînes d’effets** lourdes en mobilité.
- **Batterie** : réduire `fftSize` des `AnalyserNode`, **suspendre** quand l’app est en arrière‑plan, limiter les animations.
- **Interruptions audio** : changement de **sortie** (casque branché), notifications; surveiller les **événements** UI et réagir (mettre en pause, reprendre).
- **Orientation & gestes** : en **touch**, privilégier **gestes simples** (tap) pour l’activation.

### 🔧 Conseils pratiques (mobile)
```js
// Réduire les coûts de visualisation
analyser.fftSize = 1024; // pas plus
// Suspendre en arrière-plan
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') ctx.suspend();
});
// Reprendre à la reprise
window.addEventListener('focus', () => { if (ctx.state === 'suspended') ctx.resume(); });
```

---

## 🧩 Schémas Mermaid

### Bouton d’activation & états
```mermaid
graph LR
  UI["Bouton \n Activer le son"] --> Handler[Handler utilisateur]
  Handler --> Resume[ctx.resume()]
  Resume --> Init[Init graphe]
  Init --> OK[État: Audio activé]
  Resume --> Err[Erreur]
  Err --> Aide[Message d’aide]
```

### Visibilité & transport
```mermaid
graph LR
  Hidden[visibility=hidden] --> Suspend[ctx.suspend()]
  Visible[visibility=visible] --> Resume[ctx.resume()]
  Resume --> Replanif[Recalcule planning]
```

---

## 🔧 Exercices (progressifs)

1. **Bouton d’activation** : implémente le bouton et un indicateur d’état `aria-live`.
2. **Transport fiable** : crée Play/Pause via `resume()`/`suspend()` et vérifie que les **notes planifiées** ne ratent pas après reprise.
3. **A11y** : ajoute des **raccourcis clavier** et rôles ARIA; teste avec un lecteur d’écran.
4. **Limiteur** : intègre un compresseur en sortie et mesure l’effet sur les **pics**.
5. **Mobile** : réduit `fftSize`, suspends en arrière‑plan, et mesure l’impact sur la **batterie**.
6. **Erreurs** : simule un refus d’activation et affiche un **guide** de résolution.

---

## 💡 Astuces & bonnes pratiques

- **Toujours** demander une **action explicite** avant d’émettre du son.
- **Informer** l’utilisateur sur l’état audio (activé, coupé, volume).
- **Limiter** le volume et **aplanir** les transitoires (enveloppes/compresseur).
- **Suspends** l’audio si l’app n’est pas active; **reprends** proprement.
- **Optimise** visualisations et animations, surtout en mobilité.

---

## ⚠️ Pièges fréquents

- **Jouer au chargement** → bloqué (autoplay), ou son inattendu (mauvaise UX).
- **Ignorer la visibilité** → CPU/batterie gaspillé, risques de **glitch**.
- **Absence d’A11y** : actions non accessibles au clavier/lecteur d’écran.
- **Pics** de volume → **clipping**/**inconfort**; toujours limiter.

---

## 🧾 Résumé du chapitre (points clés)

- **Autoplay** : démarrage **uniquement** sur geste; bouton d’activation recommandé.
- **États & transport** : `resume()/suspend()/close()`; recalculer la planification après pause.
- **Visibilité** : adapter le comportement via `visibilitychange`.
- **A11y** : clavier/ARIA, limites de volume, feedbacks visuels.
- **Mobile** : latence et batterie → simplifier, suspendre en arrière‑plan, gérer interruptions.

---

> ✅ **Prochaines étapes** : **Chapitre 16 — Tests et debugging** : stratégies de tests (unitaires/integ), stubs/mocks audio, et inspection DevTools.
