export type CloudflareTrpcContext = {
  req: Request;
  responseHeaders: Headers;
  user: null;
};

export function createCloudflareContext({ req, resHeaders }: { req: Request; resHeaders: Headers }): CloudflareTrpcContext {
  return { req, responseHeaders: resHeaders, user: null };
}
