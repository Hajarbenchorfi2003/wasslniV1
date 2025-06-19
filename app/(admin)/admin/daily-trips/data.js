export const mockDailyTrips = [
  {
    id: 1,
    tripId: 1,
    date: "2024-03-20",
    status: "COMPLETED",
    trip: {
      id: 1,
      name: "Trajet 1",
      route: {
        id: 1,
        name: "Route A",
        stops: [
          {
            id: 1,
            name: "Arrêt 1",
            lat: 33.5731,
            lng: -7.5898,
            stopOrder: 1
          },
          {
            id: 2,
            name: "Arrêt 2",
            lat: 33.5831,
            lng: -7.5998,
            stopOrder: 2
          },
          {
            id: 3,
            name: "Arrêt 3",
            lat: 33.5931,
            lng: -7.6098,
            stopOrder: 3
          }
        ]
      },
      bus: {
        id: 1,
        plateNumber: "12345",
        marque: "Mercedes",
        capacity: 50
      },
      driver: {
        id: 1,
        name: "John Doe",
        phone: "+212 6XX-XXXXXX"
      }
    },
    positions: [
      {
        lat: 33.5731,
        lng: -7.5898,
        timestamp: "2024-03-20 08:00:00"
      },
      {
        lat: 33.5781,
        lng: -7.5948,
        timestamp: "2024-03-20 08:15:00"
      },
      {
        lat: 33.5831,
        lng: -7.5998,
        timestamp: "2024-03-20 08:30:00"
      }
    ],
    attendance: [
      {
        id: 1,
        studentId: 1,
        type: "DEPART",
        status: "PRESENT",
        timestamp: "2024-03-20 08:00:00",
        reportedBy: {
          id: 1,
          name: "John Doe"
        }
      },
      {
        id: 2,
        studentId: 2,
        type: "DEPART",
        status: "ABSENT",
        timestamp: "2024-03-20 08:00:00",
        reportedBy: {
          id: 1,
          name: "John Doe"
        }
      }
    ],
    incidents: [
      {
        id: 1,
        description: "Retard de 15 minutes au départ",
        timestamp: "2024-03-20 08:00:00",
        reportedBy: {
          id: 1,
          name: "John Doe"
        }
      }
    ]
  },
  {
    id: 2,
    tripId: 2,
    date: "2024-03-20",
    status: "ONGOING",
    trip: {
      id: 2,
      name: "Trajet 2",
      route: {
        id: 2,
        name: "Route B",
        stops: [
          {
            id: 4,
            name: "Arrêt 4",
            lat: 33.6031,
            lng: -7.6198,
            stopOrder: 1
          },
          {
            id: 5,
            name: "Arrêt 5",
            lat: 33.6131,
            lng: -7.6298,
            stopOrder: 2
          },
          {
            id: 6,
            name: "Arrêt 6",
            lat: 33.6231,
            lng: -7.6398,
            stopOrder: 3
          }
        ]
      },
      bus: {
        id: 2,
        plateNumber: "67890",
        marque: "Volvo",
        capacity: 45
      },
      driver: {
        id: 2,
        name: "Jane Smith",
        phone: "+212 6XX-XXXXXX"
      }
    },
    positions: [
      {
        lat: 33.6031,
        lng: -7.6198,
        timestamp: "2024-03-20 09:00:00"
      },
      {
        lat: 33.6081,
        lng: -7.6248,
        timestamp: "2024-03-20 09:15:00"
      }
    ],
    attendance: [
      {
        id: 3,
        studentId: 3,
        type: "DEPART",
        status: "PRESENT",
        timestamp: "2024-03-20 09:00:00",
        reportedBy: {
          id: 2,
          name: "Jane Smith"
        }
      }
    ],
    incidents: []
  },
  {
    id: 3,
    tripId: 3,
    date: "2024-03-20",
    status: "PLANNED",
    trip: {
      id: 3,
      name: "Trajet 3",
      route: {
        id: 3,
        name: "Route C",
        stops: [
          {
            id: 7,
            name: "Arrêt 7",
            lat: 33.6331,
            lng: -7.6498,
            stopOrder: 1
          },
          {
            id: 8,
            name: "Arrêt 8",
            lat: 33.6431,
            lng: -7.6598,
            stopOrder: 2
          },
          {
            id: 9,
            name: "Arrêt 9",
            lat: 33.6531,
            lng: -7.6698,
            stopOrder: 3
          }
        ]
      },
      bus: {
        id: 3,
        plateNumber: "24680",
        marque: "Scania",
        capacity: 55
      },
      driver: {
        id: 3,
        name: "Mike Johnson",
        phone: "+212 6XX-XXXXXX"
      }
    },
    positions: [],
    attendance: [],
    incidents: []
  }
]; 