"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";

type ModalContextType = {
  isMounted: boolean;
};

const ModalContext = createContext<ModalContextType>({
  isMounted: false,
});

export const useModal = () => {
  return useContext(ModalContext);
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ModalContext.Provider value={{ isMounted }}>
      {children}
    </ModalContext.Provider>
  );
}
