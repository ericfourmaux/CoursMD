// src/import/mp3-loader.js
export async function loadMp3File(file) {
  if (!file) throw new Error('Aucun fichier .mp3 sélectionné');
  const arrayBuffer = await file.arrayBuffer();

  // Crée un AudioContext uniquement pour le décodage
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  // decodeAudioData transforme le MP3 en AudioBuffer (PCM float32)
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  // Ferme le contexte de décodage (bonne pratique)
  ctx.close();

  // Méta rapides
  const duration = audioBuffer.duration;
  const sr = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;
  return { audioBuffer, meta: { duration, sampleRate: sr, channels } };
}
