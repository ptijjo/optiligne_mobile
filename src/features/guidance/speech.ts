import * as Speech from 'expo-speech';

export type SpeakFn = (text: string) => void;

/** TTS français ; no-op si texte vide. */
export function speakAlert(text: string): void {
  if (!text.trim()) {
    return;
  }
  try {
    Speech.stop();
    Speech.speak(text, { language: 'fr-FR', rate: 1.0 });
  } catch {
    // Fail soft : la voix ne doit jamais faire planter le guidage.
  }
}

export function stopSpeech(): void {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
