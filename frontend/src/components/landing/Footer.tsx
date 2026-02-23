import { Link } from "react-router-dom";
import { Shield, Github, Twitter, Linkedin, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const linkGroups = {
  Platform: {
    Dashboard: ["Simulation", "Metrics", "Agents"],
    Architecture: ["PBFT Consensus", "ArmorIQ Layer", "Audit Logs"],
  },
  Developers: {
    Resources: ["GitHub Repo", "API Reference", "SDKs"],
    Community: ["Discord", "Twitter", "Blog"],
  },
  Project: {
    Details: ["About Us", "Team", "Vision"],
    Hackathon: ["Devpost", "Submission Video", "Pitch Deck"],
  },
};

export default function Footer() {
  return (
    <footer className="relative pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* Newsletter column */}
            <div>
              <Link to="/" className="mb-6 flex items-center gap-2.5">
                <img src="/logo.png" alt="ByzantineMind Logo" className="h-[36px] w-[180px] object-contain" />
              </Link>
              <h4 className="mb-4 text-lg font-bold text-foreground">Subscribe to our newsletter</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your email"
                  className="h-10 border-border/40 bg-background/50 text-sm"
                />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(linkGroups).map(([title, sections]) => (
              <div key={title}>
                <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">{title}</h5>
                {Object.entries(sections).map(([subtitle, items]) => (
                  <div key={subtitle} className="mb-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">{subtitle}</p>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item}>
                          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Separator className="my-8 bg-border/20" />

          {/* Contact row */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-primary/60" />
              <span>+1 (555) 000-0000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-primary/60" />
              <span>contact@byzantinemind.ai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary/60" />
              <span>San Francisco, CA 94107</span>
            </div>
          </div>

          <Separator className="my-6 bg-border/20" />

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2026 ByzantineMind · Byzantine Fault Tolerant AI Consensus
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <a href="https://github.com/Harsh4r0ra/delhi-hacks" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
                  <Github className="h-4 w-4" />
                </a>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                <span className="text-primary">EN</span>
                <span>SE</span>
                <span>DE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}