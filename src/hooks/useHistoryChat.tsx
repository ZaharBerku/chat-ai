import useLocalStorage from "./useLocalStorage";
import useIndexDB from "./useIndexDB";
import { useEffect, useState } from "react";
import { History } from "@/types/Model";

type CustomInstructions = {
  personalize: string;
  isEnabledPersonalize: boolean;
};

type HistoryMethod = {
  historyChat: History[];
  id: number | null;
  findChatIndex(id?: number): number | null;
  findChat(): History | undefined;
  delete(id: number): void;
  createChat(commonPersonalize: CustomInstructions | null): History;
  chat(chat: History): History[];
  editName(name: string, id: number): History[];
  addIdThread(addIdThread: string, id: number): History[];
  toggleStarred(id: number): History[];
  deleteMessage(indexMessage: number, numberOfMessage?: number): History[];
  editAnswerSystem(answer: string, index: number): History[];
  editPersonalize(value: string): History[];
  togglePersonalize(value: boolean): History[];
};

type HistoryChatHook = {
  id?: number;
};

const historyMethod: HistoryMethod = {
  historyChat: [],
  id: null,

  findChatIndex(id) {
    if (!this.id && !id) {
      return null;
    }
    return this.historyChat.findIndex((chat) => chat.id === (id || this.id));
  },

  findChat() {
    return this.historyChat.find((chat) => chat.id === this.id);
  },

  delete(id) {
    const indexChat = this.findChatIndex(id);
    if (indexChat !== null && indexChat !== -1) {
      const copyHistory = [...this.historyChat];
      copyHistory.splice(indexChat, 1);
      this.historyChat = copyHistory;
    }
  },

  createChat(commonPersonalize) {
    const chat: History = {
      id: Date.now(),
      conversation: [],
      name: "",
      starred: false,
      personalize: commonPersonalize?.personalize ?? "",
      isEnabledPersonalize: commonPersonalize?.isEnabledPersonalize ?? false,
      isLastCreate: true,
    };
    const lastChat = this.historyChat.at(0);
    if (lastChat) {
      lastChat.isLastCreate = false;
    }
    this.historyChat.unshift(chat);
    this.id = chat.id;
    return chat;
  },

  chat(chat) {
    const indexChat = this.findChatIndex();

    if (indexChat !== null && indexChat !== -1) {
      this.historyChat[indexChat] = chat;
    } else {
      this.historyChat.unshift(chat);
    }
    return this.historyChat;
  },

  editName(name, id) {
    const indexChat = this.findChatIndex(id);
    if (indexChat !== null && indexChat !== -1) {
      this.historyChat[indexChat].name = name;
    }
    return this.historyChat;
  },

  addIdThread(ThreadId, id) {
    const indexChat = this.findChatIndex(id);
    if (indexChat !== null && indexChat !== -1) {
      this.historyChat[indexChat].ThreadId = ThreadId;
    }
    return this.historyChat;
  },

  toggleStarred(id) {
    const indexChat = this.findChatIndex(id);
    if (indexChat !== null && indexChat !== -1) {
      this.historyChat[indexChat].starred =
        !this.historyChat[indexChat].starred;
    }
    return this.historyChat;
  },

  deleteMessage(indexMessage, numberOfMessage = 1) {
    const indexChat = this.findChatIndex();
    if (indexChat !== null && indexChat !== -1) {
      this.historyChat[indexChat].conversation.splice(
        indexMessage,
        numberOfMessage
      );
    }
    return this.historyChat;
  },

  editAnswerSystem(answer, index) {
    const indexChat = this.findChatIndex();
    if (indexChat !== null && indexChat !== -1) {
      const lastAnswer = this.historyChat[indexChat]?.conversation?.at(index);
      if (lastAnswer) {
        lastAnswer.content = answer;
      }
    }
    return this.historyChat;
  },

  editPersonalize(value) {
    const indexChat = this.findChatIndex();
    if (indexChat !== null && indexChat !== -1) {
      this.historyChat[indexChat].personalize = value;
    }
    return this.historyChat;
  },

  togglePersonalize(value) {
    const indexChat = this.findChatIndex();
    if (indexChat !== null && indexChat !== -1) {
      this.historyChat[indexChat].isEnabledPersonalize = value;
    }
    return this.historyChat;
  },
};

const localStorageData = {
  historyStore: {
    name: "history",
    defaultValue: [],
  },
  selectChatStore: {
    name: "selectChat",
    defaultValue: null,
  },
  personalize: {
    name: "commonPersonalize",
    defaultValue: null,
  },
};

const useHistoryChat = () => {
  const { historyStore, selectChatStore, personalize } = localStorageData;
  const [history, setHistory] = useIndexDB<History[]>(
    historyStore.name,
    historyStore.defaultValue
  );

  const [currentChat, setCurrentChat] = useIndexDB<History | null>(
    selectChatStore.name,
    selectChatStore.defaultValue,
    true
  );

  const [commonPersonalize, setCommonPersonalize] =
    useLocalStorage<CustomInstructions | null>(
      personalize.name,
      personalize.defaultValue
    );

  const updateData = (
    historyChat: History[],
    id: number | null = historyMethod.id
  ) => {
    const currentChat = historyMethod.findChat();
    setHistory(historyChat);
    if (id === currentChat?.id) {
      setCurrentChat({ ...currentChat });
    }
  };

  const deleteChat = (id: number) => {
    historyMethod.delete(id);
    setHistory(historyMethod.historyChat);
    if (id === currentChat?.id) {
      setCurrentChat(null);
    }
  };

  const editName = (name: string, id: number) => {
    const historyChat = historyMethod.editName(name, id);
    updateData(historyChat, id);
  };
  const addThreadId = (ThreadId: string, id: number) => {
    const historyChat = historyMethod.addIdThread(ThreadId, id);
    updateData(historyChat, id);
  };

  const editAnswerSystem = (answer: string, index: number) => {
    const historyChat = historyMethod.editAnswerSystem(answer, index);
    updateData(historyChat);
  };

  const setPersonalize = (value: string) => {
    const chat = historyMethod.findChat();
    if (chat) {
      const historyChat = historyMethod.editPersonalize(value);
      updateData(historyChat);
      if (chat.isLastCreate) {
        setCommonPersonalize((currentPersonalize) => ({
          personalize: value,
          isEnabledPersonalize:
            currentPersonalize?.isEnabledPersonalize ?? false,
        }));
      }
    } else if (currentChat?.id) {
      setCommonPersonalize((currentPersonalize) => ({
        personalize: value,
        isEnabledPersonalize: currentPersonalize?.isEnabledPersonalize ?? false,
      }));
      setCurrentChat((currentChat) => {
        if (currentChat) {
          currentChat.personalize = value;
          return { ...currentChat } as History;
        }
        return currentChat;
      });
    }
  };

  const togglePersonalize = (value: boolean) => {
    const chat = historyMethod.findChat();
    if (chat) {
      const historyChat = historyMethod.togglePersonalize(value);
      updateData(historyChat);
      if (chat.isLastCreate) {
        setCommonPersonalize((currentPersonalize) => ({
          personalize: currentPersonalize?.personalize ?? "",
          isEnabledPersonalize: value,
        }));
      }
    } else if (currentChat?.id) {
      setCommonPersonalize((currentPersonalize) => ({
        personalize: currentPersonalize?.personalize ?? "",
        isEnabledPersonalize: value,
      }));
      setCurrentChat((currentChat) => {
        if (currentChat) {
          currentChat.isEnabledPersonalize = value;
          return { ...currentChat } as History;
        }
        return currentChat;
      });
    }
  };

  const deleteMessages = (indexMessage: number, numberOfMessage?: number) => {
    const historyChat = historyMethod.deleteMessage(
      indexMessage,
      numberOfMessage
    );
    const currentChat = historyMethod.findChat();
    setHistory(historyChat);
    if (currentChat) {
      setCurrentChat({ ...currentChat });
    }
  };

  const toggleStarred = (id: number) => {
    historyMethod.toggleStarred(id);
    const currentChat = historyMethod.findChat();
    setHistory(historyMethod.historyChat);
    if (id === currentChat?.id) {
      setCurrentChat({ ...currentChat });
    }
  };

  useEffect(() => {
    historyMethod.historyChat = [...history];
  }, [history]);

  useEffect(() => {
    historyMethod.historyChat = [...history];
    if (currentChat?.id) {
      historyMethod.id = currentChat?.id;
    } else {
      const chat = historyMethod.createChat(commonPersonalize);
      setCurrentChat(chat);
    }
  }, [currentChat?.id]);

  useEffect(() => {
    if (currentChat?.conversation?.length) {
      const currentHistory = historyMethod.chat(currentChat);
      setHistory([...currentHistory]);
    }
  }, [currentChat?.conversation]);

  useEffect(() => {
    const item = localStorage.getItem("history");
    if (item) {
      localStorage.removeItem("history");
    }
  }, []);

  return {
    history,
    currentChat,
    setCurrentChat,
    deleteChat,
    editName,
    toggleStarred,
    deleteMessages,
    setPersonalize,
    editAnswerSystem,
    togglePersonalize,
    addThreadId
  } as const;
};

export default useHistoryChat;
