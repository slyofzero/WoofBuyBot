import { errorHandler } from "./handlers";

export async function apiFetcher<T>(url: string, headers?: HeadersInit) {
  try {
    const response = await fetch(url, { headers });
    const data = (await response.json()) as T;
    return { response: response.status, data };
  } catch (error) {
    errorHandler(error);
    return { response: 400, data: null };
  }
}
