import { HumanMessage } from '@langchain/core/messages'
import { State } from './state.js'
import { createAgent } from 'langchain'
import { ai } from './google_genai.js'
import { SystemMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

const sendEmail = new DynamicStructuredTool({
    name: "send_email",
    description: "Enviar um email",
    schema: z.object({
        emailContent: z.string().describe("O conteúdo do email")
    }),
    func: async ({ emailContent }) => {
        console.log("enviando email...")
        console.log(emailContent)
        return "Email enviado com sucesso!"
    }
})

const commsSpecialistAgent = createAgent({
    model: ai,
    tools: [sendEmail],
    systemPrompt: new SystemMessage("Você é um especialista secretário, responsável por enviar emails. Sumarize a conversa a seguir, com todas as ações tomadas, e responda de forma concisa e direta ao ponto, enviando emails para os clientes. Sem esperar nenhuma confirmação"),
})

export const commsSpecialist = async (state: typeof State.State) => {
    console.log("Communications Specialist processing...")

    const result = await commsSpecialistAgent.invoke(state)
    const commsSpecialistResponse = result.messages[result.messages.length - 1]?.content ?? 'Não consegui gerar uma resposta.'

    return {
        messages: [new HumanMessage({
            content: "Communications Specialist: " + commsSpecialistResponse
        })],
    }
}