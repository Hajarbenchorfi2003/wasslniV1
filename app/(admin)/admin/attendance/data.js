export const mockAttendance = [
  {
    id: 1,
    date: "2024-03-20",
    route: {
      id: 1,
      name: "Trajet 1",
      busNumber: "12345-A-6",
      driver: "Mohammed Ali"
    },
    stops: [
      {
        id: 1,
        name: "Arrêt Principal",
        time: "07:30",
        students: [
          {
            id: 1,
            name: "Youssef Benali",
            status: "present",
            time: "07:28"
          },
          {
            id: 3,
            name: "Amine Kaddouri",
            status: "present",
            time: "07:29"
          }
        ]
      },
      {
        id: 2,
        name: "Arrêt Secondaire",
        time: "07:45",
        students: [
          {
            id: 5,
            name: "Omar Tazi",
            status: "absent",
            time: null
          }
        ]
      }
    ]
  },
  {
    id: 2,
    date: "2024-03-20",
    route: {
      id: 2,
      name: "Trajet 2",
      busNumber: "67890-B-6",
      driver: "Ahmed Hassan"
    },
    stops: [
      {
        id: 3,
        name: "Arrêt Principal",
        time: "07:15",
        students: [
          {
            id: 2,
            name: "Fatima Zahra",
            status: "present",
            time: "07:14"
          }
        ]
      },
      {
        id: 4,
        name: "Arrêt Secondaire",
        time: "07:30",
        students: [
          {
            id: 4,
            name: "Laila Moussa",
            status: "late",
            time: "07:32"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    date: "2024-03-19",
    route: {
      id: 1,
      name: "Trajet 1",
      busNumber: "12345-A-6",
      driver: "Mohammed Ali"
    },
    stops: [
      {
        id: 1,
        name: "Arrêt Principal",
        time: "07:30",
        students: [
          {
            id: 1,
            name: "Youssef Benali",
            status: "present",
            time: "07:28"
          },
          {
            id: 3,
            name: "Amine Kaddouri",
            status: "present",
            time: "07:29"
          }
        ]
      },
      {
        id: 2,
        name: "Arrêt Secondaire",
        time: "07:45",
        students: [
          {
            id: 5,
            name: "Omar Tazi",
            status: "present",
            time: "07:44"
          }
        ]
      }
    ]
  }
]; 