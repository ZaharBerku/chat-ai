import { OpenAIModel } from "@/types/Model";
import React, { useState } from "react";
import { BsChevronDown } from "react-icons/bs";

interface DropdownProps {
  options: OpenAIModel[];
  onChangeHandler: (option: OpenAIModel) => void;
  value: OpenAIModel;
}

export const Dropdown = ({
  options,
  onChangeHandler,
  value,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: OpenAIModel) => {
    onChangeHandler(option);
    setIsOpen(false);
  };

  return (
    <div className="py-10 relative w-full flex flex-col h-full">
      <div className="flex items-center justify-center gap-2">
        <div className="relative w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
          <button
            className="relative flex w-full cursor-default flex-col rounded-md border border-black/10 bg-white py-2 pl-3 pr-10 text-left focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-blue-800 sm:text-sm align-center"
            id="headlessui-listbox-button-:r0:"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
            data-headlessui-state=""
            aria-labelledby="headlessui-listbox-label-:r1: headlessui-listbox-button-:r0:"
            onClick={() => setIsOpen(!isOpen)}
          >
            <label
              className="block text-xs text-blue-700 dark:text-gray-500 text-center"
              id="headlessui-listbox-label-:r1:"
              data-headlessui-state=""
            >
              Model
            </label>
            <span className="inline-flex w-full truncate">
              <span className="flex h-6 items-center gap-1 truncate text-white">
                {value.name}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <BsChevronDown className="h-4 w-4 text-gray-400" />
            </span>
          </button>
          {isOpen && (
            <div className="absolute bg-white bg-opacity-10 rounded-b-lg w-full border border-black/10 text-white">
              {options
                .filter((option) => option.name !== value.name)
                .map((option: OpenAIModel) => (
                  <div
                    className="px-3 py-3 h-10 w-full hover:bg-blue-700"
                    onClick={() => handleSelect(option)}
                  >
                    {option.name}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
