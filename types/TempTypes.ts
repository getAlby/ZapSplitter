// TODO: remove and update webhook description once these types are added to alby-js-sdk
export type BaseWebhookEndpointResponse = {
  url: string;
  description?: string;
  filter_types: string[];
  created_at: string;
  id: string;
};

export type CreateWebhookEndpointResponse = BaseWebhookEndpointResponse & {
  endpoint_secret: string;
};

export type Invoice = {
  amount: number;
  boostagram?: {
    podcast: string;
    feedID?: number;
    itemID: number;
    episode: string;
    ts: number;
    action: string;
    app_name: string;
    app_version: string;
    value_msat: number;
    value_msat_total: number;
    name: string;
    message: string;
    sender_name: string;
    episode_guid?: string;
    boost_link?: string;
    url?: string;
    guid?: string;
  } & Record<string, unknown>;
  comment?: string;
  created_at: string;
  creation_date: number;
  currency: string;
  custom_records: Record<string, string>;
  description_hash: null;
  expires_at: string;
  expiry: number;
  fiat_currency: string;
  fiat_in_cents: number;
  identifier: string;
  keysend_message?: string;
  memo: string;
  payer_name: string;
  payer_pubkey?: string;
  payment_hash: string;
  payment_request: string;
  r_hash_str: string;
  settled: boolean;
  settled_at: string;
  state: string;
  type: string;
  value: number;
  metadata?: {
    // TODO: add typings
    payer_data?: unknown;
    zap_request?: unknown;
  };
} & Record<string, unknown>;
