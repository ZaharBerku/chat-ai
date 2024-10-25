import { History, SortedHistory } from "@/types/Model";

const getSortedHistory: (history: History[]) => SortedHistory = (history: History[]) => {
  const sortedHistory = history.reduce((initialValue: SortedHistory, chat: History) => {
    if (chat.starred) {
      initialValue.starredHistory.push(chat)
    } else {
      initialValue.currentHistory.push(chat)
    }
    return initialValue;
  }, {
    starredHistory: [],
    currentHistory: []
  });
  return sortedHistory;
};

export { getSortedHistory }