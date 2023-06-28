import { FC, createContext, useContext } from "react";

import { Props as SocialLink } from "../../components/SocialLink/SocialLink";

export interface Messages {
  socialLinks?: SocialLink[];
  legalInformationLink?: string;
}

const MessagesContext = createContext<Messages | undefined>(undefined);

export const MessagesProvider: FC<
  React.PropsWithChildren<{ messages?: Messages }>
> = ({ messages, children }) => (
  <MessagesContext.Provider value={messages}>
    {children}
  </MessagesContext.Provider>
);

export const useMessages = () => useContext(MessagesContext) || {};
