export const mockStops = [
  {
    id: 1,
    name: "Arrêt Principal",
    location: "123 Rue des Étudiants, Casablanca",
    coordinates: {
      lat: 33.5731,
      lng: -7.5898
    },
    routes: [
      {
        id: 1,
        name: "Trajet 1",
        time: "07:30"
      },
      {
        id: 2,
        name: "Trajet 2",
        time: "07:15"
      }
    ],
    students: [
      { id: 1, name: "Youssef Benali" },
      { id: 3, name: "Amine Kaddouri" }
    ],
    status: "active"
  },
  {
    id: 2,
    name: "Arrêt Secondaire",
    location: "124 Rue des Étudiants, Rabat",
    coordinates: {
      lat: 34.0209,
      lng: -6.8416
    },
    routes: [
      {
        id: 1,
        name: "Trajet 1",
        time: "07:45"
      },
      {
        id: 2,
        name: "Trajet 2",
        time: "07:30"
      }
    ],
    students: [
      { id: 5, name: "Omar Tazi" },
      { id: 4, name: "Laila Moussa" }
    ],
    status: "active"
  },
  {
    id: 3,
    name: "Arrêt Tertiaire",
    location: "125 Rue des Étudiants, Marrakech",
    coordinates: {
      lat: 31.6295,
      lng: -7.9811
    },
    routes: [
      {
        id: 3,
        name: "Trajet 3",
        time: "07:00"
      }
    ],
    students: [],
    status: "inactive"
  }
]; 