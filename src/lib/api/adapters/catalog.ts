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
  createdAt: string;
};

export type Catalog = {
  id: string;
  name: string;
  slug: string;
  primaryColorHex: string | null;
  buttonColorHex: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  isWhatsappVerified: boolean;
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
  };
}
