export interface PlatformTranslationKeys {
  id: string
  nameKey: string
  descriptionKey: string
}

export const platformsSection = {
  titleKey: 'platforms.title',
  subtitleKey: 'platforms.subtitle',
}

export const platforms: PlatformTranslationKeys[] = [
  {
    id: 'web',
    nameKey: 'platforms.cards.web.name',
    descriptionKey: 'platforms.cards.web.description',
  },
  {
    id: 'windows',
    nameKey: 'platforms.cards.windows.name',
    descriptionKey: 'platforms.cards.windows.description',
  },
  {
    id: 'android',
    nameKey: 'platforms.cards.android.name',
    descriptionKey: 'platforms.cards.android.description',
  },
]