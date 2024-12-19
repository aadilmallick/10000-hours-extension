import { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IconButton = ({
  children,
  onClick,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={cn("p-0 bg-none border-none", className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const RoundedIconButton = ({
  children,
  onClick,
  className,
  tooltip,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
}) => {
  return (
    <button
      className={cn(
        "p-1 bg-none border-none rounded-full shadow-md transition-colors",
        className
      )}
      onClick={onClick}
      title={tooltip}
    >
      {children}
    </button>
  );
};

export default IconButton;
