# WebCPC Re‑Orchestrator

> Re‑orchestration “chiptune CPC” en **Vanilla JavaScript** avec **instruments générés dynamiquement** (aucun sample), séquenceur temps réel, **synthèse AudioWorklet**, et **export MP3** via `lame.js`.

## ✨ Fonctionnalités

- **Synthèse dynamique** (pas de fichiers audio) :
  - **Kick** (sinus + pitch envelope + drive),
  - **Snare** (burst de bruit + band‑pass résonant),
  - **Hi‑hat** (bruit + high‑pass + enveloppe rapide),
  - **Synth polyphonique** (saw + FM légère, **ADSR**, filtre simplifié, drive), côté **AudioWorklet**.
- **Séquenceur** 16 pas, lookahead précis, basé sur `AudioContext.currentTime`.
- **Contrôles UI** : tempo, cutoff, résonance, attack (exposés via `AudioParam`).
- **Export hors‑ligne** :
  - rendu **OfflineAudioContext** (plus vite que temps réel),
  - encodage **MP3** avec `lame.js`.

> Pourquoi AudioWorklet ? Il exécute le DSP sur le thread audio (AudioWorkletGlobalScope) pour une **latence faible** et un **timing stable**. Pourquoi OfflineAudioContext ? Pour **rendre un graphe audio vers un buffer** sans passer par la sortie audio, **aussi vite que possible**. [1](https://glitch.com/~meyda-tutorial)[2](https://github.com/meyda/meyda)[3](https://github.com/Logon-System/YM-Tools)

---

## 🗂️ Arborescence
webcpc-reorch/
├─ public/
│  ├─ index.html           # UI minimale + inclusion lame.min.js (CDN)
│  ├─ style.css
│  └─ libs/
│     └─ lame.min.js      # (optionnel) si tu veux une copie locale au lieu du CDN
├─ src/
│  ├─ audio/
│  │  ├─ AudioEngine.js    # initialisation AudioContext, chargement des worklets
│  │  ├─ Exporter.js       # OfflineAudioContext + encodage MP3 (lamejs)
│  │  └─ Scheduler.js      # lookahead + scheduling des events
│  ├─ instruments/
│  │  ├─ Instruments.js    # API haut-niveau: createKick/Snare/Hat/Synth noteOn/noteOff
│  │  └─ params.js         # (optionnel) presets/enveloppes
│  ├─ worklets/
│  │  ├─ voice-processor.js # synthé poly: saw+FM, ADSR, drive
│  │  ├─ noise-processor.js # bruit blanc (snare/hat)
│  │  └─ bus-processor.js   # (optionnel) post-traitement bus (drive/DC-block/limiter)
│  ├─ sequencer/
│  │  └─ Sequencer.js       # patterns 16 pas, mapping vers instruments dynamiques
│  ├─ ui/
│  │  └─ controls.js        # binding UI -> AudioParams
│  └─ main.js               # bootstrap (engine + instruments + sequencer + UI)
├─ package.json
└─ README.md

---

## 🚀 Démarrage rapide

### 1) Prérequis

- Navigateur moderne (**AudioWorklet** et **OfflineAudioContext** sont largement supportés) ; HTTPS recommandé pour certaines APIs. [1](https://glitch.com/~meyda-tutorial)
- Serveur statique (ex. `npx serve`, `python -m http.server`, Vite/Parcel).

### 2) Installation & lancement

```bash
# Cloner le projet
git clone <TON_REPO_URL>
cd webcpc-reorch

# (Optionnel) installer un serveur local
npm i -g serve
serve public
# ou :
python -m http.server 8000  # puis ouvre http://localhost:8000/public/index.html

Pour charger lame.min.js, tu peux utiliser un CDN fiable :
https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js ou https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js. [geocities.ws], [genesis8bit.fr]

