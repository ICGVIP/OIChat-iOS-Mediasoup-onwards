import React, { createContext, useState } from 'react';

// Create context
export const GlobalContext = createContext();





export const GlobalProvider = ({ children }) => {

  const [isMute_g, setIsMute_g] = useState(true);
  const [isPathToReels, setPathToReels] = useState();
  const [isPathToPost, setPathToPost] = useState();
  const [isPathToStory, setPathToStory] = useState();
  const [isPathToProfile, setPathToProfile] = useState();
  const [selectedLocation, setSelectedLocation] = useState('');
  console.log("isMute_g :; isMute_g", isMute_g)

  return (
    <GlobalContext.Provider value={{
        isMute_g, setIsMute_g,
        selectedLocation, setSelectedLocation,
        isPathToReels, setPathToReels,
        isPathToPost, setPathToPost,
        isPathToStory, setPathToStory,
        isPathToProfile, setPathToProfile
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
