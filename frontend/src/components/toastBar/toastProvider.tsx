import { useMemo, useState } from "react";
import { ToastContext } from "./toastContext";
import Toast from "./toastMessage";

type ToastProviderProps = {
	children: React.ReactNode;
}

type ToastType = {
	message: string;
	type: "success" | "error" | "info" | "default";
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {

	const [toast, setToasts] = useState<ToastType[]>([]);

	function openToast(message: string, type: "success" | "error" | "info" | "default" = "default") {
		const newToast = { message, type };
		setToasts([newToast]);

		setTimeout(() => {
			setToasts([]);
		}, 3500);
	}

	const contextValue = useMemo(() => ({
		open: openToast,
	}), [])

	return (
		<>
			<ToastContext.Provider value={contextValue}>
				{children}
				{toast.length > 0 && toast.map((toast, index) => (
					<Toast key={index} message={toast.message} type={toast.type} />
				))}
			</ToastContext.Provider>
		</>
	)
}

export default ToastProvider