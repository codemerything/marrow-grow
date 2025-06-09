"use client"

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast, Toaster } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Badge not used in final table, can be removed if not needed
import { Plus, Upload, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, // Added DialogFooter
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose // Added DialogClose
} from "@/components/ui/dialog";
import { useSeedStore, Seed } from "@/store/SeedStore"; // Import Seed type

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// For edit form data, excluding non-editable fields
type EditFormData = Omit<Seed, 'id' | 'imageUrl' | 'createdAt' | 'createdBy' | '_id'>;

export function SeedsManagement() {
  const { seeds, isLoading, fetchSeeds, updateSeed, removeSeed } = useSeedStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [currentSeed, setCurrentSeed] = useState<Seed | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    waterDrainRate: 0.3,
    nutrientDrainRate: 0.3,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    description: "",
    waterDrainRate: 0.3,
    nutrientDrainRate: 0.3,
  });
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSeeds();
  }, [fetchSeeds]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image for the seed.");
      return;
    }
    if (!formData.name || !formData.description) {
      toast.error("Seed name and description are required.");
      return;
    }
    const toastId = toast.loading("Creating new seed...");
    try {
      const imageBase64 = await fileToBase64(selectedFile);
      const seedPayload = { ...formData, image: imageBase64 };
      const response = await api.post("/api/seeds", seedPayload);

      if (response.data.seed) {
        toast.success(response.data.message || "Seed created successfully!", { id: toastId });
        fetchSeeds(); // Re-fetch seeds
        setIsAddDialogOpen(false);
        setFormData({ name: "", description: "", waterDrainRate: 0.3, nutrientDrainRate: 0.3 });
        setSelectedFile(null);
      } else {
        toast.error(response.data.message || "Failed to create seed. Unexpected response.", { id: toastId });
      }
    } catch (error: any) {
      console.error("Detailed error creating seed:", error);
      toast.error(error.response?.data?.message || "An error occurred while creating the seed.", { id: toastId });
    }
  };

  const handleEditOpen = (seed: Seed) => {
    setCurrentSeed(seed);
    setEditFormData({
      name: seed.name,
      description: seed.description,
      waterDrainRate: seed.waterDrainRate,
      nutrientDrainRate: seed.nutrientDrainRate,
    });
    setEditSelectedFile(null); // Reset file input
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeed) return;

    if (!editFormData.name || !editFormData.description) {
        toast.error("Seed name and description are required.");
        return;
    }

    let imageBase64: string | undefined = undefined;
    if (editSelectedFile) {
      try {
        imageBase64 = await fileToBase64(editSelectedFile);
      } catch (error) {
        toast.error("Error processing image file.");
        return;
      }
    }

    const payload = {
      ...editFormData,
      ...(imageBase64 && { image: imageBase64 }), // Add image only if a new one was selected and processed
    };

    const success = await updateSeed(currentSeed.id, payload);
    if (success) {
      setIsEditDialogOpen(false);
      setCurrentSeed(null);
      setEditSelectedFile(null);
        // fetchSeeds(); // Not strictly needed if store updates state correctly and re-renders
    }
  };

  const handleDeleteOpen = (seed: Seed) => {
    setCurrentSeed(seed);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentSeed) return;
    const success = await removeSeed(currentSeed.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setCurrentSeed(null);
      // fetchSeeds(); // Not strictly needed if store updates state correctly and re-renders
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Seeds Management</h1>
          <p className="text-muted-foreground">Manage your seed varieties and their growing parameters</p>
        </div>

        {/* Add New Seed Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Seed
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Seed Variety</DialogTitle>
              <DialogDescription>
                Enter the details for the new seed variety including growing parameters.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="image-add">Seed Image</Label>
                <div className="flex items-center gap-2">
                  <Input id="image-add" type="file" accept="image/*" onChange={handleFileChange} className="flex-1" required />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                 {selectedFile && <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-add">Seed Name</Label>
                <Input
                  id="name-add"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cherry Tomato"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-add">Description</Label>
                <Textarea
                  id="description-add"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the seed variety..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waterDrainRate-add">Water Drain Rate</Label>
                  <Input
                    id="waterDrainRate-add" type="number" step="0.01" min="0" max="1"
                    value={formData.waterDrainRate}
                    onChange={(e) => setFormData({ ...formData, waterDrainRate: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nutrientDrainRate-add">Nutrient Drain Rate</Label>
                  <Input
                    id="nutrientDrainRate-add" type="number" step="0.01" min="0" max="1"
                    value={formData.nutrientDrainRate}
                    onChange={(e) => setFormData({ ...formData, nutrientDrainRate: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Seed</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Seed Dialog */}
      {currentSeed && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Seed Variety</DialogTitle>
              <DialogDescription>Update the details for {currentSeed.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="image-edit">New Seed Image (Optional)</Label>
                <div className="flex items-center gap-2">
                    <Input id="image-edit" type="file" accept="image/*" onChange={handleEditFileChange} className="flex-1" />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {editSelectedFile && <p className="text-xs text-muted-foreground">Selected: {editSelectedFile.name}</p>}
                 {currentSeed.imageUrl && !editSelectedFile && (
                    <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Current image:</p>
                        <img src={currentSeed.imageUrl} alt="Current seed" className="h-16 w-16 object-cover rounded-md mt-1"/>
                    </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-edit">Seed Name</Label>
                <Input
                  id="name-edit"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-edit">Description</Label>
                <Textarea
                  id="description-edit"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waterDrainRate-edit">Water Drain Rate</Label>
                  <Input
                    id="waterDrainRate-edit" type="number" step="0.01" min="0" max="1"
                    value={editFormData.waterDrainRate}
                    onChange={(e) => setEditFormData({ ...editFormData, waterDrainRate: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nutrientDrainRate-edit">Nutrient Drain Rate</Label>
                  <Input
                    id="nutrientDrainRate-edit" type="number" step="0.01" min="0" max="1"
                    value={editFormData.nutrientDrainRate}
                    onChange={(e) => setEditFormData({ ...editFormData, nutrientDrainRate: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Changes"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Seed Confirmation Dialog */}
      {currentSeed && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Seed</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the seed variety "{currentSeed.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start mt-4">
              <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seed Varieties</CardTitle>
          <CardDescription>All registered seed varieties with their growing parameters. Found: {seeds.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && seeds.length === 0 ? (
            <p>Loading seed varieties...</p>
          ) : seeds.length === 0 ? (
             <p>No seed varieties found. Add a new seed to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Water Rate</TableHead>
                  <TableHead className="text-right">Nutrient Rate</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seeds.map((seed) => (
                  <TableRow key={seed.id}>
                    <TableCell>
                      {seed.imageUrl ? (
                        <img
                          src={seed.imageUrl}
                          alt={seed.name}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{seed.name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={seed.description}>{seed.description}</TableCell>
                    <TableCell className="text-right">{seed.waterDrainRate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{seed.nutrientDrainRate.toFixed(2)}</TableCell>
                    <TableCell>{new Date(seed.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="View Details (Not Implemented)">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Seed" onClick={() => handleEditOpen(seed)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Seed" onClick={() => handleDeleteOpen(seed)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}