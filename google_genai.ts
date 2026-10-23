import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import "dotenv/config"

const apiKey = process.env.GOOGLE_GENAI_API_KEY
const model = process.env.MODEL_AI

if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in the environment variables.")
}

if (!model) {
    throw new Error("MODEL_AI is not set in the environment variables.")
}

export const ai = new ChatGoogleGenerativeAI({
    model: model,
    apiKey: apiKey
})