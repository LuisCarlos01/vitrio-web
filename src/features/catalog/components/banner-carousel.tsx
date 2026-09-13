'use client';

import { useEffect, useState } from 'react';

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
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${currentSlide.imageUrl})`,
      }}
    >
      <button
        type="button"
        aria-label="Banner anterior"
        onClick={() => goTo(currentIndex - 1)}
      >
        ‹
      </button>
      <p>{currentSlide.title}</p>
      <button
        type="button"
        aria-label="Próximo banner"
        onClick={() => goTo(currentIndex + 1)}
      >
        ›
      </button>
      <div role="tablist" aria-label="Banners">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ir para o banner ${index + 1}`}
            aria-current={index === currentIndex}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
