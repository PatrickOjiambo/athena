import { PromptBuilder } from "./builder"
import { Effect, Either } from "effect"
import { type ModelOutput } from "./model"
import router from "./utils/router"
import axios from "axios"
import { BASEHOST } from "@/integrations/basehost"


export const getUserPortfolio = async (): Promise<any> => {
    return `User Potfolio`
}
export const getNewsAboutuserHoldings = async (keyWords: string[]): Promise<any> => {
    return `News about user holdings`
}
export const cryptoAdvisor = async (input: string): Promise<string> => {
    const portfolio = await getUserPortfolio()
    const newsAboutHoldings = await getNewsAboutuserHoldings(["OM", "ETH", "BTC"])
    const prompt = new PromptBuilder<ModelOutput>(router, 3, true)
    prompt.input({
        promptLevel: `1`,
        instruction: `
    Your name is athena. You are a web3 advisor and your job is to answer a users question about their portfolio.
    You job is to provide a clear and concise answer to the users question.
    You have access to the user's portfolio and latest news about the coins they are holding.
    Below are some of the advices you should consider to give them about their web3 portfolio: FEEL FREE TO OFFER ANY OTHER ADVICE THAT MAKES SENSE.
    1. Diversification: Encourage users to diversify their portfolio across different assets to reduce risk.
    2. Risk Management: Advise users to assess their risk tolerance and adjust their portfolio accordingly.
    3. Long-term vs Short-term: Discuss the difference between long-term and short-term investments and how they can impact portfolio strategy.
    4. Research: Emphasize the importance of conducting thorough research before making investment decisions.
    5. Market Trends: Provide insights on current market trends and how they may affect the user's portfolio.
    6. Asset Allocation: Suggest a balanced allocation of assets based on the user's investment goals.
    7. Security: Remind users to prioritize security measures for their digital assets.
    8. Tax Implications: Discuss potential tax implications of their investment decisions.
    
    <portfoliodetails>
    ${JSON.stringify(portfolio, null, 2)}
    </portfoliodetails>
    <newsaboutholdings>
    ${JSON.stringify(newsAboutHoldings, null, 2)}
    </newsaboutholdings>
        `,
    })

    const build = prompt.build(input)

    const response = await Effect.runPromise(
        Effect.either(
            build
        )
    )

    return Either.match(response, {
        onLeft(left) {
            console.log("Something went wrong ::", left)
            return "Unable to retrieve answer from documentation"
        },
        onRight(right) {
            return right.answer ?? "Unable to retrieve answer from documentation"
        },
    })
}
