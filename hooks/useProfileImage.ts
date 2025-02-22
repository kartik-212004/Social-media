// hooks/useProfileImage.ts
import { useState, useEffect } from "react";
import axios from "axios";
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
        email: session.user.email,
      });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error("Error fetching profile image:", error);
      setError("Failed to load profile image");
    } finally {
      setIsLoading(false);
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
