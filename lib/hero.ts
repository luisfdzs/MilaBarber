import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'

const heroDir = path.join(process.cwd(), 'public', 'hero')

export type HeroMedia = {
  hasPoster: boolean
  hasVideo: boolean
}

export function getHeroMedia(): HeroMedia {
  const hasPoster = existsSync(path.join(heroDir, 'poster-wide.jpg'))
  const hasVideo = existsSync(path.join(heroDir, 'montage-wide.webm'))
  return { hasPoster, hasVideo }
}
