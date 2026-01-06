// src/worklets/noise-processor.js
class NoiseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const output = outputs[0];
    const ch = output[0];
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1);
    return true;
  }
}
registerProcessor('noise-processor', NoiseProcessor);
