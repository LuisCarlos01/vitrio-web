type CatalogResponseBody = {
  id: string;
  name: string;
  slug: string;
  primaryColorHex: string | null;
  buttonColorHex: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  whatsappVerificationStatus: 'UNVERIFIED' | 'VERIFIED';
  whatsappVerifiedAt: string | null;
  logoUrl: string | null;
  createdAt: string;
};

/** Placeholders neutros que o backend usa quando a revendedora nunca escolheu cor (`CatalogColorDefaults`, spec 002 do vitrio-api) — nunca nulos na resposta, mas também nunca uma escolha real da revendedora. */
export const UNSET_CATALOG_COLORS = {
  primaryColorHex: '#6D28D9',
  buttonColorHex: '#059669',
} as const;

export type Catalog = {
  id: string;
  name: string;
  slug: string;
  primaryColorHex: string | null;
  buttonColorHex: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  isWhatsappVerified: boolean;
  whatsappVerifiedAt: string | null;
  logoUrl: string | null;
};

export function toCatalog(body: CatalogResponseBody): Catalog {
  return {
    id: body.id,
    name: body.name,
    slug: body.slug,
    primaryColorHex: body.primaryColorHex,
    buttonColorHex: body.buttonColorHex,
    instagramHandle: body.instagramHandle,
    whatsappNumber: body.whatsappNumber,
    isWhatsappVerified: body.whatsappVerificationStatus === 'VERIFIED',
    whatsappVerifiedAt: body.whatsappVerifiedAt,
    logoUrl: body.logoUrl,
  };
}
