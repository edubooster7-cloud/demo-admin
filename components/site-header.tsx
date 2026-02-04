"use client";

import { useEffect, useState } from "react";
import { IconBell, IconInfoCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/app/api/axios";

interface Notification {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: "reminder" | "deadline" | "result" | "message";
}

export function SiteHeader() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAllOpen, setIsAllOpen] = useState(false);

  // 1. Récupérer les notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notification/me");
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Erreur notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optionnel: polling toutes les 60 secondes
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Marquer comme lu
  const markAsRead = async (id: string) => {
    try {
      const response = await api.patch(`/notification/me/mark-read/${id}`);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
        );
      }
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);
  const latestNotifications = unreadNotifications.slice(0, 3); // Top 3 non-lues

  return (
    <header className="sticky top-0 z-40 flex w-full shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-base font-medium truncate">Tableau de bord</h1>

        <div className="ml-auto flex items-center gap-2">
          {/* --- POPOVER (Aperçu rapide) --- */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
              >
                <IconBell className="size-5 text-muted-foreground" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0 shadow-xl" align="end">
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <h2 className="text-sm font-semibold">Récent</h2>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold uppercase">
                  {unreadNotifications.length} nouvelles
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {latestNotifications.length > 0 ? (
                  latestNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-medium text-primary">
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notif.body}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground italic">
                    Aucune nouvelle notification
                  </div>
                )}
              </div>

              <div className="p-2 border-t bg-muted/20">
                <Button
                  variant="ghost"
                  className="w-full text-xs h-8"
                  onClick={() => setIsAllOpen(true)}
                >
                  Voir tout l'historique
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* --- DIALOG (Toutes les notifications) --- */}
      <Dialog open={isAllOpen} onOpenChange={setIsAllOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2">
              <IconBell className="size-5" />
              Centre de notifications
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-125">
            <div className="p-6 space-y-8">
              {/* Section Non-lues */}
              {unreadNotifications.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Nouvelles ({unreadNotifications.length})
                  </h3>
                  <div className="grid gap-3">
                    {unreadNotifications.map((notif) => (
                      <NotificationItem
                        key={notif._id}
                        notif={notif}
                        onRead={() => markAsRead(notif._id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section Archivées/Lues */}
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4">
                  Déjà lues
                </h3>
                {readNotifications.length > 0 ? (
                  <div className="grid gap-3 opacity-70">
                    {readNotifications.map((notif) => (
                      <NotificationItem key={notif._id} notif={notif} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Aucune notification lue.
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </header>
  );
}

// Sous-composant pour un item de notification
function NotificationItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead?: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex gap-4 p-4 rounded-xl border transition-all",
        notif.read
          ? "bg-background"
          : "bg-primary/5 border-primary/20 shadow-sm",
      )}
    >
      <div className="mt-1">
        <IconInfoCircle
          className={cn(
            "size-5",
            notif.read ? "text-muted-foreground" : "text-primary",
          )}
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold leading-none">{notif.title}</h4>
          <time className="text-[10px] text-muted-foreground uppercase">
            {new Date(notif.createdAt).toLocaleDateString("fr-FR")}
          </time>
        </div>
        <p className="text-sm text-muted-foreground">{notif.body}</p>

        {!notif.read && onRead && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-primary"
            onClick={onRead}
          >
            Marquer comme lu
          </Button>
        )}
      </div>
    </div>
  );
}
