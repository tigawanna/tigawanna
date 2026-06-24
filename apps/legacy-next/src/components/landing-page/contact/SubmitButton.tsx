import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {};

export function SubmitButton({}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="
        btn btn-primary btn-wide max-w-[90%]
        transition-all duration-300 hover:scale-105
        animate-in fade-in-50 slide-in-from-bottom-2 duration-700
        @starting-style:opacity-0 @starting-style:translate-y-2
      "
    >
      Send {pending && <Loader className="animate-spin h-4 w-4 ml-2" />}
    </button>
  );
}
