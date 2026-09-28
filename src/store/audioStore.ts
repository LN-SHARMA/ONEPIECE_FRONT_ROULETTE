import { create } from 'zustand';
import { pirateAudio } from '../services/audioService';

interface AudioStore {
  isMuted: boolean; // Backwards compatible alias for BGM
  isBgmMuted: boolean;
  isSfxMuted: boolean;
  toggleMute: () => void;
  toggleBgm: () => void;
  toggleSfx: () => void;
  playSwordClash: () => void;
  playCannon: () => void;
  playHakiSurge: () => void;
  playCoinChime: () => void;
  playWoodClick: () => void;
}

const STORAGE_KEYS = {
  BGM: 'grand_fleet_audio_bgm_muted_v1',
  SFX: 'grand_fleet_audio_sfx_muted_v1',
};

const getStoredBool = (key: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return JSON.parse(saved);
  } catch (e) {}
  return fallback;
};

export const useAudioStore = create<AudioStore>((set, get) => {
  // SFX is enabled by default (false = not muted)
  const initialSfxMuted = getStoredBool(STORAGE_KEYS.SFX, false);
  // BGM is muted by default (true = muted) to respect browser autoplay
  const initialBgmMuted = getStoredBool(STORAGE_KEYS.BGM, true);

  pirateAudio.setSfxMuted(initialSfxMuted);
  pirateAudio.setBgmMuted(initialBgmMuted);

  return {
    isMuted: initialBgmMuted,
    isBgmMuted: initialBgmMuted,
    isSfxMuted: initialSfxMuted,

    toggleMute: () => {
      get().toggleBgm();
    },

    toggleBgm: () => {
      const nextBgmMuted = !get().isBgmMuted;
      pirateAudio.setBgmMuted(nextBgmMuted);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.BGM, JSON.stringify(nextBgmMuted));
        } catch (e) {}
      }
      set({ isBgmMuted: nextBgmMuted, isMuted: nextBgmMuted });
    },

    toggleSfx: () => {
      const nextSfxMuted = !get().isSfxMuted;
      pirateAudio.setSfxMuted(nextSfxMuted);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.SFX, JSON.stringify(nextSfxMuted));
        } catch (e) {}
      }
      set({ isSfxMuted: nextSfxMuted });
    },

    playSwordClash: () => pirateAudio.playSwordClash(),
    playCannon: () => pirateAudio.playCannon(),
    playHakiSurge: () => pirateAudio.playHakiSurge(),
    playCoinChime: () => pirateAudio.playCoinChime(),
    playWoodClick: () => pirateAudio.playWoodClick(),
  };
});
