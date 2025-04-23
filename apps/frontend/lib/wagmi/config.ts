import { http, createConfig } from "wagmi";
import { polygonAmoy, polygon } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [polygonAmoy, polygon],
  connectors: [metaMask()],
  transports: {
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
  },
});
