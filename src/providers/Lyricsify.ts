import axios from 'axios'
import { Provider, SearchParams } from './Provider'
import { parse } from 'node-html-parser'
import { decode } from 'html-entities'
import { normalizeString, removeTags } from '../utils'

const BASE_URL = 'https://www.lyricsify.com/'

const config = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
  },
}

export class Lyricsify implements Provider {
  private async getLink(artist: string, name: string) {
    const normalizedArtist = normalizeString(artist)
    const normalizedName = normalizeString(name)
    const query = artist + ' ' + name
    const response = await axios.get(BASE_URL + 'search?q=' + query, config)
    const data = response.data
    const list = parse(data)
      ?.querySelectorAll('.li')
      .map((item) => {
        const row = item.querySelector('.title')
        return { title: row?.textContent.toLowerCase(), link: item.querySelector('.title')?.getAttribute('href') }
      })
    const match = list.find((items) => {
      return (
        normalizeString(items.title?.toLowerCase()).includes(normalizedArtist) &&
        normalizeString(items.title?.toLowerCase()).includes(normalizedName)
      )
    })
    return match?.link
  }

  private async getLrc(link: string) {
    const id: string = link.substring(link.lastIndexOf('.') + 1)
    const response = await axios.get(BASE_URL + link, config)
    const result = response.data
    const page = parse(result)
    const lrc = page?.getElementById(`lyrics_${id}_details`)
    const decoded = decode(lrc.rawText)
    if (decoded?.length) {
      const parse = removeTags(decoded).toString()
      return parse
    }
  }

  async getBestMatched({ rawName, rawArtist }: SearchParams) {
    const name = rawName.toLowerCase()
    const artist = rawArtist.toLowerCase()
    const link = await this.getLink(artist, name)
    if (link) {
      const lrc = await this.getLrc(link)
      return lrc
    }
    return ''
  }
}
