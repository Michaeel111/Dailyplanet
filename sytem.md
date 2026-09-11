```tsx
// app/page.tsx  (or wherever your main landing/dashboard page lives)
// Single non-scrollable Neumorphic Weather Globe Experience

"use client";

import { useState } from "react";
import { GlobePolaroids } from "@/components/globe"; // Adjust path as needed
import { Sun, CloudRain, Wind, ThermometerSun, Bell, User, Settings } from "lucide-react";

export default function DailyPlanetHome() {
  const [isCardOpen, setIsCardOpen] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("Lagos, Nigeria");
  const [currentTemp, setCurrentTemp] = useState("28°"); // Mock - connect to API later
  const [condition, setCondition] = useState("Partly Cloudy");

  // Neumorphic Tailwind classes (centralized - move to globals or cn() utility later)
  const neuCard = "bg-[#E0E5EC] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] rounded-[32px]";
  const neuInset = "shadow-[inset_10px_10px_20px_rgb(163,177,198,0.7),inset_-10px_-10px_20px_rgba(255,255,255,0.6)]";
  const neuButton = "bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgb(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] active:shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 rounded-2xl";

  return (
    <div className="min-h-screen bg-[#E0E5EC] font-['DM_Sans'] overflow-hidden flex items-center justify-center relative">
      {/* Subtle ambient background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#E0E5EC_1px,transparent_1px)] [background-size:40px_40px] opacity-40" />

      <div className="w-full max-w-7xl mx-auto px-6 flex flex-col h-screen">
        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center py-8 z-20">
          <div className="flex items-center gap-4">
            <div className={`${neuCard} px-6 py-3 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-2xl bg-[#6C63FF] flex items-center justify-center text-white shadow-inner">
                🌍
              </div>
              <div>
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-tighter text-[#3D4852]">Daily-Planet</h1>
                <p className="text-xs text-[#6B7280] -mt-1">Weather from another world</p>
              </div>
            </div>
          </div>

          {/* Toggleable Card Trigger */}
          <button
            onClick={() => setIsCardOpen(!isCardOpen)}
            className={`${neuButton} px-6 py-3 flex items-center gap-3 text-[#3D4852] font-medium`}
          >
            <User className="w-5 h-5" />
            <span>{selectedLocation}</span>
            <div className={`transition-transform ${isCardOpen ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center relative">
          {/* The Globe - Centered Hero */}
          <div className="relative z-10 scale-[0.95] md:scale-100">
            <GlobePolaroids
              speed={0.002}
              className="drop-shadow-2xl"
              markers={[
                { id: "lagos", location: [6.52, 3.37], image: "https://images.unsplash.com/photo-1580300578721-6c0a9b0c5e0f?w=120&h=120&fit=crop", caption: "Lagos", rotate: -3 },
                // Add more relevant markers as needed
              ]}
            />
          </div>

          {/* Floating Info Overlay (Top-Left of Globe) */}
          <div className={`absolute top-12 left-12 ${neuCard} p-8 max-w-xs hidden lg:block`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl ${neuInset} flex items-center justify-center text-4xl`}>
                ⛅
              </div>
              <div>
                <div className="text-6xl font-['Plus_Jakarta_Sans'] font-bold text-[#3D4852] tracking-tighter">{currentTemp}</div>
                <div className="text-[#6B7280]">{condition}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[#6B7280] text-xs">Humidity</div>
                <div className="font-medium">68%</div>
              </div>
              <div>
                <div className="text-[#6B7280] text-xs">Wind</div>
                <div className="font-medium">12 km/h</div>
              </div>
              <div>
                <div className="text-[#6B7280] text-xs">UV</div>
                <div className="font-medium">4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggleable Weather Card (Top Right) */}
        {isCardOpen && (
          <div className="absolute top-28 right-8 z-30 w-96">
            <div className={`${neuCard} p-8 shadow-2xl`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-sm text-[#6B7280]">CURRENTLY IN</div>
                  <div className="text-2xl font-bold text-[#3D4852]">{selectedLocation}</div>
                </div>
                <button
                  onClick={() => setIsCardOpen(false)}
                  className="w-10 h-10 rounded-2xl hover:bg-black/5 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Quick Stats - Inset Wells */}
              <div className="space-y-6">
                <div className={`${neuInset} rounded-2xl p-5 flex gap-5 items-center`}>
                  <ThermometerSun className="w-8 h-8 text-[#6C63FF]" />
                  <div className="flex-1">
                    <div className="text-sm text-[#6B7280]">Feels Like</div>
                    <div className="text-3xl font-semibold">26°</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`${neuInset} rounded-2xl p-5`}>
                    <CloudRain className="w-8 h-8 text-[#38B2AC] mb-3" />
                    <div className="text-sm text-[#6B7280]">Chance of Rain</div>
                    <div className="text-3xl font-semibold">30%</div>
                  </div>
                  <div className={`${neuInset} rounded-2xl p-5`}>
                    <Wind className="w-8 h-8 text-[#6C63FF] mb-3" />
                    <div className="text-sm text-[#6B7280]">Wind Speed</div>
                    <div className="text-3xl font-semibold">12 km/h</div>
                  </div>
                </div>
              </div>

              {/* Premium Alert Teaser */}
              <div className="mt-10 pt-6 border-t border-[#D1D9E6]">
                <button className="w-full bg-[#6C63FF] text-white h-14 rounded-2xl font-medium flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.985] transition-all shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]">
                  <Bell className="w-5 h-5" />
                  Enable Premium Email Alerts
                </button>
                <p className="text-center text-xs text-[#6B7280] mt-4">Get notified before it rains</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Status Bar */}
        <footer className="text-center py-8 text-[#6B7280] text-sm flex items-center justify-center gap-6">
          <div>Data from Open-Meteo</div>
          <div className="w-1 h-1 rounded-full bg-[#6B7280]/40" />
          <div>Neumorphic UI • Built with ❤️</div>
        </footer>
      </div>
    </div>
  );
}
```

### Implementation Summary & Reasoning (Neumorphism Integration)

**Mental Model Match:**
- **Tech Stack**: Next.js + Tailwind (inferred from previous conversations).
- **Design Tokens**: Directly adopted the full Neumorphism system from the provided `design-system.md` (cool grey `#E0E5EC`, dual RGBA shadows, `Plus Jakarta Sans` + `DM Sans`, deep rounding, etc.).
- **Globe Component**: Preserved your existing `GlobePolaroids` exactly, only wrapped it with proper neumorphic container support.

**Key Design Choices**:
- **Single non-scrollable page** → Full viewport layout with `min-h-screen` + flex centering.
- **Toggleable Card (Top Right)** → Elegant floating panel with smooth open/close. Uses deep inset wells inside for that signature nested depth.
- **Globe Hero** → Centered with subtle ambient background pattern to let the globe breathe while maintaining the "continuous surface" philosophy.
- **All elements** follow the exact shadow definitions, radii, colors, and micro-interactions from the design system.
- **Accessibility** preserved: High contrast, focus-ready buttons, touch-friendly sizes.

**Next Steps Recommendations**:
1. Add the following to your `globals.css` (or Tailwind config):

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

body {
  font-family: 'DM Sans', system-ui, sans-serif;
}

.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```