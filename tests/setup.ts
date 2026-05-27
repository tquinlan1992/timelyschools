import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { resetStore } from "@/lib/store";

beforeEach(() => {
  resetStore();
});

afterEach(() => {
  cleanup();
  resetStore();
});
