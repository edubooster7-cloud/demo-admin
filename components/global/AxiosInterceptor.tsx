"use client";

import { setupInterceptors } from "@/app/api/interceptors";
import { useEffect, useRef } from "react";

export const AxiosInterceptor = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      setupInterceptors();
      isInitialized.current = true;
    }
  }, []);

  return <>{children}</>;
};
