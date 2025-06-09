import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Sprout, Trophy, Zap, TrendingUp, UserPlus, GamepadIcon } from "lucide-react"

export function GameOverview() {
  const stats = [
    {
      title: "Total Players",
      value: "2,847",
      description: "Registered users",
      icon: Users,
      trend: "+127 this week",
      color: "text-blue-600",
    },
    {
      title: "Active Players",
      value: "1,234",
      description: "Last 24 hours",
      icon: GamepadIcon,
      trend: "+89 today",
      color: "text-green-600",
    },
    {
      title: "Seeds Planted",
      value: "15,432",
      description: "Total seeds planted",
      icon: Sprout,
      trend: "+2,341 this week",
      color: "text-emerald-600",
    },
    {
      title: "Leaderboard Entries",
      value: "892",
      description: "Active competitors",
      icon: Trophy,
      trend: "+45 this week",
      color: "text-yellow-600",
    },
  ]

  const recentActivity = [
    { type: "user", message: "New player 'GrowMaster99' joined the game", time: "2 minutes ago" },
    { type: "seed", message: "Rare 'Golden Tomato' seed was planted", time: "5 minutes ago" },
    {
      type: "leaderboard",
      message: "Player 'PlantWhisperer' reached #1 on weekly leaderboard",
      time: "12 minutes ago",
    },
    { type: "admin", message: "Seed database updated with 3 new varieties", time: "1 hour ago" },
    { type: "user", message: "Player 'GreenThumb42' completed daily challenge", time: "2 hours ago" },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case "seed":
        return <Sprout className="h-4 w-4 text-green-500" />
      case "leaderboard":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Zap className="h-4 w-4 text-purple-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Game Overview</h1>
        <p className="text-muted-foreground">Monitor your Marrow Grow game performance and player activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="text-xs text-green-600 mt-1">{stat.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events in your game</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 space-y-1">
                    <div className="text-sm">{activity.message}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-dashed border-muted-foreground/20">
                <div className="font-medium">Add New Seed Variety</div>
                <div className="text-sm text-muted-foreground">Create new seeds for players to discover</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-dashed border-muted-foreground/20">
                <div className="font-medium">Reset Weekly Leaderboard</div>
                <div className="text-sm text-muted-foreground">Clear current week's rankings</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-dashed border-muted-foreground/20">
                <div className="font-medium">Broadcast Announcement</div>
                <div className="text-sm text-muted-foreground">Send message to all players</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-dashed border-muted-foreground/20">
                <div className="font-medium">Export Player Data</div>
                <div className="text-sm text-muted-foreground">Download player statistics</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
