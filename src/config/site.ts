export const siteConfig = {
  name: "GPT Teacher",
  description: "Plataforma de ensino com agentes de IA.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/",
  },
} as const;

export type SiteConfig = typeof siteConfig;
