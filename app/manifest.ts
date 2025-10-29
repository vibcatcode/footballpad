import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FootballPad - 축구 전술, 경기분석, 기술훈련 전문 사이트',
    short_name: 'FootballPad',
    description: '축구 전술, 경기분석, 기술훈련, 레슨, 리뷰를 제공하는 축구 전문 사이트',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    scope: '/',
    lang: 'ko',
    categories: ['sports', 'education', 'lifestyle'],
    icons: [
      {
        src: '/FootballPad_Icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/FootballPad_Icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: '경기 기록',
        short_name: '경기 기록',
        description: '경기 결과를 빠르게 기록하세요',
        url: '/matches/record',
        icons: [{ src: '/FootballPad_Icon.png', sizes: '192x192' }]
      },
      {
        name: '축구 전술',
        short_name: '전술',
        description: '포메이션과 전술을 분석하세요',
        url: '/tactics',
        icons: [{ src: '/FootballPad_Icon.png', sizes: '192x192' }]
      },
      {
        name: '기술 훈련',
        short_name: '훈련',
        description: '체계적인 훈련 프로그램을 확인하세요',
        url: '/training',
        icons: [{ src: '/FootballPad_Icon.png', sizes: '192x192' }]
      }
    ]
  }
}
