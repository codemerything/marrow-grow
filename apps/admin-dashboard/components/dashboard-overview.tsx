import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Droplets, Zap, TrendingUp } from "lucide-react"

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Seeds",
      value: "24",
      description: "Active seed varieties",
      icon: Sprout,
      trend: "+12%",
    },
    {
      title: "Water Usage",
      value: "1,234L",
      description: "This month",
      icon: Droplets,
      trend: "-5%",
    },
    {
      title: "Nutrient Efficiency",
      value: "87%",
      description: "Average efficiency",
      icon: Zap,
      trend: "+3%",
    },
    {
      title: "Growth Rate",
      value: "94%",
      description: "Success rate",
      icon: TrendingUp,
      trend: "+8%",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your seeds.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="text-xs text-green-600 mt-1">{stat.trend} from last month</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your seed management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <div className="text-sm">
                  <span className="font-medium">Tomato Seeds</span> added successfully
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <div className="text-sm">
                  <span className="font-medium">Lettuce variety</span> updated water rate
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <div className="text-sm">
                  <span className="font-medium">Basil Seeds</span> nutrient levels optimized
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                Add New Seed Variety
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                Update Water Schedules
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                Generate Growth Report
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                Export Seed Database
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
