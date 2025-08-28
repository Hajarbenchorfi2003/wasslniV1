import { Bell } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getNotfication, markNotificationAsRead } from '@/services/notficationicidient';
import { useEffect, useState } from 'react';
import shortImage from "@/public/images/all-img/short-image-2.png";

const NotificationMessage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
  const getUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') return null;
      return JSON.parse(userStr);
    } catch (err) {
      console.error('Failed to parse user:', err);
      return null;
    }
  };

  const user = getUser();
  
  const getHrefBasedOnRole = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case "admin":
        return "/admin/notifications";
      case "super_admin":
        return "/super-admin/notifications";
      case "parent":
        return "/parent/notifications";
      case "responsible":
        return "/manager/incidents-notifications";
      case "driver":
        return "/driver/notifications";
      default:
        return "/";
    }
  };

  const href = getHrefBasedOnRole();

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await getNotfication();
        const notificationsData = response.data || response;
        
        if (Array.isArray(notificationsData)) {
          setNotifications(notificationsData);
          // Count unread notifications
          const unread = notificationsData.filter(notif => !notif.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);
  

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationAsRead();
      // Update local state to mark all as read
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
          data-[state=open]:bg-default-100  dark:data-[state=open]:bg-default-200 
           hover:text-primary text-default-500 dark:text-default-800  rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="w-4 h-4 p-0 text-xs font-medium items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[999] mx-4 lg:w-[412px] p-0"
      >
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
        >
          <span className="text-base font-semibold text-white flex-1">
            Notifications
          </span>
          <button 
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-white flex-0 cursor-pointer hover:underline hover:decoration-default-100 dark:decoration-default-900"
          >
            Mark all as read
          </button>
        </DropdownMenuLabel>
        <div className="h-[150px] xl:h-[200px]">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => (
                <DropdownMenuItem
                  key={`notification-${item.id}`}
                  className="flex gap-9 py-2 px-4 cursor-pointer dark:hover:bg-background"
                >
                  <div className="flex-1 flex items-center gap-2">
                    <Avatar className="h-10 w-10 rounded">
                      <AvatarFallback>
                        {item.reportedBy?.charAt(0) || 'N'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-default-900 mb-[2px] whitespace-nowrap">
                        {item.reportedBy || 'System Notification'}
                      </div>
                      <div className="text-xs text-default-900 truncate max-w-[100px] lg:max-w-[185px]">
                        {item.message}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium text-default-900 whitespace-nowrap",
                      {
                        "text-default-600": item.read,
                      }
                    )}
                  >
                    {formatDate(item.createdAt || item.timestamp)}
                  </div>
                  {!item.read && (
                    <div className="w-2 h-2 rounded-full mr-2 bg-primary"></div>
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>No notifications available</p>
              </div>
            )}
          </ScrollArea>
        </div>
        <DropdownMenuSeparator />
        <div className="m-4 mt-5">
          <Button asChild type="text" className="w-full">
            <Link href={href}>View All</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;