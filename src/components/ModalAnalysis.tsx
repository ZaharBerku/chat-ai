import React, { FC, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import MarkdownRenderer from "./Markdown";

interface PersonalizeResultsProps {
  code: string;
  result: string;
  handleCloseModal: () => void;
}

const ModalAnalysis: FC<PersonalizeResultsProps> = ({
  code,
  result,
  handleCloseModal,
}) => {
  const isValid = result ? JSON.stringify(result) !== "{}" : result;
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
        className="fixed z-[200] inset-0 bg-gray-600 bg-opacity-50 h-full w-full"
      ></div>
      <div className="fixed inset-0 z-[300] w-11/12 md:w-2/3 lg:w-1/3 top-20 mx-auto h-fit">
        <div className="h-full relative py-5 px-8 shadow-lg rounded-md bg-blue-900 overflow-auto max-h-96">
          <div className="mt-3 flex items-center bg-blue-900 justify-between sticky z-50 -top-5">
            <div className="px-2 py-4 flex justify-start">
              <h2 className="text-xl md:text-2xl leading-6 font-medium text-white">
                Analysis
              </h2>
            </div>
            <IoClose color="gray" size={30} onClick={handleCloseModal} />
          </div>
          <MarkdownRenderer
            style={{
              backgroundColor: "transparent",
              width: "100%",
            }}
            content={"```javascript\n" + code + "\n```"}
          />
          {result && isValid && (
            <div className="bg-[#003970] p-4 -mt-5 rounded-b-md flex flex-col gap-3 overflow-auto">
              <span className=" text-gray-400">Result</span>
              {result}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalAnalysis;
