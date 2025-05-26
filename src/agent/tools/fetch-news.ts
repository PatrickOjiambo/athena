"use server"
import axios from "axios"
import "dotenv/config"
import { NewsApiResponse } from "@/types/agent/news"
const APIKEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
if (!APIKEY) {
    throw new Error("NewsFeed API key is not defined")
}
export async function fetchNewsAboutUserHoldings(keyWords: string[]): Promise<any> {
    try {
        if (!APIKEY) {
            throw new Error("NewsFeed API key is not defined")
        }
        const query = keyWords.map(k => `"${k}"`).join(" OR ")
        const truncatedQuery = query.slice(0, 100)
        const queryString = `https://newsdata.io/api/1/latest?apikey=${APIKEY}&size=10&language=en&q=${encodeURIComponent(truncatedQuery)}`
        const response = await axios.get(
            queryString,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        )
        if (response.status !== 200) {
            throw new Error("Failed to fetch news")
        }
        const newsData = response.data as NewsApiResponse
        console.debug("Fetched news data:", newsData)
        if (newsData.status !== "success") {
            throw new Error("Error while fetching news")
        }
        const articles = newsData.results.map((article) => ({
            title: article.title,
            link: article.link,
            description: article.description,
            pubDate: article.pubDate,
            sourceName: article.source_name,
            imageUrl: article.image_url,
        }))
        return articles
    }
    catch (error) {
        console.error("Error fetching news about user holdings:", error)
        throw new Error("Unable to fetch news about user holdings")
    }
}