export const streamOpenAi = async ({
  response,
  setConversation,
  conversation,
  message,
}: any) => {
  const data = response.body;
  if (!data) {
    return;
  }

  let text = "";
  const reader = data.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    const chunkValue = decoder.decode(value);
    const currentValue = checkValue(chunkValue);
    if (done) {
      break;
    }
    text += currentValue;
    setConversation([
      ...conversation,
      { content: message, role: "user" },
      { content: text, role: "system" },
    ]);
  }
};

const checkValue = (input: string) => {
  input = input.replace(/data: /g, "");
  input = input.replace(/(?<!\n\n)\n\n/g, "");
  input = input.replace(/\n\n\n\n/g, "\n\n");
  return input;
};
