const SOUND_FREQUENCIES: Record<string, number[]> = {
  pulse: [660, 880],
  glass: [784, 1175, 1568],
  bloom: [523, 659, 1047],
};

export async function playReminderSound(soundKey: string) {
  const notes = SOUND_FREQUENCIES[soundKey] ?? SOUND_FREQUENCIES.pulse;
  const audioContext = new AudioContext();

  let isPlaying = true;
  let loopIndex = 0;

  function playLoop() {
    if (!isPlaying) {
      void audioContext.close();
      return;
    }

    const now = audioContext.currentTime;
    const loopStartTime = now + loopIndex * 0.9;

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, loopStartTime + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.18, loopStartTime + index * 0.16 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, loopStartTime + index * 0.16 + 0.22);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(loopStartTime + index * 0.16);
      oscillator.stop(loopStartTime + index * 0.16 + 0.24);
    });

    loopIndex++;

    // 安排下一次循环
    window.setTimeout(() => playLoop(), 900);
  }

  playLoop();

  // 返回停止函数
  return () => {
    isPlaying = false;
    void audioContext.close();
  };
}
