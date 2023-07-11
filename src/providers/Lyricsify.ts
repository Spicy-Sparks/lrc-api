import axios from 'axios'
import { Provider, SearchParams } from './Provider'
import { parse } from 'node-html-parser'
import { decode } from 'html-entities'
import { normalizeString } from '../utils'

const BASE_URL = 'https://www.lyricsify.com/'

const config = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    // 'Content-Type': 'application/x-www-form-urlencoded',
    'Accept-Encoding': 'gzip, deflate, br',
    // 'Content-Encoding': 'br',
    'Content-Type': 'text/html; charset=utf-8',
    'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,hr;q=0.7',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    Referer: 'https://www.lyricsify.com/',
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
    const response = await axios.get(BASE_URL + link, config)
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
