// components/IncidentListItem.jsx
"use client";

import React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react";
// No Badge import needed here, as we'll use the colored dot for status
// No DeleteConfirmationDialog here, as actions are on hover

export function IncidentListItem({ incident, onSelect, isSelected, onAcknowledge, onResolve }) {
    if (!incident) return null;

    // Map incident data to mail-like properties
    // 'name' will be reportedByName, 'text' will be description + dailyTripName
    // 'label' will indicate status for the colored dot
    const mailLikeData = {
        id: incident.id,
        name: incident.reportedByName,
        subject: incident.description, // Main subject/description
        text: incident.dailyTripName ? `${incident.description} - ${incident.dailyTripName}` : incident.description, // Combines description and trip name
        date: incident.timestamp,
         starred: false, // You could add a 'starred' property to incidents if needed
     };

    const getLabelColor = (status) => {
        switch (status) {
            case 'new': return 'bg-destructive'; // Red for new incidents
            case 'acknowledged': return 'bg-yellow-500'; // Yellow for acknowledged
            case 'resolved': return 'bg-success'; // Green for resolved
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
                    console.log(`Checkbox clicked for incident ${mailLikeData.id}`);
                }}
            />

            {/* Star Icon (always unstarred for incidents, or implement logic) */}
            <div
                className="ltr:mr-6 rtl:ml-6"
                onClick={(e) => {
                    e.stopPropagation();
                    // Toggle starred status if applicable to incidents
                    console.log(`Toggling star for incident ${mailLikeData.id}`);
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
                {incident.status === 'NEW' && onAcknowledge && (
                    <Button
                        size="icon"
                        className="bg-transparent hover:bg-transparent hover:bg-default-50 rounded-full"
                        onClick={(e) => { e.stopPropagation(); onAcknowledge(mailLikeData.id); }}
                    >
                        <Icon icon="heroicons:hand-raised" className="w-5 h-5 text-yellow-600" />
                        <span className="sr-only">Reconnaître</span>
                    </Button>
                )}
                {incident.status === 'ACKNOWLEDGED' && onResolve && (
                    <Button
                        size="icon"
                        className="bg-transparent hover:bg-transparent hover:bg-default-50 rounded-full"
                        onClick={(e) => { e.stopPropagation(); onResolve(mailLikeData.id); }}
                    >
                        <Icon icon="heroicons:check-badge" className="w-5 h-5 text-green-600" />
                        <span className="sr-only">Résoudre</span>
                    </Button>
                )}
                <Button
                    size="icon"
                    className="bg-transparent hover:bg-transparent hover:bg-default-50 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Delete incident ${mailLikeData.id}`);
                    }}
                >
                    <Icon icon="heroicons:trash" className="w-5 h-5 text-default-600" />
                    <span className="sr-only">Supprimer</span>
                </Button>
            </div>
        </div>
    );
}