"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const t = setInterval(() => setTime(format(new Date(), "HH:mm:ss")), 1000);
    return () => clearInterval(t);
  }, []);

  return time;
}
