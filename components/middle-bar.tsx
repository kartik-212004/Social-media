import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Camera, Heart } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

type Post = {
  id: string;
  Caption: string;
  createdAt: string;
  user?: {
    name?: string;
    image?: string;
  };
};

export default function Middlebar() {
  const { data: session } = useSession();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const [caption, setCaption] = useState("");
  const [fetchPost, setFetchPost] = useState<Post[]>([]);
  const [userpost, setUserPost] = useState<Post[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [tabBar, setTabBar] = useState(true);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textAreaRef.current;
    setCaption(e.target.value);
    
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get("/api/getpost");
      setFetchPost(response.data.post);
    } catch (error) {
      console.error("Fetch posts failed:", error);
    }
  }, []);

  const fetchUserPost = useCallback(async () => {
    try {
      const response = await axios.post("/api/myposts", {
        email: session?.user?.email,
      });
      setUserPost(response.data.posts);
    } catch (error) {
      console.error("Fetch user posts failed:", error);
    }
  }, [session?.user?.email]);

  const handlePost = useCallback(async () => {
    if (caption.trim() && !isPosting) {
      setIsPosting(true);
      try {
        await axios.post("/api/post", {
          caption: caption.trim(),
          email: session?.user?.email,
        });

        await fetchPosts();
        setCaption("");
      } catch (error) {
        console.error("Post failed:", error);
      } finally {
        setIsPosting(false);
      }
    }
  }, [caption, session?.user?.email, fetchPosts]);

  useEffect(() => {
    fetchPosts();
    fetchUserPost();
  }, [fetchPosts, fetchUserPost]);

  const renderPostItem = (post: Post) => (
    <div key={post.id} className="p-4 px-6 flex items-start space-x-4">
      <Avatar className="mt-2">
        <AvatarImage src={post.user?.image || ""} alt="User Avatar" />
        <AvatarFallback>
          <Camera />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{post.user?.name}</span>
          <span className="text-zinc-500 text-sm">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="mt-2">{post.Caption}</p>
        <div className="mt-2 flex items-center space-x-2">
          <Heart className="text-zinc-500 hover:text-red-500 cursor-pointer" />
          <span className="text-zinc-500">0</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-x-2 min-h-screen dark:border-zinc-800 w-1/2 relative">
      <div className="sticky top-0 z-50 bg-white dark:bg-[#121212]">
        <div className="flex border-y-2 dark:border-zinc-800 flex-row w-full">
          <button
            onClick={() => setTabBar(true)}
            className="w-1/2 dark:hover:bg-zinc-900 hover:bg-zinc-100 py-4"
          >
            For you
          </button>
          <button
            onClick={() => setTabBar(false)}
            className="w-1/2 dark:hover:bg-zinc-900 hover:bg-zinc-100 py-4"
          >
            My Posts
          </button>
        </div>
      </div>

      {tabBar ? (
        <div>
          <div className="mt-2 p-5 border-b-2 dark:border-zinc-800">
            <div className="Post py-4 flex flex-row items-start">
              <div className="w-[10%] mr-4">
                <Avatar>
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt="User Avatar"
                  />
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
                />
              </div>
            </div>
            <div className="flex w-full justify-end">
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