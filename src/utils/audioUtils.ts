export const playAlertSound = () => {
  // Create a simple alert tone using Web Audio API
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.frequency.setValueAtTime(800, context.currentTime);
  oscillator.frequency.setValueAtTime(1000, context.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(800, context.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.3, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
  
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
};