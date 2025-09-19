import React, { createContext, ReactNode, useContext } from 'react';

interface ATTContextType {
  /** Whether ATT permission has been granted (null = not determined yet) */
  attPermissionGranted: boolean | null;
  /** Whether to show personalized ads based on ATT permission */
  showPersonalizedAds: boolean;
  /** Function to update ATT permission status */
  updateATTPermission: (granted: boolean) => void;
}

const ATTContext = createContext<ATTContextType | undefined>(undefined);

interface ATTProviderProps {
  children: ReactNode;
  attPermissionGranted: boolean | null;
  onATTPermissionUpdate: (granted: boolean) => void;
}

export const ATTProvider: React.FC<ATTProviderProps> = ({ 
  children, 
  attPermissionGranted,
  onATTPermissionUpdate
}) => {
  // Only show personalized ads if ATT permission is explicitly granted
  const showPersonalizedAds = attPermissionGranted === true;

  const value: ATTContextType = {
    attPermissionGranted,
    showPersonalizedAds,
    updateATTPermission: onATTPermissionUpdate,
  };

  return (
    <ATTContext.Provider value={value}>
      {children}
    </ATTContext.Provider>
  );
};

export const useATT = (): ATTContextType => {
  const context = useContext(ATTContext);
  if (context === undefined) {
    throw new Error('useATT must be used within an ATTProvider');
  }
  return context;
};
