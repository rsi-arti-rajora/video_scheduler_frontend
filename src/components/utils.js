export const getKeyFromUrl = (url) => {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.slice(1); // Extracts the path and removes the leading slash
    return path;
  };

