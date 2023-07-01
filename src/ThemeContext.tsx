import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState, useMemo,
} from "react"

interface IThemeContext {
    theme: string
    setTheme: (theme: string) => void
}

export const ThemeContext = createContext<IThemeContext>({
    theme: "system",
    setTheme: () => console.warn("no theme provider"),
} as IThemeContext)

interface ThemeProviderProps {
    children: ReactNode
}

export const ThemeProvider = ({children}: ThemeProviderProps) => {
    const [theme, setThemeState] = useState<string>(getTheme())

    const setTheme = useCallback((theme: string) => {
        setThemeState(theme);
        try {
            localStorage.setItem("theme", theme)
        } catch (e) {
            // Unsupported
        }
    }, [])

    const applyTheme = useCallback((theme: string) => {
        let resolved = theme;
        if (theme === 'system') {
            resolved = getSystemTheme()
        }
        if (resolved === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, []);

    const handleMediaQuery = useCallback(() => {
        if (theme === 'system') {
            applyTheme('system')
        }
    }, [applyTheme, theme]);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener("change", handleMediaQuery);

        return () => media.removeEventListener("change", handleMediaQuery);
    }, [handleMediaQuery])

    const handleStorage = useCallback((e: StorageEvent) => {
        if (e.key !== "theme") {
            return
        }

        const theme = e.newValue || "system"
        setTheme(theme)
    }, [setTheme])

    useEffect(() => {
        window.addEventListener('storage', handleStorage)

        return () => window.removeEventListener('storage', handleStorage)
    }, [handleStorage, setTheme])

    useEffect(() => {
        applyTheme(theme)
    }, [applyTheme, theme])

    const providerValue = useMemo(() => ({
        theme, setTheme
    }), [setTheme, theme])

    return (
        <ThemeContext.Provider value={providerValue}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext<IThemeContext>(ThemeContext)

const getTheme = () => {
    let theme
    try {
        theme = localStorage.getItem("theme") || undefined
    } catch (e) {
        // Unsupported
    }
    return theme || "system"
}

const getSystemTheme = () => {
    const e = window.matchMedia('(prefers-color-scheme: dark)')
    const isDark = e.matches
    const systemTheme = isDark ? 'dark' : 'light'
    return systemTheme
}