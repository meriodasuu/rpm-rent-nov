export type MarketplaceValue<T> =
  | { availability: "VALUE"; value: T }
  | { availability: "NOT_AVAILABLE"; reason: string };

export const marketplaceValue = <T>(value: T): MarketplaceValue<T> => ({ availability: "VALUE", value });
export const unavailableMarketplaceValue = <T>(reason: string): MarketplaceValue<T> => ({ availability: "NOT_AVAILABLE", reason });

export type CanonicalMarketplaceListing = {
  externalId: string;
  externalUrl: string | null;
  title: MarketplaceValue<string>;
  price: MarketplaceValue<number>;
  publicationActive: MarketplaceValue<boolean>;
  platformStatus: string;
};

export type MarketplaceJsonValue = string | number | boolean | null | MarketplaceJsonValue[] | { [key: string]: MarketplaceJsonValue };
export type MarketplaceListingObservation = {
  canonical: CanonicalMarketplaceListing;
  rawData: { [key: string]: MarketplaceJsonValue };
};

export type MarketplaceComparisonStatus = "MATCH" | "MISMATCH" | "NOT_AVAILABLE" | "IGNORED";
export type MarketplaceSeverity = "CRITICAL" | "ERROR" | "WARNING" | "INFO";

export type MarketplaceFieldComparison = {
  fieldCode: "PRICE" | "PUBLICATION_STATUS" | "TITLE";
  status: MarketplaceComparisonStatus;
  severity: MarketplaceSeverity;
  masterValue: string | number | boolean | null;
  externalValue: string | number | boolean | null;
};

export type MarketplaceConnectorErrorCode =
  | "NOT_CONFIGURED"
  | "AUTH_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "API_ERROR"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "INTERNAL_ERROR";

export class MarketplaceConnectorError extends Error {
  constructor(public readonly code: MarketplaceConnectorErrorCode, message: string) {
    super(message);
    this.name = "MarketplaceConnectorError";
  }
}

export type ConnectorHealth = { status: "AVAILABLE" | "NOT_CONFIGURED" | "AUTH_ERROR" | "API_ERROR" };

export interface MarketplaceConnector {
  healthCheck(): Promise<ConnectorHealth>;
  listListings(): Promise<MarketplaceListingObservation[]>;
  getListing(externalId: string): Promise<MarketplaceListingObservation>;
}
