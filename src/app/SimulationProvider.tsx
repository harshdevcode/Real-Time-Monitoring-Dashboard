"use client";
import { useLiveSimulation } from "@/hooks/useLiveSimulation";

/**
 * Mounts the live data simulation once at the root.
 * Renders nothing — purely a side-effect bootstrap.
 */
export function SimulationProvider() {
  useLiveSimulation();
  return null;
}
