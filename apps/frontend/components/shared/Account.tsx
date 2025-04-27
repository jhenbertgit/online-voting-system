import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Copy, LogOut } from "lucide-react";
import React from "react";

function shortenAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Account() {
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
