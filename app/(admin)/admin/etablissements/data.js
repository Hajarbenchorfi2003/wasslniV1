// Exemple de données mockées (tu peux en mettre plus)
export const mockEtablissements = [
  {
    id: 1,
    name: 'Lycée Al Qods',
    email: 'al.qods@example.com',
    type: 'Privé',
    city: 'Casablanca',
    isActive: true,
    schoolId: "2",
    director: {
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      phone: '0601010101'
    },
    buses: [/* liste des bus associés */]
  },
  
  {
    id: 2,
    name: "Lycée Khawarizmi",
    address: "Rue 2, Casablanca",
    phone: "0600000002",
    email: "khawarizmi@lycee.ma",
    schoolId: "2",
  },
];
