import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 animate-pulse">
          <Image
            src="/assets/logo_orange.png"
            alt="B-1N1T Loading"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
