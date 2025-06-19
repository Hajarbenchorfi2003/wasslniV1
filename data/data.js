// data-donne.js
export const demoData = {
  enums: {
    Gender: ['MALE', 'FEMALE'],
    AttendanceStatus: ['PRESENT', 'ABSENT', 'LATE'], // Added LATE for more robust attendance
    AttendanceType: ['DEPART', 'RETOUR'],
    TripStatus: ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELED'], // Added CANCELED
    Role: ['SUPER_ADMIN', 'ADMIN', 'RESPONSIBLE', 'DRIVER', 'PARENT']
  },

  users: [
    {
      id: 1,
      fullname: "Admin Principal",
      email: "superadmin@schooltrans.com",
      phone: "0612345678",
      password: "$2a$10$hashedpassword",
      role: "SUPER_ADMIN",
      cin: "AB123456",
      isActive: true
    },
    {
      id: 2,
      fullname: "Directeur École A",
      email: "directeur@ecolea.com",
      phone: "0623456789",
      password: "$2a$10$hashedpassword",
      role: "ADMIN",
      cin: "CD234567",
      isActive: false
    },
    {
      id: 3,
      fullname: "Responsable Établissement 1",
      email: "resp@etabl1.com",
      phone: "0634567890",
      password: "$2a$10$hashedpassword",
      role: "RESPONSIBLE",
      cin: "EF345678",
      isActive: true
    },
    {
      id: 6,
      fullname: "Responsable Établissement 2",
      email: "resp@etabl2.com",
      phone: "+212 634567890",
      password: "$2a$10$hashedpassword",
      role: "RESPONSIBLE",
      cin: "M343424",
      isActive: true
    },
    {
      id: 4,
      fullname: "Chauffeur Ali",
      email: "chauffeur.ali@ecolea.com",
      phone: "0645678901",
      password: "$2a$10$hashedpassword",
      role: "DRIVER",
      cin: "GH456789",
      isActive: true
    },
    {
      id: 5,
      fullname: "Parent Fatima",
      email: "parent.fatima@mail.com",
      phone: "0656789012",
      password: "$2a$10$hashedpassword",
      role: "PARENT",
      cin: "IJ567890",
      isActive: true
    },
    { // NEW PARENT
      id: 7,
      fullname: "Parent Said",
      email: "parent.said@mail.com",
      phone: "0667890123",
      password: "$2a$10$hashedpassword",
      role: "PARENT",
      cin: "KL678901",
      isActive: true
    },
    { // NEW DRIVER
      id: 8,
      fullname: "Chauffeur Omar",
      email: "chauffeur.omar@ecolea.com",
      phone: "0678901234",
      password: "$2a$10$hashedpassword",
      role: "DRIVER",
      cin: "NO789012",
      isActive: true
    }
  ],

  permissions: [
    { id: 1, name: "manage_users", description: "Peut gérer tous les utilisateurs" },
    { id: 2, name: "manage_students", description: "Peut gérer les élèves" },
    { id: 3, name: "view_reports", description: "Peut voir les rapports" },
    { id: 4, name: "mark_attendance", description: "Peut marquer les présences" },
    { id: 5, name: "track_bus", description: "Peut suivre les bus en temps réel" }
  ],

  rolePermissions: [
    { role: "SUPER_ADMIN", permissionId: 1 },
    { role: "SUPER_ADMIN", permissionId: 2 },
    { role: "SUPER_ADMIN", permissionId: 3 },
    { role: "ADMIN", permissionId: 2 },
    { role: "ADMIN", permissionId: 3 },
    { role: "RESPONSIBLE", permissionId: 2 },
    { role: "RESPONSIBLE", permissionId: 4 },
    { role: "DRIVER", permissionId: 4 },
    { role: "DRIVER", permissionId: 5 },
    { role: "PARENT", permissionId: 3 }
  ],

  schools: [
    {
      id: 1,
      name: "École Primaire Les Lilas",
      email: "contact@leslilas.com",
      phone: "0522400001",
      address: "123 Rue des Écoles",
      city: "Casablanca",
      isActive: true
    },
    {
      id: 2,
      name: "Collège Al Andalus",
      email: "secretariat@alandalus.edu",
      phone: "0522400002",
      address: "456 Avenue Mohamed V",
      city: "Rabat",
      isActive: true
    }
  ],

  establishments: [
    {
      id: 1,
      name: "Établissement Principal",
      email: "principal@leslilas.com",
      phone: "0522400101",
      address: "123 Rue des Écoles",
      quartie: "Maarif",
      city: "Casablanca",
      schoolId: 1,
      responsableId: 3
    },
    {
      id: 2,
      name: "Annexe Oasis",
      email: "annexe@leslilas.com",
      phone: "0522400102",
      address: "789 Boulevard Oasis",
      quartie: "Oasis",
      city: "Casablanca",
      schoolId: 1,
      responsableId: 6
    }
  ],

  userSchools: [
    { userId: 2, schoolId: 1 },
    { userId: 3, schoolId: 1 },
    { userId: 4, schoolId: 1 },
    { userId: 8, schoolId: 1 } // Link new driver to school 1
  ],

  students: [
    {
      id: 1,
      fullname: "Karim Benjelloun",
      dateOfBirth: "2015-03-15T00:00:00.000Z",
      gender: "MALE",
      class: "CE2",
      quartie: "Maarif",
      address: "10 Rue Atlas",
      establishmentId: 1,
      deletedAt: null
    },
    {
      id: 2,
      fullname: "Amina El Fassi",
      dateOfBirth: "2014-07-22T00:00:00.000Z",
      gender: "FEMALE",
      class: "CM1",
      quartie: "Oasis",
      address: "25 Boulevard Palmier",
      establishmentId: 1,
      deletedAt: null
    },
    {
      id: 3,
      fullname: "Mehdi Berrada",
      dateOfBirth: "2016-01-10T00:00:00.000Z",
      gender: "MALE",
      class: "CP",
      quartie: "Gauthier",
      address: "30 Avenue Hassan II",
      establishmentId: 1,
      deletedAt: null
    },
    { // NEW STUDENT FOR PARENT SAID
      id: 4,
      fullname: "Leila Hamidi",
      dateOfBirth: "2017-09-01T00:00:00.000Z",
      gender: "FEMALE",
      class: "CE1",
      quartie: "Maarif",
      address: "15 Rue Agadir",
      establishmentId: 1,
      deletedAt: null
    },
    { // ANOTHER NEW STUDENT FOR PARENT SAID
      id: 5,
      fullname: "Youssef Ziani",
      dateOfBirth: "2018-05-20T00:00:00.000Z",
      gender: "MALE",
      class: "GS",
      quartie: "Oasis",
      address: "5 Avenue Moulay Youssef",
      establishmentId: 1,
      deletedAt: null
    }
  ],

  parentStudents: [
    { parentId: 5, studentId: 1 },
    { parentId: 5, studentId: 2 },
    { parentId: 7, studentId: 4 }, // Link Leila to Parent Said
    { parentId: 7, studentId: 5 }  // Link Youssef to Parent Said
  ],

  buses: [
    {
      id: 1,
      plateNumber: "A1234BC",
      capacity: 30,
      marque: "Mercedes",
      establishmentId: 1
    },
    {
      id: 2,
      plateNumber: "B5678CD",
      capacity: 25,
      marque: "Toyota",
      establishmentId: 1
    },
    { // NEW BUS
      id: 3,
      plateNumber: "C9012EF",
      capacity: 35,
      marque: "Ford",
      establishmentId: 1
    }
  ],

  routes: [
    {
      id: 1,
      name: "Circuit Maarif-Oasis",
      establishmentId: 1
    },
    {
      id: 2,
      name: "Circuit Centre Ville",
      establishmentId: 1
    },
    { // NEW ROUTE
      id: 3,
      name: "Circuit Ain Diab",
      establishmentId: 1
    }
  ],

  stops: [
    {
      id: 1,
      name: "Arrêt Principal",
      lat: 33.5731,
      lng: -7.5898,
      stopOrder: 1,
      routeId: 1
    },
    {
      id: 2,
      name: "Place du Marché",
      lat: 33.5750,
      lng: -7.5870,
      stopOrder: 2,
      routeId: 1
    },
    {
      id: 3,
      name: "Mosquée Al Qods",
      lat: 33.5770,
      lng: -7.5840,
      stopOrder: 3,
      routeId: 1
    },
    {
      id: 4,
      name: "École Primaire",
      lat: 33.5731,
      lng: -7.5898,
      stopOrder: 1,
      routeId: 2
    },
    { // NEW STOP FOR ROUTE 3
      id: 5,
      name: "Plage Ain Diab",
      lat: 33.5900,
      lng: -7.6600,
      stopOrder: 1,
      routeId: 3
    },
    { // ANOTHER NEW STOP FOR ROUTE 3
      id: 6,
      name: "Morocco Mall",
      lat: 33.5670,
      lng: -7.6680,
      stopOrder: 2,
      routeId: 3
    }
  ],

  trips: [
    {
      id: 1,
      name: "Matin - Circuit 1",
      routeId: 1,
      busId: 1,
      driverId: 4,
      establishmentId: 1
    },
    {
      id: 2,
      name: "Soir - Circuit 1",
      routeId: 1,
      busId: 1,
      driverId: 4,
      establishmentId: 1
    },
    {
      id: 3,
      name: "Matin - Circuit 2",
      routeId: 2,
      busId: 2,
      driverId: 4,
      establishmentId: 1
    },
    { // NEW TRIP FOR NEW DRIVER AND BUS
      id: 4,
      name: "Matin - Circuit Ain Diab",
      routeId: 3,
      busId: 3,
      driverId: 8,
      establishmentId: 1
    },
    { // ANOTHER NEW TRIP FOR NEW DRIVER AND BUS
      id: 5,
      name: "Soir - Circuit Ain Diab",
      routeId: 3,
      busId: 3,
      driverId: 8,
      establishmentId: 1
    }
  ],

  dailyTrips: [
    {
      id: 1,
      tripId: 1,
      date: "2023-10-01T07:00:00.000Z",
      status: "COMPLETED"
    },
    {
      id: 2,
      tripId: 1,
      date: "2023-10-02T07:00:00.000Z",
      status: "COMPLETED"
    },
    {
      id: 3,
      tripId: 2,
      date: "2023-10-01T16:00:00.000Z",
      status: "COMPLETED"
    },
    { // NEW DAILY TRIP FOR NEW TRIP (Ain Diab)
      id: 4,
      tripId: 4,
      date: "2023-10-02T08:00:00.000Z",
      status: "PLANNED" // Planned trip for testing
    },
    { // ANOTHER NEW DAILY TRIP FOR NEW TRIP (Ain Diab)
      id: 5,
      tripId: 5,
      date: "2023-10-02T17:00:00.000Z",
      status: "ONGOING" // Ongoing trip for testing
    },
    { // FUTURE DAILY TRIP FOR EXISTING TRIP
      id: 6,
      tripId: 1,
      date: "2023-10-03T07:00:00.000Z",
      status: "PLANNED"
    }
  ],

  tripStudents: [
    { tripId: 1, studentId: 1 },
    { tripId: 1, studentId: 2 },
    { tripId: 2, studentId: 1 },
    { tripId: 2, studentId: 2 },
    { tripId: 3, studentId: 3 },
    { tripId: 4, studentId: 4 }, // Add Leila to Ain Diab trip
    { tripId: 4, studentId: 5 }, // Add Youssef to Ain Diab trip
    { tripId: 5, studentId: 4 }, // Add Leila to Ain Diab return trip
    { tripId: 5, studentId: 5 }  // Add Youssef to Ain Diab return trip
  ],

  positions: [
    {
      id: 1,
      dailyTripId: 1,
      timestamp: "2023-10-01T07:05:00.000Z",
      lat: 33.5731,
      lng: -7.5898
    },
    {
      id: 2,
      dailyTripId: 1,
      timestamp: "2023-10-01T07:15:00.000Z",
      lat: 33.5740,
      lng: -7.5885
    },
    {
      id: 3,
      dailyTripId: 1,
      timestamp: "2023-10-01T07:25:00:000Z",
      lat: 33.5750,
      lng: -7.5870
    },
    { // NEW POSITION FOR DAILY TRIP 5
      id: 4,
      dailyTripId: 5,
      timestamp: "2023-10-02T17:05:00.000Z",
      lat: 33.5905,
      lng: -7.6610
    },
    { // ANOTHER NEW POSITION FOR DAILY TRIP 5
      id: 5,
      dailyTripId: 5,
      timestamp: "2023-10-02T17:15:00.000Z",
      lat: 33.5850,
      lng: -7.6700
    }
  ],

  attendances: [
    {
      id: 1,
      dailyTripId: 1,
      studentId: 1,
      type: "DEPART",
      status: "PRESENT",
      timestamp: "2023-10-01T07:10:00.000Z",
      markedById: 4
    },
    {
      id: 2,
      dailyTripId: 1,
      studentId: 2,
      type: "DEPART",
      status: "PRESENT",
      timestamp: "2023-10-01T07:10:00.000Z",
      markedById: 4
    },
    {
      id: 3,
      dailyTripId: 3,
      studentId: 1,
      type: "RETOUR",
      status: "PRESENT",
      timestamp: "2023-10-01T16:30:00.000Z",
      markedById: 4
    },
    {
      id: 4,
      dailyTripId: 3,
      studentId: 2,
      type: "RETOUR",
      status: "ABSENT",
      timestamp: "2023-10-01T16:30:00.000Z",
      markedById: 4
    },
    { // NEW ATTENDANCE FOR LEILA (DAILY TRIP 4 - DEPART)
      id: 5,
      dailyTripId: 4,
      studentId: 4,
      type: "DEPART",
      status: "PRESENT",
      timestamp: "2023-10-02T08:10:00.000Z",
      markedById: 8 // Marked by new driver Omar
    },
    { // NEW ATTENDANCE FOR YOUSSEF (DAILY TRIP 4 - DEPART)
      id: 6,
      dailyTripId: 4,
      studentId: 5,
      type: "DEPART",
      status: "LATE", // Example of LATE status
      timestamp: "2023-10-02T08:15:00.000Z",
      markedById: 8
    }
  ],

  incidents: [
    {
      id: 1,
      dailyTripId: 1,
      reportedById: 4,
      description: "Retard de 10 minutes à cause du trafic",
      timestamp: "2023-10-01T07:45:00.000Z"
    },
    {
      id: 2,
      dailyTripId: 3,
      reportedById: 4,
      description: "Élève non présent au retour",
      timestamp: "2023-10-01T16:35:00.000Z"
    },
    { // NEW INCIDENT FOR DAILY TRIP 4
      id: 3,
      dailyTripId: 4,
      reportedById: 8,
      description: "Trafic dense, retard de 5 minutes",
      timestamp: "2023-10-02T08:30:00.000Z"
    }
  ],

  notifications: [
    {
      id: 1,
      userId: 5,
      type: "ATTENDANCE",
      title: "Présence de Karim",
      message: "Votre enfant Karim a été marqué présent ce matin",
      read: false,
      timestamp: "2023-10-01T07:15:00.000Z"
    },
    {
      id: 2,
      userId: 5,
      type: "INCIDENT",
      title: "Absence au retour",
      message: "Votre enfant Amina était absent au retour",
      read: false,
      timestamp: "2023-10-01T16:40:00.000Z"
    },
    { // NEW NOTIFICATION FOR PARENT SAID
      id: 3,
      userId: 7,
      type: "ATTENDANCE",
      title: "Présence de Leila",
      message: "Votre enfant Leila a été marqué présent ce matin.",
      read: false,
      timestamp: "2023-10-02T08:12:00.000Z"
    },
    { // ANOTHER NEW NOTIFICATION FOR PARENT SAID (LATE)
      id: 4,
      userId: 7,
      type: "ATTENDANCE",
      title: "Présence de Youssef (Retard)",
      message: "Votre enfant Youssef a été marqué présent avec un léger retard ce matin.",
      read: false,
      timestamp: "2023-10-02T08:17:00.000Z"
    }
  ],

  subscriptions: [
    {
      id: 1,
      schoolId: 1,
      establishmentCount: 2,
      amount: 5000.00,
      startDate: "2023-09-01T00:00:00.000Z",
      endDate: "2024-08-31T00:00:00.000Z",
      status: "ACTIVE"
    },
    {
      id: 2,
      schoolId: 2,
      establishmentCount: 1,
      amount: 3000.00,
      startDate: "2023-09-01T00:00:00.000Z",
      endDate: "2024-08-31T00:00:00.000Z",
      status: "ACTIVE"
    }
  ]
};

// Fonctions utilitaires pour accéder aux données
export const getUsersByRole = (role) => {
  return demoData.users.filter(user => user.role === role);
};
export const getChildren = (childId) => {
  // Convertir childId en nombre si ce n'est pas déjà le cas
  const id = typeof childId === 'string' ? parseInt(childId) : childId;
  return demoData.students.filter(user => user.id === id);
}
export const getStudentsByEstablishment = (establishmentId) => {
  return demoData.students.filter(student => student.establishmentId === establishmentId);
};

export const getTripsByDriver = (driverId) => {
  return demoData.trips.filter(trip => trip.driverId === driverId);
};

export const getDailyTripsByStatus = (status) => {
  return demoData.dailyTrips.filter(trip => trip.status === status);
};
/**
* Retourne les administrateurs (ADMIN) d'une école spécifique
* @param {number} schoolId - L'ID de l'école
* @returns {Array} - Liste des administrateurs de l'école
*/
export function getSchoolAdmins(schoolId) {
  // 1. Trouver tous les utilisateurs avec le rôle ADMIN
  const admins = demoData.users.filter(user => user.role === 'ADMIN');
  
  // 2. Filtrer ceux qui sont associés à l'école spécifiée
  const schoolAdmins = admins.filter(admin => 
    demoData.userSchools.some(us => 
      us.userId === admin.id && us.schoolId === schoolId
    )
  );
  
  return schoolAdmins;
}
export function getSchoolEstablishments(schoolId) {
  const establishments = demoData.establishments.filter(etb => etb.schoolId === schoolId);
  return establishments;
}

// Version alternative plus optimisée
export function getSchoolAdminsOptimized(schoolId) {
  return demoData.users.filter(user => 
    user.role === 'ADMIN' && 
    demoData.userSchools.some(us => 
      us.userId === user.id && us.schoolId === schoolId
    )
  );
}


// Ajouter une école
export function addSchool(newSchool) {
  const newId = demoData.schools.length + 1;
  const schoolToAdd = { id: newId, isActive: true, ...newSchool };
  demoData.schools.push(schoolToAdd);
  return schoolToAdd;
}

// Ajouter un utilisateur admin
export function addUser(user) {
  const newId = demoData.users.length + 1;
  const newUser = { id: newId, role: 'ADMIN', isActive: true, ...user };
  demoData.users.push(newUser);
  return newUser;
}

// Lier un user à une école
export function linkUserToSchool(userId, schoolId) {
  demoData.userSchools.push({ userId, schoolId });
}
// Dans data.js

// Mettre à jour une école existante
export function updateSchool(schoolId, updatedData) {
  const index = demoData.schools.findIndex(s => s.id === schoolId);
  if (index !== -1) {
    demoData.schools[index] = { ...demoData.schools[index], ...updatedData };
  }
  return demoData.schools[index];
}

// Ajouter un nouvel admin
export function addAdmin(adminData, schoolId) {
  const newId = Math.max(...demoData.users.map(u => u.id), 0) + 1;
  const newAdmin = { 
    id: newId, 
    role: 'ADMIN', 
    isActive: true, 
    ...adminData 
  };
  demoData.users.push(newAdmin);
  
  // Lier l'admin à l'école
  demoData.userSchools.push({ userId: newId, schoolId });
  
  return newAdmin;
}

// Lier un admin existant à une école
export function linkAdminToSchool(adminId, schoolId) {
  if (!demoData.userSchools.some(us => us.userId === adminId && us.schoolId === schoolId)) {
    demoData.userSchools.push({ userId: adminId, schoolId });
  }
}

/**
* Returns the payment status for a given subscription.
* @param {object} subscription - The subscription object.
* @returns {string} - A descriptive string for the payment status.
*/
export function getSubscriptionPaymentStatus(subscription) {
  switch (subscription.status) {
    case 'ACTIVE':
      return 'Actif';
    case 'INACTIVE':
      return 'Inactif'; // Assuming you might have an INACTIVE status
    case 'PENDING':
      return 'En attente'; // Assuming you might have a PENDING status
    case 'EXPIRED':
      return 'Expiré'; // Assuming you might have an EXPIRED status
    default:
      return 'Statut inconnu';
  }
}
export const getUserCountsByRoleForAdminDashboard = () => {
  const roleCounts = {};
  demoData.users.forEach(user => {
    // Exclude SUPER_ADMIN role
    if (user.role !== 'SUPER_ADMIN') {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    }
  });
  return roleCounts;
};

// Function to get total students
export const getTotalStudents = () => {
  return demoData.students.length;
};

// Function to get student counts by gender
export const getStudentCountsByGender = () => {
  const genderCounts = {};
  demoData.students.forEach(student => {
    genderCounts[student.gender] = (genderCounts[student.gender] || 0) + 1;
  });
  return genderCounts;
};

// Function to get student counts by class
export const getStudentCountsByClass = () => {
  const classCounts = {};
  demoData.students.forEach(student => {
    classCounts[student.class] = (classCounts[student.class] || 0) + 1;
  });
  return classCounts;
};

// Function to get daily trip status counts
export const getDailyTripStatusCounts = () => {
  const statusCounts = {};
  demoData.dailyTrips.forEach(trip => {
    statusCounts[trip.status] = (statusCounts[trip.status] || 0) + 1;
  });
  return statusCounts;
};

// Function to get attendance status counts for a specific daily trip (or aggregated)
export const getAttendanceStatusCounts = (dailyTripId) => {
  const attendanceCounts = {};
  const relevantAttendances = dailyTripId
    ? demoData.attendances.filter(att => att.dailyTripId === dailyTripId)
    : demoData.attendances;

  relevantAttendances.forEach(attendance => {
    attendanceCounts[attendance.status] = (attendanceCounts[attendance.status] || 0) + 1;
  });
  return attendanceCounts;
};


// Get subscription status for a school
export const getSchoolSubscriptionStatus = (schoolId) => {
    const subscription = demoData.subscriptions.find(sub => sub.schoolId === schoolId);
    return subscription ? getSubscriptionPaymentStatus(subscription) : 'Non abonné';
}


 

/**
 * Returns a bus object by ID.
 * @param {number} busId - The ID of the bus.
 * @returns {object | undefined} - The bus object or undefined if not found.
 */
export const getBusById = (busId) => {
  return demoData.buses.find(bus => bus.id === busId);
};

/**
 * Returns a route object by ID.
 * @param {number} routeId - The ID of the route.
 * @returns {object | undefined} - The route object or undefined if not found.
 */
export const getRouteById = (routeId) => {
  return demoData.routes.find(route => route.id === routeId);
};

/**
 * Returns a trip object by ID.
 * @param {number} tripId - The ID of the trip.
 * @returns {object | undefined} - The trip object or undefined if not found.
 */
export const getTripById = (tripId) => {
  return demoData.trips.find(trip => trip.id === tripId);
};

/**
 * Returns all stops for a specific route.
 * @param {number} routeId - The ID of the route.
 * @returns {Array<object>} - An array of stop objects, sorted by stopOrder.
 */
export const getStopsByRoute = (routeId) => {
  return demoData.stops.filter(stop => stop.routeId === routeId).sort((a, b) => a.stopOrder - b.stopOrder);
};

/**
 * Returns all students assigned to a specific trip.
 * @param {number} tripId - The ID of the trip.
 * @returns {Array<object>} - An array of student objects.
 */
export const getStudentsByTrip = (tripId) => {
  const studentIds = demoData.tripStudents.filter(ts => ts.tripId === tripId).map(ts => ts.studentId);
  return demoData.students.filter(student => studentIds.includes(student.id));
};

/**
 * Returns daily trips assigned to a specific driver.
 * Enriches daily trips with full trip, bus, driver, and route details.
 * @param {number} driverId - The ID of the driver.
 * @returns {Array<object>} - An array of enriched daily trip objects.
 */
export const getDailyTripsForDriver = (driverId) => {
    // 1. Find all trips (master trips) assigned to this driver
    const driverTrips = demoData.trips.filter(trip => trip.driverId === driverId);

    // 2. Find all daily trips corresponding to these master trips
    const driverDailyTrips = demoData.dailyTrips.filter(dTrip =>
        driverTrips.some(trip => trip.id === dTrip.tripId)
    );

    // 3. Enrich each daily trip with relevant details
    return driverDailyTrips.map(dTrip => {
        const trip = driverTrips.find(t => t.id === dTrip.tripId);
        const bus = trip ? demoData.buses.find(b => b.id === trip.busId) : null;
        const route = trip ? demoData.routes.find(r => r.id === trip.routeId) : null;
        const driver = demoData.users.find(u => u.id === driverId);

        return {
            ...dTrip,
            trip: {
                ...trip,
                bus: bus,
                route: route,
                driver: driver // Should be the same as the current driver
            },
            // Add a formatted date for display
            displayDate: new Date(dTrip.date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            // Add a simple date for grouping/filtering if needed
            simpleDate: new Date(dTrip.date).toISOString().split('T')[0] //YYYY-MM-DD
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, most recent first
};

/**
 * Returns attendance records for a specific daily trip and student.
 * @param {number} dailyTripId - The ID of the daily trip.
 * @param {number} studentId - The ID of the student.
 * @returns {Array<object>} - An array of attendance records.
 */
export const getAttendanceForDailyTripAndStudent = (dailyTripId, studentId) => {
  return demoData.attendances.filter(att => att.dailyTripId === dailyTripId && att.studentId === studentId);
};

/**
 * Adds or updates an attendance record.
 * @param {object} attendanceData - Data for the attendance record.
 * @returns {object} - The new or updated attendance record.
 */
export const saveAttendance = (attendanceData) => {
  const { dailyTripId, studentId, type, status, markedById } = attendanceData;
  const timestamp = new Date().toISOString();

  let existingAttendanceIndex = demoData.attendances.findIndex(att =>
    att.dailyTripId === dailyTripId && att.studentId === studentId && att.type === type
  );

  if (existingAttendanceIndex !== -1) {
    // Update existing record
    demoData.attendances[existingAttendanceIndex] = {
      ...demoData.attendances[existingAttendanceIndex],
      status,
      timestamp,
      markedById
    };
    return demoData.attendances[existingAttendanceIndex];
  } else {
    // Add new record
    const newId = Math.max(...demoData.attendances.map(att => att.id), 0) + 1;
    const newAttendance = {
      id: newId,
      dailyTripId,
      studentId,
      type,
      status,
      timestamp,
      markedById
    };
    demoData.attendances.push(newAttendance);
    return newAttendance;
  }
};

/**
 * Adds a new incident record.
 * @param {object} incidentData - Data for the incident record.
 * @returns {object} - The new incident record.
 */
export const addIncident = (incidentData) => {
  const newId = Math.max(...demoData.incidents.map(inc => inc.id), 0) + 1;
  const newIncident = {
    id: newId,
    timestamp: new Date().toISOString(),
    ...incidentData,
  };
  demoData.incidents.push(newIncident);
  return newIncident;
};

/**
 * Returns notifications for a specific user.
 * @param {number} userId - The ID of the user.
 * @returns {Array<object>} - An array of notification objects.
 */
export const getNotificationsForUser = (userId) => {
  return demoData.notifications.filter(notif => notif.userId === userId).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Marks a notification as read.
 * @param {number} notificationId - The ID of the notification.
 */
export const markNotificationAsRead = (notificationId) => {
  const index = demoData.notifications.findIndex(notif => notif.id === notificationId);
  if (index !== -1) {
    demoData.notifications[index].read = true;
  }
};

/**
 * Gets attendance count by status for a given daily trip.
 * @param {number} dailyTripId
 * @returns {object} { PRESENT: count, ABSENT: count }
 */
export const getAttendanceCountsForDailyTrip = (dailyTripId) => {
    const counts = {
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0, // Assuming LATE is a possible status, add if in enums
    };
    demoData.attendances
        .filter(att => att.dailyTripId === dailyTripId && att.type === 'DEPART') // Focus on DEPART for initial counts
        .forEach(att => {
            if (counts[att.status] !== undefined) {
                counts[att.status]++;
            }
        });
    return counts;
};

/**
 * Récupère un élève par son ID.
 * @param {number} studentId - L'ID de l'élève.
 * @returns {object | undefined} - L'objet élève ou undefined.
 */
export const getStudentById = (studentId) => {
  return demoData.students.find(student => student.id === studentId);
};

/**
 * Récupère les élèves associés à un parent.
 * @param {number} parentId - L'ID du parent.
 * @returns {Array<object>} - Un tableau d'objets élèves associés au parent.
 */
export const getChildrenOfParent = (parentId) => {
  const studentIds = demoData.parentStudents
    .filter(ps => ps.parentId === parentId)
    .map(ps => ps.studentId);
  return demoData.students.filter(student => studentIds.includes(student.id));
};

/**
 * Récupère le dernier trajet quotidien pour un élève (le plus récent ou le plus pertinent).
 * Ceci est une simplification. Dans un vrai système, cela serait plus complexe (trajet actuel, prochain trajet, etc.).
 * Pour la démo, nous prenons le dernier trajet quotidien auquel l'élève a été associé.
 *
 * @param {number} studentId - L'ID de l'élève.
 * @returns {object | undefined} - L'objet dailyTrip enrichi ou undefined.
 */
export const getLastDailyTripForStudent = (studentId) => {
  // Trouver tous les tripStudents qui incluent cet élève
  const tripsWithStudent = demoData.tripStudents.filter(ts => ts.studentId === studentId);

  if (tripsWithStudent.length === 0) {
    return undefined;
  }

  // Trouver tous les dailyTrips associés à ces trips
  const dailyTripsForStudent = demoData.dailyTrips.filter(dTrip =>
    tripsWithStudent.some(ts => ts.tripId === dTrip.tripId)
  );

  if (dailyTripsForStudent.length === 0) {
    return undefined;
  }

  // Trier par date pour obtenir le plus récent
  const latestDailyTrip = dailyTripsForStudent.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  // Enrichir le dailyTrip avec les détails du trip, bus, route, driver
  const trip = demoData.trips.find(t => t.id === latestDailyTrip.tripId);
  const bus = trip ? demoData.buses.find(b => b.id === trip.busId) : null;
  const route = trip ? demoData.routes.find(r => r.id === trip.routeId) : null;
  const driver = trip ? demoData.users.find(u => u.id === trip.driverId) : null;

  return {
    ...latestDailyTrip,
    trip: {
      ...trip,
      bus: bus,
      route: route,
      driver: driver,
    },
    displayDate: new Date(latestDailyTrip.date).toLocaleString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
  };
};

/**
 * Récupère l'historique de présence pour un élève.
 * @param {number} studentId - L'ID de l'élève.
 * @returns {Array<object>} - Un tableau d'objets de présence enrichis.
 */
export const getAttendanceHistoryForStudent = (studentId) => {
  return demoData.attendances
    .filter(att => att.studentId === studentId)
    .map(att => {
      const dailyTrip = demoData.dailyTrips.find(dt => dt.id === att.dailyTripId);
      const trip = dailyTrip ? demoData.trips.find(t => t.id === dailyTrip.tripId) : null;
      return {
        ...att,
        dailyTripName: dailyTrip ? (trip?.name || 'N/A') : 'N/A',
        dailyTripDate: dailyTrip ? new Date(dailyTrip.date).toLocaleDateString('fr-FR') : 'N/A',
        timestampFormatted: new Date(att.timestamp).toLocaleString('fr-FR'),
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Trier par date décroissante
};

/**
 * Ajoute un nouveau commentaire/préoccupation.
 * Dans un vrai système, ceci irait dans une nouvelle collection (ex: `concerns` ou `feedback`).
 * Pour la démo, nous allons le simuler en ajoutant une notification à un admin/responsable.
 * @param {object} concernData - Les données de la préoccupation (parentId, message, type, recipientId).
 */
export const addConcernOrFeedback = (concernData) => {
    try {
        const { parentId, message, type, title, recipientUserId } = concernData;
        
        // Validation des données requises
        if (!parentId || !message || !type || !title) {
            console.error("Données manquantes pour la préoccupation:", concernData);
            return false;
        }

        // Validation de la longueur du message
        if (message.trim().length < 5) {
            console.error("Message trop court pour la préoccupation");
            return false;
        }

        const newId = Math.max(...demoData.notifications.map(n => n.id), 0) + 1;

        // Trouver un admin ou responsable pour recevoir la notification
        const adminOrResponsible = demoData.users.find(u => u.role === 'ADMIN' || u.role === 'RESPONSIBLE');
        const actualRecipientId = recipientUserId || adminOrResponsible?.id;

        if (!actualRecipientId) {
            console.warn("Aucun admin ou responsable trouvé pour recevoir la notification de préoccupation.");
            return false;
        }

        const newNotification = {
            id: newId,
            userId: actualRecipientId, // L'ID de l'admin/responsable qui recevra la notification
            type: 'CONCERN', // Type de notification pour les préoccupations
            title: `Nouvelle Préoccupation (${type})`,
            message: message.trim(),
            read: false,
            timestamp: new Date().toISOString(),
            metadata: {
                parentId: parentId,
                concernType: type,
                originalTitle: title
            }
        };

        demoData.notifications.push(newNotification);
        console.log("Préoccupation ajoutée avec succès:", newNotification);
        return newNotification;
    } catch (error) {
        console.error("Erreur lors de l'ajout de la préoccupation:", error);
        return false;
    }
};
 
/**
 * Updates the status of a daily trip.
 * @param {number} dailyTripId - The ID of the daily trip.
 * @param {string} newStatus - The new status (e.g., 'ONGOING', 'COMPLETED', 'CANCELED').
 * @returns {object | undefined} - The updated daily trip object or undefined if not found.
 */
export const updateDailyTripStatus = (dailyTripId, newStatus) => {
  const index = demoData.dailyTrips.findIndex(dt => dt.id === dailyTripId);
  if (index !== -1) {
    if (demoData.enums.TripStatus.includes(newStatus)) {
      demoData.dailyTrips[index].status = newStatus;
      console.log(`Daily Trip ${dailyTripId} status updated to ${newStatus}`);
      return demoData.dailyTrips[index];
    } else {
      console.warn(`Invalid status: ${newStatus}. Must be one of ${demoData.enums.TripStatus.join(', ')}`);
      return undefined;
    }
  }
  return undefined;
};

/**
 * Adds a new position record for a daily trip.
 * @param {number} dailyTripId - The ID of the daily trip.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {object} - The new position record.
 */
export const addBusPosition = (dailyTripId, lat, lng) => {
  const newId = Math.max(...demoData.positions.map(p => p.id), 0) + 1;
  const newPosition = {
    id: newId,
    dailyTripId: dailyTripId,
    timestamp: new Date().toISOString(),
    lat: lat,
    lng: lng
  };
  demoData.positions.push(newPosition);
  console.log("New bus position added:", newPosition);
  return newPosition;
};

/**
 * Returns the most recent position for a given daily trip.
 * @param {number} dailyTripId - The ID of the daily trip.
 * @returns {object | undefined} - The latest position object or undefined.
 */
export const getLatestBusPosition = (dailyTripId) => {
  const tripPositions = demoData.positions.filter(p => p.dailyTripId === dailyTripId);
  if (tripPositions.length === 0) return undefined;
  return tripPositions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
};

// data-donne.js

// ... (vos données existantes)

// --- Nouvelles/Mises à jour des fonctions utilitaires pour le responsable d'établissement ---

/**
 * Récupère l'établissement associé à un responsable (manager).
 * @param {number} responsibleId - L'ID de l'utilisateur responsable.
 * @returns {object | undefined} - L'objet établissement ou undefined.
 */
export const getEstablishmentByResponsibleId = (responsibleId) => {
  return demoData.establishments.find(etab => etab.responsableId === responsibleId);
};

/**
* Récupère tous les utilisateurs d'un rôle donné pour un établissement spécifique.
* @param {string} role - Le rôle de l'utilisateur (ex: 'DRIVER', 'PARENT', 'STUDENT').
* @param {number} establishmentId - L'ID de l'établissement.
* @returns {Array<object>} - Un tableau d'utilisateurs.
*/
export const getUsersByRoleAndEstablishment = (role, establishmentId) => {
  // Note: Les élèves sont liés directement aux établissements
  // Les conducteurs/parents/responsables sont liés via les trajets ou n'ont pas de lien direct dans votre démo.
  // Cette fonction nécessiterait une structure plus robuste si les utilisateurs avaient un `establishmentId` direct.
  // Pour l'instant, nous filtrons par rôle. Pour les drivers/parents, le lien est indirect via les trips/students.

  if (role === 'STUDENT') {
      return demoData.students.filter(student => student.establishmentId === establishmentId);
  }

  // Pour DRIVER, PARENT, et autres rôles, on doit trouver les utilisateurs
  // qui ont des trips ou des étudiants associés à cet établissement.
  // C'est une simplification pour la démo:

  const usersInEstablishment = new Set();

  // Ajouter les drivers assignés à des trajets de cet établissement
  demoData.trips.forEach(trip => {
      if (trip.establishmentId === establishmentId && trip.driverId) {
          usersInEstablishment.add(trip.driverId);
      }
  });

  // Ajouter les parents dont les enfants sont dans cet établissement
  demoData.students.forEach(student => {
      if (student.establishmentId === establishmentId) {
          demoData.parentStudents.filter(ps => ps.studentId === student.id).forEach(ps => {
              usersInEstablishment.add(ps.parentId);
          });
      }
  });

  // Retourner les objets utilisateur correspondant aux IDs trouvés et au rôle
  return demoData.users.filter(user =>
      user.role === role && usersInEstablishment.has(user.id)
  );
};

/**
* Récupère tous les trajets (master trips) pour un établissement spécifique.
* @param {number} establishmentId - L'ID de l'établissement.
* @returns {Array<object>} - Un tableau d'objets trips.
*/
export const getTripsByEstablishment = (establishmentId) => {
  return demoData.trips.filter(trip => trip.establishmentId === establishmentId);
};

/**
* Récupère tous les arrêts pour un établissement spécifique (via ses routes).
* @param {number} establishmentId - L'ID de l'établissement.
* @returns {Array<object>} - Un tableau d'objets stops.
*/
export const getStopsByEstablishment = (establishmentId) => {
  const establishmentRoutes = demoData.routes.filter(route => route.establishmentId === establishmentId);
  const stopIds = new Set();
  establishmentRoutes.forEach(route => {
      demoData.stops.filter(stop => stop.routeId === route.id).forEach(stop => stopIds.add(stop.id));
  });
  return Array.from(stopIds).map(id => demoData.stops.find(stop => stop.id === id));
};


/**
* Récupère tous les incidents pour un établissement (via ses dailyTrips).
* @param {number} establishmentId - L'ID de l'établissement.
* @returns {Array<object>} - Un tableau d'objets incidents enrichis.
*/
export const getIncidentsByEstablishment = (establishmentId) => {
  const establishmentDailyTrips = getDailyTripsByEstablishment(establishmentId);
  const incidentDailyTripIds = new Set(establishmentDailyTrips.map(dt => dt.id));

  return demoData.incidents.filter(inc => incidentDailyTripIds.has(inc.dailyTripId))
      .map(incident => {
          const dailyTrip = demoData.dailyTrips.find(dt => dt.id === incident.dailyTripId);
          const trip = dailyTrip ? demoData.trips.find(t => t.id === dailyTrip.tripId) : null;
          const reportedByUser = demoData.users.find(user => user.id === incident.reportedById);

          return {
              ...incident,
              dailyTripName: dailyTrip ? (trip?.name || 'N/A') : 'N/A',
              dailyTripDate: dailyTrip ? new Date(dailyTrip.date).toLocaleDateString() : 'N/A',
              reportedByName: reportedByUser ? reportedByUser.fullname : 'Utilisateur Inconnu',
              timestampFormatted: new Date(incident.timestamp).toLocaleString(),
          };
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
* Récupère tous les incidents du système (pour les admins).
* @returns {Array<object>} - Un tableau de tous les objets incidents enrichis.
*/
export const getAllIncidents = () => {
  return demoData.incidents.map(incident => {
      const dailyTrip = demoData.dailyTrips.find(dt => dt.id === incident.dailyTripId);
      const trip = dailyTrip ? demoData.trips.find(t => t.id === dailyTrip.tripId) : null;
      const reportedByUser = demoData.users.find(user => user.id === incident.reportedById);
      const establishment = trip ? demoData.establishments.find(est => est.id === trip.establishmentId) : null;

      return {
          ...incident,
          dailyTripName: dailyTrip ? (trip?.name || 'N/A') : 'N/A',
          dailyTripDate: dailyTrip ? new Date(dailyTrip.date).toLocaleDateString() : 'N/A',
          reportedByName: reportedByUser ? reportedByUser.fullname : 'Utilisateur Inconnu',
          establishmentName: establishment ? establishment.name : 'N/A',
          timestampFormatted: new Date(incident.timestamp).toLocaleString(),
      };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
* Met à jour le statut d'un incident.
* @param {number} incidentId - L'ID de l'incident.
* @param {string} newStatus - Le nouveau statut ('NEW', 'ACKNOWLEDGED', 'RESOLVED').
* @returns {boolean} - True si la mise à jour a réussi, false sinon.
*/
export const updateIncidentStatus = (incidentId, newStatus) => {
  const incidentIndex = demoData.incidents.findIndex(inc => inc.id === incidentId);
  if (incidentIndex !== -1) {
    demoData.incidents[incidentIndex].status = newStatus;
    console.log(`Incident ${incidentId} status updated to ${newStatus}`);
    return true;
  }
  console.log(`Incident ${incidentId} not found for status update.`);
  return false;
};

/**
* Supprime un incident.
* @param {number} incidentId - L'ID de l'incident à supprimer.
* @returns {boolean} - True si la suppression a réussi, false sinon.
*/
export const deleteIncident = (incidentId) => {
  const incidentIndex = demoData.incidents.findIndex(inc => inc.id === incidentId);
  if (incidentIndex !== -1) {
    demoData.incidents.splice(incidentIndex, 1);
    console.log(`Incident ${incidentId} deleted successfully`);
    return true;
  }
  console.log(`Incident ${incidentId} not found for deletion.`);
  return false;
};

/**
* Supprime une notification.
* @param {number} notificationId - L'ID de la notification à supprimer.
* @returns {boolean} - True si la suppression a réussi, false sinon.
*/
export const deleteNotification = (notificationId) => {
  const notificationIndex = demoData.notifications.findIndex(notif => notif.id === notificationId);
  if (notificationIndex !== -1) {
    demoData.notifications.splice(notificationIndex, 1);
    console.log(`Notification ${notificationId} deleted successfully`);
    return true;
  }
  console.log(`Notification ${notificationId} not found for deletion.`);
  return false;
};

// data-donne.js

// ... (existing code)

/**
 * Récupère tous les dailyTrips pour un établissement spécifique.
 * @param {number} establishmentId - L'ID de l'établissement.
 * @param {string | null} dateString - Filtre optionnel par date (YYYY-MM-DD).
 * @returns {Array<object>} - Un tableau d'objets dailyTrips enrichis.
 */
export const getDailyTripsByEstablishment = (establishmentId, dateString = null) => {
  const establishmentTrips = demoData.trips.filter(trip => trip.establishmentId === establishmentId);
  let dailyTripsForEstablishment = demoData.dailyTrips.filter(dTrip =>
      establishmentTrips.some(trip => trip.id === dTrip.tripId)
  );

  if (dateString) {
      dailyTripsForEstablishment = dailyTripsForEstablishment.filter(dTrip =>
          new Date(dTrip.date).toISOString().split('T')[0] === dateString
      );
  }

  return dailyTripsForEstablishment.map(dTrip => {
      const trip = establishmentTrips.find(t => t.id === dTrip.tripId);
      const bus = trip ? demoData.buses.find(b => b.id === trip.busId) : null;
      const route = trip ? demoData.routes.find(r => r.id === trip.routeId) : null;
      // CRUCIAL ADDITION: Get stops for the route and include them
      const stops = route ? demoData.stops.filter(s => s.routeId === route.id).sort((a,b) => a.stopOrder - b.stopOrder) : [];

      const driver = trip && trip.driverId ? demoData.users.find(u => u.id === trip.driverId) : null;

      return {
          ...dTrip,
          trip: {
              ...trip,
              bus: bus,
              route: { // Embed route details including stops
                  ...route,
                  stops: stops // <--- THIS LINE IS CRUCIAL
              },
              driver: driver
          },
          displayDate: new Date(dTrip.date).toLocaleString('fr-FR', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          }),
          simpleDate: new Date(dTrip.date).toISOString().split('T')[0]
      };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Récupère toutes les routes pour un établissement spécifique.
 * @param {number} establishmentId - L'ID de l'établissement.
 * @returns {Array<object>} - Un tableau d'objets routes.
 */
export const getRoutesByEstablishment = (establishmentId) => {
  return demoData.routes.filter(route => route.establishmentId === establishmentId);
};
/**
 * Filters the list of buses from demoData by a given establishment ID.
 *
 * @param {number} establishmentId - The ID of the establishment to filter buses by.
 * @returns {Array} An array of bus objects belonging to the specified establishment.
 */
export function getBusesByEstablishment(establishmentId) {
  // Ensure demoData and demoData.buses exist and is an array
  if (!demoData || !Array.isArray(demoData.buses)) {
    console.error("Error: demoData or demoData.buses is not correctly structured in data/data.js");
    return [];
  }

  // Filter buses where establishmentId matches the provided ID
  const busesForEstablishment = demoData.buses.filter(
    (bus) => bus.establishmentId === establishmentId
  );

  return busesForEstablishment;
}
/**
 * Retrieves a user by their ID from the mock data.
 * @param {number} userId - The ID of the user to retrieve.
 * @returns {object | undefined} The user object, or undefined if not found.
 */
export function getUserById(userId) {
  console.log(`Fetching user with ID: ${userId}`);
  return demoData.users.find(user => user.id === userId);
}

/**
 * Updates a user's data in the mock data.
 * @param {number} userId - The ID of the user to update.
 * @param {object} newData - The new data to merge with the existing user data.
 * @returns {boolean} True if update was successful, false otherwise.
 */
export function updateUserData(userId, newData) {
  const userIndex = demoData.users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    // Only update allowed fields for demo, or filter based on role in real app
    demoData.users[userIndex] = {
      ...demoData.users[userIndex],
      fullname: newData.fullname !== undefined ? newData.fullname : demoData.users[userIndex].fullname,
      email: newData.email !== undefined ? newData.email : demoData.users[userIndex].email,
      phone: newData.phone !== undefined ? newData.phone : demoData.users[userIndex].phone,
      address: newData.address !== undefined ? newData.address : demoData.users[userIndex].address, // if you add address
      notificationEnabled: newData.notificationEnabled !== undefined ? newData.notificationEnabled : demoData.users[userIndex].notificationEnabled, // if you add notificationEnabled
      cin: newData.cin !== undefined ? newData.cin : demoData.users[userIndex].cin,
      isActive: newData.isActive !== undefined ? newData.isActive : demoData.users[userIndex].isActive,
    };
    console.log(`User ${userId} updated:`, demoData.users[userIndex]);
    return true;
  }
  console.log(`User ${userId} not found for update.`);
  return false;
}

/**
 * Mock function to update a user's password.
 * In a real app, this would involve hashing and secure storage.
 * @param {number} userId - The ID of the user whose password to update.
 * @param {string} newPassword - The new password.
 * @returns {boolean} True if password update was successful, false otherwise.
 */
export function updateUserPassword(userId, newPassword) {
  const userIndex = demoData.users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    // For demo, we are just "updating" it. In a real app, hash and store.
    demoData.users[userIndex].password = `$2a$10$new_hashed_password_for_${newPassword}`; // Simulate hashing
    console.log(`Password for user ${userId} updated (mock).`);
    return true;
  }
  console.log(`User ${userId} not found for password update.`);
  return false;
}
// data/data.js

// ... (keep your existing demoData structure and other exports)

// Add new data for payments specifically if needed, or derive from existing
// For this example, we'll derive payments from subscriptions and schools.
// You might want a separate 'payments' array in your demoData if it's not
// directly a 1-to-1 mapping with subscriptions over time.

/**
 * Generates mock payment data based on subscriptions and schools.
 * In a real application, this would fetch from a backend API.
 * @returns {Array<object>} An array of payment objects.
 */
export function getPaymentsData() {
  const payments = [];
  const today = new Date();

  demoData.subscriptions.forEach((sub, index) => {
    const school = demoData.schools.find(s => s.id === sub.schoolId);
    if (!school) {
      console.warn(`School with ID ${sub.schoolId} not found for subscription ID ${sub.id}`);
      return;
    }

    // Simulate different payment statuses and dates
    let status = 'Completed';
    let paymentDate = new Date(sub.startDate);
    let dueDate = new Date(sub.endDate);
    let description = `Subscription fee for ${new Date(sub.startDate).getFullYear()}-${new Date(sub.endDate).getFullYear()}`;
    let method = index % 2 === 0 ? 'Bank Transfer' : 'Credit Card'; // Alternate methods

    // Add some variability for demo purposes
    if (index === 0) { // First subscription is pending or upcoming
      status = 'Upcoming';
      paymentDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Next month
      dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 15);
    } else if (index === 1) { // Second subscription might be overdue
        status = 'Overdue';
        paymentDate = new Date(today.getFullYear(), today.getMonth() - 2, 1); // 2 months ago
        dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1); // Due last month
    } else if (index === 2) { // Simulate a failed payment
        status = 'Failed';
        paymentDate = new Date(today.getFullYear(), today.getMonth() - 1, 10);
        dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 20);
        method = 'Credit Card';
    } else { // Default to completed for other subscriptions
        status = 'Completed';
        paymentDate = new Date(sub.startDate); // Use actual start date
        dueDate = new Date(sub.endDate); // Use actual end date
    }


    payments.push({
      id: `PAY-${sub.id}-${index}`, // Unique ID for payment, distinct from subscription ID
      school: school.name,
      amount: sub.amount,
      date: paymentDate.toISOString().split('T')[0], // YYYY-MM-DD
      dueDate: dueDate.toISOString().split('T')[0], // YYYY-MM-DD
      status: status,
      method: method,
      invoiceNumber: `INV-${String(sub.id).padStart(3, '0')}-${paymentDate.getFullYear()}`,
      description: description
    });
  });

  return payments;
}

 /**
 * Generates aggregated data for charts based on payment data.
 * @param {Array} payments - The array of payment objects.
 * @param {Array} schools - The array of school objects.
 * @returns {object} An object containing data formatted for various charts.
 */
export function getChartData(payments, schools) {
  // 1. Total Revenue by School (for Bar Chart)
  const revenueBySchoolMap = new Map();
  payments.forEach(payment => {
    revenueBySchoolMap.set(payment.school, (revenueBySchoolMap.get(payment.school) || 0) + payment.amount);
  });
  const revenueBySchool = Array.from(revenueBySchoolMap.entries()).map(([schoolName, amount]) => ({
    x: schoolName,
    y: amount
  }));

  // 2. Payment Status Distribution (for Donut Chart)
  const statusDistributionMap = new Map();
  payments.forEach(payment => {
    statusDistributionMap.set(payment.status, (statusDistributionMap.get(payment.status) || 0) + 1);
  });
  const statusSeries = Array.from(statusDistributionMap.values());
  const statusLabels = Array.from(statusDistributionMap.keys());

  // 3. Monthly Payment Trends (for Area Chart)
  const monthlyTrendsMap = new Map();
  payments.forEach(payment => {
    // Assuming date is in 'YYYY-MM-DD' format
    const yearMonth = payment.date.substring(0, 7); // 'YYYY-MM'
    monthlyTrendsMap.set(yearMonth, (monthlyTrendsMap.get(yearMonth) || 0) + payment.amount);
  });

  // Sort months chronologically for the chart
  const sortedMonths = Array.from(monthlyTrendsMap.keys()).sort();
  const monthlySeries = sortedMonths.map(month => monthlyTrendsMap.get(month));

  return {
    revenueBySchool: revenueBySchool,
    statusDistribution: {
      series: statusSeries,
      labels: statusLabels
    },
    monthlyTrends: {
      categories: sortedMonths,
      series: [{ name: 'Amount', data: monthlySeries }]
    }
  };
}

// data/data.js

// ... (KEEP YOUR EXISTING demoData AND FUNCTIONS LIKE getUserById, updateUserData, etc.)

// --- New functions for Reports Dashboard Data ---

/**
 * Calculates active and inactive school counts.
 * @param {Array} schools - The array of school objects from demoData.
 * @returns {{active: number, inactive: number}} Counts of active and inactive schools.
 */
export function getSchoolStatusData(schools) {
  const activeSchools = schools.filter(school => school.isActive).length;
  const inactiveSchools = schools.length - activeSchools;
  return { active: activeSchools, inactive: inactiveSchools };
}

/**
 * Aggregates attendance data (present, absent, late) for a given period.
 * This is a simplified mock; real data would require date-based filtering.
 * @param {Array} attendances - The array of attendance records.
 * @param {string} dateRange - 'week', 'month', 'quarter', 'year' (for future use).
 * @param {number} schoolId - Optional school ID to filter by.
 * @returns {Array<object>} Formatted data for attendance chart.
 */
export function getAttendanceOverviewData(attendances, students, dailyTrips, trips, dateRange = 'month', schoolId = 'all') {
  // Simplified mock: group by status. In a real app, you'd aggregate by date or specific criteria.
  const statusCounts = { PRESENT: 0, ABSENT: 0, LATE: 0 };

  const today = new Date();
  const filterDate = new Date();
  // Adjust filterDate based on dateRange
  if (dateRange === 'week') filterDate.setDate(today.getDate() - 7);
  else if (dateRange === 'month') filterDate.setMonth(today.getMonth() - 1);
  else if (dateRange === 'quarter') filterDate.setMonth(today.getMonth() - 3);
  else if (dateRange === 'year') filterDate.setFullYear(today.getFullYear() - 1);

  attendances.forEach(att => {
    const dailyTrip = dailyTrips.find(dt => dt.id === att.dailyTripId);
    if (!dailyTrip) return;

    const trip = trips.find(t => t.id === dailyTrip.tripId);
    if (schoolId !== 'all' && trip && demoData.establishments.find(e => e.id === trip.establishmentId)?.schoolId !== schoolId) {
        return; // Skip if not for the selected school
    }

    const attendanceDate = new Date(att.timestamp);
    if (attendanceDate >= filterDate && statusCounts.hasOwnProperty(att.status)) {
      statusCounts[att.status]++;
    }
  });

  return [
    { name: 'Present', value: statusCounts.PRESENT },
    { name: 'Absent', value: statusCounts.ABSENT },
    { name: 'Late', value: statusCounts.LATE }
  ];
}


/**
 * Aggregates bus utilization data.
 * @param {Array} buses - The array of bus objects.
 * @param {Array} trips - The array of trip objects.
 * @param {Array} dailyTrips - The array of daily trip objects.
 * @param {string} dateRange - 'week', 'month', etc.
 * @param {number} schoolId - Optional school ID to filter by.
 * @returns {Array<object>} Formatted data for bus utilization chart.
 */
export function getBusUtilizationData(buses, trips, dailyTrips, dateRange = 'month', schoolId = 'all') {
    const busUsage = new Map(); // busId -> count of daily trips
    const today = new Date();
    const filterDate = new Date();
    if (dateRange === 'week') filterDate.setDate(today.getDate() - 7);
    else if (dateRange === 'month') filterDate.setMonth(today.getMonth() - 1);

    dailyTrips.forEach(dt => {
        const trip = trips.find(t => t.id === dt.tripId);
        if (!trip || !trip.busId) return;

        if (schoolId !== 'all' && demoData.establishments.find(e => e.id === trip.establishmentId)?.schoolId !== schoolId) {
            return; // Skip if not for the selected school
        }

        const dailyTripDate = new Date(dt.date);
        if (dailyTripDate >= filterDate) {
            busUsage.set(trip.busId, (busUsage.get(trip.busId) || 0) + 1);
        }
    });

    const result = buses.map(bus => {
        const usageCount = busUsage.get(bus.id) || 0;
        // Simple mock utilization: Higher usage count means higher utilization %
        // In a real app, this would be (actual_hours_used / available_hours) * 100
        const utilization = Math.min(100, (usageCount / 5) * 10); // Scale 0-100 based on some base
        return { name: bus.plateNumber, utilization: parseFloat(utilization.toFixed(2)) };
    });

    // Filter out buses not relevant to selected school if any
    if (schoolId !== 'all') {
        const relevantBusIds = buses.filter(bus => {
            const establishment = demoData.establishments.find(e => e.id === bus.establishmentId);
            return establishment && establishment.schoolId === schoolId;
        }).map(b => b.id);
        return result.filter(item => relevantBusIds.includes(buses.find(b => b.plateNumber === item.name)?.id));
    }

    return result;
}


/**
 * Aggregates incidents data by month.
 * @param {Array} incidents - The array of incident records.
 * @param {string} dateRange - 'week', 'month', etc.
 * @param {number} schoolId - Optional school ID to filter by.
 * @returns {Array<object>} Formatted data for incidents chart.
 */
export function getIncidentsReportData(incidents, dailyTrips, trips, dateRange = 'month', schoolId = 'all') {
    const monthlyIncidents = new Map(); // 'YYYY-MM' -> count
    const today = new Date();
    const filterDate = new Date();
    if (dateRange === 'week') filterDate.setDate(today.getDate() - 7);
    else if (dateRange === 'month') filterDate.setMonth(today.getMonth() - 1);
    else if (dateRange === 'quarter') filterDate.setMonth(today.getMonth() - 3);
    else if (dateRange === 'year') filterDate.setFullYear(today.getFullYear() - 1);

    incidents.forEach(inc => {
        const dailyTrip = dailyTrips.find(dt => dt.id === inc.dailyTripId);
        if (!dailyTrip) return;

        const trip = trips.find(t => t.id === dailyTrip.tripId);
        if (schoolId !== 'all' && trip && demoData.establishments.find(e => e.id === trip.establishmentId)?.schoolId !== schoolId) {
            return; // Skip if not for the selected school
        }

        const incidentDate = new Date(inc.timestamp);
        if (incidentDate >= filterDate) {
            const yearMonth = incidentDate.toISOString().substring(0, 7); // YYYY-MM
            monthlyIncidents.set(yearMonth, (monthlyIncidents.get(yearMonth) || 0) + 1);
        }
    });

    // Prepare data for ApexCharts: { x: 'Month', y: Count }
    const sortedMonths = Array.from(monthlyIncidents.keys()).sort();
    return sortedMonths.map(month => ({
        x: month,
        y: monthlyIncidents.get(month)
    }));
}


/**
 * Aggregates route distribution data.
 * @param {Array} routes - The array of route objects.
 * @param {Array} trips - The array of trip objects.
 * @param {Array} tripStudents - The array of trip-student relationships.
 * @param {number} schoolId - Optional school ID to filter by.
 * @returns {Array<object>} Formatted data for route distribution chart.
 */
export function getRouteDistributionData(routes, trips, tripStudents, schoolId = 'all') {
    const studentsPerRoute = new Map(); // routeId -> count of unique students

    trips.forEach(trip => {
        if (schoolId !== 'all' && demoData.establishments.find(e => e.id === trip.establishmentId)?.schoolId !== schoolId) {
            return; // Skip if not for the selected school
        }

        const uniqueStudentsInTrip = new Set(tripStudents
            .filter(ts => ts.tripId === trip.id)
            .map(ts => ts.studentId));

        studentsPerRoute.set(trip.routeId, (studentsPerRoute.get(trip.routeId) || 0) + uniqueStudentsInTrip.size);
    });

    const result = routes.map(route => {
        const studentCount = studentsPerRoute.get(route.id) || 0;
        return { name: route.name, value: studentCount };
    });

    // Filter out routes not relevant to selected school if any
    if (schoolId !== 'all') {
        const relevantRouteIds = routes.filter(route => {
            const establishment = demoData.establishments.find(e => e.id === route.establishmentId);
            return establishment && establishment.schoolId === schoolId;
        }).map(r => r.id);
        return result.filter(item => relevantRouteIds.includes(routes.find(r => r.name === item.name)?.id));
    }

    return result.filter(item => item.value > 0); // Only show routes with students
}


/**
 * Gets summary card data.
 * @param {object} demoData - The full demoData object.
 * @param {string} dateRange - The selected date range.
 * @param {number|string} schoolId - The selected school ID.
 * @returns {object} Summary card data.
 */
export function getSummaryCardData(demoData, dateRange = 'month', schoolId = 'all') {
  // Declare all variables at the top of the function scope with 'let'
  let totalStudents = 0; // Initialize
  let activeBuses = 0;    // Initialize
  let activeRoutes = 0;   // Initialize
  let incidentsCount = 0; // Initialize

  const today = new Date();
  let startDate = new Date();
  let previousStartDate = new Date();

  // Determine current period start date based on dateRange
  switch (dateRange) {
      case 'week':
          startDate.setDate(today.getDate() - 7);
          previousStartDate.setDate(today.getDate() - 14); // Previous week
          break;
      case 'month':
          startDate.setMonth(today.getMonth() - 1);
          startDate.setDate(1); // Start of last month
          previousStartDate.setMonth(today.getMonth() - 2);
          previousStartDate.setDate(1); // Start of month before last
          break;
      case 'quarter':
          startDate.setMonth(today.getMonth() - 3);
          startDate.setDate(1);
          previousStartDate.setMonth(today.getMonth() - 6);
          previousStartDate.setDate(1);
          break;
      case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          startDate.setMonth(0);
          startDate.setDate(1);
          previousStartDate.setFullYear(today.getFullYear() - 2);
          previousStartDate.setMonth(0);
          previousStartDate.setDate(1);
          break;
      default: // Default to current month for simplicity if dateRange is unknown
          startDate.setDate(1);
          previousStartDate.setMonth(today.getMonth() - 1);
          previousStartDate.setDate(1);
          break;
  }

  // Filter data by school if schoolId is not 'all'
  let relevantEstablishmentIds = [];
  if (schoolId !== 'all') {
      relevantEstablishmentIds = demoData.establishments
          .filter(e => e.schoolId === parseInt(schoolId))
          .map(e => e.id);
  }

  // --- Calculate total students ---
  if (schoolId !== 'all') {
      totalStudents = demoData.students.filter(s => relevantEstablishmentIds.includes(s.establishmentId)).length;
  } else {
      totalStudents = demoData.students.length;
  }

  // --- Calculate active buses ---
  if (schoolId !== 'all') {
      activeBuses = demoData.buses.filter(b => relevantEstablishmentIds.includes(b.establishmentId)).length;
  } else {
      activeBuses = demoData.buses.length;
  }

  // --- Calculate active routes ---
  if (schoolId !== 'all') {
      activeRoutes = demoData.routes.filter(r => relevantEstablishmentIds.includes(r.establishmentId)).length;
  } else {
      activeRoutes = demoData.routes.length;
  }

  // --- Calculate incidents for current and previous period ---
  const filterIncidentsByPeriod = (incidents, periodStart, currentSchoolId, relevantEstIds) => {
      const periodEnd = today; // Current date
      return incidents.filter(inc => {
          const dailyTrip = demoData.dailyTrips.find(dt => dt.id === inc.dailyTripId);
          if (!dailyTrip) return false;
          const trip = demoData.trips.find(t => t.id === dailyTrip.tripId);
          if (!trip) return false;

          if (currentSchoolId !== 'all') {
              const establishment = demoData.establishments.find(e => e.id === trip.establishmentId);
              if (!establishment || !relevantEstIds.includes(establishment.id)) return false;
          }

          const incidentDate = new Date(inc.timestamp);
          return incidentDate >= periodStart && incidentDate <= periodEnd;
      }).length;
  };

  incidentsCount = filterIncidentsByPeriod(demoData.incidents, startDate, schoolId, relevantEstablishmentIds);
  const previousIncidentsCount = filterIncidentsByPeriod(demoData.incidents, previousStartDate, schoolId, relevantEstablishmentIds);


  // --- Dynamic Trend Calculation (Simplified) ---
  const calculateTrend = (currentValue, previousValue) => {
      if (previousValue === 0) {
          if (currentValue > 0) {
               return { value: 'New', color: 'text-green-600', icon: 'TrendingUp' };
          }
          return { value: '0%', color: 'text-gray-500', icon: 'TrendingUp' };
      }
      const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
      const formattedChange = Math.abs(percentageChange).toFixed(0);
      if (percentageChange > 0) {
          return { value: `${formattedChange}%`, color: 'text-green-600', icon: 'TrendingUp' };
      } else if (percentageChange < 0) {
          return { value: `${formattedChange}%`, color: 'text-red-600', icon: 'TrendingDown' };
      } else {
          return { value: '0%', color: 'text-gray-500', icon: 'TrendingUp' };
      }
  };

  const mockPreviousStudents = totalStudents > 0 ? totalStudents * 0.9 : 0;
  const mockPreviousBuses = activeBuses > 0 ? activeBuses * 0.95 : 0;
  const mockPreviousRoutes = activeRoutes > 0 ? activeRoutes * 0.98 : 0;


  return {
      totalStudents: totalStudents,
      studentTrend: calculateTrend(totalStudents, mockPreviousStudents),
      activeBuses: activeBuses,
      busTrend: calculateTrend(activeBuses, mockPreviousBuses),
      activeRoutes: activeRoutes,
      routeTrend: calculateTrend(activeRoutes, mockPreviousRoutes),
      incidentsThisMonth: incidentsCount,
      incidentTrend: calculateTrend(incidentsCount, previousIncidentsCount),
  };
}


 