import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

interface post {
  on: boolean;
  onOpenChange: () => void;
}

import { useSession } from "next-auth/react";

export default function Post({ on, onOpenChange }: post) {
  const { data } = useSession();

  return (
    <Dialog open={on} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-start space-x-4">
          <div className="w-[10%]">
            <img
              src={data?.user?.image}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="w-5/6 pr-7 space-y-6">
            <DialogTitle className="text-2xl"> Create a Post</DialogTitle>
            <DialogDescription className="">
              <textarea
                placeholder="Anything new"
                className="w-full min-h-[30vh] text-xl placeholder:text-xl bg-transparent dark:bg-background-dark focus:outline-none resize-none placeholder:text-muted-foreground"
              />
            </DialogDescription>
          </div>
        </DialogHeader>
        <Button className="flex rounded-2xl text-xl justify-center">
          POST
        </Button>
      </DialogContent>
    </Dialog>
  );
}
