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
      // First try to get image from S3
      const response = await axios.post("/api/s3/get", {
        email: session.user.email,
      });

      if (response.status === 200 && response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);
        return;
      }
    } catch (err) {
      const error = err as AxiosError;
      
      // If no S3 image found, check for OAuth provider image
      if (error.response?.status === 404) {
        if (session.user.image) {
          setImageUrl(session.user.image);
          return;
        }
        // If no provider image, use default
        setImageUrl("/default-avatar.png");
      } else {
        console.error("Error fetching image:", error);
      }
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
