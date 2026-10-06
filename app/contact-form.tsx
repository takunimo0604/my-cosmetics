"use client";

import { useState } from "react";

const fieldClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-xl font-medium text-stone-800">
          문의가 접수되었습니다 ✨
        </p>
        <p className="mt-2 text-stone-500">빠른 시일 내에 답변드리겠습니다.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: 실제 전송 로직(API Route / Server Action) 연결
        setSent(true);
      }}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm sm:p-10"
    >
      <div>
        <label htmlFor="name" className="mb-2 block text-sm text-stone-600">
          이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="홍길동"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-stone-600">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="hello@example.com"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-stone-600">
          메시지
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="문의 내용을 입력해주세요."
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-stone-900 px-6 py-3.5 font-medium text-white transition hover:bg-rose-500"
      >
        문의 보내기
      </button>
    </form>
  );
}
