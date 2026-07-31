export const GUIDES_API = {
  list: '/guides',
  detail: (id: string) => `/guides/${id}`,
} as const;
