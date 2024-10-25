import { FC, ReactNode, ComponentProps } from "react";
import { IconBaseProps } from "react-icons";

interface ActionButtonProps extends ComponentProps<"button"> {
  icon: FC<ComponentProps<"svg"> & IconBaseProps>;
}

const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  ...props
}) => (
  <button
    className="border-none rounded-full"
    {...props}
  >
    {Icon && <Icon size={20} />}
  </button>
);

export default ActionButton;
