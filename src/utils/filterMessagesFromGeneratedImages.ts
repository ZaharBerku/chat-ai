import { Messages } from "@/types/Model";
import { isJsonString } from "@/utils/isJsonString";

const filterMessagesFromGeneratedImages = (messages: Messages) => {
  return messages.filter(
    (item) =>
      item.role === "user" ||
      (item.content && !isJsonString(item.content as any) &&
        !JSON.parse(JSON.stringify(item.content) as any)?.data)
  );
};

export { filterMessagesFromGeneratedImages };
