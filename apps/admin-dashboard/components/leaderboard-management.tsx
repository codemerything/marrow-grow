"use client"

import { useEffect, useState } from "react"
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

import { useLeaderboardStore, LeaderboardEntry } from "@/store/LeaderboardStore"; // Adjust path as needed

export function LeaderboardManagement() {
  const {
    weeklyLeaderboard,
    monthlyLeaderboard,
    allTimeLeaderboard,
    loading,
    error,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    fetchAllTimeLeaderboard,
    clearLeaderboard,
  } = useLeaderboardStore();

  const [activeTab, setActiveTab] = useState("weekly");

  // Simplified useEffect - fetch data when tab changes
  useEffect(() => {
    const fetchData = async () => {
      switch (activeTab) {
        case "weekly":
          if (weeklyLeaderboard.length === 0 && !loading.weekly) {
            await fetchWeeklyLeaderboard();
          }
          break;
        case "monthly":
          if (monthlyLeaderboard.length === 0 && !loading.monthly) {
            await fetchMonthlyLeaderboard();
          }
          break;
        case "allTime":
          if (allTimeLeaderboard.length === 0 && !loading.allTime) {
            await fetchAllTimeLeaderboard();
          }
          break;
      }
    };

    fetchData();
  }, [activeTab]); // Simplified dependency array

  const handleClearLeaderboard = async (type: "weekly" | "monthly" | "allTime") => {
    await clearLeaderboard(type);
  };

  const handleExportLeaderboard = (type: string) => {
    // Implement client-side export logic here if needed,
    // or trigger a backend export endpoint
    console.log(`Exporting ${type} leaderboard`);
  };

  const renderLeaderboardTable = (data: LeaderboardEntry[], currentLoading: boolean, currentError: string | null, isAllTime: boolean = false) => {
    if (currentLoading) {
      return <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>;
    }

    if (currentError) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error: {currentError}</div>
          <Button 
            variant="outline" 
            onClick={() => {
              if (isAllTime) fetchAllTimeLeaderboard();
              else if (activeTab === "weekly") fetchWeeklyLeaderboard();
              else if (activeTab === "monthly") fetchMonthlyLeaderboard();
            }}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-2">No data available for this leaderboard.</div>
          <Button 
            variant="outline" 
            onClick={() => {
              if (isAllTime) fetchAllTimeLeaderboard();
              else if (activeTab === "weekly") fetchWeeklyLeaderboard();
              else if (activeTab === "monthly") fetchMonthlyLeaderboard();
            }}
          >
            Load Data
          </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>{isAllTime ? "Total Yield" : "Score"}</TableHead>
            {isAllTime ? (
              <>
                <TableHead>Avg Potency</TableHead>
                <TableHead>Grow Count</TableHead>
              </>
            ) : (
              <>
                <TableHead>Seeds Planted</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Last Active</TableHead>
              </>
            )}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <TableRow key={entry._id}> {/* Use _id from backend as key */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={entry.rank && entry.rank <= 3 ? "default" : "secondary"}>#{entry.rank}</Badge>
                  {entry.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                </div>
              </TableCell>
              <TableCell className="font-medium">{entry.username || 'Unknown Player'}</TableCell>
              <TableCell>
                {isAllTime 
                  ? entry.totalYield?.toLocaleString() || '0'
                  : (entry.weeklyYield || entry.monthlyYield)?.toLocaleString() || '0'
                }
              </TableCell>
              {isAllTime ? (
                <>
                  <TableCell>{entry.avgPotency?.toFixed(2) || '0.00'}%</TableCell>
                  <TableCell>{entry.growCount || '0'}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{entry.weeklyGrowCount || entry.monthlyGrowCount || '0'}</TableCell>
                  <TableCell>N/A</TableCell> {/* Level placeholder */}
                  <TableCell>N/A</TableCell> {/* Last Active placeholder */}
                </>
              )}
              <TableCell>
                <Button variant="ghost" size="sm">
                  View Profile
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

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

      <Tabs defaultValue="weekly" className="space-y-4" onValueChange={setActiveTab}>
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
              {renderLeaderboardTable(weeklyLeaderboard, loading.weekly, error.weekly)}
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
              {renderLeaderboardTable(monthlyLeaderboard, loading.monthly, error.monthly)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alltime" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  All-Time Leaderboard
                </CardTitle>
                <CardDescription>Hall of fame - greatest players of all time</CardDescription>
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
                        Clear All-Time Leaderboard
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to clear the all-time leaderboard? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={() => handleClearLeaderboard("alltime")}>
                        Clear Leaderboard
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => handleExportLeaderboard("alltime")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderLeaderboardTable(allTimeLeaderboard, loading.allTime, error.allTime, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}