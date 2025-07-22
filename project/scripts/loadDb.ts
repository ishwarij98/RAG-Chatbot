import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"
import OpenAI from "openai";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY } = process.env;
console.log({ ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY });


const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const db1Data = [
    'https://www.formula1.com/',
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.skysports.com/f1/news',
    'https://www.bbc.com/sport/formula1',
    'https://www.britannica.com/sports/Formula-One-automobile-racing',
    'https://www.espn.in/f1/',
    'https://racingnews365.com/f1-news'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);

const db = client.db(ASTRA_DB_API_ENDPOINT, {
namespace: ASTRA_DB_NAMESPACE,
})

const splitter = new RecursiveCharacterTextSplitter({ 
    chunkSize: 512,
    chunkOverlap: 100
})

const createCollection = async (similarityMetric: SimilarityMetric =
"dot_product"
) => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric : similarityMetric
        }
    })
    console.log(res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of db1Data) {
        const content =  await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await ( const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            const vector = embedding.data[0].embedding 
            //response should be array of numbers

            const res= await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}

const scrapePage = async (url: string) => {
   const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
        headless: true
    },
    gotoOptions: {
        waitUntil: "domcontentloaded"
    },
    evaluate: async (page, browser) => {
       const result =  await page.evaluate(()=> document.body.innerHTML)
       await browser.close()
       return result
    }
   })
   return ( await loader.scrape())?.replace(/<[^>]*?/gm, '')
}

createCollection().then(() =>  loadSampleData())

// const main = async () => {
//   await createCollection();
//   await loadSampleData();
// };

// main().catch((err) => {
//   console.error("❌ Seeding failed:", err);
//   process.exit(1);
// });
