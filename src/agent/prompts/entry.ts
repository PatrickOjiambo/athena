/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod"
import { PromptBuilder } from "../builder"
import router from "../utils/router"
import zodToJsonSchema from "zod-to-json-schema"
import type { ModelOutput } from "../model"
import { Effect } from "effect"

const entryPrompt = new PromptBuilder<{name: "greetBack" | "answerNow" | "handOver" | "askBack", args: Record<string, any>}>(router, 5, true)

// greet or look for an answer

const greetBack = z.object({
    greeting: z.string()
})

const answerNow = z.object({
    answer: z.string()
})

const handOver = z.object({
    reason: z.string()
})

const askBack = z.object({
    question: z.string()
})

entryPrompt.input({
    promptLevel: `1`,
    instruction: `
    Your name is Athea, you are an agent, you know everything about a user's crypto portfolio, and you are able to answer any questions they have about it.
    You are a tool that is incharge of assisting a user with their inquiries about their portfolio. You can also recommend to them to do swaps based on their portfolio.
    Your job is to take in user input and figure out what they want.
    In case you are asked to explain something, hand over to the next agent.
    In case you are asked to how to take an action, hand over to the next agent.
    All questions made by the user should be considered to be implicitly in relation to athena.
    In case you are uncertain of your answer, hand it over to the next agent.
    When a user makes a query which can be found in the <input></input> tags.
    You need to do a couple of things:
    1. determine if the user is simply greeting you, or if the user has made a inquiry that requires further assistance from an outside source.
    If the user is simply greeting you, you must choose the **greetBack** tool and pass in your response.
    If the user's question can be answered by anything in this instruction, you must choose the **answerNow** tool and pass in your response, that is strictly from this instruction.
    If the user's question requires additional research from another agent choose the **handOver** tool, and pass in the reason why this is the case
    If the user's question is incomplete, and the user needs to provide more detailed info, use the **askBack** tool and pass in the question you want to ask the user
    If the user's question is empty use the **askBack** function
    You can only choose a single tool.
    `,
    tools: [
        {
            name: "greetBack",
            description: "Quickly reply the user with a simple greeting, use only if the inquiry is strictly only a greeting",
            args: zodToJsonSchema(greetBack)
        },
        {
            name: "answerNow",
            description: "Quickly reply to the user with a concise answer, that can be found in my instructions",
            args: zodToJsonSchema(answerNow)
        },
        {
            name: "handOver",
            description: "If the User Inquiry requires more specific information, hand over the execution to another agent with better access to information",
            args: zodToJsonSchema(handOver)
        },
        {
            name: "askBack",
            description: "If the User's Inquiry is incomplete and you require additional information from them inorder to decide the next step",
            args: zodToJsonSchema(askBack)
        }
    ],
    examples: `
    If the user input is something like: Hi there. 
    you should choose the **greetBack** tool and provide a greeting back e.g
    {
        greeting: "Hi there, I'm athena, how can I help you today"
    } 
    -----
    If the user's input is something like: Tell me about athena
    you should choose the **answerNow** tool and pass in an answer back e.g
    {
        answer: "Athena is a web3 advisor agent, that can help you with your portfolio and answer any questions you have about it. I can also recommend swaps for you on different exchanges."
    }
    -----
    If the user's input is something that requires more research like: I want to copy trades made by an AI trading agent.
    you should choose the **handOver** tool so that a more capable agent can handle the inquiry. and provide a detailed breakdown of the user's inquiry so that the next agent in the pipeline can understand the prompt, and take action.
    this is true also, if the user's query references an asset that is not in your instruction data.
    {
        "reason": "The user wants to copy trades made by an AI trading agent, but this is not something I can do. I need to hand over the inquiry to another agent that is able to do this."
    }
    ------
    If the user's input is incomplete in any way and you need further clarification, from them use the **askBack** tool and pass in a question for them.
    
    `
})
.parse<ModelOutput>((input)=>{
    return Effect.try(()=> { 
        const toolResponses = input.toolResponses
        if(!toolResponses) throw new Error("No tool responses were provided");

        if(toolResponses.length == 0) throw new Error("No tool responses were provided");

        if(toolResponses.length > 1) throw new Error("Tool response is ambiguous");

        const response = toolResponses.at(0)

        if(!response?.name || !response.args) throw new Error("Invalid tool responses");

        let parsed;
        if(response.name == "greetBack"){
            parsed = greetBack.safeParse(response.args)
        }else if(response.name == "answerNow"){
            parsed = answerNow.safeParse(response.args)
        }else if(response.name == "handOver"){
            parsed = handOver.safeParse( response.args)
        }else{
            parsed = askBack.safeParse(response.args)
        }

        if(!parsed) throw new Error("Unable to parse data");

        if(!parsed?.success){
            console.log("Something went wrong::", parsed.error)
            throw new Error("Unable to parse data")
        }

        return {
            name: response.name,
            args: parsed.data
        }
    })
})
.onStepComplete((artifact)=>{
    if(artifact.executor == "prompt"){
        console.log(`[${artifact.output?.role ?? "assistant"}] ::`, artifact?.output?.answer, " ::: \n\n", artifact?.output?.toolResponses)
    }
})

export default entryPrompt