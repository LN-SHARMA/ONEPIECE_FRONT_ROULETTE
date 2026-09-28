import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useFleetStore } from '../../store/fleetStore';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

export const EasterEggListener: React.FC = () => {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const { showToast, addBerries, setHakiVfx } = useFleetStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing inside form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const newSeq = [...inputSequence, e.key].slice(-10);
      setInputSequence(newSeq);

      if (newSeq.join(',') === KONAMI_CODE.join(',')) {
        // Trigger Gear 5 Celebration!
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#f59e0b', '#dc2626', '#38bdf8'],
        });

        setHakiVfx('conqueror');
        addBerries(100000000);
        showToast({
          title: '🥁 DRUMS OF LIBERATION!',
          message: 'Gear 5th Unlocked! Received ฿ 100,000,000 celebratory bounty!',
          type: 'haki',
        });
        setInputSequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputSequence, showToast, addBerries, setHakiVfx]);

  return null;
};
