---
title: "01 — Bases du son (physique et numérique)"
tags: ["Web Audio API", "bases", "DSP", "échantillonnage", "aliasing", "Nyquist", "quantification", "dB", "dynamiques"]
icon: "📘"
created: "2025-12-21"
---

# 📘 01 — Bases du son (physique et numérique)

> 🎯 **Objectif du chapitre** : T’expliquer, pas à pas, ce qu’est le son et comment il est représenté dans un ordinateur et dans la Web Audio API. À la fin, tu sauras lire/écrire des formules en JavaScript pour la fréquence, l’amplitude, la phase, l’échantillonnage, l’aliasing, la quantification, et tu pourras expérimenter sans te perdre.

---

## 🧠 Qu’est-ce que le son ? (définition, pourquoi, analogies)

- **Définition** : Le son est une **variation de pression** de l’air (ou d’un autre milieu) qui se propage sous forme d’**onde**. Quand cette onde arrive à nos oreilles, elle est convertie en signaux nerveux que le cerveau interprète.
- **Pourquoi c’est utile** en audio numérique : Pour manipuler du son avec la Web Audio API, nous représentons ces variations par une suite de **nombres** (échantillons). La précision et la fidélité dépendent de **la fréquence d’échantillonnage** et de **la quantification**.
- **Analogie** : Imagine un **océan** et sa surface qui monte/descend (= pression de l’air). Prendre une photo à intervalles réguliers de cette surface, c’est **échantillonner**. La résolution de l’appareil photo, c’est la **quantification**.

---

## 🧠 Fréquence, période, phase, amplitude

### 📌 Définitions
- **Fréquence `f` (Hz)** : nombre d’oscillations par seconde (détermine la **hauteur** perçue).
- **Période `T` (s)** : durée d’un cycle complet. Relation :
  ```js
  const T = 1 / f;    // période en secondes
  const f = 1 / T;    // fréquence en Hz
  ```
- **Phase `φ` (radians)** : décalage horizontal de l’onde.
- **Amplitude `A` (valeur relative)** : grandeur du déplacement (liée à la **intensité** perçue).
- **Pulsation `ω`** : vitesse angulaire d’oscillation.
  ```js
  const w = 2 * Math.PI * f; // ω = 2πf
  ```

### 🔢 Sinusoïde (modèle fondamental)
- **Formule continue** :
  ```js
  // x(t) = A * sin(ω * t + φ)
  function x(t, A, f, phi) {
    const w = 2 * Math.PI * f;
    return A * Math.sin(w * t + phi);
  }
  ```
- **Pourquoi la sinusoïde** : C’est la brique élémentaire de tout signal périodique (théorème de Fourier). Toute forme d’onde périodique peut être vue comme une **somme** de sinusoïdes.
- **Analogie** : Comme un **arc-en-ciel** est une somme de couleurs pures, un **son** est une somme de sinusoïdes pures.

### 🎼 Fréquence et notes musicales (tempérament égal)
- **Demi-tons** depuis La4=440 Hz :
  ```js
  // n: nombre de demi-tons d’écart depuis A4
  const f = 440 * Math.pow(2, n / 12);
  ```
- **MIDI → fréquence** :
  ```js
  // m: numéro de note MIDI (69 = A4)
  const f = 440 * Math.pow(2, (m - 69) / 12);
  ```

### 🔊 Amplitude, niveau et décibels (dB)
- **dB (amplitude)** :
  ```js
  // Conversion linéaire -> dB (amplitude relative)
  const db = 20 * Math.log10(linear);
  // dB -> linéaire
  const linear = Math.pow(10, db / 20);
  ```
- **RMS (mesure d’énergie)** :
  ```js
  function rms(samples) {
    const sumSq = samples.reduce((s, x) => s + x * x, 0);
    return Math.sqrt(sumSq / samples.length);
  }
  ```
- **Analogie** : Le **pic** (peak) est la hauteur maximale d’une vague. Le **RMS** est l’**énergie moyenne** de la mer.

---

## 🧠 Échantillonnage et fréquence d’échantillonnage (fs)

- **Définition** : Transformer un signal **continu** en une suite **discrète** de valeurs prises régulièrement.
- **Fréquence d’échantillonnage `fs`** : nombre d’échantillons par seconde (ex. 44_100 Hz). Plus `fs` est grand, plus on capture de détails temporels.
- **Time-step** :
  ```js
  const dt = 1 / fs; // pas temporel entre deux samples
  ```
- **Synthèse discrète d’une sinusoïde** :
  ```js
  function sineSamples({A=1, f=440, fs=44100, duration=1, phi=0}) {
    const n = Math.floor(fs * duration);
    const w = 2 * Math.PI * f;
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / fs;
      out[i] = A * Math.sin(w * t + phi);
    }
    return out;
  }
  ```

### 🧩 Schéma (Mermaid) — Chaîne d’échantillonnage
```mermaid
flowchart LR
  A[Signal analogique \n (onde sonore)] --> B[Filtre anti-alias \n (low-pass)]
  B --> C[Échantillonneur \n (fs échantillons/s)]
  C --> D[Quantificateur \n (bits -> niveaux)]
  D --> E[Signal numérique \n (suite de nombres)]
```

### ⚠️ Théorème de Nyquist-Shannon
- **Bande utile** : Pour un `fs` donné, la fréquence maximale **sans aliasing** est :
  ```js
  const fMax = fs / 2; // fréquence de Nyquist
  ```
- **Pourquoi** : En-dessous de `fs/2`, deux échantillons par période suffisent à reconstruire la sinusoïde. Au-delà, le signal **replie** dans la bande et crée de l’**aliasing**.
- **Analogie** : Prendre des photos d’une roue qui tourne trop vite: elle semble tourner **à l’envers** — c’est l’aliasing visuel.

---

## 🧠 Aliasing (repliement spectral)

- **Définition** : Un contenu fréquentiel **au-dessus** de `fs/2` apparaît faussement **en-dessous** de `fs/2` après échantillonnage.
- **Calcul d’une fréquence aliasée** (pédagogique) :
  ```js
  function aliasFrequency(f, fs) {
    // Ramène f dans [0, fs] puis replie dans [0, fs/2]
    let fAlias = Math.abs(f % fs);
    if (fAlias > fs / 2) {
      fAlias = fs - fAlias; // réflexion
    }
    return fAlias;
  }
  ```
- **Exemple** : Avec `fs = 44100`, un signal à `f = 23000` Hz **passe**, `f = 30000` Hz **replie** près de `14100` Hz.
- **Prévention** : Utiliser un **filtre anti-alias** (low-pass) avant l’échantillonnage et éviter de synthétiser des harmoniques au-delà de `fs/2`.

### 🧩 Schéma (Mermaid) — Principe d’aliasing
```mermaid
flowchart LR
  X[Fréquence réelle > fs/2] --> Y[Échantillonnage]
  Y --> Z[Repliement dans 0..fs/2 \n (alias)]
```

---

## 🧠 Quantification, bit depth et dynamique

- **Définition** : Remplacer une valeur réelle par l’un des **N niveaux** disponibles (résolution). Si `bits` est la profondeur, alors :
  ```js
  const N = 2 ** bits; // nombre de niveaux disponibles
  ```
- **Pas de quantification** (pour plage [-1, 1]) :
  ```js
  const step = 2 / (2 ** bits - 1);
  ```
- **Quantification d’un échantillon** :
  ```js
  function quantize(x, bits) {
    const maxQ = (2 ** bits - 1);
    const q = Math.round((x + 1) * maxQ / 2); // map [-1,1] -> [0,maxQ]
    return (q * 2 / maxQ) - 1;               // retour dans [-1,1]
  }
  ```
- **Dynamique approximative (dB)** :
  ```js
  // Pour un sinus pleine échelle, SNR ≈ 6.02*bits + 1.76 dB
  const SNR = 6.02 * bits + 1.76;
  ```
- **Pourquoi** : Plus de bits = **moins de bruit de quantification** et **plus de dynamique**. En audio moderne, 16 bits (CD) ou 24 bits (studio) sont courants.
- **Analogie** : Une **échelle** de mesure plus fine (bits) permet de lire la hauteur de la vague plus précisément.

---

## 🧠 Formes d’onde et contenu spectral

- **Sine** (pure): harmoniques inexistants.
- **Square** : harmoniques impaires (1, 3, 5, …), amplitude ∝ 1/n.
- **Sawtooth** : harmoniques tous multiples, amplitude ∝ 1/n.
- **Triangle** : seulement impaires, amplitude ∝ 1/n².
- **Pourquoi** : Le **timbre** dépend de la distribution des harmoniques.

### 🔢 Approximation de Fourier (démo simple en JS)
```js
function sawApprox(t, f, harmonics = 20) {
  const w = 2 * Math.PI * f;
  let sum = 0;
  for (let n = 1; n <= harmonics; n++) {
    sum += Math.sin(n * w * t) / n; // amplitude 1/n
  }
  return (2 / Math.PI) * sum; // normalisation approx.
}
```

### ⚠️ Aliasing pratique avec formes riches
- Les **formes riches** (square/saw) génèrent des harmoniques > `fs/2` → aliasing si non limité.
- **Solutions** : utiliser des **band-limited oscillators**, des techniques **BLEP/PolyBLEP**, ou **filtres** post-oscillateur.

---

## 🧠 Domaine temporel vs domaine fréquentiel

- **Temporel** : on observe `x[n]` (échantillons dans le temps).
- **Fréquentiel** : on observe l’**énergie par bande de fréquences** (via FFT).
- **Pourquoi** : Les effets (filtres, EQ) s’expliquent mieux en **fréquence**, tandis que l’**enveloppe** (ADSR) se voit mieux en **temps**.

### 🧪 Petite visualisation Canvas (oscillogramme)
```js
// Dessine une sinusoïde sur Canvas
function drawSineOnCanvas(canvas, {A=0.9, f=5, samples=512}) {
  const ctx2d = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx2d.clearRect(0, 0, w, h);
  ctx2d.strokeStyle = '#1f77b4';
  ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  for (let i = 0; i < samples; i++) {
    const t = i / samples; // 0..1
    const y = A * Math.sin(2 * Math.PI * f * t);
    const px = (i / (samples - 1)) * w;
    const py = (h / 2) - y * (h / 2 - 10);
    if (i === 0) ctx2d.moveTo(px, py); else ctx2d.lineTo(px, py);
  }
  ctx2d.stroke();
}
```

---

## 🛠️ Mise en pratique Web Audio (rapide)

> 💡 **But** : relier les concepts au graphe Web Audio.

1. Crée un `AudioContext`.
2. Crée un `OscillatorNode` (sin) et un `GainNode` (volume).
3. Connecte osc → gain → destination.
4. Modifie `frequency.value` (fréquence) et `gain.gain.value` (amplitude).

### 🧩 Schéma (Mermaid) — Graphe simple
```mermaid
graph LR
  Osc[OscillatorNode (sine)] --> Gain[GainNode (volume)]
  Gain --> Out[AudioDestinationNode]
```

---

## 🔧 Exercices (progressifs)

1. **Fréquence & période** : Écris une fonction qui retourne `T` pour une `f` donnée et l’inverse.
2. **Notes → Hz** : Crée une table des 12 demi-tons autour de A4.
3. **RMS vs Peak** : Génère une sinusoïde et calcule son **RMS**; compare au **peak** (= `A`).
4. **Aliasing** : Écris `aliasFrequency(f, fs)` et teste des fréquences proches de `fs/2`.
5. **Quantification** : Implémente `quantize(x, bits)` et mesure l’erreur moyenne (MSE).
6. **Spectre intuitif** : Approche saw/triangle avec 20 harmoniques; observe l’impact du nombre d’harmoniques.

---

## 💡 Astuces & bonnes pratiques

- **Toujours raisonner vs `fs/2`** : Toute harmonique > `fs/2` est suspecte.
- **Limiter le gain** (`≤ 1`) pour éviter la **saturation** (clipping).
- **Utiliser des enveloppes** (chap. 4) pour éviter les clics (transitions abruptes).
- **Mesurer** (RMS/dB) plutôt que juger à l’oreille seulement.

---

## ⚠️ Pièges fréquents

- **Clipping** : Un signal > 1 ou < -1 est tronqué → distorsion.
- **Aliasing insidieux** : Les formes d’onde non band-limitées aliasent même à faible fréquence si leurs harmoniques montent haut.
- **Confondre dB (puissance) et dBFS** (référence numérique pleine échelle). Ici, on manipule **amplitude relative**.

---

## 📚 Références d’étude (sans lien externe requis)

- Théorème de Nyquist-Shannon (concept fondamental de DSP).
- Notions d’harmoniques et séries de Fourier.
- Perception : hauteur (fréquence), sonie (niveau), timbre (spectre).

---

## 🧾 Résumé du chapitre (points clés)

- **Son = onde de pression** → représentée par une suite de nombres.
- **Fréquence/Période** : `f = 1/T`, `ω = 2πf`, sinusoïde `x(t) = A·sin(ωt + φ)`.
- **Notes ↔ Hz** : `f = 440 * 2**(n/12)`; `f = 440 * 2**((m-69)/12)`.
- **Amplitude ↔ dB** : `db = 20·log10(lin)`; **RMS** mesure l’énergie.
- **Échantillonnage** : `fs` définit la résolution temporelle; **Nyquist** : `fMax = fs/2`.
- **Aliasing** : toute composante > `fs/2` se replie → utiliser anti-alias.
- **Quantification** : `bits` → `2**bits` niveaux; dynamique ≈ `6.02·bits + 1.76 dB`.
- **Formes d’onde** : timbre = distribution des harmoniques; attention à l’aliasing.
- **Temporel vs Fréquentiel** : oscillogramme vs spectre (FFT à venir).

---

> ✅ **Prochaines étapes** : passer à **Chapitre 2 — Architecture de la Web Audio API**, pour construire et connecter les nœuds dans un graphe audio.
