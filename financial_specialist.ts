import { HumanMessage } from '@langchain/core/messages'
import { createAgent } from 'langchain'
import { State } from './state.js'
import { ai } from './google_genai.js'
import { SystemMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

const payBill = new DynamicStructuredTool({
    name: "pay_bill",
    description: "Pagar a conta do usuário",
    schema: z.object({
        amount: z.number().describe("O valor da conta a ser paga"),
    }),
    func: async ( { amount }) => {
        console.log(`pagando conta de R$ ${amount}...`)
        return "Conta paga com sucesso!"
    }
})

const financialSpecialistAgent = createAgent({
    model: ai,
    tools: [payBill],
    systemPrompt: new SystemMessage("Você é um especialista financeiro. Responda a pergunta do cliente com base na conversa a seguir. Seja conciso e direto ao ponto."),
})

export const financialSpecialist = async (state: typeof State.State) => {
    console.log("Financial Specialist processing...")

    const result = await financialSpecialistAgent.invoke(state)
    const financialSpecialistResponse = result.messages[result.messages.length - 1]?.content ?? 'Não consegui gerar uma resposta.'

    return {
        messages: [new HumanMessage({
            content: financialSpecialistResponse
        })],
    }
}