import { forwardRef, LegacyRef, useState, ChangeEvent, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import useCheckMobileScreen from "@/hooks/useCheckMobileScreen";
import { Tooltip } from "flowbite-react";

type FieldProps = {
  isLoading: boolean;
  handleSubmit: (type: "message", message: string) => void;
  handlePaste: (event: any) => void;
  id: number;
};

const Field = forwardRef(
  (
    { isLoading, handleSubmit, handlePaste, id }: FieldProps,
    ref: LegacyRef<HTMLTextAreaElement>
  ) => {
    const [value, setValue] = useState("");
    const isMobile = useCheckMobileScreen();
    const element = ref as any;
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (event.target.value) {
        event.target.style.height = "0px";
        event.target.style.height = `${event.target.scrollHeight}px`;
      } else {
        event.target.style.height = "24px";
      }
      setValue(event.target.value);
    };

    const handleClick = () => {
      setValue("");
      element.current.style.height = "24px";
      handleSubmit("message", value);
    };

    const handleKeypress = (e: any) => {
      const { value } = e.target;
      if (
        !isMobile &&
        e.keyCode == 13 &&
        value.trim().length >= 1 &&
        !e.shiftKey &&
        !e.metaKey
      ) {
        setValue("");
        element.current.style.height = "24px";
        handleSubmit("message", value);
        e.preventDefault();
      }
    };

    useEffect(() => {
      if (id && value) {
        setValue("");
      }
    }, [id]);

    useEffect(() => {
      if (element?.current) {
        element?.current.focus();
      }
    }, [element?.current]);
    return (
      <>
        <textarea
          ref={ref}
          value={value}
          tabIndex={0}
          disabled={isLoading}
          data-id="root"
          style={{
            height: "24px",
            maxHeight: "200px",
          }}
          placeholder="Send a message..."
          className="m-0 w-full flex-1 ml-2 resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 dark:bg-transparent"
          onChange={handleChange}
          onKeyDown={handleKeypress}
          onPaste={handlePaste}
        />

        <div className="bottom-2 md:bottom-3 absolute z-50 right-2 md:right-3">
          <button
            type="button"
            disabled={isLoading || value?.trim()?.length === 0}
            onClick={handleClick}
            className="p-1 rounded-md bg-transparent disabled:bg-gray-500 disabled:opacity-40"
          >
            <FiSend className="h-4 w-4 mr-1 text-white " />
          </button>
        </div>
      </>
    );
  }
);

export default Field;
