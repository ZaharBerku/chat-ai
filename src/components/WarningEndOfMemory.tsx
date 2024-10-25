import { FC, useEffect } from "react";
import { IoClose } from "react-icons/io5";

type WarningEndOfMemoryProps = {
  handleCloseModal: () => void;
};

const WarningEndOfMemory: FC<WarningEndOfMemoryProps> = ({
  handleCloseModal,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" && handleCloseModal) {
        handleCloseModal(); // Close the modal
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("keydown", handleKeyDown);

    // Remove event listener on cleanup when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCloseModal]);
  return (
    <>
      <div
        onClick={handleCloseModal}
        className="fixed z-[200] bg-gray-600 bg-opacity-50 h-full w-full"
      ></div>
      <div className="fixed inset-0 z-[300] top-20 h-fit mx-auto py-5 px-8 max-w-sm shadow-lg rounded-md bg-blue-900">
        <div className="mt-3 flex flex-col items-center justify-center gap-2 md:gap-5">
          <div className="px-2 py-4 flex justify-start">
            <h2 className="text-xl md:text-2xl leading-6 text-center font-medium text-white">
              Memory overflow warning
            </h2>
          </div>
          <div className="mt-2 flex-1">
            <p className={"text-white text-center"}>
              In case of memory overflow, the browser can clear your chat
              history. We recommend clearing your history of chats that are no
              longer relevant.
            </p>
          </div>
          <div className="items-center py-3 flex justify-end gap-3">
            <button
              onClick={handleCloseModal}
              className="px-3 py-1.5 bg-green-500 rounded text-white disabled:bg-green-700 disabled:text-gray-200"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export { WarningEndOfMemory };
