---
title: "13 — OfflineAudioContext (rendu hors temps réel, mixdown & export)"
tags: ["Web Audio API", "OfflineAudioContext", "startRendering", "AudioBuffer", "mixdown", "normalisation", "export WAV", "batch processing", "limitations"]
icon: "📘"
created: "2025-12-21"
---

# 📘 13 — OfflineAudioContext (rendu hors temps réel, mixdown & export)

> 🎯 **Objectif du chapitre** : Apprendre à utiliser **OfflineAudioContext** pour **rendre** un graphe audio **hors temps réel**, réaliser un **mixdown**, **normaliser** le signal et **exporter** en **WAV**. Tu verras comment construire un projet offline, planifier les événements, traiter plusieurs sources (**batch processing**) et les **limites** à connaître.

---

## 🧠 Pourquoi un rendu hors temps réel ?

- **Définition** : `OfflineAudioContext` calcule un graphe audio **aussi vite que possible**, sans dépendre d’une carte son ni de l’UI. On obtient un **`AudioBuffer` final** que l’on peut **analyser** ou **sauvegarder**.
- **Pourquoi** : exporter des **boucles**, des **mix**, appliquer des **effets** intensifs (reverb, convolution) sans glitch, pré‑calculer des **assets**, réaliser des **tests** et mesures.
- **Analogie** : comme **rendre** une image en haute qualité en arrière‑plan vs l’afficher en direct.

---

## 🧠 API & paramètres principaux

- **Construction** :
  ```js
  // OfflineAudioContext(numberOfChannels, lengthInFrames, sampleRate)
  const sr = 44100;
  const seconds = 4.0;
  const channels = 2;
  const length = Math.floor(sr * seconds); // frames
  const offline = new OfflineAudioContext(channels, length, sr);
  ```
- **Temps & scheduling** : `offline.currentTime` **avance pendant le rendu**; on planifie avec `start(when)` et automations comme en temps réel.
- **Rendu** :
  ```js
  const renderedBuffer = await offline.startRendering();
  // ou: offline.oncomplete = (e) => { const renderedBuffer = e.renderedBuffer; };
  ```
- **Sources autorisées** : `OscillatorNode`, `AudioBufferSourceNode`, etc. **Non autorisés**: `MediaStreamAudioSourceNode`, `MediaElementAudioSourceNode`.

---

## 🧪 Mixdown offline — exemple complet

```js
async function renderMixdown({sr=44100, seconds=4}={}){
  const channels = 2;
  const length = Math.floor(sr * seconds);
  const ctx = new OfflineAudioContext(channels, length, sr);

  // Piste 1: oscillateur basse
  const bass = ctx.createOscillator(); bass.type = 'sawtooth'; bass.frequency.value = 110;
  const bassAmp = ctx.createGain(); bassAmp.gain.value = 0.35;
  bass.connect(bassAmp);

  // Piste 2: lead
  const lead = ctx.createOscillator(); lead.type = 'triangle'; lead.frequency.value = 440;
  const leadAmp = ctx.createGain(); leadAmp.gain.value = 0.25;
  const leadDelay = ctx.createDelay(); leadDelay.delayTime.value = 0.22;
  const fb = ctx.createGain(); fb.gain.value = 0.3; leadDelay.connect(fb).connect(leadDelay);
  lead.connect(leadDelay).connect(leadAmp);

  // Bus reverb (convolver)
  const rev = ctx.createConvolver();
  rev.buffer = makeExponentialIR(ctx, 2.5, 2.2); // cf. chap. 10
  const sendBass = ctx.createGain(); sendBass.gain.value = 0.2; bassAmp.connect(sendBass).connect(rev);
  const sendLead = ctx.createGain(); sendLead.gain.value = 0.4; leadAmp.connect(sendLead).connect(rev);

  // Mix bus
  const mix = ctx.createGain(); mix.gain.value = 0.9;
  bassAmp.connect(mix);
  leadAmp.connect(mix);
  const wetRev = ctx.createGain(); wetRev.gain.value = 0.25; rev.connect(wetRev).connect(mix);

  // Sortie
  mix.connect(ctx.destination);

  // Scheduling
  const t0 = 0.0;
  bass.start(t0);
  lead.start(t0 + 0.1); // démarrage légèrement après
  bass.stop(seconds);
  lead.stop(seconds);

  const rendered = await ctx.startRendering();
  return rendered; // AudioBuffer
}
```

> 💡 **Note** : Les **automations** (`setValueAtTime`, `linearRampToValueAtTime`, etc.) fonctionnent en offline comme en temps réel.

---

## 🧠 Normalisation (peak) & dB (JS)

- **Trouver le pic** :
  ```js
  function findPeak(buf){
    let peak = 0;
    for(let ch=0; ch<buf.numberOfChannels; ch++){
      const data = buf.getChannelData(ch);
      for(let i=0; i<data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    }
    return peak; // 0..1
  }
  ```
- **Appliquer un gain pour viser −1 dBFS** :
  ```js
  function dbToLinear(db){ return Math.pow(10, db/20); }
  function normalizeToMinus1dB(buf){
    const target = dbToLinear(-1);
    const peak = findPeak(buf);
    const g = peak > 0 ? target / peak : 1;
    for(let ch=0; ch<buf.numberOfChannels; ch++){
      const data = buf.getChannelData(ch);
      for(let i=0;i<data.length;i++) data[i] *= g;
    }
    return g; // gain appliqué
  }
  ```

> 💡 **Astuce** : Pour préserver la **musicalité**, applique une **limite** au gain de normalisation (ex. max +6 dB).

---

## 🧠 Export **WAV** (PCM 16‑bit) depuis `AudioBuffer`

```js
function audioBufferToWav(buf, {float32=false}={}){
  const numCh = buf.numberOfChannels;
  const sr = buf.sampleRate;
  const len = buf.length;
  const bytesPerSample = float32 ? 4 : 2;
  const blockAlign = numCh * bytesPerSample;
  const byteRate = sr * blockAlign;
  const dataBytes = len * blockAlign;
  const headerBytes = 44;
  const totalBytes = headerBytes + dataBytes;
  const out = new DataView(new ArrayBuffer(totalBytes));

  // RIFF/WAVE header
  function writeStr(off, s){ for(let i=0;i<s.length;i++) out.setUint8(off+i, s.charCodeAt(i)); }
  let off = 0;
  writeStr(off, 'RIFF'); off += 4;
  out.setUint32(off, totalBytes - 8, true); off += 4; // file size
  writeStr(off, 'WAVE'); off += 4;
  writeStr(off, 'fmt '); off += 4;
  out.setUint32(off, 16, true); off += 4;              // fmt chunk size
  out.setUint16(off, float32 ? 3 : 1, true); off += 2; // format: 1=PCM, 3=IEEE float
  out.setUint16(off, numCh, true); off += 2;
  out.setUint32(off, sr, true); off += 4;
  out.setUint32(off, byteRate, true); off += 4;
  out.setUint16(off, blockAlign, true); off += 2;
  out.setUint16(off, float32 ? 32 : 16, true); off += 2; // bits/sample
  writeStr(off, 'data'); off += 4;
  out.setUint32(off, dataBytes, true); off += 4;

  // Interleave & write samples
  const chans = [];
  for(let ch=0; ch<numCh; ch++) chans[ch] = buf.getChannelData(ch);
  for(let i=0; i<len; i++){
    for(let ch=0; ch<numCh; ch++){
      const s = Math.max(-1, Math.min(1, chans[ch][i]));
      if (float32) {
        out.setFloat32(off, s, true); off += 4;
      } else {
        out.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
      }
    }
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
```

### 🔧 Téléchargement du fichier
```js
function downloadBlob(blob, filename='render.wav'){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a);
  a.click(); a.remove(); URL.revokeObjectURL(url);
}
```

---

## 🧠 Workflow complet : render → normalise → export

```js
async function renderExport(){
  const buf = await renderMixdown({ sr: 44100, seconds: 4 });
  normalizeToMinus1dB(buf);
  const blob = audioBufferToWav(buf, { float32: false }); // PCM 16‑bit
  downloadBlob(blob, 'mixdown.wav');
}
```

### 🧩 Schéma (Mermaid)
```mermaid
graph LR
  Build[Construire OfflineAudioContext] --> Graph[Créer le graphe]
  Graph --> Render[startRendering]
  Render --> Buf[AudioBuffer]
  Buf --> Norm[Normalisation]
  Norm --> WAV[Encodage WAV]
  WAV --> DL[Téléchargement]
```

---

## 🧠 Batch processing (plusieurs sources)

```js
async function batchRender(urls){
  const results = [];
  for(const url of urls){
    // Exemple minimal: charger un buffer et le passer dans une chaîne offline
    const sr = 44100, seconds = 3;
    const offline = new OfflineAudioContext(2, Math.floor(sr*seconds), sr);
    const res = await fetch(url); const ab = await res.arrayBuffer();
    const buf = await offline.decodeAudioData(ab);
    const src = offline.createBufferSource(); src.buffer = buf;
    const lpf = offline.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 6000;
    src.connect(lpf).connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();
    normalizeToMinus1dB(rendered);
    const wav = audioBufferToWav(rendered);
    results.push({ url, wav });
  }
  return results; // tableau de Blob WAV
}
```

> 💡 **Astuce** : enchaîne les rendus **séquentiellement** pour éviter de saturer le CPU/mémoire.

---

## 🧠 Limitations & points d’attention

- **Sources live** (`MediaStream`, `<audio>`) **non supportées** en offline.
- **Taille du buffer** : trop longue → **mémoire** élevée. Rendre par **segments** si nécessaire.
- **Effets** lourds : la convolution (reverb) augmente le **temps de calcul**; adapter `seconds` et `sr`.
- **Sample rate** : choisir `sr` adapté à l’usage (CD 44.1 kHz, vidéo 48 kHz).
- **Compatibilité** : vérifier que le navigateur gère bien **OfflineAudioContext** (les versions modernes oui).

---

## 🔧 Exercices (progressifs)

1. **Mixdown** : crée un mix de 3 pistes (basse/lead/percus) et exporte en **WAV**.
2. **Normalisation** : implémente une **limite** de gain (max +6 dB) et compare.
3. **Dither (optionnel)** : ajoute un bruit blanc très faible avant export pour réduire la **quantification**.
4. **Batch** : applique un **lowpass** + **normalisation** sur 5 fichiers et télécharge chaque WAV.
5. **Mesure** : calcule le **RMS global** du rendu et consigne le résultat.
6. **Segments** : rends 30 s en 3 segments de 10 s, assemble les WAV (bonus).

---

## 💡 Astuces & bonnes pratiques

- **Préparer** les automations **avant** `startRendering()`.
- **Réutiliser** des fonctions utilitaires (normalize, export) dans un **module**.
- **Tester** différentes tailles `fftSize` **après** rendu (chap. 8) pour analyser.
- **Nommer** les fichiers exportés avec **métadonnées** (bpm, sr, date).

---

## ⚠️ Pièges fréquents

- **Oublier** de connecter la chaîne à `offline.destination` → rendu **silencieux**.
- **Start/Stop** mal planifiés → sources absentes; toujours `start(when)` dans la fenêtre.
- **Gain trop élevé** → clipping; appliquer **normalisation**.

---

## 🧾 Résumé du chapitre (points clés)

- **OfflineAudioContext** rend un graphe **sans latence**, retourne un **AudioBuffer**.
- **Planification** comme en temps réel; **sources live** non supportées.
- **Normalisation** : trouver le **peak**, appliquer **gain** (ex. −1 dBFS).
- **Export** : construire un **WAV** (PCM 16‑bit ou Float32) et **télécharger**.
- **Batch** : traiter **plusieurs fichiers** séquentiellement.

---

> ✅ **Prochaines étapes** : **Chapitre 14 — Performance, mémoire, et robustesse** : profiling, optimisation des graphes, et gestion des ressources.
