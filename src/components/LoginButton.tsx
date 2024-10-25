import { MouseEventHandler, ReactElement } from "react";

interface Props {
  handleClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactElement;
}

const LoginButton = ({ handleClick, children }: Props) => (
  <button
    onClick={handleClick}
    className="-ml-0.5 -mt-0.5 inline-flex h-[50px] w-[100px] items-center justify-center rounded-md hover:text-blue-900  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-white dark:hover:bg-blue-700 border-2 border-gray-300 text-white"
    >
    {children}
  </button>
);

export default LoginButton;
