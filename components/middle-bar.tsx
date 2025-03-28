import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Camera, Heart, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Loading from "@/app/loading";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Input } from "./ui/input";
import { Image as Gallery } from "lucide-react";
import { ExternalLink, File } from "lucide-react";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { useUserImage } from "@/hooks/useAwsImage";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Post = {
  id: string;
  Caption: string;
  createdAt: string;
  postName?: string;
  mimeType: string;
  userId?: string;
  likes?: { userId: string }[];
  user?: {
    id?: string;
    name?: string;
    image?: string;
  };
};

type PostWithImage = Post & {
  imageUrl?: string;
  userAvatarUrl?: string;
  likeCount?: number;
  isLikedByUser?: boolean;
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
  const [isLoadingPublicPosts, setIsLoadingPublicPosts] = useState(true);
  const [isLoadingUserPosts, setIsLoadingUserPosts] = useState(true);
  const router = useRouter();
  useRef<Set<string>>(new Set());
  const avatarUrlCache = useRef<Record<string, string>>({});

  const fetchUserAvatars = useCallback(async (posts: PostWithImage[]) => {
    const userIds = posts
      .filter((post) => post.user?.id && !avatarUrlCache.current[post.user.id])
      .map((post) => post.user!.id!) as string[];

    if (userIds.length === 0) return posts;

    try {
      const response = await axios.post("/api/search/batch-avatars", {
        userIds,
      });
      const avatarUrls = response.data.avatarUrls || {};

      Object.entries(avatarUrls).forEach(([id, url]) => {
        avatarUrlCache.current[id] = url as string;
      });

      return posts.map((post) => ({
        ...post,
        userAvatarUrl: post.user?.id
          ? avatarUrlCache.current[post.user.id]
          : undefined,
      }));
    } catch (error) {
      console.error("Failed to fetch user avatars:", error);
      return posts;
    }
  }, []);

  const handleLike = async (postId: string) => {
    if (!session?.user?.email) {
      toast({ title: "Please login to like posts" });
      return;
    }

    try {
      const response = await axios.post("/api/posts/like", {
        postId,
        email: session.user.email,
      });

      if (response.data.success) {
        setFetchPost((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likeCount:
                    (post.likeCount || 0) + (response.data.liked ? 1 : -1),
                  isLikedByUser: response.data.liked,
                }
              : post
          )
        );

        toast({
          title: response.data.liked ? "Post liked!" : "Post unliked!",
        });
      }
    } catch (error) {
      console.error("Like operation failed:", error);
      toast({ title: "Failed to like post" });
    }
  };

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
    if (!isLoadingPublicPosts) setIsLoadingPublicPosts(true);
    try {
      const response = await axios.get("/api/posts/public-posts");
      const posts = response.data.post;
      const signedUrls = response.data.link;
      const likeCounts = response.data.likeCounts;

      let postsWithImages = posts.map((post: Post) => ({
        ...post,
        imageUrl: signedUrls[post.id],
        likeCount: likeCounts[post.id],
        isLikedByUser:
          post.likes?.some(
            (like: { userId: string }) =>
              like.userId === (session?.user as SessionUser)?.id
          ) || false,
      }));

      postsWithImages = await fetchUserAvatars(postsWithImages);
      setFetchPost(postsWithImages);
    } catch (error) {
      console.error("Fetch posts failed:", error);
      toast({ title: "Failed to load posts" });
    } finally {
      setIsLoadingPublicPosts(false);
    }
  }, [(session?.user as SessionUser)?.id, toast, fetchUserAvatars]);

  const fetchUserPost = useCallback(async () => {
    if (!isLoadingUserPosts) setIsLoadingUserPosts(true);
    try {
      const response = await axios.post("/api/posts/user-posts", {
        email: session?.user?.email,
      });
      const posts = response.data.posts;
      const signedUrls = response.data.link || {};

      let postsWithImages = posts.map((post: Post) => ({
        ...post,
        imageUrl: signedUrls[post.id],
      }));

      postsWithImages = await fetchUserAvatars(postsWithImages);
      setUserPost(postsWithImages);
    } catch (error) {
      console.error("Fetch user posts failed:", error);
      toast({ title: "Failed to load your posts" });
    } finally {
      setIsLoadingUserPosts(false);
    }
  }, [session?.user?.email, toast, fetchUserAvatars]);

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

      if (tabBar) {
        await fetchPosts();
      } else {
        await fetchUserPost();
      }

      setCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
      toast({ title: "Post created successfully" });
    } catch (error) {
      console.error("Post failed:", error);
      toast({ title: "Failed to create post" });
    } finally {
      setIsPosting(false);
    }
  }, [
    caption,
    file,
    session?.user?.email,
    fetchPosts,
    fetchUserPost,
    toast,
    tabBar,
  ]);

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
    if (tabBar) {
      fetchPosts();
    } else {
      fetchUserPost();
    }
  }, [tabBar, fetchPosts, fetchUserPost]);

  const handleUserClick = (userId: string | undefined) => {
    if (userId) {
      router.push(`/dashboard/?id=${userId}`);
    } else {
      toast({
        title: "Could not find user profile",
        description: "User information is not available",
      });
    }
  };

  const renderPostItem = useCallback(
    (post: PostWithImage) => {
      if (!post) return null;
      console.log(post.isLikedByUser);
      return (
        <div
          key={post.id}
          className="p-4 px-6 hover:bg-zinc-100 dark:hover:bg-[#070707] transition-colors duration-200 flex items-start space-x-4"
        >
          <Avatar
            className="mt-2 cursor-pointer"
            onClick={() => handleUserClick(post.user?.id)}
          >
            <AvatarImage
              key={post.id}
              src={post.userAvatarUrl || ""}
              alt="User Avatar"
              className="object-cover"
            />
            <AvatarFallback>
              <Camera />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center py-2 space-x-2">
              <span
                className="font-semibold cursor-pointer hover:underline"
                onClick={() => handleUserClick(post.user?.id)}
              >
                {post.user?.name}
              </span>
              <span className="text-zinc-500 text-sm">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="my-2">
              {post.Caption.split(" ").map((word, index) =>
                word.startsWith("#") ? (
                  <span key={index} className="text-indigo-500">
                    {word}{" "}
                  </span>
                ) : (
                  word + " "
                )
              )}
            </p>
            {post.imageUrl && (
              <>
                {post.mimeType?.startsWith("video/") ? (
                  <video
                    onDoubleClick={() => {
                      if (post.imageUrl) window.open(post.imageUrl, "_blank");
                    }}
                    muted
                    className="w-full max-h-[60vh] rounded-xl object-cover"
                    src={post.imageUrl}
                    controls
                  />
                ) : (
                  <div className="relative w-full aspect-video">
                    <Image
                      onDoubleClick={() => {
                        if (post.imageUrl) window.open(post.imageUrl, "_blank");
                      }}
                      className="rounded-xl object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                      src={post.imageUrl}
                      alt={`Post by ${post.user?.name}`}
                      loading="lazy"
                    />
                  </div>
                )}
              </>
            )}

            <div className="mt-2 flex items-center space-x-3">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-1"
              >
                <Heart
                  className={`h-5 w-5 cursor-pointer transition-colors ${
                    post.isLikedByUser
                      ? "text-red-500 fill-red-500"
                      : "text-zinc-500 hover:text-red-500"
                  }`}
                />
                <span className="text-sm text-zinc-500">
                  {post.likeCount || 0}
                </span>
              </button>

              {post.imageUrl && (
                <Link
                  className="text-zinc-500"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={post.imageUrl}
                >
                  <ExternalLink />
                </Link>
              )}
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
      );
    },
    [handleLike]
  );

  return (
    <div className="border-x-2 min-h-screen dark:border-zinc-800 xl:w-1/2 w-full relative">
      <div className="sticky top-0 z-50 dark:bg-darktheme bg-white">
        <div className="flex border-y-2 dark:border-zinc-800 flex-row w-full">
          <button
            onClick={() => setTabBar(true)}
            className={`w-1/2 py-4 text-lg font-semibold transition-all duration-200 `}
          >
            <span
              className={`py-2 ${
                tabBar
                  ? "border-b-2 border-blue-500"
                  : "dark:border-[#121212] border-white border-b-2"
              }`}
            >
              For you
            </span>
          </button>
          <button
            onClick={() => setTabBar(false)}
            className={`w-1/2 py-4 text-lg font-semibold transition-all duration-200`}
          >
            <span
              className={`py-2 ${
                tabBar
                  ? "dark:border-[#121212] border-white border-b-2 "
                  : "border-b-2 border-blue-500"
              }`}
            >
              My Posts
            </span>
          </button>
        </div>
      </div>

      {tabBar ? (
        <div>
          <div className="px-2 py-1 border-b-2 dark:border-zinc-800">
            <div className="Post py-2 flex flex-row items-start">
              <div className="mx-2">
                <Avatar>
                  <AvatarImage
                    className="object-cover"
                    src={imageUrl || ""}
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
                  placeholder="What's cooking in your mind?"
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
                className="py-2 w-[35%] text-blue-400 px-5 rounded-3xl font-medium hidden sm:block"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="sm:hidden p-2 bg-gray-200 dark:bg-[#030303] rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                <Gallery
                  className="w-6 h-6 text-black dark:text-white"
                  strokeWidth={1.5}
                />
              </button>

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
            {isLoadingPublicPosts ? (
              <Loading />
            ) : fetchPost.length > 0 ? (
              fetchPost.map(renderPostItem)
            ) : (
              <div className="p-4 text-center text-zinc-500">
                No posts available
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoadingUserPosts ? (
            <Loading />
          ) : userpost.length > 0 ? (
            userpost.map(renderPostItem)
          ) : (
            <div className="p-4 text-center text-zinc-500">No posts yet</div>
          )}
        </div>
      )}
    </div>
  );
}
