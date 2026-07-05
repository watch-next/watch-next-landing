export interface FooterNavGroup {
  heading: string
  links: { label: string; href: string }[]
}

export const footerSection = {
  brandDescription: 'Discover, track, and share your favorite movies and series. Your next binge starts here.',
}

export const footerNav: FooterNavGroup[] = [
  {
    heading: 'Navigation',
    links: [
      { label: 'Home', href: '#hero' },
      { label: 'Features', href: '#features' },
      { label: 'Platforms', href: '#platforms' },
      { label: 'Premium', href: '#premium' },
      { label: 'Roadmap', href: '#roadmap' },
    ],
  },
  {
    heading: 'Platforms',
    links: [
      { label: 'Web App', href: '#platforms' },
      { label: 'Windows', href: '#platforms' },
      { label: 'Android', href: '#platforms' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Cookie Policy', href: '/cookies-policy' },
    ],
  },
]

export const socialLinks = [
  { label: 'Twitter', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Discord', href: '#' },
]