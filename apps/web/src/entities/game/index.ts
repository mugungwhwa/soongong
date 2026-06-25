export type { GameState, GameBadge, QuestResult, UpdateGameStateResponse, Rank, BadgeRarity } from "./model";
export { getGameState, getRecentBadges, updateGameState } from "./api";
export type { GameEvent, MascotMoodSignal } from "./lib/mascot-mood";
export { gameEventToMood, resultToMood } from "./lib/mascot-mood";
export type { ReviewGrade } from "./lib/game-rules";
export { gradeToInterval, gradeToHpDelta } from "./lib/game-rules";
// 클라이언트 전용 심볼(useEarnedBadges/BADGE_CATALOG)은 이 배럴에 올리지 않는다 —
// 배럴이 ./api(next/headers 서버 전용)도 재export 하므로 클라이언트 소비자가 같은
// FSD 함정에 빠진다. 클라이언트는 deep import(@/entities/game/{lib,model}/...) 사용.
