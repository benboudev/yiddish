import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const timestamp = new Date().toISOString()
  console.log(`API called at: ${timestamp}`)

  try {
    const response = await fetch('https://www.yiddish24.com/cat/57', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch webpage')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const articles = $('.bulletin-news-col.text-right.yiddish-player-details.darkred').map((_, element) => {
      const $element = $(element)
      return {
        h1: $element.find('h1').text().trim(),
        p: $element.find('p').text().trim(),
        img: $element.find('img').attr('src') || '',
        audio: $element.find('.button-sections .aeroBtn').attr('data-url') || ''
      }
    }).get()

    console.log(`Found ${articles.length} articles`)

    return NextResponse.json({ 
      timestamp,
      articles 
    })

  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json({ 
      timestamp,
      error: 'Failed to scrape website' 
    }, { 
      status: 500 
    })
  }
}

