"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Gift,
  Shirt,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// 每个内容模块对应的头部图标（与 Tools Grid 导航卡图标一致，建立视觉锚点）
const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  codes: Gift,
  "beginner-guide": BookOpen,
  "tier-list": BarChart3,
  abilities: Swords,
  characters: Users,
  "yen-guide": Coins,
  "skins-titles": Shirt,
  "trello-updates": Bell,
};

// Tools Grid 卡片 -> section id 映射（8 张卡片与 8 个 section 一一对应）
const SECTION_IDS = [
  "codes",
  "beginner-guide",
  "tier-list",
  "abilities",
  "characters",
  "yen-guide",
  "skins-titles",
  "trello-updates",
];

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.anime-randomizer.wiki";

  // Trello / Updates 手风琴展开状态
  const [panelExpanded, setPanelExpanded] = useState<number | null>(null);
  // 兑换码复制反馈
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 1500);
  };

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Jujutsu Randomizer Wiki",
        description:
          "Complete Jujutsu Randomizer Wiki covering codes, random skills, skins, titles, Yen farming, updates, and Roblox arena guides.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 498,
          height: 280,
          caption: "Jujutsu Randomizer - Roblox Random-Skill Arena",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Jujutsu Randomizer Wiki",
        alternateName: "Jujutsu Randomizer",
        url: siteUrl,
        description:
          "Complete Jujutsu Randomizer Wiki resource hub for codes, random skills, skins, titles, Yen tips, and Roblox arena guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 498,
          height: 280,
          caption: "Jujutsu Randomizer Wiki - Roblox Random-Skill Arena",
        },
        sameAs: [
          "https://www.roblox.com/games/95467791496576/Jujutsu-Randomizer",
          "https://discord.com/invite/n6VZ5HM9cX",
          "https://www.roblox.com/communities/579224321/Dope-Interactive",
          "https://www.youtube.com/watch?v=oqHvLmdGTkA",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Jujutsu Randomizer",
        gamePlatform: ["PC", "Roblox"],
        applicationCategory: "Game",
        genre: ["Action", "Fighting", "RPG", "Anime"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 100,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: "0",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/95467791496576/Jujutsu-Randomizer",
        },
      },
      {
        "@type": "VideoObject",
        name: "Jujutsu Randomizer gameplay",
        description:
          "Jujutsu Randomizer gameplay preview — a Roblox JJK-inspired arena where every round rolls random skills.",
        uploadDate: "2026-07-06",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/oqHvLmdGTkA",
        url: "https://www.youtube.com/watch?v=oqHvLmdGTkA",
      },
    ],
  };

  const m = t.modules;
  const toolsCards: any[] = t.tools.cards || [];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* ============ Hero Section ============ */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                          bg-[hsl(var(--nav-theme)/0.1)]
                          border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gift className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/95467791496576/Jujutsu-Randomizer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* ============ Video Section（紧跟 Hero） ============ */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="oqHvLmdGTkA"
              title="Jujutsu Randomizer gameplay"
            />
          </div>
        </div>
      </section>

      {/* ============ Tools Grid - 8 Navigation Cards（视频区之后） ============ */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            <NavCard href="#codes" icon={Gift} card={toolsCards[0]} index={0} sectionId="codes" />
            <NavCard href="#beginner-guide" icon={BookOpen} card={toolsCards[1]} index={1} sectionId="beginner-guide" />
            <NavCard href="#tier-list" icon={BarChart3} card={toolsCards[2]} index={2} sectionId="tier-list" />
            <NavCard href="#abilities" icon={Swords} card={toolsCards[3]} index={3} sectionId="abilities" />
            <NavCard href="#characters" icon={Users} card={toolsCards[4]} index={4} sectionId="characters" />
            <NavCard href="#yen-guide" icon={Coins} card={toolsCards[5]} index={5} sectionId="yen-guide" />
            <NavCard href="#skins-titles" icon={Shirt} card={toolsCards[6]} index={6} sectionId="skins-titles" />
            <NavCard href="#trello-updates" icon={Bell} card={toolsCards[7]} index={7} sectionId="trello-updates" />
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* ============ Module 1: Jujutsu Randomizer Codes ============ */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Gift}
            eyebrow={m.jujutsuCodes.eyebrow}
            title={m.jujutsuCodes.title}
            intro={m.jujutsuCodes.intro}
          />

          {/* Active codes */}
          <div className="scroll-reveal mb-8 md:mb-10">
            <h3 className="flex items-center gap-2 mb-4 text-lg md:text-xl font-bold">
              <Gift className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              Active codes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {m.jujutsuCodes.activeCodes.map((c: any, i: number) => (
                <div
                  key={i}
                  className="p-4 md:p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.15)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]">
                      <Check className="w-3 h-3" />
                      {c.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.reward}</span>
                  </div>
                  <code className="text-base md:text-lg font-mono font-bold tracking-wide break-all">
                    {c.code}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyCode(c.code)}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs font-medium hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground">{c.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements + Redeem steps */}
          <div className="scroll-reveal grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 md:mb-10">
            <div>
              <h3 className="flex items-center gap-2 mb-4 text-lg md:text-xl font-bold">
                <Check className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                Redemption requirements
              </h3>
              <div className="space-y-3">
                {m.jujutsuCodes.requirements.map((r: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <p className="font-semibold mb-1 text-sm md:text-base">{r.title}</p>
                    <p className="text-sm text-muted-foreground">{r.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 mb-4 text-lg md:text-xl font-bold">
                <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                How to redeem
              </h3>
              <div className="space-y-3">
                {m.jujutsuCodes.redeemSteps.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.2)] border border-[hsl(var(--nav-theme)/0.5)]">
                      <span className="text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                        {s.step}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expired codes */}
          <div className="scroll-reveal p-4 md:p-6 bg-white/[0.03] border border-border rounded-xl">
            <h3 className="flex items-center gap-2 mb-3 text-base md:text-lg font-bold">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Expired codes
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {m.jujutsuCodes.expiredCodes.map((c: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-border text-xs text-muted-foreground"
                >
                  <code className="font-mono line-through opacity-70">{c.code}</code>
                  <span className="opacity-60">· {c.reward}</span>
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{m.jujutsuCodes.expiredNote}</p>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* ============ Module 2: Jujutsu Randomizer Beginner Guide ============ */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={BookOpen}
            eyebrow={m.jujutsuBeginnerGuide.eyebrow}
            title={m.jujutsuBeginnerGuide.title}
            intro={m.jujutsuBeginnerGuide.intro}
          />

          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {m.jujutsuBeginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {step.step}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-2">
                    {step.body}
                  </p>
                  <p className="inline-flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                    <span className="text-[hsl(var(--nav-theme-light))] font-medium">
                      {step.tip}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Module 3: Jujutsu Randomizer Tier List ============ */}
      <section id="tier-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={BarChart3}
            eyebrow={m.jujutsuTierList.eyebrow}
            title={m.jujutsuTierList.title}
            intro={m.jujutsuTierList.intro}
          />

          <div className="scroll-reveal space-y-4 md:space-y-5">
            {m.jujutsuTierList.tiers.map((tier: any, ti: number) => {
              const tone = TIER_TONES[tier.tier] || TIER_TONES.default;
              return (
                <div
                  key={ti}
                  className="p-4 md:p-5 bg-white/5 border border-border rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg font-bold text-sm md:text-base ${tone.badge}`}
                    >
                      {tier.tier}
                    </span>
                    <h3 className="font-bold text-base md:text-lg">{tier.label}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tier.entries.map((e: any, ei: number) => (
                      <div
                        key={ei}
                        className="p-3 md:p-4 bg-white/5 border border-border rounded-lg hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm md:text-base">{e.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                            {e.type}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">{e.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Module 4: Jujutsu Randomizer Abilities ============ */}
      <section id="abilities" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Swords}
            eyebrow={m.jujutsuAbilities.eyebrow}
            title={m.jujutsuAbilities.title}
            intro={m.jujutsuAbilities.intro}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {m.jujutsuAbilities.abilities.map((a: any, i: number) => (
              <div
                key={i}
                className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {a.category}
                  </span>
                </div>
                <h3 className="font-bold mb-2 text-base md:text-lg">{a.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{a.effect}</p>
                <div className="mt-auto space-y-2 text-xs">
                  <p className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Combo:</span> {a.combo}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0 rotate-[-90deg]" />
                    <span className="text-muted-foreground"><span className="font-semibold text-foreground/80">Counter:</span> {a.counter}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 模块之间的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* ============ Module 5: Jujutsu Randomizer Characters ============ */}
      <section id="characters" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Users}
            eyebrow={m.jujutsuCharacters.eyebrow}
            title={m.jujutsuCharacters.title}
            intro={m.jujutsuCharacters.intro}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {m.jujutsuCharacters.characters.map((c: any, i: number) => (
              <div
                key={i}
                className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {c.type}
                  </span>
                </div>
                <h3 className="font-bold mb-2">{c.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{c.detail}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/70">Search:</span> {c.terms}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Module 6: Jujutsu Randomizer Yen Guide ============ */}
      <section id="yen-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Coins}
            eyebrow={m.jujutsuYenGuide.eyebrow}
            title={m.jujutsuYenGuide.title}
            intro={m.jujutsuYenGuide.intro}
          />

          {/* 桌面端表格 */}
          <div className="scroll-reveal hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Reward</th>
                  <th className="px-4 py-3 font-semibold">Main Use</th>
                  <th className="px-4 py-3 font-semibold">Beginner Priority</th>
                </tr>
              </thead>
              <tbody>
                {m.jujutsuYenGuide.rows.map((r: any, i: number) => (
                  <tr
                    key={i}
                    className="border-t border-border hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{r.method}</td>
                    <td className="px-4 py-3 text-[hsl(var(--nav-theme-light))] font-semibold">{r.reward}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.use}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs">
                        <Check className="w-3 h-3" />
                        {r.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片 */}
          <div className="scroll-reveal md:hidden space-y-3">
            {m.jujutsuYenGuide.rows.map((r: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm">{r.method}</p>
                  <span className="text-[hsl(var(--nav-theme-light))] font-semibold text-sm">{r.reward}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{r.use}</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs">
                  <Check className="w-3 h-3" />
                  {r.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Module 7: Jujutsu Randomizer Skins And Titles ============ */}
      <section id="skins-titles" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Shirt}
            eyebrow={m.jujutsuSkinsTitles.eyebrow}
            title={m.jujutsuSkinsTitles.title}
            intro={m.jujutsuSkinsTitles.intro}
          />

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {m.jujutsuSkinsTitles.cosmetics.map((c: any, i: number) => (
              <div
                key={i}
                className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shirt className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {c.type}
                  </span>
                </div>
                <h3 className="font-bold mb-2">{c.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground/70">Unlock:</span> {c.unlock}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground/70">Effect:</span> {c.effect}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Module 8: Jujutsu Randomizer Trello And Updates ============ */}
      <section id="trello-updates" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Bell}
            eyebrow={m.jujutsuTrelloUpdates.eyebrow}
            title={m.jujutsuTrelloUpdates.title}
            intro={m.jujutsuTrelloUpdates.intro}
          />

          <div className="scroll-reveal space-y-3 mb-8 md:mb-10">
            {m.jujutsuTrelloUpdates.panels.map((panel: any, index: number) => {
              const isOpen = panelExpanded === index;
              return (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() => setPanelExpanded(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-2 font-semibold text-sm md:text-base">
                      <Bell className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                      {panel.heading}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5">
                      <p className="text-sm text-muted-foreground mb-3">{panel.summary}</p>
                      <ul className="space-y-2">
                        {panel.details.map((d: string, di: number) => (
                          <li key={di} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Official links */}
          <div className="scroll-reveal flex flex-wrap gap-3 justify-center">
            {OFFICIAL_LINKS.map((lnk, i) => (
              <a
                key={i}
                href={lnk.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
              >
                {lnk.label}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* ============ Latest Updates（保留组件，空数据返回 null） ============ */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* ============ FAQ Section ============ */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* ============ CTA Section ============ */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* ============ Footer ============ */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.com/invite/n6VZ5HM9cX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=oqHvLmdGTkA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/579224321/Dope-Interactive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/95467791496576/Jujutsu-Randomizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.roblox}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.notice}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============ 子组件 ============ */

// 模块头部：图标 + eyebrow + 标题 + 简介
function ModuleHeader({
  icon: Icon,
  eyebrow,
  title,
  intro,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="text-center mb-8 md:mb-12 scroll-reveal">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 md:mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
        <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
        <span className="text-xs md:text-sm font-medium uppercase tracking-wider">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">{title}</h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
        {intro}
      </p>
    </div>
  );
}

// Tools Grid 导航卡：点击平滑滚动到对应 section
function NavCard({
  href,
  icon: Icon,
  card,
  index,
  sectionId,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  card: any;
  index: number;
  sectionId: string;
}) {
  if (!card) return null;
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(sectionId);
      }}
      className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                 bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                 transition-all duration-300 cursor-pointer text-left
                 hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                    bg-[hsl(var(--nav-theme)/0.1)]
                    flex items-center justify-center
                    group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                    transition-colors"
      >
        {Icon ? (
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]" />
        ) : (
          <DynamicIcon
            name={card.icon}
            className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
          />
        )}
      </div>
      <h3 className="mb-1.5 text-sm md:text-base font-semibold">
        {card.title}
      </h3>
      <p className="text-sm text-muted-foreground">{card.description}</p>
    </a>
  );
}

// 分层色调（全部基于主题色 + 中性 token，禁止硬编码 hex / red / green）
const TIER_TONES: Record<string, { badge: string }> = {
  S: { badge: "bg-[hsl(var(--nav-theme))] text-white" },
  A: { badge: "bg-[hsl(var(--nav-theme)/0.7)] text-white" },
  B: { badge: "bg-[hsl(var(--nav-theme)/0.4)] text-white" },
  C: { badge: "bg-white/10 text-muted-foreground" },
  Passives: { badge: "bg-[hsl(var(--nav-theme-light))] text-background" },
  default: { badge: "bg-white/10 text-muted-foreground" },
};

// Trello 模块底部官方外链
const OFFICIAL_LINKS = [
  { label: "Roblox Game", href: "https://www.roblox.com/games/95467791496576/Jujutsu-Randomizer" },
  { label: "Dope Interactive", href: "https://www.roblox.com/communities/579224321/Dope-Interactive" },
  { label: "Trello", href: "https://trello.com/b/NadimwDh/jujutsu-randomizer-official-trello" },
  { label: "Discord", href: "https://discord.com/invite/n6VZ5HM9cX" },
];
