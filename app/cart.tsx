"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { toast } from "./toast";

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};
type CartItem = CartProduct & { quantity: number };

const STORAGE_KEY = "takunimo-cart";
const MAX_QTY = 99;
const EMPTY: CartItem[] = [];

// --- localStorage 기반 외부 스토어 (새로고침/다른 탭에서도 유지·동기화) ---
let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) {
      items = parsed.filter(
        (i): i is CartItem =>
          i &&
          typeof i.id === "string" &&
          typeof i.name === "string" &&
          typeof i.price === "number" &&
          typeof i.image === "string" &&
          Number.isInteger(i.quantity) &&
          i.quantity > 0,
      );
    }
  } catch {
    // 손상되었거나 접근 불가능한 저장소는 빈 장바구니로 취급
  }
}

function setItems(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 저장 실패(사생활 보호 모드 등)해도 메모리 상태로는 동작
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  load();
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return items;
};
const getServerSnapshot = () => EMPTY;

function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

function addItem(p: CartProduct) {
  const found = items.find((i) => i.id === p.id);
  setItems(
    found
      ? items.map((i) =>
          i.id === p.id ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QTY) } : i,
        )
      : [...items, { ...p, quantity: 1 }],
  );
}

function changeQty(id: string, delta: number) {
  setItems(
    items.map((i) =>
      i.id === id
        ? { ...i, quantity: Math.min(Math.max(i.quantity + delta, 1), MAX_QTY) }
        : i,
    ),
  );
}

const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));
const clearCart = () => setItems(EMPTY);

// --- 상품 카드의 [장바구니 담기] 버튼 ---
export function AddToCartButton({ product }: { product: CartProduct }) {
  return (
    <button
      type="button"
      onClick={() => {
        addItem(product);
        toast("success", `'${product.name}'을(를) 장바구니에 담았어요.`);
      }}
      className="rounded-full border border-stone-300 px-4 py-1.5 text-sm transition hover:border-matcha-400 hover:text-matcha-500"
    >
      장바구니 담기
    </button>
  );
}

const qtyBtn =
  "flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:border-matcha-400 hover:text-matcha-500 disabled:opacity-40 disabled:hover:border-stone-300 disabled:hover:text-stone-600";

// --- 헤더의 장바구니 아이콘(배지) + 오른쪽 슬라이드 Drawer ---
export default function CartDrawer() {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`장바구니, ${count}개`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone-700 transition hover:text-matcha-500"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 7h12l-1 13H7L6 7Z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-matcha-500 px-1 text-[11px] leading-none font-medium text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
            aria-hidden={!open}
          >
            <div
              onClick={() => setOpen(false)}
              className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="장바구니"
              className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
                <div>
                  <p className="text-xs tracking-[0.3em] text-matcha-500">CART</p>
                  <h2 className="mt-1 text-xl font-light">
                    장바구니{" "}
                    <span className="text-sm text-stone-400">({count})</span>
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="닫기"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-stone-400">
                  <span className="text-5xl">🌿</span>
                  <p>장바구니가 비어 있어요.</p>
                  <a
                    href="#products"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-700 transition hover:border-matcha-400 hover:text-matcha-500"
                  >
                    제품 둘러보기
                  </a>
                </div>
              ) : (
                <>
                  <ul className="flex-1 divide-y divide-stone-100 overflow-y-auto px-6">
                    {cart.map((i) => (
                      <li key={i.id} className="flex gap-4 py-5">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                          <Image
                            src={i.image}
                            alt={i.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{i.name}</p>
                              <p className="mt-0.5 text-sm text-stone-500">
                                {won(i.price)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(i.id)}
                              className="shrink-0 text-xs text-stone-400 underline-offset-4 transition hover:text-matcha-500 hover:underline"
                            >
                              삭제
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                aria-label={`${i.name} 수량 감소`}
                                disabled={i.quantity <= 1}
                                onClick={() => changeQty(i.id, -1)}
                                className={qtyBtn}
                              >
                                −
                              </button>
                              <span
                                className="w-6 text-center text-sm"
                                aria-live="polite"
                              >
                                {i.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`${i.name} 수량 증가`}
                                disabled={i.quantity >= MAX_QTY}
                                onClick={() => changeQty(i.id, 1)}
                                className={qtyBtn}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-medium">
                              {won(i.price * i.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-stone-200 px-6 py-5">
                    <div className="mb-4 flex items-baseline justify-between">
                      <span className="text-stone-500">총 결제 금액</span>
                      <span className="text-2xl font-light text-matcha-500">
                        {won(total)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          clearCart();
                          toast("success", "장바구니를 비웠어요.");
                        }}
                        className="rounded-full border border-stone-300 px-5 py-3 text-sm transition hover:border-matcha-400 hover:text-matcha-500"
                      >
                        장바구니 비우기
                      </button>
                      <button
                        type="button"
                        onClick={() => toast("success", "결제 기능은 준비 중이에요.")}
                        className="flex-1 rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-matcha-500"
                      >
                        주문하기
                      </button>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
