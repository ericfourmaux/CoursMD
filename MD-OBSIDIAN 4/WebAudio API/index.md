---
title: "Cours Web Audio API — Index (Syllabus)"
tags: ["Web Audio API", "Syllabus", "Index", "Obsidian"]
icon: "🗺️"
created: "2025-12-21"
---

# 🗺️ Cours complet Web Audio API — Index (Syllabus)

> Ce dossier contient les chapitres du cours, prêts pour Obsidian. Chaque note suit une structure pédagogique avec icônes, schémas (Mermaid), formules en JavaScript, exemples concrets, exercices, et un résumé final.

## 🏷️ Légende des icônes
- 📘 Chapitre
- 🎯 Objectifs
- 🧠 Concept clé
- 🧪 Exemple / Démo
- 🔧 Pratique / Exercice
- 🧩 Schéma
- 📎 Fichier livré (.md)
- 💡 Astuce
- ⚠️ Attention
- 🛠️ Outils / Setup

---

## 📚 Syllabus (chapitres)

### 📘 00 — Introduction & Environnement
- 🎯 **Objectifs** : Comprendre la Web Audio API, ses cas d’usage, et préparer l’environnement (Vite/Webpack, TS optionnel).
- 🧠 **Points essentiels** : Différence `<audio>`/`MediaElement` vs `AudioContext`; politique d’autoplay et geste utilisateur; graphe de nœuds.
- 🧪 **Exemples** : `AudioContext`, `OscillatorNode`, `GainNode`, démarrage sur click.
- 📎 **Fichier** : `00-Introduction.md`

### 📘 01 — Bases du son (physique et numérique)
- 🎯 **Objectifs** : Fréquence, amplitude, phase, formes d’onde; échantillonnage, Nyquist, aliasing, quantification, dB et dynamique.
- 🧠 **Points essentiels** : `T = 1/f`, `ω = 2πf`, sinusoïde `x(t) = A·sin(ωt + φ)`; `fs` et bande utile `fs/2`; quantification et dynamique `≈ 6.02·bits + 1.76 dB`.
- 🧪 **Exemples** : Générer 440 Hz, visualiser signal (Canvas), aliasing contrôlé.
- 📎 **Fichier** : `01-Bases-du-son.md`

### 📘 02 — Architecture de la Web Audio API
- 🎯 **Objectifs** : AudioGraph, nœuds sources/traitements/destination, connexions et routing.
- 🧠 **Points essentiels** : Fan-in/fan-out, `connect()`/`disconnect()`, cycles à éviter, niveaux.
- 🧪 **Exemples** : Deux oscillateurs → mix → filtre → destination.
- 📎 **Fichier** : `02-Architecture.md`

### 📘 03 — Oscillateurs et synthèse de base
- 🎯 **Objectifs** : `OscillatorNode` (sine, square, saw, triangle), pitch & start/stop.
- 🧠 **Points essentiels** : Timbre vs forme d’onde, transposition par demi-tons.
- 🧪 **Exemples** : Mini-synth mono (clavier → fréquence).
- 📎 **Fichier** : `03-Oscillateurs.md`

### 📘 04 — Gain, enveloppes, et automatisations
- 🎯 **Objectifs** : `GainNode`, enveloppe **ADSR**, automations temporelles.
- 🧠 **Points essentiels** : `setValueAtTime`, `linearRampToValueAtTime`, `exponentialRampToValueAtTime`, `setTargetAtTime`.
- 🧪 **Exemples** : Note avec ADSR, portamento.
- 📎 **Fichier** : `04-Gain-et-Enveloppes.md`

### 📘 05 — Filtres (EQ) et modelage du timbre
- 🎯 **Objectifs** : `BiquadFilterNode` (low/high/bandpass), `Q`, balayeurs.
- 🧠 **Points essentiels** : Filtrage comme "lunettes" du son; contrôle du contenu spectral.
- 🧪 **Exemples** : Effet wah (LFO) sur low-pass.
- 📎 **Fichier** : `05-Filtres.md`

### 📘 06 — Temps et scheduling précis
- 🎯 **Objectifs** : Planification au `currentTime`, différence avec `setTimeout`.
- 🧠 **Points essentiels** : Clock Audio, lookahead, agenda d’événements.
- 🧪 **Exemples** : Séquenceur 16 pas au tempo.
- 📎 **Fichier** : `06-Scheduling.md`

### 📘 07 — Fichiers audio, buffers et lecture
- 🎯 **Objectifs** : `fetch` + `decodeAudioData`, `AudioBufferSourceNode`, `MediaElementAudioSourceNode`.
- 🧠 **Points essentiels** : Lecture one-shot, boucles, `playbackRate`.
- 🧪 **Exemples** : Lecteur de samples.
- 📎 **Fichier** : `07-Buffers-et-Lecture.md`

### 📘 08 — Analyse et visualisation (FFT)
- 🎯 **Objectifs** : `AnalyserNode`, time-domain & frequency data.
- 🧠 **Points essentiels** : FFT size, smoothing; spectre vs oscillogramme.
- 🧪 **Exemples** : Oscilloscope + spectre sur Canvas.
- 📎 **Fichier** : `08-Analyse-et-Visualisation.md`

### 📘 09 — Spatialisation et panorama
- 🎯 **Objectifs** : `StereoPannerNode`, `PannerNode` (HRTF).
- 🧠 **Points essentiels** : Position, distance, rolloff, cones.
- 🧪 **Exemples** : Contrôles 2D de pan/distance.
- 📎 **Fichier** : `09-Spatialisation.md`

### 📘 10 — Effets (Delay, Reverb, Distorsion, Compresseur)
- 🎯 **Objectifs** : Chaînage d’effets courants.
- 🧠 **Points essentiels** : `DelayNode`, `ConvolverNode`, `WaveShaperNode`, `DynamicsCompressorNode`.
- 🧪 **Exemples** : Pedalboard virtuel.
- 📎 **Fichier** : `10-Effets.md`

### 📘 11 — Microphone et traitement en temps réel
- 🎯 **Objectifs** : `getUserMedia`, `MediaStreamAudioSourceNode`, latence et permissions.
- 🧠 **Points essentiels** : Écho/acoustique, sécurité, UI.
- 🧪 **Exemples** : VU-mètre du micro + gate.
- 📎 **Fichier** : `11-Microphone-Temps-reel.md`

### 📘 12 — AudioWorklet (processing custom) & WASM (intro)
- 🎯 **Objectifs** : `AudioWorkletProcessor`, paramètres, DSP simple, intro WASM.
- 🧠 **Points essentiels** : Frontière main/audio, perf et déterminisme.
- 🧪 **Exemples** : `MyGainProcessor` + LFO.
- 📎 **Fichier** : `12-AudioWorklet-et-WASM.md`

### 📘 13 — OfflineAudioContext (rendu hors temps réel)
- 🎯 **Objectifs** : Rendu non temps réel, export.
- 🧠 **Points essentiels** : Normalisation, batch processing.
- 🧪 **Exemples** : Export WAV d’un motif.
- 📎 **Fichier** : `13-OfflineAudioContext.md`

### 📘 14 — Performance, mémoire, et robustesse
- 🎯 **Objectifs** : Profiling, optimisation, gestion des ressources.
- 🧠 **Points essentiels** : Pools de nœuds, GC, leaks.
- 🧪 **Exemples** : Bench création/destroy vs pool.
- 📎 **Fichier** : `14-Performance-et-Robustesse.md`

### 📘 15 — Politiques, accessibilité, UX et mobile
- 🎯 **Objectifs** : Autoplay, gestes, A11y, mobile.
- 🧠 **Points essentiels** : `resume()`/`suspend()`, feedbacks visuels/haptiques.
- 🧪 **Exemples** : Bouton "Activer le son" robuste.
- 📎 **Fichier** : `15-Politiques-UX-A11y.md`

### 📘 16 — Tests et debugging
- 🎯 **Objectifs** : Tests unitaires et intégration; DevTools audio.
- 🧠 **Points essentiels** : Mock de time, stubs de nœuds.
- 🧪 **Exemples** : Planificateur musical testé.
- 📎 **Fichier** : `16-Tests-et-Debug.md`

### 📘 17 — Intégration : TypeScript, bundlers et frameworks
- 🎯 **Objectifs** : Typage, organisation, Vite/Webpack, Vue/React.
- 🧠 **Points essentiels** : Service `AudioEngine`, composables/hooks.
- 🧪 **Exemples** : `useAudioEngine()` (Vue 3).
- 📎 **Fichier** : `17-Integration-TS-Bundlers-Frameworks.md`

### 📘 18 — Projets fil rouge (capstones)
- 🎯 **Objectifs** : Consolidation par projets.
- 🧠 **Points essentiels** : Synth poly, drum machine, sampler.
- 🧪 **Exemples** : Trois projets complets.
- 📎 **Fichier** : `18-Projets-Fil-Rouge.md`

### 📘 19 — Annexes : formules, tableaux utilitaires, snippets
- 🎯 **Objectifs** : Tables et conversions d’usage.
- 🧠 **Points essentiels** : dB ↔ linéaire, notes ↔ Hz, BPM ↔ ms.
- 🧪 **Exemples** : Snippets prêt-à-coller.
- 📎 **Fichier** : `19-Annexes-Formules-et-Snippets.md`

---

## 🧭 Conseils d’utilisation
- Ouvrir ce dossier dans **Obsidian**.
- Naviguer chapitre par chapitre; chaque note contient exercices et un résumé.
- Expérimenter le code directement dans le navigateur avec un serveur local (Vite/Webpack) quand indiqué.
