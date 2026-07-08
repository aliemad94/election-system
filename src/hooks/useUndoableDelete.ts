import { useRef, useCallback, useEffect } from 'react';

type PendingDelete<T> = {
  item: T;
  timeoutId: ReturnType<typeof setTimeout>;
};

export function useUndoableDelete<T extends { id: string | number }>(
  onConfirmDelete: (item: T) => Promise<void>,
  onRestore: (item: T) => void,
  onDeleteFailed: (item: T, error: unknown) => void,
  delayMs = 5000
) {
  // Map بدل متغير واحد — كل عملية حذف بمؤقت مستقل بمعرّفها الخاص
  const pending = useRef<Map<string | number, PendingDelete<T>>>(new Map());

  const requestDelete = useCallback((item: T) => {
    // إذا كان العنصر نفسه قيد حذف مسبق، نلغي المؤقت القديم أولاً
    const existing = pending.current.get(item.id);
    if (existing) clearTimeout(existing.timeoutId);

    const timeoutId = setTimeout(async () => {
      pending.current.delete(item.id);
      try {
        await onConfirmDelete(item);
      } catch (error) {
        // فشل الشبكة/الخادم: نعيد العنصر للقائمة ونبلّغ المستخدم
        onDeleteFailed(item, error);
      }
    }, delayMs);

    pending.current.set(item.id, { item, timeoutId });
  }, [onConfirmDelete, onDeleteFailed, delayMs]);

  const undoDelete = useCallback((id: string | number) => {
    const entry = pending.current.get(id);
    if (!entry) return;
    clearTimeout(entry.timeoutId);
    pending.current.delete(id);
    onRestore(entry.item);
  }, [onRestore]);

  // عند مغادرة الصفحة/تفكيك المكوّن: نُنفّذ كل الحذوفات المعلّقة فوراً
  // بدل تركها "معلّقة" بلا تنفيذ ولا إلغاء
  useEffect(() => {
    return () => {
      pending.current.forEach(({ item, timeoutId }) => {
        clearTimeout(timeoutId);
        onConfirmDelete(item).catch((error) => {
          // لا يمكن تحديث الواجهة بعد التفكيك، لكن نسجل الخطأ على الأقل
          console.error('فشل تنفيذ الحذف المعلّق عند مغادرة الصفحة', error);
        });
      });
      pending.current.clear();
    };
  }, []);

  return { requestDelete, undoDelete };
}
