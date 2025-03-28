"use client";

import axios from "axios";
import { Search, UserCheck2, Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import debounce from "lodash/debounce";

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

const CACHE_DURATION = 5 * 60 * 1000;
const USERS_CACHE_KEY = "cached_users";
const CACHE_TIMESTAMP_KEY = "users_cache_timestamp";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [names, setNames] = useState<User[]>([]);
  const [filteredNames, setFilteredNames] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isCacheValid = useCallback(() => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const now = new Date().getTime();
    return now - parseInt(timestamp) < CACHE_DURATION;
  }, []);

  const getCachedUsers = useCallback(() => {
    if (!isCacheValid()) return null;
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }, [isCacheValid]);

  const cacheUsers = useCallback((users: User[]) => {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().getTime().toString());
  }, []);

  const handleSearch = useCallback(
    debounce((searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredNames([]);
        return;
      }
      const filtered = names.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNames(filtered);
    }, 300),
    [names]
  );

  useEffect(() => {
    handleSearch(search);
  }, [search, handleSearch]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const cachedUsers = getCachedUsers();
      if (cachedUsers) {
        setNames(cachedUsers);
        const shuffled = [...cachedUsers].sort(() => 0.5 - Math.random());
        setSuggestedUsers(shuffled.slice(0, 4));
        setIsLoading(false);
        return;
      }

      const response = await axios.get("/api/search");
      const users = response.data.Users;

      const avatarResponse = await axios.post("/api/search/batch-avatars", {
        userIds: users.map((user: User) => user.id),
      });

      const usersWithAvatars = users.map((user: User) => ({
        ...user,
        avatarUrl: avatarResponse.data.avatarUrls[user.id],
      }));

      cacheUsers(usersWithAvatars);
      setNames(usersWithAvatars);
      const shuffled = [...usersWithAvatars].sort(() => 0.5 - Math.random());
      setSuggestedUsers(shuffled.slice(0, 4));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getCachedUsers, cacheUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const renderUserList = useCallback(
    (users: User[]) => {
      return users.map((user) => (
        <li
          onClick={() => router.push(`/dashboard/?id=${user.id}`)}
          className="px-4 py-3 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/50 
                   rounded-xl cursor-pointer transition-all duration-200 group"
          key={user.id}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border dark:border-zinc-800">
              <AvatarImage src={user.avatarUrl} loading="lazy" />
              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[15px] font-medium">{user.name}</span>
              <span className="text-[13px] text-zinc-500">
                @{user.name.toLowerCase().replace(/\s+/g, "")}
              </span>
            </div>
          </div>
          <UserCheck2 className="w-5 h-5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </li>
      ));
    },
    [router]
  );

  return (
    <div className="py-16 h-screen md:w-[60%] w-full dark:border-zinc-800 border-x-2">
      <div className="px-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full py-3 pl-12 pr-4 bg-zinc-100 dark:bg-zinc-800/50 
                     rounded-2xl outline-none focus:ring-2 ring-blue-500/20
                     text-[15px] font-normal placeholder:text-zinc-500
                     transition-all duration-200"
          />
        </div>

        <div className="mt-6">
          {!search.trim() && (
            <div className="flex items-center space-x-2 px-2 mb-4">
              <Users className="w-5 h-5 text-zinc-500" />
              <h2 className="text-[15px] font-medium text-zinc-500">
                Suggested Users
              </h2>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3 px-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {search.trim() !== "" ? (
                filteredNames.length > 0 ? (
                  renderUserList(filteredNames)
                ) : (
                  <p className="text-center text-[15px] text-zinc-500 mt-4">
                    No users found
                  </p>
                )
              ) : suggestedUsers.length > 0 ? (
                renderUserList(suggestedUsers)
              ) : (
                <p className="text-center text-[15px] text-zinc-500 mt-4">
                  No suggestions available
                </p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
