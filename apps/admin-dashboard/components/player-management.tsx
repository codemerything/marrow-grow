"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, RotateCcw, Zap, Ban, UserCheck, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"; 
import api from "@/lib/api"; 
import { toast, Toaster } from 'react-hot-toast';

interface Player {
  id: string
  username: string
  email: string
  level: number
  seedsPlanted: number
  spinsRemaining: number
  role: "player" | "moderator" | "admin"
  status: "active" | "banned" | "suspended"
  joinDate: string
  lastActive: string
  totalScore: number
}

export function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPlayers = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Fetching players...');
    try {
      // IMPORTANT: Replace '/api/players' if your endpoint is different
      const response = await api.get("/api/players");

      // Attempt to access data, assuming it might be nested under a 'players' key or be the direct response data
      let rawPlayers = [];
      if (response.data && Array.isArray(response.data.players)) {
        rawPlayers = response.data.players;
      } else if (Array.isArray(response.data)) {
        rawPlayers = response.data;
      } else {
        console.warn('Unexpected response structure for players:', response.data);
        toast.error('Unexpected data structure from server.', { id: toastId });
        setPlayers([]); // Set to empty if structure is wrong
        return; // Exit early
      }

      const fetchedPlayers = rawPlayers.map((player: any) => ({
        ...player,
        id: player._id || player.id, // Map _id to id, or use id if _id is not present
      }));

      setPlayers(fetchedPlayers);
      toast.success('Players loaded successfully!', { id: toastId });
    } catch (error: any) {      
      console.error("Detailed error fetching players:", {
        message: error.message,
        response: error.response ? {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        } : 'No response received',
        request: error.request ? error.request : 'No request object',
        config: error.config,
        rawErrorObject: error
      });
      toast.error(error.response?.data?.message || "Failed to fetch players. Check console.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const filteredPlayers = players.filter(
    (player) =>
      player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRoleChange = (playerId: string, newRole: "player" | "moderator" | "admin") => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, role: newRole } : p)))
  }

  const handleStatusChange = (playerId: string, newStatus: "active" | "banned" | "suspended") => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, status: newStatus } : p)))
  }

  const handleResetSeeds = (playerId: string) => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, seedsPlanted: 0, level: 1, totalScore: 0 } : p)))
  }

  const handleResetSpins = (playerId: string) => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, spinsRemaining: 5 } : p)))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "moderator":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "banned":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Player Management</h1>
          <p className="text-muted-foreground">Manage players, roles, and game progress</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Database</CardTitle>
          <CardDescription>Search and manage all registered players</CardDescription>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Seeds</TableHead>
                <TableHead>Spins</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center"> {/* Adjust colSpan based on your actual number of columns */} 
                    Loading players...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !players.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center"> {/* Adjust colSpan based on your actual number of columns */} 
                    No players found.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredPlayers.map((player: Player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{player.username}</div>
                      <div className="text-sm text-muted-foreground">{player.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{player.level}</TableCell>
                  <TableCell>{player.seedsPlanted}</TableCell>
                  <TableCell>{player.spinsRemaining}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(player.role)}>{player.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(player.status)}>{player.status}</Badge>
                  </TableCell>
                  <TableCell>{player.lastActive}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedPlayer(player)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleResetSeeds(player.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset Seeds
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetSpins(player.id)}>
                          <Zap className="h-4 w-4 mr-2" />
                          Reset Spins
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {player.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(player.id, "banned")}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Ban Player
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(player.id, "active")}
                            className="text-green-600"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Unban Player
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Player Details Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Player Details: {selectedPlayer?.username}</DialogTitle>
            <DialogDescription>Manage player settings and permissions</DialogDescription>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={selectedPlayer.role}
                    onValueChange={(value: "player" | "moderator" | "admin") =>
                      handleRoleChange(selectedPlayer.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={selectedPlayer.status}
                    onValueChange={(value: "active" | "banned" | "suspended") =>
                      handleStatusChange(selectedPlayer.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedPlayer.level}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Seeds Planted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedPlayer.seedsPlanted}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedPlayer.totalScore.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleResetSeeds(selectedPlayer.id)} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Seeds & Progress
                </Button>
                <Button variant="outline" onClick={() => handleResetSpins(selectedPlayer.id)} className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Reset Spins (Give 5)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
