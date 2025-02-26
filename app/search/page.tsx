"use client";

import axios from "axios";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { UserCheck2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [names, setNames] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/search");
      setNames(response.data.Users);
    } catch (error) {
      console.error(error);
    }
  };

  function userDashboard(id: string) {
    console.log(id);
    router.push("/");
  }

  const filteredNames =
    search.trim() === ""
      ? []
      : names.filter((user) =>
          user.name.toLowerCase().startsWith(search.toLowerCase())
        );

  return (
    <div className="py-16 h-screen w-[60%] dark:border-zinc-800 border-l-2">
      <div className="flex flex-row items-center justify-center space-x-2">
        <Search />
        <input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Looking For Someone?"
          className="py-3 w-[70%] px-4 border-gray-800 border rounded-3xl outline-none"
        />
      </div>
      <div className="flex flex-row my-4 justify-center">
        <ul className="w-[60%] space-y-2 list-none">
          {filteredNames.length > 0 ? (
            filteredNames.map((user) => (
              <li
                onClick={() => {
                  userDashboard(user.id);
                }}
                className="h-10 px-3 py-2 flex flex-row justify-between hover:bg-gray-200 border border-gray-200 dark:hover:bg-[#222121] dark:bg-[#0f0f0f] rounded-2xl"
                key={user.id}
              >
                {user.name}{" "}
                <span>
                  <UserCheck2 />
                </span>
              </li>
            ))
          ) : (
            <p>
              {search.trim() === ""
                ? "Start typing to search..."
                : "No users found"}
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
