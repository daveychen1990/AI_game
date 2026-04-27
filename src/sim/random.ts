export interface SequenceRng {
  readonly sequence: number[];
  readonly index: number;
}

export function createSequenceRng(sequence: number[]): SequenceRng {
  return {
    sequence: sequence.length > 0 ? [...sequence] : [0.5],
    index: 0
  };
}

export function nextRandom(rng: SequenceRng): [number, SequenceRng] {
  const value = rng.sequence[rng.index % rng.sequence.length] ?? 0.5;

  return [
    value,
    {
      sequence: rng.sequence,
      index: rng.index + 1
    }
  ];
}

export function pickOne<T>(rng: SequenceRng, entries: readonly T[]): [T, SequenceRng] {
  if (entries.length === 0) {
    throw new Error("Cannot pick from an empty list.");
  }

  const [value, next] = nextRandom(rng);
  const index = Math.min(entries.length - 1, Math.floor(value * entries.length));

  return [entries[index], next];
}
