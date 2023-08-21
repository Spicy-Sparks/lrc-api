import { Provider } from '.'
import { createURLWithQuery, fetchJSON, defaultTimeout } from '../utils'
import { SearchParams } from './Provider'
import axios from 'axios'

const BASE_URL = 'https://c.y.qq.com/'

interface ArtistInfo {
  mid: string
  name: string
}

const headers = {
  Referer: 'https://y.qq.com',
}
export class QQMusic implements Provider {
  async getArtistInfo(artist: string): Promise<ArtistInfo | undefined> {
    try {
      const response = await axios.get(
        createURLWithQuery(new URL('splcloud/fcgi-bin/smartbox_new.fcg', BASE_URL), { key: artist }),
        { timeout: defaultTimeout }
      )
      // console.log('response', response.data.data.singer.itemlist)
      const singer = response.data.data.singer
      const matchedArtist = singer?.itemlist?.[0]
      if (!matchedArtist) return
      return {
        mid: matchedArtist.mid,
        name: matchedArtist.name,
      }
    } catch (error) {
      return
      // console.log('error', error)
    }
  }

  async getBestMatched({ name, artist }: SearchParams) {
    // const artistInfo = await this.getArtistInfo(artist)
    // if (!artistInfo) return

    try {
      const songsResponse = await axios.get(
        createURLWithQuery(new URL('splcloud/fcgi-bin/smartbox_new.fcg', BASE_URL), {
          key: name + ' ' + artist,
          g_tk: '5381',
        }),
        { timeout: defaultTimeout, headers: headers }
      )

      const songs = songsResponse.data.data.song.itemlist
      if (!songs) return

      const matchedSong = songs[0]

      // const matchedSong = songs
      //   .filter(({ singer }: any) => singer?.[0]?.mid === artistInfo.mid)
      //   .find(({ songname_hilight }: any) => String(songname_hilight).includes('<em>'))
      // if (!matchedSong) return

      const lyricsResponse = await axios.get(
        createURLWithQuery(new URL('lyric/fcgi-bin/fcg_query_lyric_new.fcg', BASE_URL), {
          format: 'json',
          nobase64: '1',
          songmid: matchedSong.mid,
        }),
        {
          headers: {
            referer: 'https://y.qq.com/',
          },
          timeout: defaultTimeout,
        }
      )
      const lyric = lyricsResponse.data.lyric
      if (!lyric) return
      return String(lyric)
    } catch (error) {
      return
      // console.log('error', error)
    }
  }
}
