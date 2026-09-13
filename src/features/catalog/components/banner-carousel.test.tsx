import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BannerCarousel } from './banner-carousel';

const slides = [
  {
    id: 'prod-1',
    imageUrl: 'https://cdn.example.com/eggeo.png',
    title: 'Eggeo Blossom',
  },
  {
    id: 'prod-2',
    imageUrl: 'https://cdn.example.com/glamour.jpeg',
    title: 'Glamour Noir',
  },
  {
    id: 'prod-3',
    imageUrl: 'https://cdn.example.com/eggeo2.png',
    title: 'Eggeo Rose',
  },
];

describe('BannerCarousel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when there are no slides', () => {
    const { container } = render(<BannerCarousel slides={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the first slide and one dot per slide, the first marked current', () => {
    render(<BannerCarousel slides={slides} />);

    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
    const dots = screen.getAllByRole('button', { name: /Ir para o banner/ });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
  });

  it('advances to the next slide when the next arrow is clicked, wrapping at the end', async () => {
    const user = userEvent.setup();
    render(<BannerCarousel slides={slides} />);

    await user.click(screen.getByRole('button', { name: 'Próximo banner' }));
    expect(screen.getByText('Glamour Noir')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Próximo banner' }));
    expect(screen.getByText('Eggeo Rose')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Próximo banner' }));
    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
  });

  it('goes to the previous slide when the prev arrow is clicked, wrapping at the start', async () => {
    const user = userEvent.setup();
    render(<BannerCarousel slides={slides} />);

    await user.click(screen.getByRole('button', { name: 'Banner anterior' }));

    expect(screen.getByText('Eggeo Rose')).toBeInTheDocument();
  });

  it('jumps directly to a slide when its dot is clicked', async () => {
    const user = userEvent.setup();
    render(<BannerCarousel slides={slides} />);

    await user.click(
      screen.getByRole('button', { name: 'Ir para o banner 3' }),
    );

    expect(screen.getByText('Eggeo Rose')).toBeInTheDocument();
  });

  it('auto-advances to the next slide after the interval elapses', () => {
    vi.useFakeTimers();
    render(<BannerCarousel slides={slides} />);

    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('Glamour Noir')).toBeInTheDocument();
  });
});
