import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Camera, Heart, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Input } from "./ui/input";
import { useProfileImage } from "@/hooks/useProfileImage";

type Post = {
  id: string;
  Caption: string;
  createdAt: string;
  postName?: string;
  mimeType: string;
  user?: {
    name?: string;
    image?: string;
  };
};

type PostWithImage = Post & {
  imageUrl?: string;
};

export default function Middlebar() {
  const { imageUrl } = useProfileImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: session } = useSession();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [caption, setCaption] = useState("");
  const [fetchPost, setFetchPost] = useState<PostWithImage[]>([]);
  const [userpost, setUserPost] = useState<PostWithImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [tabBar, setTabBar] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = textAreaRef.current;
      setCaption(e.target.value);

      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    },
    []
  );

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get("/api/posts/public-posts");
      const posts = response.data.post;
      const signedUrls = response.data.link;

      const postsWithImages = posts.map((post: Post) => ({
        ...post,
        imageUrl: signedUrls[post.id],
      }));

      setFetchPost(postsWithImages);
      console.log(postsWithImages);
    } catch (error) {
      console.error("Fetch posts failed:", error);
    }
  }, []);

  const fetchUserPost = useCallback(async () => {
    try {
      const response = await axios.post("/api/posts/user-posts", {
        email: session?.user?.email,
      });
      const posts = response.data.posts;
      const signedUrls = response.data.link || {};

      const postsWithImages = posts.map((post: Post) => ({
        ...post,
        imageUrl: signedUrls[post.id],
      }));

      setUserPost(postsWithImages);
    } catch (error) {
      console.error("Fetch user posts failed:", error);
    }
  }, [session?.user?.email]);

  const handlePost = useCallback(async () => {
    if (!caption.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("email", session?.user?.email ?? "");
      formData.append("caption", caption);

      await axios.post("/api/posts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchPosts();
      setCaption("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Post failed:", error);
      toast({ title: "Failed to create post" });
    } finally {
      setIsPosting(false);
    }
  }, [caption, file, session?.user?.email, fetchPosts, toast]);

  const DeletePost = async (id: string) => {
    try {
      const response = await axios.delete(`/api/posts/delete-post/?id=${id}`);

      toast({ title: response.data.message });
      setUserPost((prevPosts) => prevPosts.filter((post) => post.id !== id));
      setFetchPost((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      toast({ title: "Failed to delete post" });
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUserPost();
  }, [fetchPosts, fetchUserPost]);

  const renderPostItem = (post: PostWithImage) =>
    post ? (
      <div key={post.id} className="p-4 px-6 flex items-start space-x-4">
        {post.imageUrl ? (
          <Avatar className="mt-2">
            <AvatarImage src={post.imageUrl} alt="User Avatar" />
            <AvatarFallback>
              <Camera />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Skeleton className="h-10 w-10 rounded-full mt-2" />
        )}

        <div className="flex-1">
          <div className="flex items-center py-2 space-x-2">
            <span className="font-semibold">{post.user?.name}</span>
            <span className="text-zinc-500 text-sm">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="my-2">
            {post.Caption.split(" ").map((word, index) =>
              word.startsWith("#") ? (
                <span key={index} className="text-purple-400">
                  {word}{" "}
                </span>
              ) : (
                word + " "
              )
            )}
          </p>
          {post.mimeType?.startsWith("video/") ? (
            <video
              muted
              className="w-full max-h-[60vh] rounded-xl object-cover"
              src={post.imageUrl}
              controls
            />
          ) : (
            <img
              className="w-full max-h-[60vh] rounded-xl object-cover"
              src={post.imageUrl}
              alt={`Post by ${post.user?.name}`}
            />
          )}

          <div className="mt-2 flex items-center space-x-2">
            <Heart className="text-zinc-500 hover:text-red-500 cursor-pointer" />
            <span className="text-zinc-500">0</span>
            {!tabBar && (
              <span
                onClick={() => DeletePost(post.id)}
                className="text-zinc-500 hover:text-red-500 cursor-pointer"
              >
                <Trash2Icon />
              </span>
            )}
          </div>
        </div>
      </div>
    ) : (
      <Skeleton />
    );

  return (
    <div className="border-x-2 min-h-screen dark:border-zinc-800 w-1/2 relative">
      <div className="sticky top-0 z-50 dark:bg-darktheme bg-white">
        <div className="flex border-y-2 dark:border-zinc-800 flex-row w-full">
          <button
            onClick={() => setTabBar(true)}
            className={`w-1/2 py-4 text-lg font-semibold transition-all duration-200 ${
              tabBar
                ? "border-b-2 border-blue-500"
                : "dark:border-[#121212] border-white border-b-2"
            }`}
          >
            For you
          </button>
          <button
            onClick={() => setTabBar(false)}
            className={`w-1/2 py-4 text-lg font-semibold transition-all duration-200 ${
              tabBar
                ? "dark:border-[#121212] border-white border-b-2"
                : "border-b-2 border-blue-500"
            }`}
          >
            My Posts
          </button>
        </div>
      </div>

      {tabBar ? (
        <div>
          <div className="px-2 py-1 border-b-2 dark:border-zinc-800">
            <div className="Post py-2 flex flex-row items-start">
              <div className="mx-2">
                <Avatar>
                  <AvatarImage src={imageUrl || ""} alt="User Avatar" />
                  <AvatarFallback>
                    <Camera />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="w-4/5">
                <textarea
                  ref={textAreaRef}
                  value={caption}
                  rows={1}
                  placeholder="What's happening?"
                  className="w-full bg-transparent placeholder:text-xl text-2xl resize-none overflow-hidden border-b-2 border-zinc-700 focus:outline-none p-2"
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            <div className="flex w-full space-x-4 justify-end">
              <Input
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                type="file"
                accept="image/*,video/*"
                className="py-2 w-[35%] text-blue-400 px-5 rounded-3xl font-medium"
              />
              <button
                onClick={handlePost}
                disabled={!caption.trim() || isPosting}
                className="py-2 px-5 rounded-3xl font-medium 
                bg-blue-500 text-white 
                hover:bg-blue-600 
                disabled:opacity-50 disabled:cursor-not-allowed 
                transition-colors"
              >
                {isPosting ? "Posting..." : "POST"}
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {fetchPost.map(renderPostItem)}
          </div>
        </div>
      ) : !userpost ? (
        <Skeleton />
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {userpost.length > 0 ? (
            userpost.map(renderPostItem)
          ) : (
            <div className="p-4 text-center text-zinc-500">No posts yet</div>
          )}
        </div>
      )}
    </div>
  );
}
