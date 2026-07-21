/**
 * Per-letter ASL fingerspelling reference photos, keyed by lowercase letter.
 *
 * NOTE FOR THE ML AGENT: this worktree does not have
 * apps/training/datasets/raw/asl_alphabet available locally (it's
 * gitignored and wasn't present on disk here), so no actual images have
 * been copied in yet. Drop `<letter>.jpg` files into this folder (a.jpg,
 * b.jpg, ... z.jpg) and they'll be picked up automatically via
 * import.meta.glob below — no code changes needed elsewhere.
 */
const modules = import.meta.glob<{ default: string }>("./*.jpg", { eager: true });

const samplesByLetter: Partial<Record<string, string>> = {};
for (const path in modules) {
  const match = /\/([a-z])\.jpg$/i.exec(path);
  const mod = modules[path];
  const letter = match?.[1];
  if (letter && mod) {
    samplesByLetter[letter.toLowerCase()] = mod.default;
  }
}

export function getAslSampleImage(letter: string): string | undefined {
  return samplesByLetter[letter.toLowerCase()];
}
