const categoryColors: Record<string, string> = {
  'Announcements': 'rgba(62, 139, 255, 0.15)',
  'Guides': 'rgba(114, 85, 255, 0.15)',
  'Tips': 'rgba(74, 222, 128, 0.15)',
  'News': 'rgba(255, 176, 66, 0.15)',
}

const categoryTextColors: Record<string, string> = {
  'Announcements': '#3E8BFF',
  'Guides': '#7255FF',
  'Tips': '#4ADE80',
  'News': '#FFB042',
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] || 'rgba(107, 114, 128, 0.15)'
}

export function getCategoryTextColor(category: string): string {
  return categoryTextColors[category] || '#6B7280'
}