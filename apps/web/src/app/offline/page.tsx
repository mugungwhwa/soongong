"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#F8FBF7] p-8 text-center">
      <img
        src="/mascot/main-half.png"
        alt="순공이"
        className="h-32 w-32 object-contain opacity-60"
      />
      <h1 className="text-xl font-bold text-[var(--color-text-strong)]">오프라인 상태예요</h1>
      <p className="text-sm text-[var(--color-text-default)]">
        인터넷 연결을 확인한 뒤 다시 시도해주세요.
        <br />
        회독 기록은 연결되면 자동으로 동기화돼요.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-xl bg-[#A8DCCB] px-6 py-2.5 text-sm font-semibold text-white"
      >
        다시 연결하기
      </button>
    </div>
  );
}
