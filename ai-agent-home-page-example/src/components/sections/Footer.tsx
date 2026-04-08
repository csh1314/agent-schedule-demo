import { cn } from "@/lib/utils";
import { FOOTER_GROUPS } from "@/data/constants";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-slate-800/50 bg-slate-950 py-12 md:py-16",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <a
              href="#"
              className="mb-4 inline-block text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              AgentHub
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              下一代 AI Agent 智能协作平台，赋能企业与开发者实现智能化转型。
            </p>
          </div>

          {/* Link groups */}
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider and copyright */}
        <div className="mt-12 border-t border-slate-800/50 pt-8 text-center">
          <p className="text-sm text-slate-500">
            Copyright 2026 AgentHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
