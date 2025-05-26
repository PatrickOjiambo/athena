import { PromptBuilder } from "./builder"
import { Effect, Either } from "effect"
import { type ModelOutput } from "./model"
import router from "./utils/router"
import axios from "axios"
import { BASEHOST } from "@/integrations/basehost"
import getUserPortfolio from "./tools/get_user_portfolio"
// import { fetchNewsAboutUserHoldings } from "./tools/fetch-news"
export const cryptoAdvisor = async (input: string): Promise<string> => {
    const portfolio = await getUserPortfolio("vwHq2nXm8bAoxPeXXJ9douzZHcahVCopuFjzLEbk3zv")
    // const listOfCoins = portfolio.map((coin) => coin.symbol.toUpperCase())
    // const newsAboutHoldings = await fetchNewsAboutUserHoldings(listOfCoins)
    // console.debug("Fetched news about holdings:", newsAboutHoldings)
    console.log("Portfolio details:", portfolio)
    const prompt = new PromptBuilder<ModelOutput>(router, 3, true)
    prompt.input({
        promptLevel: `1`,
        instruction: `
    Your name is athena. You are a web3 advisor and your job is to answer a users question about their portfolio.
    You job is to provide a clear and concise answer to the users question.
    You have access to the user's portfolio and latest news about the coins they are holding.
    Below are some of the advices you should consider to give them about their web3 portfolio: FEEL FREE TO OFFER ANY OTHER ADVICE THAT MAKES SENSE.
    THE ADVICE SHOULD BE GIVEN BASED ON THEIR PORTFOLIO AND THE CURRENT MARKET CONDITIONS.
    DON'T GIVE GENERAL ADVICES, IF THE USER DOESN'T HAVE ANY ASSETS, DON'T GIVE THEM ADVICE.
    
    <portfoliodetails>
    ${JSON.stringify(portfolio, null, 2)}
    </portfoliodetails>
   
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
