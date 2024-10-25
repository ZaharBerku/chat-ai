import React, { ChangeEvent, useState, FC, useEffect } from "react";

import { History } from "@/types/Model";

interface PersonalizeResultsProps {
  text?: string;
  setPersonalize: (personalize: string) => void;
  currentChat: History | null;
  handleCloseModal: () => void;
}

const PersonalizeResults: FC<PersonalizeResultsProps> = ({
  text,
  setPersonalize,
  currentChat,
  handleCloseModal,
}) => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setValue(value);
  };

  const handleSave = () => {
    handleCloseModal();
    setPersonalize(value);
  };

  useEffect(() => {
    if (text) {
      setValue(text);
    }
  }, [text]);

  useEffect(() => {
    const handleKeyDown = (event:any) => {
      if (event.key === 'Escape' && handleCloseModal) {
        handleCloseModal(); // Close the modal
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseModal]); 

  return (
    <>
      <div
        onClick={handleCloseModal}
        className="fixed z-[200] bg-gray-600 bg-opacity-50 h-full w-full"
      ></div>
      <div className="fixed inset-0 z-[300] top-20 bottom-40 md:bottom-60 mx-auto py-5 px-8 w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-blue-900">
        <div className="mt-3 flex flex-col gap-2 md:gap-5">
          <div className="px-2 py-4 flex justify-start">
            <h2 className="text-xl md:text-2xl leading-6 font-medium text-white">
              Custom instructions here
            </h2>
          </div>
          <div className="mt-2 flex-1">
            <textarea
              value={value}
              onChange={handleChange}
              className="resize-none text-sm h-full w-full bg-[#2A2B32] rounded-md border border-gray-300 focus:border-gray-300 font-light text-white placeholder:text-white placeholder:opacity-70 placeholder:font-light"
              rows={8}
              placeholder="Tell the AI about yourself. You can include info about your style, preferences, role, projects, etc. Any context that will help personalize the results to you. You can add a lot of info here."
            ></textarea>
          </div>
          <div className="items-center py-3 flex justify-end gap-3">
            <button
              onClick={handleCloseModal}
              className="px-3 py-1.5 bg-gray-600 rounded text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-500 rounded text-white disabled:bg-green-700 disabled:text-gray-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalizeResults;
