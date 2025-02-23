import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

const useFetchUserPassword = () => {
  const { data: session } = useSession();
  const [handlePasswordField, setHandlePasswordField] = useState<
    boolean | null
  >(null); 

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await axios.post("/api/settings/get-password", {
          email: session.user.email,
        });

        setHandlePasswordField(response.data?.find ?? false); 
      } catch (error) {
        console.log("Error fetching user:", error);
        setHandlePasswordField(false);
      }
    };

    fetchUser();
  }, [session?.user?.email]);

  return handlePasswordField;
};

export default useFetchUserPassword;
