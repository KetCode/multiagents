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
    schema: z.object({}),
    func: async () => {
        console.log("pagando conta...")
        return "Conta paga com sucesso!"
    }
})

const createBill = new DynamicStructuredTool({
    name: "create_bill",
    description: "Cria uma novo boleto para ser pago pelo usuário",
    schema: z.object({
        price: z.number().describe("O valor do boleto a ser criado"),
    }),
    func: async () => {
        console.log("criando boleto...")
        return "Boleto criado com sucesso!"
    }
})

const getBill = new DynamicStructuredTool({
    name: "get_bill",
    description: "Pegar o valor da conta do usuário",
    schema: z.object({}),
    func: async () => {
        console.log("obtendo valor da conta...")
        return "Sua conta tem um valor de 500 reais."
    }
})

const financialSpecialistAgent = createAgent({
    model: ai,
    tools: [payBill, createBill, getBill],
    systemPrompt: new SystemMessage("Você é um especialista financeiro. Responda a pergunta do cliente com base na conversa a seguir. Seja conciso e direto ao ponto."),
})

export const financialSpecialist = async (state: typeof State.State) => {
    console.log("Financial Specialist processing...")

    const result = await financialSpecialistAgent.invoke(state)
    const financialSpecialistResponse = result.messages[result.messages.length - 1]?.content ?? 'Não consegui gerar uma resposta.'

    return {
        messages: [new HumanMessage({
            content: "Financial Specialist: " + financialSpecialistResponse
        })],
    }
}