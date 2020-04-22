export type WithHypermedia<T> = { _links: HypermediaControl[] } & T

type HypermediaControl =
  | string
  | { relation: string; parameters: { [name: string]: any } }
