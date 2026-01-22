import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  emoji: string;
}

interface ConfettiProps {
  active?: boolean;
  duration?: number;
}

export function Confetti({ active = true, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(active);

  const emojis = ['🎉', '🌟', '⭐', '✨', '🎊', '💫', '🎈', '🏆', '💖', '🌈'];
  const colors = [
    'text-pink',
    'text-yellow',
    'text-blue',
    'text-purple',
    'text-orange',
    'text-green',
  ];

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 16 + Math.random() * 16,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setPieces(newPieces);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isVisible || pieces.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute ${piece.color}`}
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            fontSize: `${piece.size}px`,
            animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
          }}
        >
          {piece.emoji}
        </div>
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
