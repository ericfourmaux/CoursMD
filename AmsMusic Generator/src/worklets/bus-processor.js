// src/worklets/bus-processor.js
// Traitement bus: DC-blocker + soft-clip drive + ceiling (limiteur doux)

class BusProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'inputGain', defaultValue: 1.0, minValue: 0.0, maxValue: 4.0, automationRate: 'k-rate' },
      { name: 'drive',     defaultValue: 0.10, minValue: 0.0, maxValue: 1.0, automationRate: 'k-rate' },
      { name: 'ceiling',   defaultValue: 0.95, minValue: 0.50, maxValue: 1.0, automationRate: 'k-rate' },
      { name: 'outputGain',defaultValue: 1.0, minValue: 0.0, maxValue: 4.0, automationRate: 'k-rate' },
      // coeff du DC-block (HP très bas). Valeur proche de 1 => coupure très basse (~20 Hz/moins)
      { name: 'dcCoeff',   defaultValue: 0.995, minValue: 0.95, maxValue: 0.9999, automationRate: 'k-rate' },
    ];
  }

  constructor(options) {
    super(options);
    // État pour DC-blocker par canal: y[n] = x[n] - x[n-1] + coeff * y[n-1]
    this.prevX = [0, 0];
    this.prevY = [0, 0];
  }

  process(inputs, outputs, parameters) {
    const input  = inputs[0];
    const output = outputs[0];

    if (!input || input.length === 0) {
      // Pas de signal -> silence
      for (let ch = 0; ch < output.length; ch++) output[ch].fill(0);
      return true;
    }

    const inGain = parameters.inputGain[0];
    const outGain = parameters.outputGain[0];
    const drive   = parameters.drive[0];
    const ceiling = parameters.ceiling[0];
    const coeff   = parameters.dcCoeff[0];

    const numChannels = Math.min(input.length, output.length);

    for (let ch = 0; ch < numChannels; ch++) {
      const inp = input[ch];
      const out = output[ch];

      let px = this.prevX[ch];
      let py = this.prevY[ch];

      for (let i = 0; i < out.length; i++) {
        // Gain en entrée
        let x = (inp ? inp[i] : 0) * inGain;

        // DC-blocker
        // y = x - x_prev + coeff * y_prev
        let y = x - px + coeff * py;
        px = x; py = y;

        // Drive (soft clip tanh)
        const d = 1 + 10 * drive;      // intensité subjective
        y = Math.tanh(y * d);

        // Ceiling (limiteur doux)
        const c = ceiling;
        if (Math.abs(y) > c) {
          // courbe simple : ramener au plafond avec compression
          y = Math.sign(y) * (c + (Math.abs(y) - c) * 0.25);
        }

        // Gain de sortie
        out[i] = y * outGain;
      }

      this.prevX[ch] = px;
      this.prevY[ch] = py;
    }

    return true;
  }
}

registerProcessor('bus-processor', BusProcessor);
