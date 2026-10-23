import { ai } from "./google_genai.js"
import { State } from "./state.js"

import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { z } from 'zod'

const routingTool = {
    name: "routingTool",
    description: "Selecione o proximo estado",
    schema: z.object({
        next: z.enum(["financial_specialist", "scheduling_specialist", "comms_specialist", "END"]),
    })
}

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Você é um supervisor de um consultório. Tome a melhor ação para atender a necessidade do cliente " +
        "com base na conversa a seguir:"],
        new MessagesPlaceholder("messages"),
    ["human", "Escolha um desses proximos estados: financial_specialist, scheduling_specialist, comms_specialist, END (estado terminal se não tiver mais nada a fazer)"],
])

export const supervisor = async (state: typeof State.State) => {
    console.log("Supervisor escolhendo o proximo")

    const aiWithTool = ai.bindTools([routingTool], {
        tool_choice: "routingTool",
    })

    const aiResponse = await prompt.pipe(aiWithTool).invoke({
        messages: state.messages,
    })
    
    if(aiResponse.tool_calls) {
        return { nextNode: aiResponse.tool_calls[0]?.args.next }
    } else {
        return { nextNode: "END" }
    }
}