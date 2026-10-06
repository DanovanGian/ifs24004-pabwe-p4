import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai string kosong sebagai nilai awal default", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const { result } = renderHook(() => useInput("halo"));
    expect(result.current[0]).toBe("halo");
  });

  it("memperbarui nilai lewat handleChange", () => {
    const { result } = renderHook(() => useInput());
    act(() => {
      result.current[1]({ target: { value: "dunia" } });
    });
    expect(result.current[0]).toBe("dunia");
  });

  it("memperbarui nilai lewat setValue", () => {
    const { result } = renderHook(() => useInput());
    act(() => {
      result.current[2]("baru");
    });
    expect(result.current[0]).toBe("baru");
  });
});