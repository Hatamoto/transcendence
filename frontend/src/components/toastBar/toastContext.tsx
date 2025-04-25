import { createContext, useContext } from "react"

type ToastContextValue = {
	open: (message: string, type: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => useContext(ToastContext);