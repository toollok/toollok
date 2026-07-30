"use client";

import { useState } from "react";
import { Sparkles, Zap, Star } from "lucide-react";

// Components
import Hero from "@/components/sections/Hero";
import SearchModal from "@/components/ui/SearchModal";
import AdSlot from "@/components/ui/AdSlot";
import FeaturedCategories from "@/components/sections/FeaturedCategories";
import ToolSection from "@/components/sections/ToolSection";
import PremiumShowcase from "@/components/sections/PremiumShowcase";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Testimonials from "@/components/sections/Testimonials";
import FAQSection from "@/components/sections/FAQSection";
import Newsletter from "@/components/sections/Newsletter";

// Data
import { POPULAR_TOOLS, TRENDING_TOOLS, RECENT_TOOLS } from "@/constants";

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-white selection:bg-blue-500 selection:text-white relative overflow-x-hidden">

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 1. HERO */}
      <Hero onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Top Leaderboard Ad */}
      <div className="w-full max-w-[1440px] mx-auto px-4 mb-16">
        <AdSlot adSlot="1122334455" format="horizontal" minHeight="90px" className="hidden md:flex" />
      </div>

      {/* 3-Column Super Layout */}
      <div className="w-full max-w-[1920px] mx-auto flex justify-center gap-8 px-4 lg:px-8">

        {/* LEFT SKYSCRAPER */}
        <aside className="hidden 2xl:block w-[300px] shrink-0">
          <AdSlot adSlot="left-skyscraper" format="vertical" minHeight="600px" className="sticky top-24" />
        </aside>

        {/* MAIN CONTENT ZONE */}
        <div className="flex-1 w-full max-w-[1440px] min-w-0 pb-16">

          {/* 2. CATEGORIES */}
          <FeaturedCategories />

          {/* 3. POPULAR TOOLS */}
          <ToolSection
            title="Most Popular Tools"
            subtitle="User Favorites"
            icon={Star}
            iconColorClass="text-emerald-400"
            tools={POPULAR_TOOLS}
            bottomAdSlotId="9988776655"
          />

          {/* 4. TRENDING TOOLS */}
          <ToolSection
            title="Trending This Week"
            subtitle="Rapid Growth"
            icon={Zap}
            iconColorClass="text-amber-400"
            tools={TRENDING_TOOLS}
          />

          {/* 5. RECENT TOOLS */}
          <ToolSection
            title="Recently Published"
            subtitle="Fresh Releases"
            icon={Sparkles}
            iconColorClass="text-cyan-400"
            tools={RECENT_TOOLS}
          />

          {/* 6. PREMIUM SHOWCASE (Controlled by Feature Flag) */}
          <PremiumShowcase />

          {/* 7. FEATURES */}
          <WhyChooseUs />

          {/* 8. SOCIAL PROOF */}
          <Testimonials />

          {/* 9. FAQS */}
          <FAQSection />

        </div>

        {/* RIGHT SKYSCRAPER */}
        <aside className="hidden 2xl:block w-[300px] shrink-0">
          <AdSlot adSlot="right-skyscraper" format="vertical" minHeight="600px" className="sticky top-24" />
        </aside>

      </div>

      {/* 10. NEWSLETTER */}
      <Newsletter />

    </div>
  );
}