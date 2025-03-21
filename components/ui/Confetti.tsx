'use client';

import { useEffect, useState } from 'react';

import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ duration = 3000 }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Get window dimensions
    const { innerWidth: width, innerHeight: height } = window;
    setDimensions({ width, height });

    // Hide confetti after duration
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return show ? (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={400}
      gravity={0.2}
    />
  ) : null;
};
