import axios from 'axios'
import { Provider, SearchParams } from './Provider'
import { parse } from 'node-html-parser'
import { decode } from 'html-entities'

const BASE_URL = 'https://www.lyricsify.com/'

const normalizeString = (str?: string) => {
  if (!str) return ''
  return str
    .trim()
    .replace(/[,&].*/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export class Lyricsify implements Provider {
  private async getLink(artist: string, name: string) {
    const query = artist + ' ' + name
    const response = await axios.get(BASE_URL + 'search?q=' + query)
    const data = response.data
    const list = parse(data)
      ?.querySelectorAll('.li')
      .map((item) => {
        const row = item.querySelector('.title')
        return { title: row?.textContent.toLowerCase(), link: item.querySelector('.title')?.getAttribute('href') }
      })
    const match = list.find((items) => {
      return (
        normalizeString(items.title?.toLowerCase()).includes(artist) &&
        normalizeString(items.title?.toLowerCase()).includes(name)
      )
    })
    return match?.link
  }

  private removeTags = (str: string) => {
    if (str === null || str === '') {
      return false
    } else {
      str = str
        .toString()
        .replace(/(<([^>]+)>)/gi, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/^\s*\n\n/gm, '')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
    }
    const listStr = str.split('\n')
    const array: Array<string> = []
    listStr.forEach((items) => {
      if (items.substring(0, 9).includes('.')) {
        array.push(items)
      }
    })

    return array.join('\n')
  }

  private async getLrc(link: string) {
    const id: string = link.substring(link.lastIndexOf('.') + 1)
    const response = await axios.get(BASE_URL + link)
    const result = response.data
    const page = parse(result)
    const lrc = page?.getElementById(`lyrics_${id}_details`)
    const decoded = decode(lrc.rawText)
    if (decoded?.length) {
      const parse = this.removeTags(decoded).toString()
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
