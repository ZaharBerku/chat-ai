import { AssistantStream } from "openai/lib/AssistantStream";
import { isValidJSON } from "./isValidJSON";

const observeStream = (
  stream: AssistantStream,
  openai: any,
  availableFunctions: any,
  sandbox: any,
  res: any,
  currentChatId: any
) => {
  const checkAndRespondToToolCalls = async () => {
    const currentRun = stream.currentRun();
    if (currentRun?.status !== "requires_action") return res.end();
    const fnCallResults: any[] = [];

    const functions =
      currentRun?.required_action?.submit_tool_outputs?.tool_calls || [];
    for (const func of functions) {
      const result = await availableFunctions[func.function.name](
        func.function.arguments
          ? isValidJSON(func.function.arguments)
            ? JSON.parse(func.function.arguments)
            : {
                code: func.function.arguments,
              }
          : "",
        res,
        sandbox
      );
      fnCallResults.push({
        result,
        callId: func.id,
      });
    }

    let newStream = openai.beta.threads.runs.submitToolOutputsStream(
      currentChatId,
      currentRun.id,
      {
        tool_outputs: fnCallResults.map(({ callId, result }) => {
          return {
            tool_call_id: callId,
            output: JSON.stringify(result),
          };
        }),
      }
    );
    observeStream(
      newStream,
      openai,
      availableFunctions,
      sandbox,
      res,
      currentChatId
    );
  };

  stream
    .on("textDelta", (textDelta) => {
      if (textDelta.value) {
        const currentRun = stream.currentRun();
        if (currentRun) {
          const wasImageGeneration =
            currentRun.required_action?.submit_tool_outputs?.tool_calls.some(
              (tool: { function: { name: string } }) =>
                tool.function.name === "generation_images"
            );
          if (wasImageGeneration) {
            return null;
          } else {
            res.write(textDelta.value);
          }
        } else {
          res.write(textDelta.value);
        }
      }
    })
    .on("end", checkAndRespondToToolCalls)
    .on("error", (err) => {
      res.write(
        JSON.stringify({
          loader: { name: "failed" },
        })
      );
    });
};

export { observeStream };
