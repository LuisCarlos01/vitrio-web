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
  /** true assim que algum PATCH já definiu primaryColorHex/buttonColorHex, mesmo que o valor coincida com o placeholder — nunca volta a false (spec 010 do vitrio-api). */
  hasCustomColor: boolean;
  logoUrl: string | null;
  createdAt: string;
};

export type Catalog = {
  id: string;
  name: string;
  slug: string;
  primaryColorHex: string | null;
  buttonColorHex: string | null;
  hasCustomColor: boolean;
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
    hasCustomColor: body.hasCustomColor,
    instagramHandle: body.instagramHandle,
    whatsappNumber: body.whatsappNumber,
    isWhatsappVerified: body.whatsappVerificationStatus === 'VERIFIED',
    whatsappVerifiedAt: body.whatsappVerifiedAt,
    logoUrl: body.logoUrl ?? null,
  };
}
