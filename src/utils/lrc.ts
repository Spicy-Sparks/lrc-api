export const normalizeLRC = (lrc: string): string => {
  // Some LRC timestamps are in a non-standard format [mm:ss.xxx],
  // and we should convert it to a standard form [mm:ss.xx].
  lrc = lrc.replaceAll(/^\s*(\[\d{2}.\d{2}.)(\d{2})\d(\])/gm, (_$0, $1, $2, $3) => $1 + $2 + $3)

  return lrc
}

export const normalizeString = (str?: string) => {
  if (!str) return ''
  return str
    .trim()
    .replace(/[,&].*/, '')
    .normalize('NFD')
    .replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, '')
}
