"use client"

import { useState } from "react"
import Image from "next/image"
import Header from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { GameOptions } from "@/stores/useGameStore"

interface FeedingScheduleScreenProps {
  // Prop changed to pass data
  onScheduleConfirm: (schedule: Required<GameOptions>['feedingSchedule']) => void;
  onBack: () => void;
}

// Nutrient types with their properties
const nutrientMixes = {
  basic: { name: "Basic Mix", desc: "Standard, reliable feed.", potency: 1.0, yield: 1.0, nutrientFeed: 10 },
  growth: { name: "Growth Boost", desc: "Bigger yields, less potency.", potency: 0.9, yield: 1.2, nutrientFeed: 25 },
  potent: { name: "Potency Plus", desc: "More potent, less yield.", potency: 1.2, yield: 0.9, nutrientFeed: 15 },
  balanced: { name: "Balanced Blend", desc: "Slight boost to both.", potency: 1.1, yield: 1.1, nutrientFeed: 18 },
  fungal: { name: "Fungal Fizz", desc: "Risk of mold, big yields!", potency: 0.8, yield: 1.3, nutrientFeed: 30 },
  bonebroth: { name: "Bone Broth", desc: "Super potent, stunts growth.", potency: 1.3, yield: 0.8, nutrientFeed: 12 },
  phantom: {
    name: "Phantom Dew",
    desc: "Ghostly, high yield, low flavor.",
    potency: 1.0,
    yield: 1.3,
    nutrientFeed: 22,
  },
  rotjuice: { name: "Rot Juice", desc: "Smells bad, drains everything.", potency: 0.7, yield: 0.7, nutrientFeed: 8 },
  cosmic: {
    name: "Cosmic Compost",
    desc: "Unpredictable, sometimes amazing.",
    potency: 1.4,
    yield: 1.0,
    nutrientFeed: 20,
  },
  doomdust: {
    name: "Doom Dust",
    desc: "Dangerous, huge yields if you survive.",
    potency: 0.6,
    yield: 1.4,
    nutrientFeed: 28,
  },
}

export default function FeedingScheduleScreen({ onScheduleConfirm, onBack }: FeedingScheduleScreenProps) {
  const [feedAmounts, setFeedAmounts] = useState({ month1: 0, month2: 0, month3: 0 });
  const [selectedNutrients, setSelectedNutrients] = useState({ month1: "basic", month2: "basic", month3: "basic" });

  const changeFeedAmount = (month: keyof typeof feedAmounts, change: number) => {
    setFeedAmounts((prev) => ({
      ...prev,
      [month]: Math.max(0, Math.min(10, prev[month] + change)),
    }));
  };

  const selectNutrient = (month: keyof typeof selectedNutrients, nutrientKey: string) => {
    setSelectedNutrients((prev) => ({ ...prev, [month]: nutrientKey }));
  };

  const handleConfirmSchedule = () => {
    const scheduleData: Required<GameOptions>['feedingSchedule'] = {
      month1: { amount: feedAmounts.month1, nutrient: selectedNutrients.month1 },
      month2: { amount: feedAmounts.month2, nutrient: selectedNutrients.month2 },
      month3: { amount: feedAmounts.month3, nutrient: selectedNutrients.month3 },
    };
    console.log("Feeding Schedule Confirmed:", scheduleData);
    onScheduleConfirm(scheduleData); // Use the new prop to pass data
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      {/* Game Widget Container */}
      <div className="relative w-[800px] h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-800">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image src="/images/bg3.png" alt="Marrow Grow Workshop" fill className="object-cover pixel-art" priority />
        </div>

        {/* Header with Logo */}
        <Header />

        {/* Back Button */}
        <div className="absolute top-4 left-20 z-10">
          <Button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 border-2 border-gray-500 font-pixel text-sm px-4 py-2"
          >
            <ChevronLeft size={16} className="mr-2 text-yellow-300" />
            Back
          </Button>
        </div>

        {/* Feeding Schedule Configuration */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-600px]">
          <div className="bg-gray-900/90 border-2 border-gray-800 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="font-pixel text-white text-center mb-6 text-lg">FEEDING SCHEDULE</h2>

            <div className="space-y-4">
              {/* Month 1 */}
              <div className="flex items-center gap-4">
                {/* Feed Amount */}
                <div className="w-32">
                  <div className="text-center text-white font-pixel text-xs mb-2">MONTH 1</div>
                  <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-3 flex items-center justify-between">
                    <button
                      onClick={() => changeFeedAmount("month1", -1)}
                      className="text-white font-pixel text-xl w-6 h-6 flex items-center justify-center hover:text-blue-300"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-white font-pixel text-xl">{feedAmounts.month1}</span>
                    <button
                      onClick={() => changeFeedAmount("month1", 1)}
                      className="text-white font-pixel text-xl w-6 h-6 flex items-center justify-center hover:text-blue-300"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Nutrient Selection */}
                <div className="flex-1">
                  <div className="text-center text-white font-pixel text-xs mb-2">SELECT NUTRIENT</div>
                  <div className="w-[540px] h-20 bg-gray-800 border-2 border-gray-700 rounded-lg overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="flex gap-2 p-2 min-w-max">
                      {Object.entries(nutrientMixes).map(([key, nutrient]) => (
                        <button
                          key={key}
                          onClick={() => selectNutrient("month1", key)}
                          className={`w-[100px] px-2 py-2 rounded border-2 transition-colors flex-shrink-0 ${
                            selectedNutrients.month1 === key
                              ? "border-blue-400 bg-blue-900/50 text-blue-300"
                              : "border-gray-600 bg-gray-700 text-gray-300 hover:border-blue-500"
                          }`}
                        >
                          <div className="font-pixel text-[10px] text-center leading-tight">{nutrient.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Month 2 */}
              <div className="flex items-center gap-4">
                {/* Feed Amount */}
                <div className="w-32">
                  <div className="text-center text-white font-pixel text-xs mb-2">MONTH 2</div>
                  <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-3 flex items-center justify-between">
                    <button
                      onClick={() => changeFeedAmount("month2", -1)}
                      className="text-white font-pixel text-xl w-6 h-6 flex items-center justify-center hover:text-green-300"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-white font-pixel text-xl">{feedAmounts.month2}</span>
                    <button
                      onClick={() => changeFeedAmount("month2", 1)}
                      className="text-white font-pixel text-xl w-6 h-6 flex items-center justify-center hover:text-green-300"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Nutrient Selection */}
                <div className="flex-1">
                  <div className="text-center text-white font-pixel text-xs mb-2">SELECT NUTRIENT</div>
                  <div className="w-[540px] h-20 bg-gray-800 border-2 border-gray-700 rounded-lg overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="flex gap-2 p-2 min-w-max">
                      {Object.entries(nutrientMixes).map(([key, nutrient]) => (
                        <button
                          key={key}
                          onClick={() => selectNutrient("month2", key)}
                          className={`w-[100px] px-2 py-2 rounded border-2 transition-colors flex-shrink-0 ${
                            selectedNutrients.month2 === key
                              ? "border-green-400 bg-green-900/50 text-green-300"
                              : "border-gray-600 bg-gray-700 text-gray-300 hover:border-green-500"
                          }`}
                        >
                          <div className="font-pixel text-[10px] text-center leading-tight">{nutrient.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Month 3 */}
              <div className="flex items-center gap-4">
                {/* Feed Amount */}
                <div className="w-32">
                  <div className="text-center text-white font-pixel text-xs mb-2">MONTH 3</div>
                  <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-3 flex items-center justify-between">
                    <button
                      onClick={() => changeFeedAmount("month3", -1)}
                      className="text-white font-pixel text-xl w-6 h-6 flex items-center justify-center hover:text-purple-300"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-white font-pixel text-xl">{feedAmounts.month3}</span>
                    <button
                      onClick={() => changeFeedAmount("month3", 1)}
                      className="text-white font-pixel text-xl w-6 h-6 flex items-center justify-center hover:text-purple-300"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Nutrient Selection */}
                <div className="flex-1">
                  <div className="text-center text-white font-pixel text-xs mb-2">SELECT NUTRIENT</div>
                  <div className="w-[540px] h-20 bg-gray-800 border-2 border-gray-700 rounded-lg overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="flex gap-2 p-2 min-w-max">
                      {Object.entries(nutrientMixes).map(([key, nutrient]) => (
                        <button
                          key={key}
                          onClick={() => selectNutrient("month3", key)}
                          className={`w-[100px] px-2 py-2 rounded border-2 transition-colors flex-shrink-0 ${
                            selectedNutrients.month3 === key
                              ? "border-purple-400 bg-purple-900/50 text-purple-300"
                              : "border-gray-600 bg-gray-700 text-gray-300 hover:border-purple-500"
                          }`}
                        >
                          <div className="font-pixel text-[10px] text-center leading-tight">{nutrient.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Growing Button */}
            <div className="mt-4 text-center">
              <Button
                onClick={handleConfirmSchedule}
                className="bg-green-600 hover:bg-green-500 text-black font-pixel text-lg px-8 py-3 border-2 border-green-700"
              >
                START GROWING
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
