import { createURLWithQuery, defaultTimeout } from '../utils'
import { Provider, SearchParams } from './Provider'
import axios from "axios"
import crypto from 'crypto'

const BASE_URL = 'https://music.163.com/api/'

interface ArtistInfo {
  id: number
  name: string
}

const randomUserAgent = (): string => {
  const userAgentList = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Mobile/14F89;GameHelper",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:46.0) Gecko/20100101 Firefox/46.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:46.0) Gecko/20100101 Firefox/46.0",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)",
    "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
    "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)",
    "Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/13.10586",
    "Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1",
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
  ]
  const num = Math.floor(Math.random() * userAgentList.length)
  return userAgentList[num]
}

const getRandomHex = (length:number):string  => {
  const isOdd = length % 2;
  const randHex = crypto.randomBytes(8).toString("hex")
  return isOdd ? randHex.slice(1) : randHex;
}

const randomCookies = (musicU: string): string => {
  const CookiesList = [
    'os=pc; osver=Microsoft-Windows-10-Professional-build-10586-64bit; appver=2.0.3.131777; channel=netease; __remember_me=true',
    // 'MUSIC_U'+ musicU +'; buildver=1506310743; resolution=1920x1080; mobilename=MI5; osver=7.0.1; channel=coolapk; os=android; appver=4.2.0',
    'osver=%E7%89%88%E6%9C%AC%2010.13.3%EF%BC%88%E7%89%88%E5%8F%B7%2017D47%EF%BC%89; os=osx; appver=1.5.9; MUSIC_U=' + musicU + '; channel=netease;'
  ]
  const num = Math.floor(Math.random() * CookiesList.length)
  return CookiesList[num]
}

// const headers = {
//   'User-Agent':
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
//   "cookie": 'NMTID=',
// }

export class NetEase implements Provider {
  private async getArtistInfo(artist: string): Promise<ArtistInfo | undefined> {
    try {
      const response = await axios.post(
        BASE_URL+"cloudsearch/pc",
        { 
          s: artist,
          limit: '1',
          type: '100'
        },{
          timeout: defaultTimeout,
          headers: {
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'music.163.com',
            'User-Agent': randomUserAgent(),
            "Cookie": randomCookies(getRandomHex(128)),
            },
        proxy: false,
    }
      )
      // console.log("response config: " + JSON.stringify(response.config))
      // console.log("response: " + JSON.stringify(response.data))
      if (!response.data || response.data.code !==200) return
      const matchedArtist = response.data.result.artists?.[0]
      if (!matchedArtist) return
      return {
        id: matchedArtist.id,
        name: matchedArtist.name,
      }
    } catch (error) {
      // console.log("error 1",error)
    }
    
  }

  async getBestMatched({ name, artist }: SearchParams) {
    const artistInfo = await this.getArtistInfo(artist)
    if (!artistInfo) return

    try {
      const response = await axios.post(
        BASE_URL+"cloudsearch/pc",
        {
          s: [name, artistInfo.name].join(' '),
          limit: '10',
          type: '1',
        },{
          timeout:defaultTimeout,
          headers: {
            'Accept': '*/*',
            // 'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'music.163.com',
            'User-Agent': randomUserAgent(),
            "Cookie": randomCookies(getRandomHex(128)),
            }
        } 
      )
      // console.log("response config: " + JSON.stringify(response.config))
      // console.log("response: " + JSON.stringify(response.data))
      if (!response.data || response.data.code !==200) return
      const songs = response.data.result.songs
      const matchedSongs = songs.filter(({ ar }: any) => ar?.[0]?.id === artistInfo.id)
      const matchedSong = matchedSongs.find((song: any) => String(song.name).includes(name)) ?? matchedSongs[0]
      
      if (!matchedSong) return
  
      const response2 = await axios.get(
        createURLWithQuery(new URL('song/lyric', BASE_URL), {
          id: String(matchedSong.id),
          lv: '1',
        }),
        {timeout:defaultTimeout}
      )
      // console.log("response2: " + response2.data)
      if (!response2.data) return
      const lrc = response2.data.lrc
      if (!lrc) return
      // console.log("LRC",lrc)
      return lrc.lyric
    } catch (error) {
      // console.log("error 2",error)
    }
  }
}
