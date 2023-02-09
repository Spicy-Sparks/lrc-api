import { Provider } from '.'
import { createURLWithQuery, fetchJSON,defaultTimeout } from '../utils'
import { SearchParams } from './Provider'
import axios from "axios"

const BASE_URL = 'https://c.y.qq.com/'


interface ArtistInfo {
  mid: string
  name: string
}

export class QQMusic implements Provider {
  async getArtistInfo (artist: string): Promise<ArtistInfo | undefined> {
    try {
      const response = await axios.get(createURLWithQuery(new URL('splcloud/fcgi-bin/smartbox_new.fcg', BASE_URL), { key: artist }),{timeout:defaultTimeout})
      const singer = response.data.singer
      const matchedArtist = singer?.itemlist?.[0]
      if (!matchedArtist) return
      return {
        mid: matchedArtist.mid,
        name: matchedArtist.name
      }
    } catch (error) {
    }
    
  }

  async getBestMatched ({ name, artist }: SearchParams) {
    const artistInfo = await this.getArtistInfo(artist)
    if (!artistInfo) return

    try {
      const {
        data: {
          song: { list: songs }
        }
      } = await axios.get(
        createURLWithQuery(new URL('soso/fcgi-bin/client_search_cp', BASE_URL), {
          format: 'json',
          w: [name, artistInfo.name].join(' '),
          n: '10'
        }),
        {timeout:defaultTimeout}
      )
      if (!songs) return
  
      const matchedSong = songs
        .filter(({ singer }: any) => singer?.[0]?.mid === artistInfo.mid)
        .find(({ songname_hilight }: any) => String(songname_hilight).includes('<em>'))
      if (!matchedSong) return
  
      const response = await axios.get(
        createURLWithQuery(new URL('lyric/fcgi-bin/fcg_query_lyric_new.fcg', BASE_URL), {
          format: 'json',
          nobase64: '1',
          songmid: matchedSong.songmid
        }),
        {
          headers: {
            referer: 'https://y.qq.com/',
          },
          timeout:defaultTimeout
        },
      )
      const lyric = response.data.lyric
      if (!lyric) return
  
      return String(lyric)
    } catch (error) {
    }
  }
}
