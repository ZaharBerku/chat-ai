export type ChatCompletionContentPartText = {
  text: string;
  type: "text";
};
export type promptMessage = {
  name: string;
  instructions: string;
};

export type ChatCompletionContentPartImage = {
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };

  type: any;
};

export type ChatCompletionContentPart =
  | ChatCompletionContentPartText
  | ChatCompletionContentPartImage;

export type Content = string | Array<ChatCompletionContentPart> | null;

export type MessageUser = {
  content: Content;
  role: "user";
  files?: any;
};

export type MessageSystem = {
  content: string | null;
  role: "system";
  data?: any;
};

export type Messages = Array<MessageSystem | MessageUser>;

export type OpenAIModel = {
  name: string;
  id: string;
  available: boolean;
};

export type History = {
  id: number;
  ThreadId?: string;
  conversation: Messages;
  name: string;
  starred: boolean;
  personalize: string;
  isEnabledPersonalize: boolean;
  isLastCreate: boolean;
};

export type SortedHistory = {
  starredHistory: History[];
  currentHistory: History[];
};

export type NameActions = "delete" | "starred" | "value" | "conversation";

export type Actions = {
  delete: (id: number) => void;
  conversation: (history: History | null) => void;
  value: (name: string, id: number) => void;
  starred: (id: number) => void;
};

export type FileType = {
  id: number;
  file?: File;
  url?: string;
  type?: string;
  name?: string;
};

export type FilesArray = FileType;

export type FilesType = {
  files: FileType[];
  images: FileType[];
};

export type AnswersSystem = {
  [key: number]: {
    [key: number]: string[];
  };
};
