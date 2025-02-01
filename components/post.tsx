import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";

export default function Post({ on, onOpenChange }) {
  const { data } = useSession();

  return (
    <Dialog open={on} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader className="flex flex-row items-start space-x-4">
          <div className="w-[10%]">
            <img
              src={data?.user?.image}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="w-5/6 pr-7 space-y-6">
            <DialogTitle className="text-2xl">Post</DialogTitle>
            <DialogDescription className="h-[40vh]">
              <textarea
                placeholder="Anything new"
                className="w-full h-full text-xl placeholder:text-xl bg-transparent dark:bg-background-dark focus:outline-none resize-none placeholder:text-muted-foreground"
              />
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
