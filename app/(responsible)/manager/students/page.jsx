// pages/manager/StudentsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { demoData as initialDemoData, getStudentsByEstablishment, getUserById } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser } from '@/components/models/ModalUser'; // Assuming a generic ModalUser or ModalStudent
import StudentCard from './StudentCard'; // Le nouveau composant StudentCard

// Composants Shadcn/ui pour les filtres et le layout
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6; // Affichera 6 étudiants par page (ex: 2 lignes de 3 cartes)

// Ce composant est conçu pour être utilisé par un gestionnaire d'établissement,
// il attend donc `managerEstablishmentId` comme prop.
export const StudentsPage = ({ managerEstablishmentId }) => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [students, setStudents] = useState([]); // Liste des étudiants après enrichissement et filtrage initial par établissement
  const [filteredStudents, setFilteredStudents] = useState([]); // Liste des étudiants après application du filtre de recherche
  const [isModalOpen, setIsModalOpen] = useState(false); // État de visibilité de la modale d'ajout/modification
  const [editingUser, setEditingUser] = useState(null); // Utilisateur en cours d'édition (null si ajout)
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche

  // Utilise l'ID de l'établissement du gestionnaire. Si non fourni, simule avec l'ID 1.
  const effectiveManagerEstablishmentId = managerEstablishmentId || 1;
  const establishmentName = currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)?.name || 'Votre Établissement';


  // Effet pour enrichir les étudiants et les filtrer par établissement
  useEffect(() => {
    if (!effectiveManagerEstablishmentId) {
      setStudents([]); // Pas d'ID d'établissement, pas d'étudiants
      return;
    }

    const fetchedStudents = currentDemoData.students.filter(student =>
        student.establishmentId === effectiveManagerEstablishmentId // Filtre initial par établissement
    );

    let enrichedStudents = fetchedStudents.map(student => {
      // Enrichir avec le nom des parents
      const parentLinks = currentDemoData.parentStudents.filter(ps => ps.studentId === student.id);
      const parentNames = parentLinks.map(pl => {
          const parent = getUserById(pl.parentId);
          return parent ? parent.fullname : '';
      }).filter(Boolean).join(', ') || 'N/A'; // Join multiple parent names

      return {
        ...student,
        parentNames: parentNames, // Multiple parent names
      };
    });

    setStudents(enrichedStudents); // Store the fully enriched and establishment-filtered list
    setCurrentPage(1); // Reset pagination on data change
  }, [currentDemoData, effectiveManagerEstablishmentId]);

  // Effet pour appliquer le filtre de recherche et gérer la pagination.
  useEffect(() => {
    let tempFilteredStudents = [...students]; // Commence avec la liste déjà filtrée par établissement

    // Applique le filtre de recherche (par nom, classe, quartier, adresse, parent name)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredStudents = tempFilteredStudents.filter(student =>
        student.fullname.toLowerCase().includes(lowerCaseSearchTerm) ||
        student.class.toLowerCase().includes(lowerCaseSearchTerm) ||
        student.quartie.toLowerCase().includes(lowerCaseSearchTerm) ||
        student.address.toLowerCase().includes(lowerCaseSearchTerm) ||
        (student.parentNames && student.parentNames.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredStudents(tempFilteredStudents); // Met à jour la liste filtrée finale

    const newTotalPages = Math.ceil(tempFilteredStudents.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredStudents.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredStudents.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [students, searchTerm, currentPage]); // Dépendencies

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditStudent = (student) => {
    // Note: You might need to refine the data structure passed to ModalUser if it's generic
    // or create a specific ModalStudent component for student-specific fields.
    setEditingUser(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id) => {
    try {
      const studentToDelete = currentDemoData.students.find(s => s.id === id);
      if (!studentToDelete) {
        toast.error("Étudiant non trouvé pour suppression.");
        return;
      }

      // Instead of hard delete, maybe soft delete (set deletedAt property)
      const updatedStudents = currentDemoData.students.map(s =>
        s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s
      );

      // Disassociate from trips and attendances if needed (logical cleanup)
      // For demo, we'll mark as deleted, actual disassociation might be more complex
      const updatedTripStudents = currentDemoData.tripStudents.filter(ts => ts.studentId !== id);
      const updatedAttendances = currentDemoData.attendances.filter(att => att.studentId !== id);


      setCurrentDemoData(prevData => ({
        ...prevData,
        students: updatedStudents,
        tripStudents: updatedTripStudents,
        attendances: updatedAttendances,
      }));

      toast.success(`Étudiant ${studentToDelete.fullname} marqué comme supprimé (inactif).`);
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Erreur lors de la suppression de l\'étudiant');
    }
  };

  const handleSaveStudent = async (userData) => {
    try {
      let message = '';
      let updatedStudentsArray = [...currentDemoData.students];
      let updatedParentStudentsArray = [...currentDemoData.parentStudents]; // For linking parents

      if (editingUser) { // Mode édition
        const index = updatedStudentsArray.findIndex(s => s.id === editingUser.id);
        if (index !== -1) {
          const studentToUpdate = updatedStudentsArray[index];
          const updatedStudent = {
            ...studentToUpdate,
            ...userData,
            id: editingUser.id,
            // Ensure establishmentId is preserved
            establishmentId: studentToUpdate.establishmentId, // Preserve original establishment
            deletedAt: null, // Ensure active if re-enrolled
          };
          updatedStudentsArray[index] = updatedStudent;
          message = 'Étudiant modifié avec succès';

          // Update parent-student link: assuming userData.parentIds is an array of selected parent IDs
          updatedParentStudentsArray = updatedParentStudentsArray.filter(ps => ps.studentId !== updatedStudent.id);
          if (userData.parentIds && Array.isArray(userData.parentIds)) {
              userData.parentIds.forEach(parentId => {
                  updatedParentStudentsArray.push({ studentId: updatedStudent.id, parentId: parseInt(parentId) });
              });
          }

        } else {
          throw new Error("Étudiant à modifier non trouvé.");
        }
      } else { // Mode ajout
        const newId = Math.max(...currentDemoData.students.map(s => s.id), 0) + 1;
        const newStudent = {
          ...userData,
          id: newId,
          createdAt: new Date().toISOString(),
          establishmentId: effectiveManagerEstablishmentId, // Assign to manager's establishment
          deletedAt: null,
        };
        updatedStudentsArray.push(newStudent);
        message = 'Étudiant ajouté avec succès';

        // Add parent-student link for new student
        if (userData.parentIds && Array.isArray(userData.parentIds)) {
            userData.parentIds.forEach(parentId => {
                updatedParentStudentsArray.push({ studentId: newId, parentId: parseInt(parentId) });
            });
        }
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        students: updatedStudentsArray,
        parentStudents: updatedParentStudentsArray, // Update parent-student relations
      }));

      toast.success(message);
      setIsModalOpen(false);
      setEditingUser(null);

    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Helper for ModalUser to filter roles (if it's generic user modal)
  const allParents = currentDemoData.users.filter(user => user.role === 'PARENT');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Étudiants de {establishmentName}
        </h2>
        {/* Add Student Button */}
        <Button onClick={() => {
          setEditingUser(null); // Ensure no previous editing state
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Étudiant
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom, classe, quartier ou parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {/* No establishment filter needed as it's scope to manager's establishment */}
      </div>

      {/* Modal for adding/editing a student. You might need a specific ModalStudent component */}
      {/* For now, assuming ModalUser can be adapted or you'll create ModalStudent later */}
      <ModalUser
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveStudent}
        role="STUDENT" // Specify role
        establishments={[]} // Not directly used for student's establishment, it's fixed
        parents={allParents} // Pass parents for selection if student form includes parent linking
        fixedEstablishmentId={effectiveManagerEstablishmentId} // Force new/edited students to manager's establishment
      />


      {/* Main content area: Grid of Student Cards */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:user-group" className="h-6 w-6 text-primary" />
            Liste des Étudiants
          </CardTitle>
          <CardDescription>
            Nombre total d'élèves filtrés: {filteredStudents.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paginatedStudents.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onEditStudent={handleEditStudent}
                  onDeleteStudent={handleDeleteStudent}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Aucun Étudiant trouvé.</p>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center mt-4 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={`page-${page}`}
              onClick={() => handlePageChange(page)}
              variant={page === currentPage ? "default" : "outline"}
              className={cn("w-8 h-8")}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;