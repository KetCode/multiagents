import { HumanMessage } from '@langchain/core/messages'
import { State } from './state.js'
import { createAgent } from 'langchain'
import { ai } from './google_genai.js'
import { SystemMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

const scheduleAppointment = new DynamicStructuredTool({
    name: "schedule_appointment",
    description: "Agendar uma nova consulta médica",
    schema: z.object({
        date: z.string().describe("A data da consulta"),
        time: z.string().describe("A hora da consulta"),
        description: z.string().describe("A descrição da consulta"),
    }),
    func: async () => {
        console.log("marcando consulta...")
        return "Consulta marcada com sucesso!"
    }
})

const rescheduleAppointment = new DynamicStructuredTool({
    name: "reschedule_appointment",
    description: "Reagendar uma consulta médica existente",
    schema: z.object({
        date: z.string().describe("A nova data da consulta"),
        time: z.string().describe("A nova hora da consulta"),
    }),
    func: async () => {
        console.log("reagendando consulta...")
        return "Consulta reagendada com sucesso!"
    }
})

const cancelAppointment = new DynamicStructuredTool({
    name: "cancel_appointment",
    description: "Cancelar uma consulta médica existente",
    schema: z.object({}),
    func: async () => {
        console.log("cancelando consulta...")
        return "Consulta cancelada com sucesso!"
    }
})

const schedulingSpecialistAgent = createAgent({
    model: ai,
    tools: [scheduleAppointment, rescheduleAppointment, cancelAppointment],
    systemPrompt: new SystemMessage("Você é um especialista secretário, responsável por organizar a agenda. Analise a conversa a seguir e responda de forma concisa e direta ao ponto, agendando, reagendando ou cancelando consultas médicas conforme necessário. Não pergunte nada ao usuário"),
})

export const schedulingSpecialist = async (state: typeof State.State) => {
    console.log("Scheduling Specialist processing...")

    const result = await schedulingSpecialistAgent.invoke(state)
    const schedulingSpecialistResponse = result.messages[result.messages.length - 1]?.content ?? 'Não consegui gerar uma resposta.'

    return {
        messages: [new HumanMessage({
            content: "Scheduling Specialist: " + schedulingSpecialistResponse
        })],
    }
}