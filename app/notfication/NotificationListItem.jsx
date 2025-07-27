// components/NotificationMailItem.jsx
"use client";

import React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react";
// You might need DeleteConfirmationDialog if you want to use it for notifications,
// but for simplicity, I'll just use a console.log for dismiss.

export function NotificationListItem({ notification, onMarkAsRead, onDismiss, onSelect, isSelected }) {
    if (!notification) return null;

    // Map notification data to mail-like properties
    // You can customize 'name' and 'label' based on how you want them to appear.
    const mailLikeData = {
        id: notification.id,
        name: notification.reportedByName || 'System', // Use reportedByName or a default sender
        subject: notification.title, // Title acts as subject
        text: notification.message, // Message acts as main text
        date: notification.timestamp,
        read: notification.read,
        starred: notification.starred || false, // Assuming 'starred' can be a property on your notification
        // 'label' property is used for the colored dot in the MailList design
        // We'll derive this from notification.type
        label: (notification.type || 'default').toLowerCase().replace(/_/g, '-'), // e.g., 'incident-report', 'daily-trip-assignment'
    };

    // We don't manage isChecked state internally here, as selection is usually parent-driven
    // The isSelected prop from parent will handle the background.

    const getLabelColor = (label) => {
        switch (label) {
            case 'incident-report': return 'bg-destructive'; // Red for incidents
            case 'daily-trip-assignment': return 'bg-primary'; // Primary for presence/assignment
            case 'system-alert': return 'bg-yellow-500'; // Yellow for system alerts
            case 'incident-update': return 'bg-orange-500'; // Orange for updates
            case 'incident-resolution': return 'bg-success'; // Green for resolution
            default: return 'bg-default-300'; // Default gray
        }
    };

    return (
        <div
            className={cn(
                "flex items-center py-5 px-6 border-b border-default-100 cursor-pointer group relative",
                "hover:bg-primary/10",
                isSelected ? "bg-primary/10" : "", // Apply selection background
                !mailLikeData.read ? "bg-white text-foreground font-semibold" : "bg-muted/50 text-muted-foreground"
            )}
            onClick={() => onSelect(mailLikeData.id)}
        >
            <Checkbox
                className="border-default-300 p-0 ltr:mr-6 rtl:ml-6"
                onClick={(e) => {
                    e.stopPropagation();
                    // Implement multi-selection logic if needed
                    console.log(`Checkbox clicked for notification ${mailLikeData.id}`);
                }}
            />

            <div
                className="ltr:mr-6 rtl:ml-6"
                onClick={(e) => {
                    e.stopPropagation();
                    // Implement logic to toggle 'starred' status if needed
                    console.log(`Toggling star for notification ${mailLikeData.id}`);
                }}
            >
                {mailLikeData.starred ? (
                    <Icon
                        icon="heroicons:star-16-solid"
                        className="w-4 h-4 text-yellow-400"
                    />
                ) : (
                    <Icon icon="heroicons:star" className="w-4 h-4 text-default-600" />
                )}
            </div>

            <div className="text-sm text-default-600 mr-4 min-w-max">
                {mailLikeData.name}
            </div>

            <div className="flex-1 flex-shrink overflow-hidden min-w-[100px] mr-7">
                <p className="truncate text-sm text-default-600">
                    <span className={cn({ "font-bold": !mailLikeData.read })}>
                        {mailLikeData.subject}:
                    </span>{''}
                    {mailLikeData.text}
                </p>
            </div>

            <div
                className={cn("h-2 w-2 rounded-full bg-default-300 ltr:mr-1.5 rtl:ml-1.5", getLabelColor(mailLikeData.label))}
            ></div>

            <div className="text-sm text-default-600 whitespace-nowrap">
                {formatDistanceToNow(parseISO(mailLikeData.date), { addSuffix: true, locale: fr })}
            </div>

            {/* Hidden actions on hover */}
            <div className="hidden absolute top-0 ltr:right-0 rtl:left-0 h-full w-fit px-5 bg-background z-10 md:group-hover:flex items-center">
                {!mailLikeData.read && (
                    <Button
                        size="icon"
                        className="bg-transparent hover:bg-transparent hover:bg-default-50 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(mailLikeData.id);
                        }}
                    >
                        <Icon icon="heroicons:envelope-open" className="w-5 h-5 text-default-600" />
                        <span className="sr-only">Mark as Read</span>
                    </Button>
                )}
                <Button
                    size="icon"
                    className="bg-transparent hover:bg-transparent hover:bg-default-50 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(mailLikeData.id); // Assuming onDismiss handles removal
                    }}
                >
                    <Icon icon="heroicons:trash" className="w-5 h-5 text-default-600" />
                    <span className="sr-only">Dismiss</span>
                </Button>
            </div>
        </div>
    );
}