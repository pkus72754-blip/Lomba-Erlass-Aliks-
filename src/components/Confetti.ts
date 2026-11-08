import confetti from 'canvas-confetti';

export function fireStudentSuccessConfetti() {
  // Neo-brutalist vibrant confetti colors: Yellow, Pink, Cyan, Mint, Purple
  const colors = ['#FFE600', '#FF6B97', '#38BDF8', '#35E88E', '#C084FC'];

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
    ticks: 200,
    gravity: 1.1,
    scalar: 1.2
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });
  }, 250);
}
