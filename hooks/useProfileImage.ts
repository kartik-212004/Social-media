// hooks/useProfileImage.ts
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";

export const useProfileImage = () => {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImage = async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/s3/get", {
        email: session?.user?.email,
      });

      if (response.status === 200 && response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);
      } else {
        throw new Error("Image not found");
      }
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 404) {
        console.warn("No profile image found, using default.");
        setImageUrl("/default-avatar.png");
      } else {
        console.error("Error fetching image:", error);
      }
    }
  };

  useEffect(() => {
    fetchImage();
  }, [session?.user?.email]);

  return {
    imageUrl,
    isLoading,
    error,
    refetchImage: fetchImage,
  };
};
