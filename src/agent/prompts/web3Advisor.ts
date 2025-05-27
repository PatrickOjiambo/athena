/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { PromptBuilder } from "../builder";
import router from "../utils/router";
import zodToJsonSchema from "zod-to-json-schema";
import { Effect } from "effect";
import type { ModelOutput } from "../model";
import { cryptoAdvisor } from "../queries";
const tradingPrompt = new PromptBuilder<ModelOutput>(router, 5, true);
const web3Advisor = z.object({
    query: z.string(),
});
tradingPrompt
    .input({
        promptLevel: `1`,
        instruction: `
    Your name is athena, you are an agent that knows everything about a user's portfolio, you know everything about a user's wallet and their web3 portfolio including what they hold,, how much of each
    asset they are holding and everything else about their wallet.
    You are also familiar with web3 investing, this includes coins and memecoins and the risks associated with them.
    Your job is to select a single or multiple tools, that can be used to successfully fetch resources necessary for answering a user inquiry.
    Only provide recommendations based on user's portfolio that we provide to you. Use the tools available to you to answer the user query.
    You are presented with a couple of tools and need to choose which ones you can use to answer the user correctly and completely.
    Your tools include: 
    **GetUserPortfolio** - Use this tool to get all the assets and memecoins a user is holding and their distributions.
    `,
        tools: [
            {
                name: "GetUserPortfolio",
                description:
                    `Use this tool to answer a specific question about a users portfolio and to provide recommendations to the user on how they 
          can distribute and manage their assets`,
                args: zodToJsonSchema(web3Advisor),
            },
            // {
            //     name: "GetUserProfitAndLoss",
            //     description:
            //         `Use this tool to answer a specific question about a users profit and loss across different exchanges over time`,
            //     args: zodToJsonSchema(web3Advisor),
            // },
        ],
    })
    .parse<ModelOutput>((input) => {
        return Effect.tryPromise(async () => {
            const responses = input.toolResponses;
            if (!responses || responses.length == 0)
                throw new Error("No responses were found");
            let outputs: Array<string> = [];
            for (const response of responses) {
                switch (response.name) {
                    case "GetUserPortfolio": {
                        const parsed = web3Advisor.safeParse(response.args);
                        if (!parsed.success) throw new Error("Invalid query");
                        const resp = await cryptoAdvisor(parsed.data.query);
                        outputs.push(resp);
                        break;
                    }

                    default: {
                        throw new Error("No response was chosen");
                    }
                }
            }
            return outputs.join("\n\n");
        });
    })
    .input({
        promptLevel: `1`,
        instruction: `
    Summarise the input, so that it's clear, concise and complete.
    `,
    })
    .parse<ModelOutput>((input) =>
        Effect.try(() => {
            if (!input.answer || input.answer.trim().length == 0)
                throw new Error("Invalid output");

            return input;
        }),
    )
    .onStepComplete((artifact) => {
        if (artifact.executor == "prompt") {
            console.log(
                `[${artifact.output?.role ?? "assistant"}] ::`,
                artifact?.output?.answer,
                " ::: \n\n",
                artifact?.output?.toolResponses,
            );
        }
    });
export default tradingPrompt;
