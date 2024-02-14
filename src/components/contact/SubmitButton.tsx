import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {

}

export function SubmitButton({}:SubmitButtonProps){
const { pending } = useFormStatus();
return (
  <button
    // onClick={(e) => e.preventDefault()}
    type="submit"
    className="btn  btn-wide max-w-[90%]">
    Send {pending && <Loader className="animate-spin h-4 w-4" />}
  </button>
);
}
