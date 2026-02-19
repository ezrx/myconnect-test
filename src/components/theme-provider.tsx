'use strict';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return <NextThemesProvider attribute="data-theme" defaultTheme="system" enableSystem {...props}>{children}</NextThemesProvider>;
}
