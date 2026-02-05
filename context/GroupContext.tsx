import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GroupInfo } from '../types';

interface GroupContextType {
  groupInfo: GroupInfo;
  updateGroupInfo: (info: Partial<GroupInfo>) => void;
}

const defaultGroupInfo: GroupInfo = {
  name: "Share Video 🔞",
  subtext: "Undangan Grup WhatsApp",
  image: "https://picsum.photos/id/64/200/200", // Placeholder for the profile
  memberCount: 256,
  groupLink: "https://chat.whatsapp.com/" // Default link
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [groupInfo, setGroupInfo] = useState<GroupInfo>(defaultGroupInfo);

  const updateGroupInfo = (info: Partial<GroupInfo>) => {
    setGroupInfo(prev => ({ ...prev, ...info }));
  };

  return (
    <GroupContext.Provider value={{ groupInfo, updateGroupInfo }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};