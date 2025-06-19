export const mockRoutes = [
  {
    id: 1,
    name: "Trajet 1",
    busNumber: "12345-A-6",
    driver: "Mohammed Ali",
    stops: [
      {
        id: 1,
        name: "Arrêt Principal",
        time: "07:30",
        location: "123 Rue des Étudiants, Casablanca",
        students: [
          { id: 1, name: "Youssef Benali" },
          { id: 3, name: "Amine Kaddouri" }
        ]
      },
      {
        id: 2,
        name: "Arrêt Secondaire",
        time: "07:45",
        location: "124 Rue des Étudiants, Casablanca",
        students: [
          { id: 5, name: "Omar Tazi" }
        ]
      }
    ],
    schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    status: "active"
  },
  {
    id: 2,
    name: "Trajet 2",
    busNumber: "67890-B-6",
    driver: "Ahmed Hassan",
    stops: [
      {
        id: 3,
        name: "Arrêt Principal",
        time: "07:15",
        location: "125 Rue des Étudiants, Rabat",
        students: [
          { id: 2, name: "Fatima Zahra" }
        ]
      },
      {
        id: 4,
        name: "Arrêt Secondaire",
        time: "07:30",
        location: "126 Rue des Étudiants, Rabat",
        students: [
          { id: 4, name: "Laila Moussa" }
        ]
      }
    ],
    schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    status: "active"
  },
  {
    id: 3,
    name: "Trajet 3",
    busNumber: "12345-A-6",
    driver: "Mohammed Ali",
    stops: [
      {
        id: 5,
        name: "Arrêt Principal",
        time: "08:00",
        location: "127 Rue des Étudiants, Marrakech",
        students: []
      },
      {
        id: 6,
        name: "Arrêt Secondaire",
        time: "08:15",
        location: "128 Rue des Étudiants, Marrakech",
        students: []
      }
    ],
    schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    status: "inactive"
  }
]; 