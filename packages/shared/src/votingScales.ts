import { VotingScaleKey } from "./types.js";

export interface VotingScaleDefinition {
  key: VotingScaleKey;
  label: string;
  description: string;
  cards: string[];
  specialCards: string[];
}

export const VOTING_SCALES: Record<VotingScaleKey, VotingScaleDefinition> = {
  fibonacci: {
    key: "fibonacci",
    label: "Fibonacci",
    description: "Sequência de Fibonacci, a mais usada em Planning Poker",
    cards: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89"],
    specialCards: ["?", "☕"],
  },
  tshirt: {
    key: "tshirt",
    label: "Tamanhos de camiseta",
    description: "PP, P, M, G, GG — ótimo para estimativas de alto nível",
    cards: ["PP", "P", "M", "G", "GG", "XG"],
    specialCards: ["?", "☕"],
  },
  points: {
    key: "points",
    label: "Pontos (1-10)",
    description: "Escala linear simples de 1 a 10",
    cards: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    specialCards: ["?", "☕"],
  },
  powers2: {
    key: "powers2",
    label: "Potências de 2",
    description: "1, 2, 4, 8, 16, 32 — comum em times que usam story points",
    cards: ["1", "2", "4", "8", "16", "32", "64"],
    specialCards: ["?", "☕"],
  },
  sequential: {
    key: "sequential",
    label: "Sequencial (0-5)",
    description: "Escala curta de dificuldade relativa, de 0 a 5",
    cards: ["0", "1", "2", "3", "4", "5"],
    specialCards: ["?", "☕"],
  },
};

export const VOTING_SCALE_LIST = Object.values(VOTING_SCALES);

export function getCardsForScale(key: VotingScaleKey): string[] {
  const scale = VOTING_SCALES[key];
  return [...scale.cards, ...scale.specialCards];
}
