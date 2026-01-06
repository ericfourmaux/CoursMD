// src/audio/Scheduler.js
export class Scheduler {
  constructor(ctx, tempo = 120) {
    this.ctx = ctx;
    this.tempo = tempo;
    this.lookaheadMs = 25;          // scheduling en avance
    this.scheduleAheadSec = 0.1;    // fenêtre
    this.nextNoteTime = ctx.currentTime;
    this.isRunning = false;
    this.intervalId = null;
  }
  setTempo(bpm) { this.tempo = bpm; }
  _spb() { return 60 / this.tempo; } // secondes par battement

  start(callback) {
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      const ct = this.ctx.currentTime;
      while (this.nextNoteTime < ct + this.scheduleAheadSec) {
        callback(this.nextNoteTime);
        this.nextNoteTime += this._spb() / 4; // 16ᵉ
      }
    }, this.lookaheadMs);
  }
  stop() { clearInterval(this.intervalId); this.isRunning = false; }
}
