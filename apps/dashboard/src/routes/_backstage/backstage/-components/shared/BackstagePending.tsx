import { Loader } from "lucide-react";

export function BackstagePending() {
  return (
    <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center">
      <Loader className="size-4 animate-spin" />
    </div>
  );
}
