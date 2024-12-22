'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Article {
  h1: string
  p: string
  img: string
  link: string
  songUrl: string
}

interface ApiResponse {
  timestamp: string
  articles: Article[]
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/scrape', { cache: 'no-store' })
      const json = await response.json()
      if (json.error) {
        throw new Error(json.error)
      }
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scraped Articles</h1>
      <p className="mb-4">Last fetched: {data?.timestamp}</p>
      <button 
        onClick={fetchData}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Data
      </button>
      {data?.articles.map((article, index) => (
        <div key={index} className="mb-8 p-4 border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">{article.h1}</h2>
          {article.img && (
            <div className="mb-4">
              <Image
                src={article.img}
                alt={`Image for ${article.h1}`}
                width={400}
                height={300}
                layout="responsive"
                className="rounded-md"
              />
            </div>
          )}
          <p className="text-gray-700">{article.p}</p>
          {article.link && (
            <a href={article.link} className="text-blue-500 hover:underline">
              Read more
            </a>
          )}
          {article.songUrl && (
            <div className="mt-4">
              <audio controls>
                <source src={article.songUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-sm text-gray-500 mt-2">
                Audio source: <a href="https://www.yiddish24.com" className="text-blue-500 hover:underline">yiddish24.com</a>
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
