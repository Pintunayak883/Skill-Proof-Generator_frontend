export async function signIn(data: { email: string; password: string }) {
  const { loginHR } = await import("./api");
  try {
    const response = await loginHR(data.email, data.password);
    const token = response.data.token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    return { ok: true, token };
  } catch (error) {
    throw error;
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  company: string;
}) {
  const { registerHR } = await import("./api");
  try {
    const response = await registerHR(
      data.name,
      data.email,
      data.password,
      data.company,
    );
    const token = response.data.token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    return { ok: true, token };
  } catch (error) {
    throw error;
  }
}

export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function isAuthenticated() {
  return !!getAuthToken();
}
