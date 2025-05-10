"use client";
import React from "react";
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
