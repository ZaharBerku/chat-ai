import { SiOpenai } from "react-icons/si";
import { HiUser } from "react-icons/hi";
import { FaPencilAlt } from "react-icons/fa";
import { BiCopy } from "react-icons/bi";
import { Tooltip } from "flowbite-react";
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import showdown from "showdown";
import { VscDebugRestart } from "react-icons/vsc";
import { TbCursorText } from "react-icons/tb";
import removeMarkdown from "markdown-to-text";
import { useEffect, useState, useRef } from "react";
import { LuFileCode2 } from "react-icons/lu";
import { HiOutlineCodeBracketSquare } from "react-icons/hi2";
import { IoSearch } from "react-icons/io5";
import { RiAiGenerate } from "react-icons/ri";
import { LuDownload } from "react-icons/lu";
import useCheckMobileScreen from "@/hooks/useCheckMobileScreen";
import useAutoResizeTextArea from "@/hooks/useAutoResizeTextArea";
import MessageContent from "./MessageContent";
import ModalAnalysis from "./ModalAnalysis";
import { getAnswersToConversation } from "@/utils/getAnswersToConversation";

const actionIcons = {
  "Executing code!": <HiOutlineCodeBracketSquare size={20} />,
  "Installing packages!": <LuDownload size={20} stroke="white" />,
  "Generating images!": <RiAiGenerate size={20} />,
  "Searching the web!": <IoSearch size={20} />,
};

const Message = (props: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [value, setValue] = useState("");
  const [openAnalysis, setOpenAnalysis] = useState(false);
  const textareaRef = useAutoResizeTextArea([value, isEdit]);
  const {
    message,
    isLastUserMessage,
    indexMessage,
    handleSubmit,
    isLastSystemMessage,
    errorMessage,
    isStreamingAnswer,
    deleteMessages,
    currentChat,
    editAnswerSystem,
    answerCode,
    answers,
    textLoadingTool,
  } = props;
  const answersConversation = getAnswersToConversation(
    answers,
    currentChat?.id,
    indexMessage
  );
  const code = answerCode && answerCode[indexMessage];
  const lengthSliderForAnswerSystem = answersConversation?.length - 1 ?? 0;
  const [activeSlide, setActiveSlide] = useState(
    lengthSliderForAnswerSystem || 0
  );

  const { role, content, files, data } = message;
  const isUser = role === "user";
  const text = isUser && Array.isArray(content) ? content.at(0)?.text : content;
  const images = !isUser && Array.isArray(content) && content;
  const isLoading = !isUser && text === null && !textLoadingTool;
  const isMobile = useCheckMobileScreen();

  const avatarIcon = isUser ? (
    <HiUser className="h-4 w-4 text-white" />
  ) : (
    <SiOpenai className="h-4 w-4 text-white" />
  );

  const handleOpenAnalysis = () => {
    setOpenAnalysis(true);
  };

  const handleCloseAnalysis = () => {
    setOpenAnalysis(false);
  };

  const handleCopySystemMessage = () => {
    if (currentChat?.id) {
      const converter = new showdown.Converter();
      const copyText = answersConversation?.[activeSlide] ?? text;
      const plainText = converter.makeHtml(copyText);
      const textWithOutMarkdown = removeMarkdown(copyText);
      const clipboardItemData = new ClipboardItem({
        "text/plain": new Blob([textWithOutMarkdown], { type: "text/plain" }),
        "text/html": new Blob([plainText], {
          type: "text/html",
        }),
      });
      if (clipboardItemData) {
        navigator?.clipboard?.write([clipboardItemData]);
      }
    }
  };

  const handleOpenEditLastUserMessage = () => {
    setIsEdit(true);
  };

  const handleCloseEditLastUserMessage = () => {
    setIsEdit(false);
  };

  const handleSave = () => {
    const newContent = Array.isArray(content)
      ? ((content.at(0).text = value), content)
      : value;
    if (currentChat?.id) {
      deleteMessages(indexMessage, 2);
      handleSubmit("editMessage", newContent, indexMessage);
      handleCloseEditLastUserMessage();
    }
  };

  const handleChangeSlide = (indexSlide: number) => {
    setActiveSlide(indexSlide);
    if (currentChat?.id) {
      const newAnswer = answersConversation[activeSlide];
      if (newAnswer && newAnswer !== text) {
        editAnswerSystem(newAnswer, indexMessage);
      }
    }
  };

  const handleKeypress = (e: any) => {
    if (!isMobile && e.keyCode == 13 && !e.shiftKey && !e.metaKey) {
      handleSave();
    }
  };

  useEffect(() => {
    if (isUser && isLastUserMessage) {
      setValue(text);
    }
  }, [text]);

  useEffect(() => {
    if (isEdit && textareaRef.current) {
      textareaRef.current?.focus();
    }
  }, [isEdit]);

  useEffect(() => {
    if (lengthSliderForAnswerSystem) {
      setActiveSlide(lengthSliderForAnswerSystem);
    }
  }, [lengthSliderForAnswerSystem]);

  return (
    <div
      className={`group w-full text-blue-800 dark:text-gray-100 border-b border-black/10 dark:border-blue-900/50 ${
        isUser ? "dark:bg-blue-800" : "bg-gray-50 dark:bg-[#003970]"
      }`}
    >
      <div className="text-base gap-4 md:gap-6 flex lg:px-0 m-auto w-full">
        <div className="flex justify-between md:justify-normal flex-row gap-4 md:gap-6 md:max-w-6xl p-4 md:py-6 lg:px-0 m-auto w-full">
          <div className="w-8 flex flex-col relative items-end">
            <div className="relative h-7 w-7 p-1 rounded-sm text-white flex items-center justify-center bg-black/75 text-opacity-100r">
              {avatarIcon}
            </div>
            <div className="text-xs flex items-center justify-center gap-1 absolute left-0 top-2 -ml-4 -translate-x-full group-hover:visible !invisible">
              <button
                disabled
                className="text-gray-300 dark:text-gray-400"
              ></button>
              <span className="flex-grow flex-shrink-0">1 / 1</span>
              <button
                disabled
                className="text-gray-300 dark:text-gray-400"
              ></button>
            </div>
          </div>
          <div className="relative flex w-[calc(100%-50px)] gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
            <div
              className={
                "flex flex-grow flex-col gap-3 max-w-[calc(100%_-_20px)]"
              }
            >
              <div className="flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
                <MessageContent
                  errorMessage={errorMessage}
                  isLoading={isLoading}
                  isUser={isUser}
                  text={text}
                  images={images}
                  idChat={currentChat?.id}
                  indexMessage={indexMessage}
                  content={content}
                  isEdit={isEdit}
                  value={value}
                  setValue={setValue}
                  data={data}
                  files={files}
                  ref={textareaRef}
                  handleKeypress={handleKeypress}
                  setActiveSlide={handleChangeSlide}
                  activeSlide={activeSlide}
                  answers={answers}
                />
                {textLoadingTool && isLastSystemMessage && (
                  <>
                    {textLoadingTool ? (
                      <span className="flex items-center !bg-gray-700 px-3 py-2 rounded-lg !text-white gap-2">
                        {
                          actionIcons[
                            textLoadingTool as keyof typeof actionIcons
                          ]
                        }
                        {textLoadingTool}
                      </span>
                    ) : (
                      <TbCursorText className="h-6 w-6 animate-pulse" />
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              {isUser ? (
                <>
                  {isLastUserMessage && (
                    <>
                      {isEdit ? (
                        <>
                          <div className="h-8">
                            <Tooltip content={"Save & Submit"}>
                              <button onClick={handleSave}>
                                <FaCheck size={17} color="#fff" />
                              </button>
                            </Tooltip>
                          </div>
                          <div className="h-8">
                            <Tooltip content={"Cancel"}>
                              <button onClick={handleCloseEditLastUserMessage}>
                                <IoClose size={20} color="#fff" />
                              </button>
                            </Tooltip>
                          </div>
                        </>
                      ) : (
                        <div className="h-8">
                          <Tooltip content={"Edit"}>
                            <button onClick={handleOpenEditLastUserMessage}>
                              <FaPencilAlt size={17} color="#fff" />
                            </button>
                          </Tooltip>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="h-8">
                    <Tooltip hidden={isStreamingAnswer} content={"Copy"}>
                      <button
                        disabled={isStreamingAnswer}
                        onClick={handleCopySystemMessage}
                      >
                        <BiCopy size={20} />
                      </button>
                    </Tooltip>
                  </div>
                  {code && (
                    <div className="h-8">
                      <Tooltip hidden={isStreamingAnswer} content={"Code"}>
                        <button
                          disabled={isStreamingAnswer}
                          onClick={handleOpenAnalysis}
                        >
                          <LuFileCode2 size={20} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                  {isLastSystemMessage && (
                    <div className="h-8">
                      <Tooltip
                        hidden={isStreamingAnswer}
                        content={"Regenerate"}
                      >
                        <button
                          disabled={isStreamingAnswer}
                          onClick={() =>
                            handleSubmit("regenerate", text, indexMessage)
                          }
                        >
                          <VscDebugRestart size={20} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {openAnalysis && (
        <ModalAnalysis
          result={code.result}
          code={code.code}
          handleCloseModal={handleCloseAnalysis}
        />
      )}
    </div>
  );
};

export default Message;
