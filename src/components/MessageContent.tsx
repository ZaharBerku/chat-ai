import {
  ChangeEvent,
  memo,
  forwardRef,
  LegacyRef,
  useEffect,
  useState,
  useRef,
} from "react";
import { VscServerProcess } from "react-icons/vsc";
import { SwiperSlide } from "swiper/react";
import { TbCursorText } from "react-icons/tb";
import Image from "next/image";
import clsx from "clsx";

import { convertToBlob } from "@/utils/convertToBlob";
import { isJsonString } from "@/utils/isJsonString";
import VariantAnswerSwiper from "./VariantAnswerSwiper";
import Files from "./Files";
import MarkdownRenderer from "./Markdown";

interface MessageContentProps {
  isLoading: boolean;
  isUser: boolean;
  text: string;
  content: any;
  errorMessage: string;
  isEdit: boolean;
  value: string;
  setValue: (value: string) => void;
  handleKeypress: (event: any) => void;
  indexMessage: number;
  activeSlide: number;
  data: any;
  setActiveSlide: (value: number) => void;
  answers: any;
  images: any;
  files?: any;
  idChat?: number;
}

const Img = memo(({ img }: any) => {
  const url = convertToBlob(img);
  return (
    <Image
      width="0"
      height="0"
      src={url}
      className="object-cover max-w-full h-auto w-auto static"
      alt={"image ai"}
    />
  );
});

const Images = memo(({ content }: any) => {
  return (
    <>
      {Array.isArray(content) && content.length > 1 && (
        <div className="mb-5 flex flex-col gap-3">
          {content?.map((item: any, index: number) => {
            if (!index) {
              return null;
            }

            return (
              <div key={index}>
                <Img img={item.image_url.url} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
});

const GenerateImageE2b = ({ image }: any) => {
  const arrayImages = isJsonString(image)
    ? JSON.parse(image)?.data
    : image?.data;
  if (!arrayImages || arrayImages?.type !== "base64") {
    return null;
  }
  return <Img img={arrayImages.image} />;
};

const GenerationImages = ({ images }: any) => {
  const arrayImages = isJsonString(images)
    ? JSON.parse(images)?.data
    : images?.data;

  if (!arrayImages) {
    return null;
  }

  return (
    <div className="mb-5 w-full">
      {arrayImages?.image?.map((item: any, index: number) => {
        return (
          <div className="w-full relative" key={index}>
            <a
              target="__target"
              className="absolute inset-0"
              href={item.url}
            ></a>
            <Image
              width="0"
              height="0"
              loader={() => item.url}
              src={item.url}
              className="object-cover max-w-full h-auto w-auto static"
              alt={"image ai"}
              unoptimized={true}
            />
          </div>
        );
      })}
    </div>
  );
};

const MessageContent = forwardRef(
  (
    {
      isLoading,
      isUser,
      text,
      content,
      isEdit,
      value,
      setValue,
      idChat,
      handleKeypress,
      indexMessage,
      setActiveSlide,
      data,
      errorMessage,
      images,
      files,
      activeSlide,
      answers,
    }: MessageContentProps,
    ref: LegacyRef<HTMLTextAreaElement>
  ) => {
    const [isShowWaitText, setIsShowWaitText] = useState(false);
    const idInterval = useRef<any | null>(null);
    const answer =
      idChat && answers[idChat]
        ? answers[idChat][indexMessage - 1] || text
        : text;

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValue(value);
    };

    useEffect(() => {
      if (isLoading && !errorMessage) {
        idInterval.current = setInterval(() => {
          setIsShowWaitText((currentValue) => !currentValue);
        }, 4000);
      } else if (idInterval.current) {
        setIsShowWaitText(false);
        clearInterval(idInterval.current);
        idInterval.current = null;
      }
    }, [isLoading, errorMessage]);

    if (isLoading) {
      return isShowWaitText ? (
        <span className="flex items-center !bg-gray-700 px-3 py-2 rounded-lg !text-white gap-2">
          <VscServerProcess size={20} />
          Information is being processed, please be patient...
        </span>
      ) : (
        <TbCursorText className="h-6 w-6 animate-pulse" />
      );
    }

    if (!text && !answer && !data) {
      return null;
    }

    return (
      <div className="markdown prose w-full break-words dark:prose-invert dark">
        {isUser ? (
          <div className="flex flex-col h-full">
            <Images content={content} />
            <Files allFiles={files} />
            <textarea
              ref={ref}
              onChange={handleChange}
              onKeyDown={handleKeypress}
              value={value}
              className={clsx(
                "m-0 resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0",
                { ["hidden"]: !isEdit }
              )}
            />
            <p className={clsx("whitespace-pre-line", { ["hidden"]: isEdit })}>
              {text}
            </p>
          </div>
        ) : (
          <>
            {Array.isArray(answer) ? (
              <VariantAnswerSwiper
                setActiveSlide={setActiveSlide}
                activeSlide={activeSlide}
              >
                {answer.map((text, index) => (
                  <SwiperSlide key={index} className="!w-full">
                    {isJsonString(text) ? (
                      <GenerationImages images={text} />
                    ) : (
                      <MarkdownRenderer content={text} />
                    )}
                  </SwiperSlide>
                ))}
              </VariantAnswerSwiper>
            ) : data ? (
              <GenerateImageE2b image={data} />
            ) : isJsonString(answer) &&
              (JSON.parse(images)?.data || images?.data) ? (
              <GenerationImages images={answer} />
            ) : (
              <MarkdownRenderer content={answer} />
            )}
          </>
        )}
      </div>
    );
  }
);

export default MessageContent;
