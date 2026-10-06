"use client";

/*
 * Supabase SQL Editor에서 한 번 실행해 주세요.
 *
 * create table public.qna (
 *   id bigint generated always as identity primary key,
 *   user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 *   author text not null,
 *   title text not null,
 *   content text not null,
 *   created_at timestamptz not null default now()
 * );
 * alter table public.qna enable row level security;
 * create policy "qna read"   on public.qna for select using (true);
 * create policy "qna insert" on public.qna for insert to authenticated with check (auth.uid() = user_id);
 * create policy "qna update" on public.qna for update to authenticated using (auth.uid() = user_id);
 * create policy "qna delete" on public.qna for delete to authenticated using (auth.uid() = user_id);
 */

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { toast } from "./toast";

type Post = {
  id: number;
  user_id: string;
  author: string;
  title: string;
  content: string;
  created_at: string;
};

const fieldClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200";

export default function Board() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; label: string } | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("qna")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast(
        "error",
        error.code === "42P01" || error.code === "PGRST205"
          ? "qna 테이블이 없습니다. board.tsx 상단의 SQL을 실행해 주세요."
          : `목록을 불러오지 못했습니다: ${error.message}`,
      );
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const toUser = (
      u: { id: string; email?: string; user_metadata?: { name?: string } } | undefined,
    ) =>
      u ? { id: u.id, label: u.user_metadata?.name || u.email || "회원" } : null;

    supabase.auth.getSession().then(({ data }) => setUser(toUser(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(toUser(session?.user));
      setEditing(null);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => data.subscription.unsubscribe();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase || !user) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title")).trim();
    const content = String(fd.get("content")).trim();
    const author = String(fd.get("author")).trim();

    setSaving(true);
    const { error } = editing
      ? await supabase
          .from("qna")
          .update({ title, content, author })
          .eq("id", editing.id)
      : await supabase.from("qna").insert({ title, content, author });
    setSaving(false);

    if (error) return toast("error", `저장 실패: ${error.message}`);
    toast("success", editing ? "글이 수정되었습니다." : "글이 등록되었습니다.");
    setEditing(null);
    form.reset();
    load();
  };

  const handleDelete = async (post: Post) => {
    if (!supabase || !window.confirm("이 글을 삭제할까요?")) return;
    const { error } = await supabase.from("qna").delete().eq("id", post.id);
    if (error) return toast("error", `삭제 실패: ${error.message}`);
    toast("success", "글이 삭제되었습니다.");
    if (editing?.id === post.id) setEditing(null);
    load();
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="font-medium">Supabase 설정이 필요해요 🌱</p>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          프로젝트 루트의 <code className="rounded bg-stone-100 px-1.5">.env.local</code>{" "}
          파일에 아래 값을 추가하고 개발 서버를 다시 시작해 주세요.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-stone-100 p-4 text-left text-xs leading-6">
          {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {user ? (
        <form
          key={editing?.id ?? "new"}
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <h3 className="text-lg font-medium">
            {editing ? "글 수정" : "글 작성"}
          </h3>
          <input
            name="author"
            required
            defaultValue={editing?.author ?? user.label}
            placeholder="작성자"
            aria-label="작성자"
            className={fieldClass}
          />
          <input
            name="title"
            required
            defaultValue={editing?.title}
            placeholder="제목"
            aria-label="제목"
            className={fieldClass}
          />
          <textarea
            name="content"
            required
            rows={4}
            defaultValue={editing?.content}
            placeholder="궁금한 점이나 사용 후기를 남겨주세요."
            aria-label="내용"
            className={fieldClass}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-rose-500 disabled:opacity-60"
            >
              {saving ? "저장 중..." : editing ? "수정 완료" : "등록"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-stone-300 px-6 py-3 transition hover:border-rose-400 hover:text-rose-500"
              >
                취소
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
          글을 작성하려면 상단에서 로그인해 주세요.
        </p>
      )}

      {loading ? (
        <p className="text-center text-stone-400">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-stone-400">
          아직 등록된 글이 없어요. 첫 글을 남겨보세요 ✨
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium">{p.title}</h3>
                {user?.id === p.user_id && (
                  <div className="flex shrink-0 gap-2 text-sm">
                    <button
                      onClick={() => {
                        setEditing(p);
                        document
                          .getElementById("board")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-stone-500 transition hover:text-rose-500"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="text-stone-500 transition hover:text-rose-500"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-stone-600">
                {p.content}
              </p>
              <p className="mt-4 text-xs text-stone-400">
                {p.author} · {new Date(p.created_at).toLocaleDateString("ko-KR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
