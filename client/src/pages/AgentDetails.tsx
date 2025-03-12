import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
// import { Separator } from "../components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  StakingAssetsCard,
  ProvidersCard,
  AgentDetailsCard,
  AgentsListCard,
  EthereumMetricsCard,
  ErrorCard,
} from "../components/ui/AgentCards";
import { Message } from "../types/AgentInterfaces";
import { StakingCard } from "../components/ui/StakingCard";
import { LidoSDK, LidoSDKCore } from "@lidofinance/lido-ethereum-sdk";
import { createPublicClient, http } from "viem";
import { holesky } from "viem/chains";

const PLUTUS_ASCII = `
██████╗ ██╗     ██╗   ██╗████████╗██╗   ██╗███████╗
██╔══██╗██║     ██║   ██║╚══██╔══╝██║   ██║██╔════╝
██████╔╝██║     ██║   ██║   ██║   ██║   ██║███████╗
██╔═══╝ ██║     ██║   ██║   ██║   ██║   ██║╚════██║
██║     ███████╗╚██████╔╝   ██║   ╚██████╔╝███████║
╚═╝     ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝ ╚══════╝
`;

const AgentDetails: React.FC = () => {
  const { authenticated, user } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { wallets } = useWallets();
  const chainId = 17000;
  const embeddedWallet =
    wallets.find((wallet) => wallet.walletClientType === "privy") || wallets[0];
  const [votingPower, setVotingPower] = useState<string>("0");
  const [canVote, setCanVote] = useState<boolean>(false);
  const RPC_URL = "https://ethereum-holesky.publicnode.com";
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const setProvider = async () => {
      if (embeddedWallet) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/set-provider",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                provider: LidoSDKCore.createWeb3Provider(
                  chainId,
                  window.ethereum
                ),
                address: user?.wallet?.address,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to set provider");
          }

          console.log("Provider set successfully");
        } catch (error) {
          console.error("Error setting provider:", error);
        }
      }
    };

    setProvider();
  }, [embeddedWallet]);
  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket("ws://localhost:3000");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("data", data);

      switch (data.type) {
        case "message":
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              content: data.content,
              timestamp: new Date(data.timestamp),
            },
          ]);
          break;

        case "tools":
          try {
            // Parse the tool response content
            const toolData = JSON.parse(data.content);
            console.log("Parsed tool data:", toolData);

            if (toolData.error) {
              console.error("Tool error:", toolData.message);
              return;
            }

            // Handle different tool responses
            if (toolData.type === "assets") {
              setCurrentCard({
                type: "assets",
                items: toolData.items.map((asset: any) => ({
                  name: asset.name,
                  rewardRate: asset.rewardRate,
                  logo: asset.logo,
                  type: "asset",
                })),
              });
            } else if (toolData.ok.currentPage >= 1) {
              setCurrentCard({
                type: "agents_list",
                items: toolData.ok.data.map((agent: any) => ({
                  name: agent.agentName,
                  mindshare: agent.mindshare.toFixed(2),
                  marketCap: agent.mindshareDeltaPercent.toFixed(2),
                  type: "agent_card",
                })),
              });
            } else if (toolData.ok.agentName !== "") {
              // Single agent response
              setCurrentCard({
                type: "agent_details",
                agentName: toolData.ok.agentName,
                mindshare: toolData.ok.mindshare,
                marketCap: toolData.ok.marketCap,
                price: toolData.ok.price,
                holdersCount: toolData.ok.holdersCount,
              });
            }
          } catch (error) {
            console.error("Error parsing tool response:", error);
          }
          break;

        case "error":
          console.error("Server error:", data.content);
          break;
      }
    };
    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    const checkVotingPower = async () => {
      if (authenticated && embeddedWallet && user?.wallet?.address) {
        try {
          const rpcProvider = createPublicClient({
            chain: holesky,
            transport: http(RPC_URL),
          });
          const provider = LidoSDKCore.createWeb3Provider(
            chainId,
            window.ethereum
          );
          const lidoSDK = new LidoSDK({
            chainId: chainId,
            rpcProvider,
            web3Provider: provider,
          });

          const stakedBalance = await lidoSDK.shares.balance(
            user.wallet.address as `0x${string}`
          );

          const hasVotingPower = Number(stakedBalance) >= 1e18; // 1 ETH in wei
          setVotingPower(stakedBalance.toString());
          setCanVote(hasVotingPower);
        } catch (error) {
          console.error("Error checking voting power:", error);
        }
      }
    };

    checkVotingPower();
  }, [authenticated, embeddedWallet, user?.wallet?.address]);

  const handleSendMessage = () => {
    if (!input.trim() || !ws.current) return;

    setIsLoading(true);
    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: input,
        timestamp: new Date(),
      },
    ]);

    // Send message through WebSocket
    ws.current.send(
      JSON.stringify({
        content: input,
      })
    );

    setInput("");
    setIsLoading(false);
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderCard = () => {
    if (!currentCard) return null;

    try {
      switch (currentCard.type) {
        case "assets":
          return <StakingAssetsCard assets={currentCard.items} />;

        case "providers":
          return <ProvidersCard providers={currentCard.items} />;

        case "agent_details":
          return <AgentDetailsCard data={currentCard} />;

        case "agents_list":
          return <AgentsListCard agents={currentCard.items} />;

        case "metrics":
          return <EthereumMetricsCard data={currentCard} />;

        default:
          return <ErrorCard message="Unknown card type" />;
      }
    } catch (error) {
      return (
        <ErrorCard
          message={error instanceof Error ? error.message : "An error occurred"}
        />
      );
    }
  };

  const renderMessage = (msg: Message) => {
    if (msg.type === "user") {
      return (
        <div className="font-mono text-black/90">
          <span className="text-black/30">user@plutus</span>
          <span className="text-black/70">:~$</span>
          <span className="ml-2">{msg.content}</span>
        </div>
      );
    } else {
      return (
        <div className="font-mono">
          <span className="text-black/70">plutus@ai</span>
          <span className="text-black/30">:~$</span>
          <div className="mt-1 text-black/90 pl-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="whitespace-pre-wrap"
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex w-full h-screen bg-white">
      {/* Chat Interface */}
      <div className="w-[570px] border-r border-black/20 bg-white flex flex-col h-full shadow-md">
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-black/20">
            <pre
              className="text-black text-xs font-mono whitespace-pre select-none"
              style={{ textShadow: "0 0 1px rgba(0, 0, 0, 0.2)" }}
            >
              {PLUTUS_ASCII}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="text-black/70 hover:text-black hover:bg-black/10 rounded-full h-8 w-8 p-0"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-white px-4 py-3 text-sm font-mono border-b border-black/20 flex items-center">
            <div className="h-3 w-3 rounded-full bg-black mr-2 animate-pulse"></div>
            <span className="text-black/70">Terminal connected • Type your message to interact with the AI Assistant</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 font-mono">
          <div className="flex flex-col gap-6">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="text-black/50 font-mono text-sm mb-2">No messages yet</div>
                <div className="text-black/30 font-mono text-xs">Start typing to interact with Plutus AI</div>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`terminal-line ${msg.type === 'ai' ? 'pl-0' : 'pl-0'} `}>
                {renderMessage(msg)}
                <span className="text-xs text-black/30 mt-1 block">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-black/20 bg-white p-4">
          <div className="flex items-center gap-2 font-mono text-black bg-white rounded-lg p-2 border-2 border-black focus-within:border-black transition-colors">
            <span className="text-black font-bold">user@plutus</span>
            <span className="text-black/70">:~$</span>
            <Input
              placeholder="Type your command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none text-black placeholder:text-black/30 focus:outline-none focus:ring-0 font-mono"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isLoading}
              className="bg-black text-white hover:bg-black/90 rounded-md h-8 w-8"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Explore and Cards */}
      <div className="flex-1 flex flex-col p-6 bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div
                className="text-2xl font-bold text-black font-montserrat tracking-tight"
              >
                EXPLORE
              </div>
              <div className="ml-2 h-1 w-16 bg-black"></div>
            </div>
            
            {canVote && (
              <Button
                onClick={() => (window.location.href = "/voting")}
                className="bg-black hover:bg-black/80 text-white font-bold rounded-full px-6 font-montserrat"
              >
                GO TO VOTING
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                  {(parseFloat(votingPower) / 1e18).toFixed(4)} stETH
                </span>
              </Button>
            )}
          </div>
          
          {!currentCard && (
            <div className="border-2 border-black rounded-xl bg-white p-8 text-center">
              <div className="text-black/70 font-montserrat mb-2">No data to display</div>
              <div className="text-black/40 text-sm font-montserrat">
                Ask the AI assistant about staking assets, agents, or Ethereum metrics
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {renderCard()}

            {/* Staking Card moved inside explore section */}
            {authenticated && embeddedWallet && (
              <div className="border-2 border-black rounded-xl bg-white shadow-md p-6 mt-6 transition-all hover:bg-gray-50">
                <div className="text-xl font-bold text-black font-montserrat mb-4 flex items-center">
                  <div className="h-6 w-1 bg-black mr-3"></div>
                  STAKING
                </div>
                <StakingCard
                  web3Provider={LidoSDKCore.createWeb3Provider(
                    chainId,
                    window.ethereum
                  )}
                  account={user?.wallet?.address || ""}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Replace the style jsx global with regular CSS classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}} />
    </div>
  );
};

export default AgentDetails;
