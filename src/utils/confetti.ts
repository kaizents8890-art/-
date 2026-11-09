import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
    });
  } catch {
    // fallback if canvas not available
  }
};
