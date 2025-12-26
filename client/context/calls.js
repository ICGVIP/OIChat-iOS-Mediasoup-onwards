import { createContext, useContext, useState } from 'react';


const CallsContext = createContext({
  calls: [],
  setCalls: () => {},
});

export function useCallsSet() {
  return useContext(CallsContext);
}



export function CallsProvider(props) {
  const [calls, setCalls] = useState([]);

  return (
    <CallsContext.Provider
      value={{
        calls,
        setCalls
      }}
    >
      {props.children}
    </CallsContext.Provider>
  );
}