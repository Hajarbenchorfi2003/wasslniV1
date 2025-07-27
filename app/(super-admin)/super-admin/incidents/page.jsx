'use client';
 
import { useEffect, useState } from "react";
import { getAllIncidents } from "@/services/notficationicidient";
import { format } from "date-fns";
import fr from 'date-fns/locale/fr';

const IncidentsSuperAdminPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllIncidents()
      .then(data => {
        if (Array.isArray(data)) {
          setIncidents(data);
        } else {
          setIncidents([]);
        }
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des incidents :", err);
        setError("Impossible de charger les incidents.");
        setIncidents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-destructive text-xl">
        {error}
      </div>
    );
  }

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gestion des Incidents (Super Admin)</h1>

        {incidents.length === 0 ? (
          <div className="text-muted-foreground">Aucun incident trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">Titre</th>
                  <th className="border px-4 py-2 text-left">Description</th>
                  <th className="border px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{incident.id}</td>
                    <td className="border px-4 py-2">{incident.title || '-'}</td>
                    <td className="border px-4 py-2">{incident.description || '-'}</td>
                    <td className="border px-4 py-2">
                      {incident.date
                        ? format(new Date(incident.date), 'dd MMMM yyyy - HH:mm', { locale: fr })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
};

export default IncidentsSuperAdminPage;
