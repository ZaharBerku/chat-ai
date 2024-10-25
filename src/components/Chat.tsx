import { ChangeEvent, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { BsPlusLg } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import { CiStop1 } from "react-icons/ci";
import { useSession } from "next-auth/react";
import { MdKeyboardVoice } from "react-icons/md";
import useRecord from "@/hooks/useRecord";
import useUploadFiles from "@/hooks/useUploadFiles";
import ResetButton from "./ResetButton";
import { env } from "../config/env";
import clsx from "clsx";
import Vision from "./Vision";
import Files from "./Files";
import Field from "./Field";
import Message from "./Message";

import { GPT4_OPENAI_MODEL } from "@/shared/Constants";
import {
  Messages,
  Content,
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  MessageUser,
} from "@/types/Model";
import { filterDatesWithinAnHour } from "@/utils/filterDatesWithinAnHour";
import { isJsonString } from "@/utils/isJsonString";
import useHistoryChat from "@/hooks/useHistoryChat";

const Chat = ({
  toggleComponentVisibility,
  currentChat,
  setCurrentChat,
  editName,
  isOnline,
  isComponentVisible,
  deleteMessages,
  editAnswerSystem,
  setAnswers,
  setAnswerCode,
  answers,
  answerCode,
  addThreadId,
}: any) => {
  const { data: session } = useSession();
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isScrollingDown, setIsScrollingDown] = useState(true);
  const [textLoadingTool, setTextLoadingTool] = useState<string | null>(null);
  const [openText, setOpenText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isStreaming = useRef(false);
  const isCurrentlyStreaming = useRef(false);
  const [isStreamingAnswer, setIsStreamingAnswer] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<Messages>([]);

  // const {
  //   startRecording,
  //   stopRecording,
  //   backgroundRecordButton,
  //   text: speechToText,
  //   recording,
  //   setText,
  // }: any = useRecord();
  const {
    isLoading: isLoadingFiles,
    selectedFiles,
    handleFilesChange,
    deleteFiles,
    resetFiles,
    setSelectedFiles,
  } = useUploadFiles();
  const handleToggleText = () => {
    setOpenText((currentValue) => !currentValue);
  };
  const handleCancelStreaming = () => {
    isStreaming.current = true;
  };

  const handleOpenStreaming = () => {
    isStreaming.current = false;
  };

  const handleRemoveAnswer = (index: number) => {
    const copyAnswers = { ...answers };
    if (copyAnswers[currentChat?.id] && copyAnswers[currentChat?.id][index]) {
      delete copyAnswers[currentChat?.id][index];
      setAnswers(copyAnswers);
    }
  };

  const setScrollToBottom = () => {
    if (bottomOfChatRef.current && isScrollingDown) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const setFocusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current?.focus();
    }
  };

  const getMessagesWithResetLastAnswer = () => {
    setConversation((currentMessages) => {
      const copy = [...currentMessages];
      if (currentMessages.length) {
        copy.splice(-1);
        return [...copy, { content: null, role: "system" }];
      }
      return currentMessages;
    });
    const copyMessages = [...conversation];
    copyMessages.splice(-1);
    return copyMessages;
  };

  const resetData = () => {
    setErrorMessage("");
    // setText("");
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.target.scrollTop;
    setIsScrollingDown(currentScrollY > (prevScrollY || 0));
    setPrevScrollY(currentScrollY);
  };

  const handlePaste = async (event: any) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];
    const filterImage = Array.from(items).filter((item: any) => {
      return (
        item.type.indexOf("image") !== -1 && validImageTypes.includes(item.type)
      );
    });
    if (filterImage?.length) {
      const result = await Promise.all(
        filterImage.map((item: any, index) => {
          const file = item.getAsFile();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const data = {
                url: reader.result as string,
                id: Date.now() + index,
                type: file.type,
                name: file.name,
              };
              resolve(data);
            };
            reader.readAsDataURL(file);
          });
        })
      );
      setSelectedFiles((currentFiles) => ({
        ...currentFiles,
        images: [...currentFiles.images, ...(result as any)],
      }));
    }
  };

  const getTitleForNewChat = async (messages: Messages) => {
    try {
      const body = {
        messages,
      };
      const response = await fetch(`/api/getTitle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return response;
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);
    }
  };

  const writeToLocalStorageAnswerCode = async (
    code: string,
    name: string,
    indexAnswer: number
  ) => {
    if (currentChat?.id) {
      setAnswerCode((currentAnswer: any) => {
        const objectIndexQuestion = currentAnswer[currentChat?.id] || {};
        objectIndexQuestion[indexAnswer] = {
          ...(objectIndexQuestion[indexAnswer] || {}),
          [name]: code,
        };

        currentAnswer[currentChat?.id] = objectIndexQuestion;
        return { ...currentAnswer };
      });
    }
  };

  const streamAnswer = async (response: any) => {
    const reader = response.body?.getReader();
    const typeNotification = {
      search: "Searching the web",
      generating: "Generating images",
      code: "Executing code",
      install: "Installing packages",
      execute: "Executing command",
      failed: "The request failed",
    };
    let text = "";
    const processStream = async () => {
      setIsStreamingAnswer(true);
      isCurrentlyStreaming.current = true;
      while (true) {
        const data = await reader.read();
        const { done, value } = data;
        if (done || isStreaming.current) {
          break;
        }

        const chunk = new TextDecoder("utf-8").decode(value);
        if (
          chunk &&
          isJsonString(chunk) &&
          JSON.parse(chunk) &&
          JSON.parse(chunk)?.hasOwnProperty("loader")
        ) {
          const { loader, data } = JSON.parse(chunk);
          const {
            name,
            code,
            nameCode,
            chatId,
          }: {
            name:
              | "search"
              | "generating"
              | "code"
              | "execute"
              | "failed"
              | "creating_conversation";
            isLoading: boolean;
            nameCode: string;
            code: string;
            chatId?: string;
          } = loader;
          if (nameCode) {
            writeToLocalStorageAnswerCode(
              code,
              nameCode,
              conversation.length + 1
            );
          }
          if (name !== "creating_conversation") {
            setTextLoadingTool(`${typeNotification[name]}`);
          }
          if (name === "failed") {
            setConversation((currentConversation: Messages) => {
              const lastMessage = currentConversation.at(-1);
              if (lastMessage) {
                lastMessage.content = `${typeNotification[name]}`;
              }
              return [...currentConversation];
            });
            setTextLoadingTool(null);
            setErrorMessage(`${typeNotification[name]}`);
          }
          if (name === "creating_conversation") {
            if (chatId) {
              addThreadId(chatId, currentChat?.id);
            }
          }
          if (data) {
            setTextLoadingTool(null);
            setConversation((currentConversation: any) => {
              const lastMessage = currentConversation.at(-1);
              if (lastMessage) {
                lastMessage.data = JSON.stringify({ data });
              }
              return [...currentConversation];
            });
          }
        } else {
          setTextLoadingTool(null);
          text += chunk || "";
          setConversation((currentConversation: Messages) => {
            const lastMessage = currentConversation.at(-1);
            if (lastMessage) {
              lastMessage.content = text;
            }
            return [...currentConversation];
          });
        }
      }
      setIsStreamingAnswer(false);
      isCurrentlyStreaming.current = false;
    };
    await processStream();
    return text;
  };

  const initialMessage = (content: Content, files?: any) => {
    const saveFiles = files?.map((file: any) => ({
      type: file.file.type,
      name: file.file.name,
    }));
    setConversation((currentMessages) => {
      return [
        ...currentMessages,
        files?.length
          ? { content, role: "user", files: { files: saveFiles } }
          : { content, role: "user" },
        { content: null, role: "system" },
      ];
    });
  };

  const getContentFromUserMessageWithAttachedFiles = (message: string) => {
    const images = selectedFiles.images.map((file: any) => {
      return {
        type: "image_url",
        image_url: {
          url: file.url,
        },
      };
    });
    const content: ChatCompletionContentPart[] = [
      {
        type: "text",
        text: message,
      },
      ...images,
    ];
    return { content, files: selectedFiles.files };
  };

  const getAnswerOpenAI = async (messages: Messages, files: any = []) => {
    try {
      const body = {
        messages,
        model: GPT4_OPENAI_MODEL,
        name: session?.user?.name,
        personalize: currentChat?.isEnabledPersonalize
          ? currentChat.personalize
          : "",
        currentChatId: currentChat?.ThreadId ? currentChat.ThreadId : "",
      };
      const formData = new FormData();

      files.forEach((file: any, index: number) => {
        formData.append(`files[${index}]`, file.file);
        formData.append(`files[${index}].name`, file.file.name);
        formData.append(`files[${index}].type`, file.file.type);
      });
      formData.append("data", JSON.stringify(body));
      const response = await fetch("/api/openai", {
        method: "POST",
        body: formData,
      });

      if (response.ok && response.body) {
        const cookies = response.headers.get("Set-Cookie");
        if (cookies && !cookies.includes("undefined")) {
          Cookies.set("sandboxId", cookies);
        }
        const answer = await streamAnswer(response);
        return answer;
      } else {
        setErrorMessage(
          "An error occurred during ping to OpenAI. Please try again."
        );
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processSetTitleForNewChat = async (
    content: ChatCompletionContentPart[],
    answer: string
  ) => {
    const { title } = await getTitleForNewChat([
      { content, role: "user" },
      { content: answer, role: "system" },
    ]).then((res) => res?.json());
    if (title) {
      editName(title, currentChat.id);
    }
  };

  const processSendUserMessageAndGetAnswer = async (message: string) => {
    const { content, files } =
      getContentFromUserMessageWithAttachedFiles(message);
    initialMessage(content, files);
    resetFiles();
    const messages = [
      ...conversation,
      { content, role: "user" } as MessageUser,
    ];
    const answer = await getAnswerOpenAI(messages, files);
    if (!conversation.length) {
      await processSetTitleForNewChat(content, answer as string);
    }
  };

  const sendMessage = async (message: string) => {
    // Don't send empty messages
    if (message.length < 1) {
      setErrorMessage("Please enter a message.");
      return;
    } else {
      setErrorMessage("");
    }
    await processSendUserMessageAndGetAnswer(message);
  };

  const resendPrevMessages = async () => {
    const messages = getMessagesWithResetLastAnswer();
    setErrorMessage("");
    const answer = await getAnswerOpenAI(messages);
    const content = messages.at(-1)?.content;
    if (
      conversation.length < 3 &&
      answer &&
      content &&
      typeof content !== "string"
    ) {
      await processSetTitleForNewChat(content, answer);
    }
  };

  const regenerateAnswer = async (answer: string, indexAnswer: number) => {
    const INDEX_QUESTION = indexAnswer - 1;
    const isHaveAnswer =
      answers[currentChat?.id] &&
      answers[currentChat?.id][INDEX_QUESTION]?.includes(answer);

    if (currentChat?.id) {
      const messages = getMessagesWithResetLastAnswer();
      const newAnswer = await getAnswerOpenAI(messages);
      setAnswers((currentAnswer: any) => {
        const objectIndexQuestion = currentAnswer[currentChat?.id] || {};
        const answersToQuestion = objectIndexQuestion[INDEX_QUESTION] || [];
        objectIndexQuestion[INDEX_QUESTION] = isHaveAnswer
          ? [...answersToQuestion, newAnswer]
          : [...answersToQuestion, answer, newAnswer];

        currentAnswer[currentChat?.id] = objectIndexQuestion;
        return { ...currentAnswer };
      });
    }
  };

  const saveEditLastUserMessage = async (
    newContent: ChatCompletionContentPart[],
    index: number
  ) => {
    handleRemoveAnswer(index);
    initialMessage(newContent);
    resetFiles();
    const messages = [
      ...conversation,
      { content: newContent, role: "user" } as MessageUser,
    ];
    await getAnswerOpenAI(messages);
  };

  const handleSubmit = async (
    typeSend: "message" | "resend" | "regenerate" | "editMessage",
    ...args: any
  ) => {
    const varianSendMessage = {
      // speech: sendSpeech,
      message: sendMessage,
      resend: resendPrevMessages,
      regenerate: regenerateAnswer,
      editMessage: saveEditLastUserMessage,
    };

    setIsLoading(true);
    handleOpenStreaming();
    const functionSend: any = varianSendMessage[typeSend];
    await functionSend(...args);
  };

  // useEffect(() => {
  //   if (speechToText) {
  //     handleSubmit("speech");
  //   }
  // }, [speechToText]);

  useEffect(() => {
    if (!isLoading) {
      setFocusTextarea();
    }
  }, [isLoading]);

  useEffect(() => {
    if (conversation.length) {
      setOpenText(false);
      setCurrentChat((currentChat: any) =>
        currentChat?.id ? { ...currentChat, conversation } : currentChat
      );
    } else {
      setOpenText(true);
    }
  }, [conversation]);

  useEffect(() => {
    setScrollToBottom();
  }, [currentChat?.id, conversation]);

  useEffect(() => {
    if (currentChat?.id) {
      const filterFromOldImage = filterDatesWithinAnHour(
        currentChat.conversation
      );
      setConversation(filterFromOldImage);
      if (filterFromOldImage.length !== currentChat.conversation.length) {
        setCurrentChat((currentChat: any) => {
          return { ...currentChat, conversation: filterFromOldImage };
        });
      }
      resetData();
    }
    if (!isComponentVisible) {
      setFocusTextarea();
    }
  }, [currentChat?.id]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey || event.altKey) &&
        event.key === "Enter" &&
        isCurrentlyStreaming.current
      ) {
        handleCancelStreaming();
      }
    };
    setFocusTextarea();
    if (currentChat?.conversation?.length) {
      setCurrentChat(null);
    }

    document.addEventListener("keydown", handleShortcut);

    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    const handleCopy = (event: any) => {
      event.preventDefault();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const clonedContent = range.cloneContents();
        const div = document.createElement("div");
        div.appendChild(clonedContent);

        const htmlContent = div.innerHTML;

        event.clipboardData.setData("text/html", htmlContent);
        event.clipboardData.setData("text/plain", selection.toString());

        console.log("Скопійований HTML:", htmlContent);
      }
    };

    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  return (
    <div className="flex max-w-full flex-1 flex-col h-[100dvh]">
      <div className="sticky top-0 z-10 flex items-center border-b border-white/20 bg-blue-800 pl-1 pt-1 text-gray-200 sm:pl-3 md:hidden">
        <button
          type="button"
          className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-white"
          onClick={toggleComponentVisibility}
        >
          <span className="sr-only">Open sidebar</span>
          <RxHamburgerMenu className="h-6 w-6 text-white" />
        </button>
        <h1 className="flex-1 text-center text-base font-normal">New chat</h1>
        <button
          onClick={() => setCurrentChat(null)}
          type="button"
          className="px-3"
        >
          <BsPlusLg className="h-6 w-6" />
        </button>
      </div>
      <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
        <div className="flex-1 overflow-hidden">
          <div className="react-scroll-to-bottom--css-ikyem-79elbk h-full dark:bg-blue-800">
            <div
              onScroll={handleScroll}
              className="react-scroll-to-bottom--css-ikyem-1n7m0yu"
            >
              {conversation.length > 0 ? (
                <div className="flex flex-col items-center text-sm bg-blue-800">
                  {conversation.map((message, index) => (
                    <Message
                      key={(currentChat?.id || 0) + index}
                      errorMessage={errorMessage}
                      message={message}
                      indexMessage={index}
                      isLastUserMessage={conversation.length - 2 === index}
                      isLastSystemMessage={conversation.length - 1 === index}
                      isStreamingAnswer={isStreamingAnswer}
                      handleSubmit={handleSubmit}
                      deleteMessages={deleteMessages}
                      currentChat={currentChat}
                      editAnswerSystem={editAnswerSystem}
                      answers={answers}
                      textLoadingTool={textLoadingTool}
                      answerCode={answerCode && answerCode[currentChat?.id]}
                    />
                  ))}
                  <div
                    className={clsx(
                      "w-full flex-shrink-0",
                      isStreamingAnswer ||
                        selectedFiles?.files?.length ||
                        selectedFiles?.images?.length
                        ? "h-36 md:h-48"
                        : "h-[86px] md:h-36"
                    )}
                  ></div>
                  <div ref={bottomOfChatRef}></div>
                </div>
              ) : null}
              <div className="flex flex-col items-center text-sm dark:bg-blue-800"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-blue-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2 z-50">
          <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
            <div className="relative flex flex-col h-full flex-1 items-end md:flex-col">
              {isStreamingAnswer && (
                <div className="flex gap-3 mb-3 mr-3 items-center h-10">
                  {isStreamingAnswer && (
                    <button
                      className={
                        "text-white flex gap-1 items-center px-3 py-2 text-sm rounded-lg border border-white max-w-min whitespace-nowrap"
                      }
                      type="button"
                      onClick={handleCancelStreaming}
                    >
                      <CiStop1 size={12} /> Stop generation
                    </button>
                  )}
                  {/* TODO - decided temporarily remove  */}
                  {/* {!Boolean(errorMessage) && isOnline && (
                  <div className="flex gap-2 items-end">
                    {recording && (
                      <span className="text-white">Listening...</span>
                    )}
                    <div className="flex justify-center items-center relative select-none ">
                      <div
                        ref={backgroundRecordButton}
                        className="bg-blue-500 z-30 absolute w-36 h-36 rounded-full scale-0 box-border flex items-center justify-center opacity-40 select-none"
                      ></div>
      
                      <button
                        type="button"
                        className="relative z-50 select-none"
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                      >
                        <MdKeyboardVoice
                          color="white"
                          className="select-none"
                          size={30}
                        />
                      </button>
                    </div>
                  </div>
                )} */}
                </div>
              )}
              {Boolean(errorMessage) || !isOnline ? (
                <ResetButton
                  isError={Boolean(errorMessage)}
                  textError={errorMessage}
                  isOnline={isOnline}
                  isStreamingAnswer={isStreamingAnswer}
                  handleRegenerate={() => handleSubmit("resend")}
                />
              ) : (
                <div
                  className={
                    "flex flex-col w-full pl-2 pr-16 py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-blue-900/50 dark:text-white dark:bg-blue-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
                  }
                >
                  <Files
                    allFiles={selectedFiles}
                    isLoading={isLoadingFiles}
                    deleteImage={deleteFiles}
                  />
                  <div className="flex items-center  gap-2">
                    <Vision
                      handleChange={handleFilesChange}
                      setFocusTextarea={setFocusTextarea}
                    />
                    <Field
                      handlePaste={handlePaste}
                      handleSubmit={handleSubmit}
                      isLoading={isLoading}
                      ref={textareaRef}
                      id={currentChat?.id}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
          <div
            onClick={handleToggleText}
            className=" cursor-pointer px-3 pt-2 pb-3 text-center text-xs lg:mx-auto lg:max-w-2xl xl:max-w-3xl text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6"
          >
            <p
              className={clsx({
                "overflow-hidden whitespace-nowrap text-ellipsis w-full":
                  !openText,
              })}
            >
              In connection with your use of this tool, you are responsible for
              ensuring adherence to PGA standards, policies, and approvals,
              including, but not limited to, reviewing the results for accuracy.{" "}
              <a
                className=" underline"
                href="https://docs.google.com/document/d/1mn_9d5OhZro_GDcj-ShM7mudWfycRIP_P-9DE5-OdZU/edit?usp=sharing"
              >
                PGA AI Policy
              </a>{" "}
              Provided such use is consistent with the AI Policy, this tool can
              be used to analyze PGA proprietary information, however, all
              "Personal Identifiable Information" should be anonymized prior to
              use with this tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
