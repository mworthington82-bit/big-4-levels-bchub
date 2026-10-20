import { useEffect, useState } from "react";

/** The family's one definition of "phone": phones, small tablets, and phones turned sideways. */
export const PHONE_QUERY =
  "screen and (max-width: 900px), screen and (max-height: 500px) and (pointer: coarse)";

export const isPhoneNow = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(PHONE_QUERY).matches;

/** True on phone layouts only. Desktop, laptop and TV always get false. */
export function usePhone() {
  const [phone, setPhone] = useState<boolean>(isPhoneNow);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(PHONE_QUERY);
    const on = () => setPhone(mql.matches);
    on();
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);
  return phone;
}
