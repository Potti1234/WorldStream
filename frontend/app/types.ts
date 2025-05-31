export interface Streamer {
  id: string
  name: string
  avatar: string
  title: string
  category: string
  viewers: number
  isLive: boolean
  thumbnail: string
}

export interface TipData {
  id: string
  username: string
  amount: number
  message: string
  timestamp: string
}

export interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: string
  isTip?: boolean
  tipAmount?: number
  tipsReceived?: { username: string; amount: number }[]
  streamerTip?: number
  isStreamerTip?: boolean
}

export interface DashboardMessage {
  id: string
  username: string
  message: string
  timestamp: string
  isTip?: boolean
  streamerTip?: number
  isStreamerTip?: boolean
} 