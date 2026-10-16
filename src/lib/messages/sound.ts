/**
 * Browser-only helpers so message / notification sounds never play before the visitor has
 * interacted with the page (autoplay policies, and it is rude to beep at someone who just arrived).
 * The audio module is loaded lazily: its constructor touches localStorage, which can throw when
 * storage is blocked, and a sound effect must never break the page.
 */

type SoundEffects = (typeof import("@/lib/audio/sound-effects"))["soundEffects"];

let interacted = false;
let soundsPromise: Promise<SoundEffects | null> | null = null;

if (typeof window !== "undefined") {
  const markInteracted = () => {
    interacted = true;
  };
  window.addEventListener("pointerdown", markInteracted, { once: true, capture: true });
  window.addEventListener("keydown", markInteracted, { once: true, capture: true });
}

function loadSounds(): Promise<SoundEffects | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!soundsPromise) {
    soundsPromise = import("@/lib/audio/sound-effects").then((module) => module.soundEffects).catch(() => null);
  }
  return soundsPromise;
}

export function hasUserInteracted(): boolean {
  if (typeof navigator !== "undefined") {
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (activation?.hasBeenActive) return true;
  }
  return interacted;
}

export function playIncomingMessageSound(): void {
  if (!hasUserInteracted()) return;
  void loadSounds().then((sounds) => {
    try {
      sounds?.playMessageSound();
    } catch {
      // Audio is optional.
    }
  });
}

export function playNotificationPreviewSound(): void {
  if (!hasUserInteracted()) return;
  void loadSounds().then((sounds) => {
    try {
      sounds?.playNotificationSound();
    } catch {
      // Audio is optional.
    }
  });
}

export async function isSoundEnabled(): Promise<boolean> {
  const sounds = await loadSounds();
  try {
    return sounds?.isEnabled() ?? false;
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  void loadSounds().then((sounds) => {
    try {
      sounds?.setEnabled(enabled);
    } catch {
      // Storage can be blocked; the in-memory setting still applies for this page.
    }
  });
}
