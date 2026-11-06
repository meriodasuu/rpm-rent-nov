export type LegacyRedirect = { source: string; destination: string; permanent: true };

// Only verified one-to-one legacy equivalents belong here. Geographic and service
// URLs stay unmapped until their historical content is checked by the owner.
export const legacyRedirects: LegacyRedirect[] = [
  { source: "/home", destination: "/", permanent: true },
  { source: "/category/avto-v-arendu", destination: "/cars", permanent: true },
  { source: "/category/avto-v-arendu/", destination: "/cars", permanent: true },
];
