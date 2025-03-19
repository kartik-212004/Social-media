"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Loading from "../loading";
import { useUserImage } from "@/hooks/useAwsImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Globe,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Dribbble,
  Link as LinkIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  type LinkType = {
    id: string;
    url: string;
    userId: string;
  };

  type Post = {
    id: string;
    Caption: string;
    mimeType: string;
    createdAt: string;
    url?: string;
  };

  type User = {
    name: string;
    bio: string;
    createdAt: string;
    email: string;
  };

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { imageUrlAvatar, error } = useUserImage({ id: userId || "" });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await axios.post("/api/search", { id: userId });
      setUser(response.data.user);
      if (response.data.user?.email) {
        fetchPosts(response.data.user.email);
        fetchLinks(response.data.user.email);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchLinks = async (email: string) => {
    try {
      const response = await axios.get(`/api/links/?email=${email}`);
      console.log(response.data.links[0].link);
      setLinks(response.data.links[0].link);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPosts = async (email: string) => {
    try {
      const response = await axios.post("/api/posts/user-posts", { email });
      setPosts(
        response.data.posts.map((post: Post) => ({
          ...post,
          url: response.data.link[post.id] || "",
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getLinkIcon = (url: string) => {
    const domain = url.toLowerCase();

    if (domain.includes("github.com"))
      return { icon: <Github size={16} />, name: "Github" };
    if (domain.includes("twitter.com") || domain.includes("x.com"))
      return { icon: <Twitter size={16} />, name: "Twitter" };
    if (domain.includes("linkedin.com"))
      return { icon: <Linkedin size={16} />, name: "Linkedin" };
    if (domain.includes("pornhub.com"))
      return { icon: <Popcorn size={16} />, name: "Pornhub" };
    if (domain.includes("instagram.com"))
      return { icon: <Instagram size={16} />, name: "Instagram" };
    if (domain.includes("facebook.com"))
      return { icon: <Facebook size={16} />, name: "Facebook" };
    if (domain.includes("youtube.com"))
      return { icon: <Youtube size={16} />, name: "Youtube" };
    if (domain.includes("dribbble.com"))
      return { icon: <Dribbble size={16} />, name: "Dribbble" };

    return { icon: <Globe size={16} />, name: "Link" };
  };

  if (error?.message == "Request failed with status code 404") {
  }

  if (!user)
    return (
      <div className="p-16 w-2/3">
        <Loading />
      </div>
    );

  return (
    <div className="w-2/3 min-h-screen dark:border-zinc-800 border-x-2 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col h-min justify-center pb-6 border-b dark:border-zinc-800 mb-6">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={imageUrlAvatar || ""}></AvatarImage>
              <AvatarFallback>kb</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                @{user.email.split("@")[0]}
              </p>
            </div>
          </div>
          <p className="mt-4 text-zinc-800 dark:text-zinc-200">{user.bio}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
          <ul className="pt-2 flex flex-row space-x-2 ">
            {links &&
              links.map((link, id) => (
                <li key={id}>
                  <a href={link.url}>{getLinkIcon(link.url).icon}</a>
                </li>
              ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar>
                  <AvatarImage
                    src={imageUrlAvatar ? imageUrlAvatar : ""}
                  ></AvatarImage>
                  <AvatarFallback>kb</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-zinc-600 dark:text-zinc-400 text-sm">
                      @{user.email.split("@")[0]}
                    </span>
                    <span className="text-zinc-500 text-sm">·</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-lg mb-3">{post.Caption}</p>

              {post.url && (
                <div className="rounded-xl overflow-hidden border dark:border-zinc-800 mb-3">
                  {post.mimeType.startsWith("image") ? (
                    <img
                      src={post.url}
                      alt="Post content"
                      className="w-full h-96 object-cover"
                    />
                  ) : (
                    <video
                      className="w-full h-96 object-cover"
                      controls
                      playsInline
                    >
                      <source src={post.url} type={post.mimeType} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
