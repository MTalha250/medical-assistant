import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { FaPlus, FaFile, FaTrash, FaSpinner } from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "../uploader";
import toast from "react-hot-toast";
import { Record } from "@/types";
import axios from "axios";
import useAuthStore from "@/store/authStore";
const Records = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      setRecords(user.records);
    }
  }, [user?._id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !fileUrl) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/records/create`,
        { title, description, fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newRecord = response.data;

      setRecords((prev) => [...prev, newRecord]);
      if (user) {
        setUser({
          ...user,
          records: [...user.records, newRecord],
        });
      }
      setTitle("");
      setDescription("");
      setFileUrl("");
      setIsDialogOpen(false);
      toast.success("Record added successfully");
    } catch (error) {
      console.error("Error adding record:", error);
      toast.error("Failed to add record");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      setIsLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}/records/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecords((prev) => prev.filter((record) => record._id !== id));
      if (user) {
        setUser({
          ...user,
          records: user.records.filter((record) => record._id !== id),
        });
      }
      toast.success("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (url: string) => {
    if (typeof url !== "string") {
      return "📁";
    }
    const extension = url.split(".").pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      jpg: "📷",
      jpeg: "📷",
      png: "📷",
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
    };
    return iconMap[extension || ""] || "📁";
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <div className="py-4 px-6 bg-gradient-to-r from-slate to-[#3A526A] border-b border-slate/10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-peach p-2 rounded-full mr-3">
            <FaFile className="text-slate text-xl" />
          </div>
          <h1 className="font-bold text-xl text-white">Medical Records</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-peach text-slate rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors">
            <FaPlus className="text-xl" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Record</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new medical record.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-skyBlue/10 hover:bg-skyBlue/20 border-skyBlue text-slate placeholder-slate/50"
                  placeholder="Enter record title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  className="w-full bg-skyBlue/10 hover:bg-skyBlue/20 border-skyBlue text-slate placeholder-slate/50"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter record description"
                />
              </div>
              <div className="space-y-2">
                <Label>File Upload</Label>
                <FileUploader
                  addedFile={fileUrl}
                  onChange={(url) => setFileUrl(url)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-peach text-slate p-2 h-10 flex items-center justify-center transition-colors hover:bg-peach/90"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 flex flex-col h-[calc(100%-4rem)] overflow-hidden">
        <div className="px-6 pt-6">
          <Card className="bg-skyBlue/20 border border-skyBlue rounded-xl p-4 text-slate">
            <p className="text-sm">
              Your medical records are stored securely. You can add new records,
              view existing ones, and manage them as needed.
            </p>
          </Card>
        </div>

        <ScrollArea className="flex-1 px-6 pt-4 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => (
              <Card
                key={record._id}
                className="p-4 hover:shadow-lg transition-all duration-200 border-slate-200 group"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-slate">
                      {record.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecord(record._id)}
                      disabled={isLoading}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {isLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </Button>
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {record.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center gap-3 mb-3">
                      {record.fileUrl.split(".").pop()?.toLowerCase() ===
                        "jpg" ||
                      record.fileUrl.split(".").pop()?.toLowerCase() ===
                        "jpeg" ||
                      record.fileUrl.split(".").pop()?.toLowerCase() ===
                        "png" ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <img
                            src={record.fileUrl}
                            alt="File"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                          <span className="text-4xl">
                            {getFileIcon(record.fileUrl)}
                          </span>
                        </div>
                      )}
                      <a
                        href={record.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-slate/80 hover:underline transition-colors"
                      >
                        View File
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
                      <span>Added on</span>
                      <span>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {records.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <FaFile className="text-4xl mx-auto mb-3 text-slate-400" />
                <p className="text-lg font-medium mb-2">No records found</p>
                <p className="text-sm">
                  Add your first record using the + button above
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Records;
