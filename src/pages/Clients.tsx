import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Users, Mail, Phone, Globe, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Client {
  id: string;
  name: string;
  focus: string;
  services: string;
  business_description: string;
  contact_info: string;
  website: string;
  number: string;
  mail: string;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("/clients/all-clients");
      const data = await response.json();

      if (response.ok && data.clients) {
        setClients(data.clients);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch clients",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToDelete(client);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      setIsDeleting(true);
      const response = await apiFetch(
        `/clients/remove?client_id=${clientToDelete.id}&delete_all_data=true`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `${clientToDelete.name} has been removed successfully`,
        });
        setClients(clients.filter((c) => c.id !== clientToDelete.id));
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete client",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Clients</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage your business clients</p>
            </div>
          </div>
          <Button onClick={() => navigate("/create-business")} className="w-full sm:w-auto text-sm">
            Add New Client
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-muted-foreground">No clients found. Create your first client to get started!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card 
              key={client.id} 
              className="group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80"
            >
              <button
                onClick={(e) => handleRemove(e, client)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Delete client"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between pr-8">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {client.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">ID: {client.id}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="w-fit mt-2 bg-primary/10 text-primary border-primary/20"
                >
                  {client.focus}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                  <p className="text-xs font-semibold mb-1.5 text-primary">Services</p>
                  <p className="text-sm text-foreground/90">{client.services}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                  <p className="text-xs font-semibold mb-1.5 text-primary">Description</p>
                  <p className="text-sm text-foreground/90 line-clamp-2">{client.business_description}</p>
                </div>

                <div className="pt-3 border-t border-border/50 space-y-3">
                  <div className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="truncate text-xs">{client.mail}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs">{client.number}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1.5 text-xs font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({ title: "Coming Soon", description: "Website link functionality coming soon!" });
                        e.preventDefault();
                      }}
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {clientToDelete?.name} and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
