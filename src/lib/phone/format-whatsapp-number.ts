/**
 * Máscara de exibição pro número de WhatsApp: aceita só dígitos (descarta
 * qualquer letra/símbolo digitado) e formata progressivamente como
 * "(11) 91234-5678" — DDD + número local, sem código do país. O backend
 * (`WhatsappNumberNormalizer`) já espera o usuário digitar só isso e
 * prepende o "+55" sozinho a partir do tamanho (10-11 dígitos), então a
 * máscara não deve incluir o código do país.
 *
 * O traço muda de posição (8 pra 9 dígitos locais) assim que o total
 * ultrapassa 10 dígitos — cobre fixo (8 dígitos) e celular (9).
 */
export function formatWhatsappNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';

  const ddd = digits.slice(0, 2);
  if (digits.length <= 2) return `(${ddd}`;

  const local = digits.slice(2);
  if (digits.length <= 6) return `(${ddd}) ${local}`;

  const splitIndex = digits.length >= 11 ? 5 : 4;
  return `(${ddd}) ${local.slice(0, splitIndex)}-${local.slice(splitIndex)}`;
}
