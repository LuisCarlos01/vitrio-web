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
      style={{
        backgroundColor: buttonColorHex,
        color: contrastTextColor(buttonColorHex),
      }}
    >
      Falar no WhatsApp
    </a>
  );
}
