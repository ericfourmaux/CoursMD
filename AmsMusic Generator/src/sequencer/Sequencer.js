// src/sequencer/Sequencer.js
export class Sequencer {
  constructor(instruments) {
    this.ins = instruments;
    // Patterns simples sur 16 pas
    this.kick = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
    this.snare=[0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
    this.hat  =[1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1];
    this.leadNotes = ['C4','E4','G4','B4']; // simplifié: on transformera en fréquences
    this.step = 0;
  }
  static toFreq(note) {
    // util. simple: convertit notes en Hz (A4=440)
    const A4=440, map={'C':-9,'C#':-8,'D':-7,'D#':-6,'E':-5,'F':-4,'F#':-3,'G':-2,'G#':-1,'A':0,'A#':1,'B':2};
    const m = note.match(/^([A-G]#?)(\d)$/); const semi = (m?map[m[1]]:0) + (parseInt(m[2])-4)*12;
    return A4 * Math.pow(2, semi/12);
  }
  tick(time) {
    const s = this.step % 16;
    if (this.kick[s])  this.ins.triggerKick(time);
    if (this.snare[s]) this.ins.triggerSnare(time);
    if (this.hat[s])   this.ins.triggerHat(time);

    // lead toutes les noires
    if (s % 4 === 0) {
      const n = this.leadNotes[(s/4)%this.leadNotes.length];
      const id = this.ins.noteOn(Sequencer.toFreq(n));
      // planifier le noteOff un peu plus tard
      setTimeout(()=> this.ins.noteOff(id), 200);
    }
    this.step++;
  }
}
