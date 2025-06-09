"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skull, Droplets, Sun, Zap } from "lucide-react"

interface HowToPlayModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 border-purple-500 border-2 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-pixel text-purple-300">How to Play</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 font-pixel text-xs">
            <TabsTrigger value="basics" className="data-[state=active]:bg-purple-600">
              Basics
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-purple-600">
              Resources
            </TabsTrigger>
            <TabsTrigger value="strategy" className="data-[state=active]:bg-purple-600">
              Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-pixel text-purple-300 mb-2">Game Overview</h3>
              <div className="text-gray-300 font-pixel text-xs space-y-2">
                <p>
                  Marrow Grow is a spooky plant cultivation game where you grow cryptic plants through different stages.
                </p>
                <p>Manage resources, defend against threats, and harvest for potency and yield!</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-pixel text-purple-300 mb-2">Lives System</h3>
              <div className="text-gray-300 font-pixel text-xs space-y-2">
                <p>• Start with 3 lives</p>
                <p>• Each grow consumes 1 life</p>
                <p>• Get more lives through daily spins</p>
                <p>• 24-hour lockout when out of lives</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <h3 className="font-pixel text-blue-300 text-sm">Fud Tears</h3>
                </div>
                <p className="text-gray-300 font-pixel text-xs">Water for basic plant growth</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-pixel text-yellow-300 text-sm">Ghost Light</h3>
                </div>
                <p className="text-gray-300 font-pixel text-xs">Controls growth rate</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Skull className="w-4 h-4 text-gray-400" />
                  <h3 className="font-pixel text-gray-300 text-sm">Bone Meal</h3>
                </div>
                <p className="text-gray-300 font-pixel text-xs">Enhances potency and yield</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  <h3 className="font-pixel text-red-300 text-sm">Dread</h3>
                </div>
                <p className="text-gray-300 font-pixel text-xs">Stress that reduces quality</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-pixel text-purple-300 mb-2">Growth Stages</h3>
              <div className="text-gray-300 font-pixel text-xs space-y-1">
                <p>1. Germinating (Crypt Sprout)</p>
                <p>2. Bone Growth</p>
                <p>3. Phantom Bloom</p>
                <p>4. Harvestable</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-pixel text-purple-300 mb-2">Defense Types</h3>
              <div className="text-gray-300 font-pixel text-xs space-y-1">
                <p>• Grower: Counters pests</p>
                <p>• Hound: Defends against raiders</p>
                <p>• Vault: Protects seeds</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-pixel text-purple-300 mb-2">Tips</h3>
              <div className="text-gray-300 font-pixel text-xs space-y-1">
                <p>• Specialize in one strain for bonuses</p>
                <p>• Balance resources carefully</p>
                <p>• Choose defenses based on threats</p>
                <p>• Time your harvest for maximum yield</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
