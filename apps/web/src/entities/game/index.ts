export type { GameState, GameBadge, QuestResult, UpdateGameStateResponse, Rank, BadgeRarity } from "./model";
export { getGameState, getRecentBadges, updateGameState } from "./api";
export type { GameEvent, MascotMoodSignal } from "./lib/mascot-mood";
export { gameEventToMood, resultToMood } from "./lib/mascot-mood";
export type { ReviewGrade } from "./lib/game-rules";
export { gradeToInterval, gradeToHpDelta, rarityFor } from "./lib/game-rules";
export type { BadgeCatalogEntry } from "./lib/badge-catalog";
export { BADGE_CATALOG } from "./lib/badge-catalog";
export { useEarnedBadges } from "./model/use-earned-badges";
