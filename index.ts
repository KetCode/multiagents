import { Annotation, StateGraph, START, END } from '@langchain/langgraph'
import { BaseMessage, AIMessage, HumanMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import "dotenv/config"
import z from 'zod'
import fs from 'fs'

const apiKey = process.env.GOOGLE_GENAI_API_KEY
const model = process.env.MODEL_AI

if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in the environment variables.")
}

if (!model) {
    throw new Error("MODEL_AI is not set in the environment variables.")
}

const ai = new ChatGoogleGenerativeAI({
    model: model,
    apiKey: apiKey
})

const State = Annotation.Root({
    input: Annotation<HumanMessage>,
    executedNodes: Annotation<number>({
       reducer: (currExecutedNodes, newExecutedNode) => currExecutedNodes + 1,
       default: () => 0, 
    }),
    nextNode: Annotation<string>,
    output: Annotation<BaseMessage[]>({
        reducer: (currOutput, newOutput) => currOutput.concat(newOutput),
        default: () => [],
    }),
})

const routingTool = {
    name: "routingTool",
    description: "Selecione o proximo estado",
    schema: z.object({
        next: z.enum(["financial_specialist", "scheduling_specialist", "comms_specialist", "END"]),
    })
}

const supervisor = async (state: typeof State.State) => {
    console.log("Supervisor escolhendo o proximo")

    const aiWithTool = ai.bindTools([routingTool], {
        tool_choice: "routingTool",
    })

    const aiResponse = await aiWithTool.invoke("Não preciso de nada. Escolha um desses proximos estados: financial_specialist, scheduling_specialist, comms_specialist, END. Retorne apenas o nome do especialista e nada mais. Sem quebra de linha")
    
    if(aiResponse.tool_calls) {
        return { nextNode: aiResponse.tool_calls[0]?.args.next }
    } else {
        return { nextNode: "END" }
    }
}

const financialSpecialist = (state: typeof State.State) => {
    console.log("Financial Specialist processing...")
    return {
        executedNodes: 1,
        output: [new AIMessage("I'm doing well, thank you!")],
    }
}

const schedulingSpecialist = (state: typeof State.State) => {
    console.log("Scheduling Specialist processing...")
    return {
        executedNodes: 1,
        output: [new AIMessage("I'm doing well, thank you!")],
    }
}

const commsSpecialist = (state: typeof State.State) => {
    console.log("Communications Specialist processing...")
    return {
        executedNodes: 1,
        output: [new AIMessage("I'm doing well, thank you!")],
    }
}

const graph = new StateGraph(State)
    .addNode("supervisor", supervisor)
    .addNode("financial_specialist", financialSpecialist)
    .addNode("scheduling_specialist", schedulingSpecialist)
    .addNode("comms_specialist", commsSpecialist)
    .addEdge(START, "supervisor")
    .addConditionalEdges("supervisor", (state: typeof State.State) => {
       return state.nextNode
    })
    .addEdge("financial_specialist", "supervisor")
    .addEdge("scheduling_specialist", "supervisor")
    .addEdge("comms_specialist", "supervisor")
    .compile();

const result = await graph.invoke({ input: new HumanMessage("Hello, how are you?") })
console.log(result)

const drawableGraph = await graph.getGraphAsync()
const graphImage = await drawableGraph.drawMermaidPng()
const graphArrayBuffer = await graphImage.arrayBuffer()

fs.writeFileSync('./graph.png', new Uint8Array(graphArrayBuffer))