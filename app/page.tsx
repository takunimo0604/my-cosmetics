import Image from "next/image";
import AuthModal from "./auth-modal";
import Board from "./board";
import CartDrawer, { AddToCartButton } from "./cart";
import ContactForm from "./contact-form";
import ToastHost from "./toast";

const products = [
  {
    id: "serum",
    name: "글로우 하이드라 세럼",
    description: "히알루론산과 비타민 B5가 깊은 수분과 투명한 광채를 선사합니다.",
    price: 38000,
    image: "/products/serum.jpg",
  },
  {
    id: "cream",
    name: "실크 밸런스 크림",
    description: "가볍게 스며들어 하루 종일 촉촉함을 지켜주는 데일리 보습 크림.",
    price: 42000,
    image: "/products/cream.jpg",
  },
  {
    id: "balm",
    name: "퓨어 클렌징 밤",
    description: "자극 없이 메이크업과 노폐물을 부드럽게 녹여내는 클렌저.",
    price: 29000,
    image: "/products/balm.jpg",
  },
];

export default function Home() {
  return (
    <div className="flex-1 bg-stone-50 text-stone-800">
      <ToastHost />
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="text-xl font-light tracking-[0.3em]">
            takunimo
          </a>
          <ul className="flex items-center gap-5 text-sm text-stone-600 sm:gap-8">
            <li>
              <a href="#products" className="transition hover:text-matcha-500">
                제품
              </a>
            </li>
            <li>
              <a href="#story" className="transition hover:text-matcha-500">
                브랜드
              </a>
            </li>
            <li>
              <a href="#board" className="transition hover:text-matcha-500">
                Q&amp;A
              </a>
            </li>
            <li>
              <a href="#contact" className="transition hover:text-matcha-500">
                문의
              </a>
            </li>
            <li>
              <CartDrawer />
            </li>
            <li>
              <AuthModal />
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-matcha-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-matcha-100 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
          <div>
            <p className="mb-4 text-xs tracking-[0.3em] text-matcha-500">
              CLEAN BEAUTY
            </p>
            <h1 className="text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
              피부 본연의
              <br />
              <span className="font-medium">빛을 깨우다</span>
            </h1>
            <p className="mt-6 max-w-md leading-8 text-stone-600">
              자연에서 온 순한 성분과 과학적인 포뮬러로, 매일의 루틴을 더 맑고
              편안하게 만들어 드립니다.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#products"
                className="rounded-full bg-stone-900 px-8 py-3.5 text-center text-white transition hover:bg-matcha-500"
              >
                제품 보러가기
              </a>
              <a
                href="#story"
                className="rounded-full border border-stone-300 px-8 py-3.5 text-center transition hover:border-matcha-400 hover:text-matcha-500"
              >
                브랜드 스토리
              </a>
            </div>
          </div>
          <div
            aria-hidden
            className="mx-auto flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded-t-[10rem] rounded-b-3xl bg-gradient-to-b from-matcha-100 via-matcha-50 to-stone-100 shadow-xl"
          >
            <span className="text-7xl">🌿</span>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs tracking-[0.3em] text-matcha-500">
            SIGNATURE
          </p>
          <h2 className="text-3xl font-light sm:text-4xl">대표 제품</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium">{p.name}</h3>
                <p className="mt-2 min-h-16 text-sm leading-7 text-stone-500">
                  {p.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-medium">
                    {p.price.toLocaleString("ko-KR")}원
                  </span>
                  <AddToCartButton
                    product={{
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      image: p.image,
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div
            aria-hidden
            className="aspect-[4/3] rounded-3xl bg-gradient-to-tr from-matcha-100 via-matcha-50 to-stone-100"
          />
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] text-matcha-500">
              OUR STORY
            </p>
            <h2 className="text-3xl font-light leading-snug sm:text-4xl">
              덜어내고, 더 깊이
              <br />
              피부를 생각합니다
            </h2>
            <p className="mt-6 leading-8 text-stone-600">
              takunimo는 &ldquo;좋은 화장품은 피부가 편안해야 한다&rdquo;는 믿음에서
              시작되었습니다. 불필요한 성분은 덜어내고, 검증된 핵심 성분에
              집중합니다.
            </p>
            <p className="mt-4 leading-8 text-stone-600">
              지속 가능한 원료와 재활용 가능한 패키지로, 피부에도 지구에도 순한
              아름다움을 만들어 갑니다.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-4 text-center">
              {[
                ["100%", "비건 포뮬러"],
                ["0", "동물실험"],
                ["95%", "자연 유래 성분"],
              ].map(([num, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-light text-matcha-500">{num}</dt>
                  <dd className="mt-1 text-xs text-stone-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Board */}
      <section id="board" className="scroll-mt-16">
        <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs tracking-[0.3em] text-matcha-500">
              Q&amp;A · REVIEW
            </p>
            <h2 className="text-3xl font-light sm:text-4xl">Q&amp;A / 리뷰</h2>
            <p className="mt-4 text-stone-500">
              궁금한 점과 사용 후기를 자유롭게 남겨주세요.
            </p>
          </div>
          <Board />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-matcha-50/60">
        <div className="mx-auto max-w-xl px-6 py-20 md:py-28">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs tracking-[0.3em] text-matcha-500">
              CONTACT
            </p>
            <h2 className="text-3xl font-light sm:text-4xl">문의하기</h2>
            <p className="mt-4 text-stone-500">
              제품이나 협업에 대해 궁금한 점을 남겨주세요.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-10 text-center text-sm text-stone-400">
        <p className="mb-2 tracking-[0.3em] text-stone-600">takunimo</p>
        <p>© 2026 takunimo. All rights reserved.</p>
      </footer>
    </div>
  );
}
