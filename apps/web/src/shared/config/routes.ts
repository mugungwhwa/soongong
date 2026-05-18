export const ROUTES = {
  today: "/today",
  play: (questId: string) => `/play/${questId}`,
  recovery: (objectId: string) => `/recovery/${objectId}`,
  result: "/result",
  admin: "/admin",
  login: "/login",
} as const;
