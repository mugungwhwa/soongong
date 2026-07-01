export type {
  SubjectRoutingResult,
  RoutingSourceType,
  SubjectGroup,
} from "./model";

export {
  getPendingConfirmations,
  confirmSubjectRouting,
  getRoutingResult,
} from "./api";

export type { SubjectLabel, SubjectGroupCode, DetectedSubject } from "./lib/detect-subject";
export { detectSubject } from "./lib/detect-subject";
