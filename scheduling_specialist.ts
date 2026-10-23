import { HumanMessage } from '@langchain/core/messages'
import { State } from './state.js'

export const schedulingSpecialist = (state: typeof State.State) => {
    console.log("Scheduling Specialist processing...")
    return {
        messages: [new HumanMessage("I'm doing well, thank you!")],
    }
}