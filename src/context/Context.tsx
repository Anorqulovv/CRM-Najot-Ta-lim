import { createContext, useState, type ReactNode} from "react";

interface ContextType {
    collapse:boolean,
    setCollapse:any
}

export const Context = createContext({} as ContextType)

export const GlobalContext = ({children}:{children:ReactNode}) => {
    const [collapse, setCollapse] = useState<boolean>(false)

    return <Context.Provider value={{collapse, setCollapse}}>{children}</Context.Provider>
}