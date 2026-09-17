import { contrastTextColor } from '@/lib/color/contrast-text-color';

type WhatsappFloatingButtonProps = {
  whatsappNumber: string | null;
  buttonColorHex: string;
};

export function WhatsappFloatingButton({
  whatsappNumber,
  buttonColorHex,
}: WhatsappFloatingButtonProps) {
  if (!whatsappNumber) {
    return null;
  }

  const digits = whatsappNumber.replace(/\D/g, '');
  const text = encodeURIComponent('Olá! Gostaria de saber mais sobre a loja.');

  return (
    <a
      href={`https://wa.me/${digits}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="flex size-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
      style={{
        backgroundColor: buttonColorHex,
        color: contrastTextColor(buttonColorHex),
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6.5"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12.032 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.146.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.765-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.087.274.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824zM12.032 0C5.406 0 .032 5.373.032 12c0 2.146.564 4.153 1.549 5.895l-1.615 5.887 6.045-1.584A11.94 11.94 0 0 0 12.032 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 22.038a10.02 10.02 0 0 1-5.128-1.408l-.367-.218-3.813.999 1.017-3.717-.239-.381a10.023 10.023 0 0 1-1.552-5.313c0-5.55 4.516-10.066 10.086-10.066s10.086 4.516 10.086 10.066-4.517 10.038-10.09 10.038z" />
      </svg>
    </a>
  );
}
