export interface Platform {
  id: string
  name: string
  description: string
}

export const platformsSection = {
  title: 'Available Everywhere',
  subtitle: 'WatchNext is available on your favorite devices. Start watching on any platform.',
}

export const platforms: Platform[] = [
  {
    id: 'web',
    name: 'Web',
    description: 'Access WatchNext from any browser. No download required.',
  },
  {
    id: 'windows',
    name: 'Windows',
    description: 'Native Windows app with full offline support and system tray integration.',
  },
  {
    id: 'android',
    name: 'Android',
    description: 'Take your watchlist on the go with the Android mobile app.',
  },
]