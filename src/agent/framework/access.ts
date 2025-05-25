/* eslint-disable @typescript-eslint/no-explicit-any */
// "use server";

import { tanteiAnswer } from "../prompts";
import type { ModelOutput } from "../model";

interface getCompletionArgs {
  prompt: string;
}
export async function getCompletion(
  args: getCompletionArgs,
  history: Array<ModelOutput>,
) {
  const { prompt } = args;

  try {
  } catch (e) {
    console.log("Something went wrong::", e);

    return {
      name: "DISPLAY",
      description: "something went wrong",
      props: {
        content:
          "Oops 😬! I'm unable to answer that at the moment, having an issue with my servers, try asking again in a minute.",
      },
    };
  }
  const result = await tanteiAnswer(prompt, history);

  const ui_blocks = (() => {
    if ((result as any).props) return [result];
    const tool_response =
      (result as unknown as ModelOutput)?.toolResponses ?? [];

    return tool_response.map((response) => {
      return {
        name:
          response.name == "displaySummary"
            ? "DISPLAY"
            : response.name == "displayButton"
              ? "COPY"
              : "unknown",
        description: "response",
        props: response.args,
      };
    });
  })();

  console.log("UI BLOCKS::", ui_blocks);

  return ui_blocks;
}
