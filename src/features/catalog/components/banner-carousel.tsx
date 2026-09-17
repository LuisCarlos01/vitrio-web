'use client';

import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export type BannerSlide = {
  id: string;
  imageUrl: string;
  title: string;
};

const AUTO_ADVANCE_MS = 5000;

export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  function goTo(index: number) {
    setCurrentIndex((index + slides.length) % slides.length);
  }

  return (
    <div
      className="relative flex h-[340px] items-center justify-start bg-cover bg-center px-6 sm:h-[440px] sm:px-12 lg:h-[560px] lg:px-16"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 60%), linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url(${currentSlide.imageUrl})`,
      }}
    >
      <button
        type="button"
        aria-label="Banner anterior"
        onClick={() => goTo(currentIndex - 1)}
        className="bg-primary-foreground text-foreground absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-opacity hover:opacity-90 sm:left-4"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <p className="text-primary-foreground max-w-md text-left text-3xl leading-tight font-semibold drop-shadow-lg sm:max-w-lg sm:text-5xl">
        {currentSlide.title}
      </p>
      <button
        type="button"
        aria-label="Próximo banner"
        onClick={() => goTo(currentIndex + 1)}
        className="bg-primary-foreground text-foreground absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-opacity hover:opacity-90 sm:right-4"
      >
        <ChevronRightIcon className="size-5" />
      </button>
      <div
        role="tablist"
        aria-label="Banners"
        className="absolute bottom-3 flex items-center gap-1.5"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ir para o banner ${index + 1}`}
            aria-current={index === currentIndex}
            onClick={() => goTo(index)}
            className="bg-primary-foreground/50 aria-[current=true]:bg-primary-foreground size-1.5 rounded-full transition-all aria-[current=true]:w-4"
          />
        ))}
      </div>
    </div>
  );
}
