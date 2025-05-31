import dynamic from 'next/dynamic'

const PlayingComponent = dynamic(
  () => import('@/components/playingComponent'),
  { ssr: false }
)

export default function Home () {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <PlayingComponent />
    </main>
  )
}
