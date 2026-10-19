export const getStoredToken = (): string | null => {
  let token: string | null = localStorage.getItem("token") || localStorage.getItem("auth");
  if (!token) return null;

  // Clean if wrapped in extra quotes from previous JSON.stringify
  if (token.startsWith('"') && token.endsWith('"')) {
    try {
      const parsed = JSON.parse(token);
      token = typeof parsed === "string" ? parsed : token.slice(1, -1);
    } catch {
      token = token.slice(1, -1);
    }
  }

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token;
};

export const setStoredAuth = (token: string) => {
  let cleanToken = token;
  if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
    try {
      const parsed = JSON.parse(cleanToken);
      cleanToken = typeof parsed === "string" ? parsed : cleanToken.slice(1, -1);
    } catch {
      cleanToken = cleanToken.slice(1, -1);
    }
  }
  localStorage.setItem("token", cleanToken);
  localStorage.setItem("auth", cleanToken);
};

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("auth");
  localStorage.removeItem("cartItems");
  localStorage.removeItem("cartCount");
};
