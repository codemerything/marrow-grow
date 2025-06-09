"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, RotateCcw, Download, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LeaderboardEntry {
  rank: number
  playerId: string
  playerName: string
  score: number
  seedsPlanted: number
  level: number
  lastActive: string
}

export function LeaderboardManagement() {
  const [weeklyLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      playerId: "p1",
      playerName: "PlantWhisperer",
      score: 15420,
      seedsPlanted: 89,
      level: 25,
      lastActive: "2 hours ago",
    },
    {
      rank: 2,
      playerId: "p2",
      playerName: "GrowMaster99",
      score: 14850,
      seedsPlanted: 76,
      level: 23,
      lastActive: "1 hour ago",
    },
    {
      rank: 3,
      playerId: "p3",
      playerName: "SeedLord",
      score: 13990,
      seedsPlanted: 82,
      level: 22,
      lastActive: "30 minutes ago",
    },
    {
      rank: 4,
      playerId: "p4",
      playerName: "GreenThumb42",
      score: 12750,
      seedsPlanted: 65,
      level: 20,
      lastActive: "4 hours ago",
    },
    {
      rank: 5,
      playerId: "p5",
      playerName: "HarvestKing",
      score: 11200,
      seedsPlanted: 58,
      level: 19,
      lastActive: "1 day ago",
    },
  ])

  const [monthlyLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      playerId: "p2",
      playerName: "GrowMaster99",
      score: 45420,
      seedsPlanted: 234,
      level: 28,
      lastActive: "1 hour ago",
    },
    {
      rank: 2,
      playerId: "p1",
      playerName: "PlantWhisperer",
      score: 42850,
      seedsPlanted: 198,
      level: 25,
      lastActive: "2 hours ago",
    },
    {
      rank: 3,
      playerId: "p6",
      playerName: "VeggieVirtuoso",
      score: 38990,
      seedsPlanted: 187,
      level: 24,
      lastActive: "6 hours ago",
    },
    {
      rank: 4,
      playerId: "p3",
      playerName: "SeedLord",
      score: 35750,
      seedsPlanted: 165,
      level: 22,
      lastActive: "30 minutes ago",
    },
    {
      rank: 5,
      playerId: "p7",
      playerName: "FarmPhenom",
      score: 32200,
      seedsPlanted: 156,
      level: 21,
      lastActive: "3 hours ago",
    },
  ])

  const handleClearLeaderboard = (type: string) => {
    // In real app, this would make an API call
    console.log(`Clearing ${type} leaderboard`)
  }

  const handleExportLeaderboard = (type: string) => {
    // In real app, this would export data
    console.log(`Exporting ${type} leaderboard`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard Management</h1>
          <p className="text-muted-foreground">View and manage game leaderboards and rankings</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportLeaderboard("all")}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Leaderboard</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Leaderboard</TabsTrigger>
          <TabsTrigger value="alltime">All-Time Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Weekly Leaderboard
                </CardTitle>
                <CardDescription>Top players this week (resets every Monday)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear Board
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Clear Weekly Leaderboard
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to clear the weekly leaderboard? This action cannot be undone and will
                        reset all weekly rankings.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={() => handleClearLeaderboard("weekly")}>
                        Clear Leaderboard
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => handleExportLeaderboard("weekly")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Seeds Planted</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyLeaderboard.map((entry) => (
                    <TableRow key={entry.playerId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={entry.rank <= 3 ? "default" : "secondary"}>#{entry.rank}</Badge>
                          {entry.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{entry.playerName}</TableCell>
                      <TableCell>{entry.score.toLocaleString()}</TableCell>
                      <TableCell>{entry.seedsPlanted}</TableCell>
                      <TableCell>{entry.level}</TableCell>
                      <TableCell>{entry.lastActive}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  Monthly Leaderboard
                </CardTitle>
                <CardDescription>Top players this month (resets monthly)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear Board
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Clear Monthly Leaderboard
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to clear the monthly leaderboard? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={() => handleClearLeaderboard("monthly")}>
                        Clear Leaderboard
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => handleExportLeaderboard("monthly")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Seeds Planted</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyLeaderboard.map((entry) => (
                    <TableRow key={entry.playerId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={entry.rank <= 3 ? "default" : "secondary"}>#{entry.rank}</Badge>
                          {entry.rank === 1 && <Trophy className="h-4 w-4 text-blue-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{entry.playerName}</TableCell>
                      <TableCell>{entry.score.toLocaleString()}</TableCell>
                      <TableCell>{entry.seedsPlanted}</TableCell>
                      <TableCell>{entry.level}</TableCell>
                      <TableCell>{entry.lastActive}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alltime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                All-Time Leaderboard
              </CardTitle>
              <CardDescription>Hall of fame - greatest players of all time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                All-time leaderboard data will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
