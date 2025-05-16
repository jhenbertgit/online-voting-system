"use client";

import React from "react";
import {
  useAccount,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  Connector,
  useConnect,
} from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wallet2Icon, Copy, LogOut, Loader2 } from "lucide-react";

/**
 * Shorten an Ethereum address for display.
 * @param address Ethereum address
 * @returns Shortened address string
 */
function shortenAddress(address?: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Account displays the current user's wallet, ENS info, and disconnect button.
 * Uses wagmi for wallet/account management and ENS resolution.
 * @returns {JSX.Element} The account card component.
 */
function Account(): React.JSX.Element {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Card className="w-full border-none shadow-none p-0">
      <CardHeader className="flex flex-row gap-3 items-center p-0 pb-1">
        <Avatar className="w-10 h-10">
          {ensAvatar ? (
            <AvatarImage src={ensAvatar} alt="ENS Avatar" />
          ) : (
            <AvatarFallback>
              {address?.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col">
          {ensName && (
            <span className="font-semibold text-primary-700 dark:text-primary-200">
              {ensName}
            </span>
          )}
          {address && (
            <span className="flex items-center gap-2 text-xs font-mono text-gray-600 dark:text-gray-300">
              {shortenAddress(address)}
              <button
                className="hover:text-primary-500 transition cursor-pointer"
                onClick={handleCopy}
                title="Copy address"
                type="button"
              >
                <Copy className="w-4 h-4 inline" />
              </button>
              {copied && <span className="text-green-500 ml-1">Copied!</span>}
            </span>
          )}
        </div>
        <Badge variant="secondary" className="ml-auto">
          Admin
        </Badge>
      </CardHeader>
      <CardContent className="p-0 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
          onClick={() => disconnect()}
        >
          <LogOut className="w-4 h-4" /> Disconnect
        </Button>
      </CardContent>
    </Card>
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
}): React.JSX.Element {
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

/**
 * WalletOptions renders a list of wallet connector options for the user to connect.
 * @returns {JSX.Element} Wallet connector options UI.
 */
function WalletOptions(): React.JSX.Element {
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
 * WalletConnectCard displays the wallet connection status and options.
 * Shows the connected account or prompts to connect a wallet.
 * Accessible, with clear instructions and focus management.
 * @returns {React.JSX.Element} The wallet connection card component.
 */
export function WalletConnectCard(): React.JSX.Element {
  const { isConnected } = useAccount();

  if (isConnected) {
    // Show connected account with avatar and badge
    return (
      <Card className="w-full bg-white border shadow-sm rounded-xl">
        <CardHeader className="flex flex-row gap-3 items-center pb-2">
          <Avatar className="w-10 h-10" aria-hidden="true">
            <AvatarImage src="/wallet.svg" alt="Wallet" />
            <AvatarFallback>
              <Wallet2Icon className="w-5 h-5 text-primary-500" />
            </AvatarFallback>
          </Avatar>
          <CardTitle
            className="text-lg font-semibold"
            id="wallet-connected-title"
          >
            Wallet Connected
          </CardTitle>
          <Badge variant="secondary" className="ml-auto" aria-label="Connected">
            Connected
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Account handles ENS, disconnect, etc. */}
          <Account />
        </CardContent>
      </Card>
    );
  }

  // Show connect wallet options in a card with tooltip and accessible instructions
  return (
    <TooltipProvider>
      <Card className="w-full bg-white border shadow-sm rounded-xl">
        <CardHeader className="flex flex-row gap-3 items-center pb-2">
          <Avatar className="w-10 h-10" aria-hidden="true">
            <AvatarImage src="/wallet.svg" alt="Wallet" />
            <AvatarFallback>
              <Wallet2Icon className="w-5 h-5 text-primary-500" />
            </AvatarFallback>
          </Avatar>
          <CardTitle
            className="text-lg font-semibold"
            id="wallet-connect-title"
          >
            Connect Wallet
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="ml-auto cursor-pointer"
                aria-label="Required"
              >
                Required
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <span id="wallet-connect-desc">
                You must connect your wallet to perform admin actions.
              </span>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="pt-0">
          {/* WalletOptions handles connection logic for all connectors */}
          <div
            className="flex flex-col gap-2"
            aria-describedby="wallet-connect-desc"
          >
            <WalletOptions />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
