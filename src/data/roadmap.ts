export interface RoadmapItem {
  quarter: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
}

export const roadmapSection = {
  title: 'What\'s Coming Next',
  subtitle: 'Here\'s what we\'re building. Follow along as we bring SeeUs to every platform.',
}

export const roadmap: RoadmapItem[] = [
  {
    quarter: 'Q1 2026',
    title: 'Core Platform Launch',
    description: 'Initial release with web app, basic tracking, and cross-platform watchlist sync.',
    status: 'completed',
  },
  {
    quarter: 'Q2 2026',
    title: 'Social Features',
    description: 'Friend lists, shared watchlists, activity feeds, and comment threads.',
    status: 'in-progress',
  },
  {
    quarter: 'Q3 2026',
    title: 'Mobile Apps',
    description: 'Native Android app with offline mode, widgets, and push notifications.',
    status: 'planned',
  },
  {
    quarter: 'Q4 2026',
    title: 'Recommendation Engine',
    description: 'AI-powered suggestions based on watch history, genre preferences, and social trends.',
    status: 'planned',
  },
  {
    quarter: 'Q1 2027',
    title: 'Windows Desktop App',
    description: 'Native Windows client with system tray, PIP mode, and keyboard shortcuts.',
    status: 'planned',
  },
  {
    quarter: 'Q2 2027',
    title: 'API & Integrations',
    description: 'Public API for third-party developers and integrations with Plex, Jellyfin, and Kodi.',
    status: 'planned',
  },
]