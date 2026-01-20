// Simplified mock of shadcn/ui use-toast for MVP
import { useState, useEffect } from "react"

export interface Toast {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9)
        console.log(`[TOAST] ${title}: ${description} (${variant})`);
        setToasts((prev) => [...prev, { id, title, description, variant }])

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }

    return {
        toast,
        toasts,
        dismiss: (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    }
}

export const toast = (props: Omit<Toast, "id">) => {
    console.log(`[TOAST GLOBAL] ${props.title}: ${props.description}`);
}
