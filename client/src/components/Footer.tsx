import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Moon,
  Send,
  Sun,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Footer() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <footer className="bg-background border-t border-border text-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Stay Connected</h3>
            <p className="text-muted-foreground">
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="flex items-center space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md bg-background"
              />
              <Button size="icon" className="rounded-full bg-primary">
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              {["Home", "About Us", "Services", "Products", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="block transition-colors hover:text-primary"
                  >
                    {item}
                  </a>
                )
              )}
            </nav>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <address className="not-italic text-muted-foreground">
              <p>Sitapura Industrial Area</p>
              <p>Jaipur, TC 12345</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: madscientistdata@gmail.com</p>
            </address>
          </div>

          {/* Follow Us & Dark Mode Toggle */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Follow Us</h3>
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                {[
                  { icon: <Facebook className="h-4 w-4" />, label: "Facebook" },
                  { icon: <Twitter className="h-4 w-4" />, label: "Twitter" },
                  {
                    icon: <Instagram className="h-4 w-4" />,
                    label: "Instagram",
                  },
                  { icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
                ].map(({ icon, label }, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                      >
                        {icon}
                        <span className="sr-only">{label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="dark-mode" className="sr-only">
                Toggle dark mode
              </Label>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 Aurora - Your Personal Agent Companion on Aptos. All rights reserved.</p>
          <nav className="flex gap-4">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Security",
              "Disclaimer"
            ].map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors hover:text-primary"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}