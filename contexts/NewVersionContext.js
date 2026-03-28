import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { secureStorage } from '../utils/storage';
import CHANGELOG from '../constants/changelog.json';

const APP_VERSION = CHANGELOG[0]?.version ?? '1.0.0';

const NewVersionContext = createContext({ hasNewVersion: false, markVersionSeen: () => {} });

export function NewVersionProvider({ children }) {
  const [hasNewVersion, setHasNewVersion] = useState(false);

  useEffect(() => {
    secureStorage.getItem('lastSeenVersion').then((lastSeen) => {
      setHasNewVersion(lastSeen !== APP_VERSION);
    });
  }, []);

  const markVersionSeen = useCallback(() => {
    setHasNewVersion(false);
    secureStorage.setItem('lastSeenVersion', APP_VERSION);
  }, []);

  return (
    <NewVersionContext.Provider value={{ hasNewVersion, markVersionSeen, APP_VERSION, CHANGELOG }}>
      {children}
    </NewVersionContext.Provider>
  );
}

export function useNewVersion() {
  return useContext(NewVersionContext);
}
