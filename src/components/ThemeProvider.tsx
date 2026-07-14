import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ComponentProps } from "react";

/**
 * App-wide theme provider. Persists the user's choice (light / dark / system)
 * to localStorage and toggles the `class` on <html> so the Tailwind design
 * tokens in index.css switch cleanly.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
