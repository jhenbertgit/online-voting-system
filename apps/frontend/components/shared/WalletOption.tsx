import * as React from "react";
import type { JSX } from "react";
import { Connector, useConnect } from "wagmi";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Wallet2Icon, Loader2 } from "lucide-react";

/**
 * WalletOptions renders a list of wallet connector options for the user to connect.
 * @returns {JSX.Element} Wallet connector options UI.
 */
export function WalletOptions(): JSX.Element {
  const { connectors, connect } = useConnect();

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <WalletOption
          key={connector.uid}
          connector={connector}
          onClick={() => connect({ connector })}
        />
      ))}
    </div>
  );
}

/**
 * WalletOption renders a single wallet connector button.
 * @param {object} props - Props for WalletOption.
 * @param {Connector} props.connector - Wallet connector instance.
 * @param {() => void} props.onClick - Click handler for connecting.
 * @returns {JSX.Element} Wallet connector button.
 */
function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}): JSX.Element {
  const [ready, setReady] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  const handleClick = async () => {
    setLoading(true);
    try {
      onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={!ready || loading}
      onClick={handleClick}
      variant="outline"
      className="flex items-center gap-3 justify-start px-4 py-2 rounded-lg border border-primary/30 shadow-sm hover:bg-primary-50 dark:hover:bg-primary-900 transition"
    >
      <Wallet2Icon className="w-5 h-5 text-primary-500" />
      <span className="flex-1 text-left font-medium">{connector.name}</span>
      {!ready && <Badge variant="secondary">Unavailable</Badge>}
      {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
    </Button>
  );
}
