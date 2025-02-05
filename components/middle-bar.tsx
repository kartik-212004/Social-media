import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Camera } from "lucide-react";
import { useRef } from "react";

export default function Middlebar() {
  const { data } = useSession();
  const textAreaRef = useRef(null);

  const handleInput = (e) => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="border-x-2 min-h-screen dark:border-zinc-800 w-1/2 relative">
      <div className="sticky top-0   ">
        <div className="flex border-y-2 dark:bg-[#121212] dark:border-zinc-800 flex-row w-full">
          <button className="w-1/2 dark:hover:bg-zinc-900 hover:bg-zinc-100 py-4">
            For you
          </button>
          <button className="w-1/2 dark:hover:bg-zinc-900 hover:bg-zinc-100 py-4">
            Following
          </button>
        </div>
      </div>

      <div className="mt-2 p-5 border-b-2 dark:border-zinc-800">
        <div className="Post py-4 flex flex-row">
          <div className="w-[10%]">
            <Avatar>
              <AvatarImage src={data?.user?.image} alt="User Avatar" />
              <AvatarFallback>
                <Camera />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="w-4/5">
            <textarea
              ref={textAreaRef}
              rows={1}
              placeholder="What's happening?"
              className="w-full bg-transparent resize-none overflow-hidden border-b-2 border-zinc-700 focus:outline-none p-2"
              onChange={handleInput}
              onInput={handleInput}
            />
          </div>
        </div>
        <div className="flex w-full justify-end">
          <button className="py-2 px-5 rounded-3xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
            POST
          </button>
        </div>
      </div>
    </div>
  );
}
