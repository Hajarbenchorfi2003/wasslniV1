// components/IncidentItemDisplay.jsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const IncidentItemDisplay = ({ incident, onClose, onAcknowledge, onResolve, onDelete  }) => {
    if (!incident) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <Icon icon="heroicons:exclamation-triangle" className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-xl">Select an incident to view details</p>
                <p className="text-sm">Incident reports will appear here.</p>
            </div>
        );
    }

    const getIncidentStatusColor = (status) => {
        switch (status) {
            case 'NEW': return 'red';
            case 'ACKNOWLEDGED': return 'yellow';
            case 'RESOLVED': return 'green';
            default: return 'gray';
        }
    };

    const getIncidentStatusText = (status) => {
        switch (status) {
            case 'NEW': return 'Nouveau';
            case 'ACKNOWLEDGED': return 'Reconnu';
            case 'RESOLVED': return 'Résolu';
            default: return 'Inconnu';
        }
    };

    return (
        <div className="flex h-full flex-col px-6 mt-2">
            {/* Top action bar */}
            <div className="flex items-center p-4 border-b">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
                    <span className="sr-only">Back to list</span>
                </Button>
                <h1 className="text-xl font-bold flex-1 truncate px-2">Incident: {incident.description}</h1>
                <div className="flex items-center gap-2">
                    {incident.status === 'NEW' && onAcknowledge && (
                        <Button variant="ghost" size="icon" onClick={() => onAcknowledge(incident.id)}>
                            <Icon icon="heroicons:hand-raised" className="h-5 w-5 text-yellow-600" />
                            <span className="sr-only">Reconnaître</span>
                        </Button>
                    )}
                    {incident.status === 'ACKNOWLEDGED' && onResolve && (
                        <Button variant="ghost" size="icon" onClick={() => onResolve(incident.id)}>
                            <Icon icon="heroicons:check-badge" className="h-5 w-5 text-green-600" />
                            <span className="sr-only">Résoudre</span>
                        </Button>
                    )}
                    <Button
                    size="icon"
                    className="bg-transparent hover:bg-transparent hover:bg-default-50 rounded-full"
                    onClick={() => onDelete(incident.id)}
                >
                    <Icon icon="heroicons:trash" className="w-5 h-5 text-default-600" />
                    <span className="sr-only">Supprimer</span>
                </Button>
                </div>
            </div>

            {/* Incident Details Content Area */}
            <ScrollArea className="flex-1 overflow-y-auto p-6">
                {/* Reporter Info */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {incident.reportedByName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-base text-default-800">{incident.reportedByName}</div>
                        <div className="text-sm text-muted-foreground">Reported on {incident.timestamp ? format(new Date(incident.timestamp), 'PPPp', { locale: fr }) : 'Date inconnue'}</div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        Incident ID: {incident.id}
                    </div>
                </div>

                {/* Main Details */}
                <div className="prose prose-sm max-w-none text-default-700 leading-relaxed space-y-4">
                    <p>
                        <strong>Description:</strong> {incident.description}
                    </p>
                    {incident.dailyTripName && (
                        <p>
                            <strong>Trajet Quotidien:</strong> {incident.dailyTripName}
                        </p>
                    )}
                    {incident.dailyTripDate && (
                        <p>
                            <strong>Date Trajet:</strong> {incident.dailyTripDate}
                        </p>
                    )}
                    <p className="flex items-center gap-2">
                        <strong>Statut:</strong>
                        <Badge variant="soft" color={getIncidentStatusColor(incident.status)} className="capitalize">
                            {getIncidentStatusText(incident.status)}
                        </Badge>
                    </p>
                    {incident.details && (
                        <div>
                            <strong>Détails Supplémentaires:</strong>
                            <p className="mt-1">{incident.details}</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default IncidentItemDisplay;