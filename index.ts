import { Annotation, StateGraph, START, END } from '@langchain/langgraph'
import { BaseMessage, AIMessage, HumanMessage } from '@langchain/core/messages'
import fs from 'fs'

const State = Annotation.Root({
    input: Annotation<HumanMessage>,
    executedNodes: Annotation<number>({
       reducer: (currExecutedNodes, newExecutedNode) => currExecutedNodes + 1,
       default: () => 0, 
    }),
    output: Annotation<BaseMessage[]>({
        reducer: (currOutput, newOutput) => currOutput.concat(newOutput),
        default: () => [],
    }),
})

const mockAction = (state: typeof State) => {
    return {
        executedNodes: 1,
        output: [new AIMessage("I'm doing well, thank you!")],
    }
}

const mockAction2 = (state: typeof State) => {
    return {
        executedNodes: 1,
        output: [new HumanMessage("I'm doing great, thanks for asking!")],
    }
}

const graph = new StateGraph(State)
    .addNode("John", mockAction)
    .addNode("Jane", mockAction2)
    .addEdge(START, "John")
    .addEdge("John", "Jane")
    .addEdge("Jane", END)
    .compile();

const result = await graph.invoke({ input: new HumanMessage("Hello, how are you?") })
console.log(result)

const drawableGraph = await graph.getGraphAsync()
const graphImage = await drawableGraph.drawMermaidPng()
const graphArrayBuffer = await graphImage.arrayBuffer()

fs.writeFileSync('./graph.png', new Uint8Array(graphArrayBuffer))