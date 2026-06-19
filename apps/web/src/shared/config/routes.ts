export const ROUTES = {
  today: "/today",
  journey: "/journey",
  dashboard: "/dashboard",
  calendar: "/calendar",
  wrongNotes: "/wrong-notes",
  graph: "/graph",
  diary: "/diary",
  play: (questId: string) => `/play/${questId}`,
  recovery: (objectId: string) => `/recovery/${objectId}`,
  result: "/result",
  admin: "/admin",
} as const;
