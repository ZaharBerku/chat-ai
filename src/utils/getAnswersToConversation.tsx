import { AnswersSystem } from "@/types/Model";

const getAnswersToConversation = (
  answers: AnswersSystem,
  chatId: number,
  indexMessage: number
) => {
  const answerConversation = answers?.[chatId]?.[indexMessage - 1];
  return answerConversation;
};

export { getAnswersToConversation };
