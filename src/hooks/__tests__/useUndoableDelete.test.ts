import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUndoableDelete } from "../useUndoableDelete";

type Item = { id: string; name: string };

describe("useUndoableDelete", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it("ينفّذ الحذف بعد المهلة", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useUndoableDelete<Item>(onConfirm, vi.fn(), vi.fn(), 5000));
    act(() => result.current.requestDelete({ id: "1", name: "أحمد" }));
    expect(onConfirm).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(onConfirm).toHaveBeenCalledWith({ id: "1", name: "أحمد" });
  });

  it("التراجع يلغي الحذف", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onRestore = vi.fn();
    const { result } = renderHook(() => useUndoableDelete<Item>(onConfirm, onRestore, vi.fn(), 5000));
    act(() => result.current.requestDelete({ id: "1", name: "أحمد" }));
    act(() => result.current.undoDelete("1"));
    expect(onRestore).toHaveBeenCalledWith({ id: "1", name: "أحمد" });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("التراجع المتعدد المتزامن", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useUndoableDelete<Item>(onConfirm, vi.fn(), vi.fn(), 5000));
    act(() => {
      result.current.requestDelete({ id: "1", name: "أول" });
      result.current.requestDelete({ id: "2", name: "ثاني" });
      result.current.requestDelete({ id: "3", name: "ثالث" });
    });
    act(() => result.current.undoDelete("2"));
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    const ids = onConfirm.mock.calls.map((c) => c[0].id);
    expect(ids).toContain("1"); expect(ids).toContain("3"); expect(ids).not.toContain("2");
  });

  it("فشل الشبكة → onDeleteFailed", async () => {
    const err = new Error("فشل الاتصال");
    const onConfirm = vi.fn().mockRejectedValue(err);
    const onFailed = vi.fn();
    const { result } = renderHook(() => useUndoableDelete<Item>(onConfirm, vi.fn(), onFailed, 5000));
    act(() => result.current.requestDelete({ id: "1", name: "أحمد" }));
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(onFailed).toHaveBeenCalledWith({ id: "1", name: "أحمد" }, err);
  });

  it("إعادة طلب نفس العنصر يلغي المؤقت القديم", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useUndoableDelete<Item>(onConfirm, vi.fn(), vi.fn(), 5000));
    act(() => result.current.requestDelete({ id: "1", name: "أولى" }));
    act(() => { vi.advanceTimersByTime(2000); result.current.requestDelete({ id: "1", name: "ثانية" }); });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith({ id: "1", name: "ثانية" });
  });

  it("التنظيف عند Unmount ينفّذ المعلّقات", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() => useUndoableDelete<Item>(onConfirm, vi.fn(), vi.fn(), 5000));
    act(() => result.current.requestDelete({ id: "1", name: "معلّق" }));
    expect(onConfirm).not.toHaveBeenCalled();
    await act(async () => { unmount(); });
    expect(onConfirm).toHaveBeenCalledWith({ id: "1", name: "معلّق" });
  });
});
