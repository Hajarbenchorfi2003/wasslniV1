// components/parent/ParentIncidentList.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const ParentIncidentList = ({ incidents, onMarkAsRead }) => {
  const getIncidentTypeColor = (type) => {
    switch (type) {
      case 'MECHANICAL_ISSUE': return 'orange';
      case 'ACCIDENT': return 'red';
      case 'DELAY': return 'yellow';
      case 'BEHAVIOR_ISSUE': return 'purple';
      case 'OTHER': return 'gray';
      default: return 'gray';
    }
  };

  const getIncidentTypeText = (type) => {
    switch (type) {
      case 'MECHANICAL_ISSUE': return 'Problème mécanique';
      case 'ACCIDENT': return 'Accident';
      case 'DELAY': return 'Retard';
      case 'BEHAVIOR_ISSUE': return 'Problème de comportement';
      case 'OTHER': return 'Autre incident';
      default: return 'Incident';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'MECHANICAL_ISSUE': return 'heroicons:wrench-screwdriver';
      case 'ACCIDENT': return 'heroicons:exclamation-triangle';
      case 'DELAY': return 'heroicons:clock';
      case 'BEHAVIOR_ISSUE': return 'heroicons:user-minus';
      case 'OTHER': return 'heroicons:exclamation-circle';
      default: return 'heroicons:exclamation-triangle';
    }
  };

  const sortedIncidents = [...incidents].sort((a, b) => {
    // Sort by timestamp (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-medium text-default-800 flex items-center gap-2">
              <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5" />
              Incidents
              {incidents.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {incidents.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Liste des incidents concernant votre enfant</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          {sortedIncidents.length > 0 ? (
            <div className="space-y-1">
              {sortedIncidents.map(incident => (
                <div 
                  key={incident.id} 
                  className="p-4 border-b last:border-b-0 flex items-start justify-between transition-colors bg-default"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Icon 
                        icon={getIncidentIcon(incident.type)} 
                        className="h-4 w-4 mr-2 text-orange-500"
                      />
                      <Badge 
                        variant="soft" 
                        color={getIncidentTypeColor(incident.type)} 
                        className="mr-2 capitalize text-xs"
                      >
                        {getIncidentTypeText(incident.type)}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        Signalé par: {incident.reportedBy?.fullname ||'Inconnu'}
                      </p>
                    </div>
                    
                    <div className="mb-2">
                      <h4 className="font-semibold text-default-700 text-sm">
                        {incident.dailyTrip?.trip?.name ||'Trajet inconnu'}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {incident.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(incident.timestamp).toLocaleString('fr-FR', {
                          year:'numeric', 
                          month:'short', 
                          day:'numeric', 
                          hour:'2-digit', 
                          minute:'2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Icon icon="heroicons:check-circle" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun incident</h3>
              <p className="text-muted-foreground text-sm">
                Aucun incident n&apos;a été signalé pour votre enfant.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};