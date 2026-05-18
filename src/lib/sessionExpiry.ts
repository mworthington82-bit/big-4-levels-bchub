const KEY = "big4_session_expired";

export const flagSessionExpired = () => {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* noop */
  }
};

export const consumeSessionExpired = (): boolean => {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v) sessionStorage.removeItem(KEY);
    return v === "1";
  } catch {
    return false;
  }
};
