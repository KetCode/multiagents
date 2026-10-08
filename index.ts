import { Annotation, StateGraph, START, END } from '@langchain/langgraph'
import fs from 'fs'

const State = Annotation.Root({
    input: Annotation<string>,
    output: Annotation<string>,
    output2: Annotation<string>,
})

const mockAction = (state: typeof State) => {
    return {
        output: "I'm doing well, thank you!",
    }
}

const mockAction2 = (state: typeof State) => {
    return {
        output2: "I'm doing great, thanks for asking!",
    }
}

const graph = new StateGraph(State)
    .addNode("John", mockAction)
    .addNode("Jane", mockAction2)
    .addEdge(START, "John")
    .addEdge("John", "Jane")
    .addEdge("Jane", END)
    .compile();

const result = await graph.invoke({ input: "Hello, how are you?" })
console.log(result)

const drawableGraph = await graph.getGraphAsync()
const graphImage = await drawableGraph.drawMermaidPng()
const graphArrayBuffer = await graphImage.arrayBuffer()

fs.writeFileSync('./graph.png', new Uint8Array(graphArrayBuffer))