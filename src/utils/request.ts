// Hàm gọi API luôn tự động gắn Authorization header từ context
import { useAuth } from '@/context/AuthContext';

// React hook: chỉ dùng trong component hoặc custom hook
export function useRequestWithAuth() {
  const { token } = useAuth();
  // Hàm gọi API có gắn token
  const requestWithAuth = async <T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = API_URL ? `${API_URL}${path}` : mockUrls[`../mock${path}.json`]?.default;
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    return data as T;
  };
  return requestWithAuth;
}
import { getConfig } from "./template";

// FIX: Hardcode production API URL
const API_URL = "https://be-sgv1.onrender.com/api";

const mockUrls = import.meta.glob<{ default: string }>("../mock/*.json", {
  query: "url",
  eager: true,
});

export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = API_URL
    ? `${API_URL}${path}`
    : mockUrls[`../mock${path}.json`]?.default;

  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  console.log('API Request URL:', url); // Debug log
  const response = await fetch(url, options);
  const data = await response.json();
  console.log('API Response:', data); // Debug log
  return data as T;
}

export async function requestWithFallback<T>(
  path: string,
  fallbackValue: T,
  options?: RequestInit
): Promise<T> {
  try {
    return await request<T>(path, options);
  } catch (error) {
    console.warn(
      "An error occurred while fetching data. Falling back to default value!"
    );
    console.warn({ path, error, fallbackValue });
    return fallbackValue;
  }
}