"use client";

import { motion } from "framer-motion";
import { Github, Mail, Send, Instagram, MapPin, Code2, Sparkles, ExternalLink } from "lucide-react";

/**
 * About the developer.
 *
 * Every fact here comes from Abriham Kassa's own portfolio site
 * (https://abriham-portfolio.abrihamkassa323.workers.dev/). Nothing is invented.
 */

const SKILLS = [
  "Full-Stack Development",
  "React / Next.js",
  "Node.js / Express",
  "Marketplace Platforms",
  "E-commerce Systems",
  "UI/UX Design",
  "Database Architecture",
  "Payment Integration",
];

const LINKS = [
  { label: "GitHub", href: "https://github.com/Abrishkassa", icon: Github },
  { label: "Telegram", href: "https://t.me/kerekassakia", icon: Send },
  {
    label: "Instagram",
    href: "https://www.instagram.com/abrish_kas?igsh=MXE0MXExOHVibHg3OQ==",
    icon: Instagram,
  },
  { label: "Email", href: "mailto:abrihamkassa323@gmail.com", icon: Mail },
  {
    label: "Portfolio",
    href: "https://abriham-portfolio.abrihamkassa323.workers.dev/",
    icon: ExternalLink,
  },
];

export function DeveloperSection({ dark }: { dark: boolean }) {
  const card = `rounded-3xl border overflow-hidden ${
    dark ? "border-gray-700 bg-gray-800/50" : "border-amber-200 bg-white"
  }`;

  return (
    <section id="developer" className="py-24 bg-gradient-to-b from-transparent to-amber-50/50 dark:to-gray-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
              dark
                ? "bg-amber-900/30 text-amber-400"
                : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
            }`}
          >
            <Code2 className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-semibold">Behind the Build</span>
          </div>
          <h2 className={`text-4xl lg:text-5xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
            About the Developer
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${dark ? "text-gray-300" : "text-gray-600"}`}>
            Darcho was designed and engineered by Abriham Kassa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={card}
        >
          <div className="grid md:grid-cols-[auto_1fr] gap-8 p-8 md:p-10">
            {/* Identity */}
            <div className="flex md:flex-col items-center gap-4 md:w-48 shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-white">AK</span>
              </div>
              <div className="text-center md:text-center">
                <h3 className={`text-xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                  Abriham Kassa
                </h3>
                <p className={`text-sm ${dark ? "text-amber-400" : "text-amber-700"}`}>
                  Software Engineer
                </p>
                <p className={`text-sm mt-1 inline-flex items-center gap-1 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  Hawassa, Ethiopia
                </p>
              </div>
            </div>

            {/* Bio + skills + links */}
            <div className="min-w-0">
              <p className={`text-lg leading-relaxed mb-4 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                Abriham builds software for real markets — from Sidama&apos;s coffee trade to Addis Ababa&apos;s
                service economy. He founded and leads engineering on Darcho, and has shipped marketplace,
                e-commerce and booking platforms for businesses across Ethiopia.
              </p>
              <p className={`leading-relaxed mb-6 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                His approach is simple: technology should be as accessible as it is powerful. Every line of
                code aims to streamline a real-world process, elevate a local brand, or connect a community.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      dark ? "bg-gray-700/70 text-gray-300" : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                        dark
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {link.label}
                    </a>
                  );
                })}
              </div>

              <p className={`mt-6 text-sm inline-flex items-center gap-2 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Available for collaboration
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
