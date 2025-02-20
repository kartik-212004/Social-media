"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import axios from "axios";

interface PostProps {
  on: boolean;
  onOpenChange: () => void;
}

export default function Post({ on, onOpenChange }: PostProps) {
  const { data } = useSession();
  const [caption, setCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = useCallback(async () => {
    if (caption.trim() && !isPosting) {
      setIsPosting(true);
      try {
        await axios.post("/api/post", {
          caption: caption.trim(),
          email: data?.user?.email,
        });

        setCaption(""); // Clear input
        onOpenChange(); // Close modal
      } catch (error) {
        console.error("Post failed:", error);
      } finally {
        setIsPosting(false);
      }
    }
  }, [caption, data?.user?.email, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line
      handlePost();
    }
  };

  return (
    <Dialog open={on} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-start space-x-4">
          <div className="w-[10%]">
            <img
              src={data?.user?.image || "/default-avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="w-5/6 pr-7 space-y-6">
            <DialogTitle className="text-2xl"> Create a Post</DialogTitle>
            <DialogDescription>
              <textarea
                maxLength={280}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={handleKeyDown} // Listen for Enter key
                placeholder="Anything new"
                className="w-full min-h-[30vh] dark:text-white text-black text-xl placeholder:text-xl bg-transparent dark:bg-background-dark focus:outline-none resize-none placeholder:text-muted-foreground"
              />
            </DialogDescription>
          </div>
        </DialogHeader>
        <Button
          onClick={handlePost}
          disabled={!caption.trim() || isPosting}
          className={`flex rounded-2xl text-xl justify-center ${
            isPosting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPosting ? "Posting..." : "POST"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
