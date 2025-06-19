export const mockDrivers = [
  {
    id: 1,
    name: "Mohammed Ali",
    phone: "+212 6XX-XXXXXX",
    email: "mohammed.ali@example.com",
    licenseNumber: "12345-A-6",
    licenseExpiry: "2025-12-31",
    status: "active",
    routes: [
      {
        id: 1,
        name: "Trajet 1",
        busNumber: "12345-A-6"
      },
      {
        id: 3,
        name: "Trajet 3",
        busNumber: "12345-A-6"
      }
    ],
    documents: [
      {
        id: 1,
        type: "license",
        name: "Permis de conduire",
        expiryDate: "2025-12-31",
        status: "valid"
      },
      {
        id: 2,
        type: "medical",
        name: "Certificat médical",
        expiryDate: "2024-12-31",
        status: "valid"
      }
    ]
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    phone: "+212 6XX-XXXXXX",
    email: "ahmed.hassan@example.com",
    licenseNumber: "67890-B-6",
    licenseExpiry: "2024-12-31",
    status: "active",
    routes: [
      {
        id: 2,
        name: "Trajet 2",
        busNumber: "67890-B-6"
      }
    ],
    documents: [
      {
        id: 3,
        type: "license",
        name: "Permis de conduire",
        expiryDate: "2024-12-31",
        status: "valid"
      },
      {
        id: 4,
        type: "medical",
        name: "Certificat médical",
        expiryDate: "2024-06-30",
        status: "expiring"
      }
    ]
  },
  {
    id: 3,
    name: "Karim Benali",
    phone: "+212 6XX-XXXXXX",
    email: "karim.benali@example.com",
    licenseNumber: "54321-C-6",
    licenseExpiry: "2024-06-30",
    status: "inactive",
    routes: [],
    documents: [
      {
        id: 5,
        type: "license",
        name: "Permis de conduire",
        expiryDate: "2024-06-30",
        status: "expiring"
      },
      {
        id: 6,
        type: "medical",
        name: "Certificat médical",
        expiryDate: "2024-03-31",
        status: "expired"
      }
    ]
  }
]; 