import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  pathname: string;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
  push: () => {},
  replace: () => {},
  back: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const push = useCallback((href: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== href) {
        window.history.pushState({}, '', href);
        setPathname(href.split('?')[0]);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, []);

  const replace = useCallback((href: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', href);
      setPathname(href.split('?')[0]);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const back = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, push, replace, back }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  return {
    push: context.push,
    replace: context.replace,
    back: context.back,
  };
};

export const usePathname = () => {
  const context = useContext(RouterContext);
  return context.pathname;
};

export const useParams = (): Record<string, string> => {
  const { pathname } = useContext(RouterContext);
  // Match /products/:id
  const productMatch = pathname.match(/^\/products\/([^/?]+)/);
  if (productMatch) {
    return { id: productMatch[1] };
  }
  return {};
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, onClick, ...props }) => {
  const { push } = useContext(RouterContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Allow standard browser behaviour for new tabs/windows or external links
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      href.startsWith('http') ||
      href.startsWith('//')
    ) {
      return;
    }

    e.preventDefault();
    push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export default Link;
