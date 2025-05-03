import React from "react";
import type { JSX } from "react";
import { useAccount } from "wagmi";
import { Account } from "./Account";
import { WalletOptions } from "./WalletOption";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wallet2Icon } from "lucide-react";

/**
 * WalletConnectCard displays the wallet connection status and options.
 * Shows the connected account or prompts to connect a wallet.
 * @returns {JSX.Element} The wallet connection card component.
 */
export function WalletConnectCard(): JSX.Element {
  const { isConnected } = useAccount();

  if (isConnected) {
    // Show connected account with avatar and badge
    return (
      <Card className="w-full max-w-sm mx-auto mb-4 border-primary/30 shadow-lg">
        <CardHeader className="flex flex-row gap-3 items-center">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/wallet.svg" alt="Wallet" />
            <AvatarFallback>
              <Wallet2Icon className="w-5 h-5 text-primary-500" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-semibold">
            Wallet Connected
          </CardTitle>
          <Badge variant="secondary" className="ml-auto">
            Connected
          </Badge>
        </CardHeader>
        <CardContent>
          {/* Account handles ENS, disconnect, etc. */}
          <Account />
        </CardContent>
      </Card>
    );
  }

  // Show connect wallet options in a card with tooltip
  return (
    <TooltipProvider>
      <Card className="w-full max-w-sm mx-auto mb-4 border-primary/30 shadow-lg">
        <CardHeader className="flex flex-row gap-3 items-center">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/wallet.svg" alt="Wallet" />
            <AvatarFallback>
              <Wallet2Icon className="w-5 h-5 text-primary-500" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-semibold">
            Connect Wallet
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="ml-auto cursor-pointer">
                Required
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              You must connect your wallet to perform admin actions.
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent>
          {/* WalletOptions handles connection logic for all connectors */}
          <div className="flex flex-col gap-2">
            <WalletOptions />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
