import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config. Add an incremental cache (R2/KV) only when the app uses ISR/`revalidate`:
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig();
