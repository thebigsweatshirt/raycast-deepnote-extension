import { getPreferenceValues, OAuth } from "@raycast/api";
import { useState, useEffect } from "react";

interface Preferences {
  apiKey: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const prefs = getPreferenceValues<Preferences>();
    if (prefs.apiKey) {
      setApiKey(prefs.apiKey);
      setIsAuthenticated(true);
    }
  }, []);

  return { isAuthenticated, apiKey };
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  // TODO: Implement API key validation by making a request to Deepnote API
  // For now, we'll just check if the key is not empty
  return apiKey.trim().length > 0;
}
