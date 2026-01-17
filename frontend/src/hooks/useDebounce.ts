import { useEffect, useState } from "react"

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        // Set timer setiap kali value berubah
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay || 500)

        // Clear timer kalau user ngetik lagi sebelum waktu habis
        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}