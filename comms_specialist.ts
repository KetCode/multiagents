import { HumanMessage } from '@langchain/core/messages'
import { State } from './state.js'

export const commsSpecialist = (state: typeof State.State) => {
    console.log("Communications Specialist processing...")
    return {
        messages: [new HumanMessage("I'm doing well, thank you!")],
    }
}