'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

const FooterContext = createContext<{
  showFooter: boolean;
  setShowFooter: (show: boolean) => void;
}>({
  showFooter: true,
  setShowFooter: () => {},
});

export const FooterProvider = ({ children }: { children: ReactNode }) => {
  const [showFooter, setShowFooter] = useState(true);

  return (
    <FooterContext.Provider value={{ showFooter, setShowFooter }}>
      {children}
    </FooterContext.Provider>
  );
};

export const useFooter = () => useContext(FooterContext);