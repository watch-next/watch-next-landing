export interface Feature {
  icon: string
  title: string
  description: string
}

export const featuresSection = {
  title: 'Everything You Need',
  subtitle: 'From discovery to tracking, WatchNext has you covered across all your favorite platforms.',
}

export const features: Feature[] = [
  {
    icon: 'discover',
    title: 'Smart Discovery',
    description: 'Get personalized recommendations powered by your watch history and preferences.',
  },
  {
    icon: 'track',
    title: 'Unified Tracking',
    description: 'Keep tabs on everything you watch across Netflix, Prime, Hulu, and more.',
  },
  {
    icon: 'social',
    title: 'Social Watchlist',
    description: 'Create and share watchlists with friends. Never lose track of what to watch next.',
  },
  {
    icon: 'calendar',
    title: 'Release Calendar',
    description: 'Stay up to date with upcoming releases, new seasons, and premiere dates.',
  },
  {
    icon: 'rating',
    title: 'Smart Ratings',
    description: 'See combined scores from IMDb, Rotten Tomatoes, and Metacritic in one place.',
  },
  {
    icon: 'offline',
    title: 'Offline Mode',
    description: 'Browse your library and plan your watchlist even without an internet connection.',
  },
]