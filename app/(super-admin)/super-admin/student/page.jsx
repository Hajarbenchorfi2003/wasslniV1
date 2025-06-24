// components/StudentsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalStudent } from '@/components/models/ModalStudent'; // Create this
import StudentCard from './StudentCard'; // Create this
import {fetchParents} from '@/services/user';
import {fetchAllEstablishments} from '@/services/etablissements';
import {fetchAllStudents,createStudent, createAssignation,updateStudent,deleteStudent,removeAssignation} from '@/services/students';

const ITEMS_PER_PAGE = 6;

const StudentsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

  let isMounted = true; // 🔥 Pour éviter les fuites de mémoire si le composant se démonte

  async function Establishments() {
    if (loading || establishments.length > 0) {
      // 🚫 Évite de recharger si déjà en cours ou déjà chargé
      return;
    }

    setLoading(true);
    try {
      const data = await fetchAllEstablishments(); // Assurez-vous que cette fonction renvoie bien un tableau
      console.log("Données reçues depuis l'API:", data);

     
        // Met à jour la liste des responsables
        setEstablishments(data);

       
    } catch (error) {
      console.error('Erreur lors du chargement des responsables', error);
      toast.error("Impossible de charger les responsables");
    } finally {
      if (isMounted) {
        setLoading(false); // 🔄 Fin du chargement
      }
    }
  }

  Establishments();

  // Nettoyage pour éviter les mises à jour sur un composant non monté
  return () => {
    isMounted = false;
  };
}, [loading]); 


 const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await fetchAllStudents({
        page: 1,
        limit: 100
      });

      console.log('Données reçues:', data.data);
      setStudents(data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des élèves', error);
      toast.error("Impossible de charger les élèves");
    } finally {
      setLoading(false);
    }
  };

  //  Charge les élèves au montage du composant
  useEffect(() => {
    loadStudents();
  }, []);

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async(id) => {
    try {
      await deleteStudent(id);
      console.log(`Attempting to soft delete student with ID: ${id}`);
      const updatedStudents = currentDemoData.students.map(student =>
        student.id === id ? { ...student, deletedAt: new Date().toISOString() } : student
      );
      // Remove student from parentStudents and tripStudents
      const updatedParentStudents = currentDemoData.parentStudents.filter(ps => ps.studentId !== id);
      const updatedTripStudents = currentDemoData.tripStudents.filter(ts => ts.studentId !== id);

      setCurrentDemoData(prevData => ({
        ...prevData,
        students: updatedStudents,
        parentStudents: updatedParentStudents,
        tripStudents: updatedTripStudents,
      }));

      toast.success('Élève supprimé (marqué comme inactif) avec succès');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Erreur lors de la suppression de l\'élève');
    }
  };

  const handleSaveStudent = async (studentData) => {

    try {
      let message = '';
      let updatedStudentsArray = [...currentDemoData.students];
      let updatedParentStudentsArray = [...currentDemoData.parentStudents];
      console.log(studentData)

      if (editingStudent) {
        const updatedStudent = await updateStudent(editingStudent.id,{
      ...studentData,
      dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString() : null,
    });
        
         toast.success('Élève modfiée avec succès', {
         position: 'bottom-right',
          });
        if (studentData.parentIds && Array.isArray(studentData.parentIds)) {
             // Récupère les anciens liens parent-enfant
              const oldParentIds = editingStudent.parentLinks.map(link => link.parent.id);
  
            // Trouve les IDs à ajouter et à supprimer
                 const toAdd = studentData.parentIds.filter(id => !oldParentIds.includes(id));
                  const toRemove = oldParentIds.filter(id => !studentData.parentIds.includes(id));

  // Mets à jour les relations (tu dois implémenter ces fonctions côté API ou service)
             if (toAdd.length > 0) {
           for (const parentId of toAdd) {
          await createAssignation({
           studentId: updatedStudent.id,
           parentId: parseInt(parentId, 10),
         });
           }
          }

        if (toRemove.length > 0) {
         for (const parentId of toRemove) {
         await removeAssignation(updatedStudent.id, parentId);
         }
         }
          await loadStudents();
      }
      } else {
       const newStudent = await createStudent({
      ...studentData,
      dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString() : null,
    });

    toast.success('Élève ajouté avec succès', {
  position: 'bottom-right',
});

    if (studentData.parentIds?.length > 0) {
      for (const parentId of studentData.parentIds) {
        await createAssignation({
          studentId: newStudent.id,
          parentId: parseInt(parentId, 10)
        });
      }
      toast.success('Parents assignés avec succès', {
  position: 'bottom-right',
});
    }

    await loadStudents();
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        students: updatedStudentsArray,
        parentStudents: updatedParentStudentsArray,
      }));

      toast.success(message);
      setIsModalOpen(false);
      setEditingStudent(null);

    }   catch (error) {
  let errorMessage = 'Une erreur est survenue';

  if (error.response && error.response.data && error.response.data.error) {
    errorMessage = error.response.data.error.message;
  } else if (error.response && error.response.data) {
    errorMessage = error.response.data;
  } else if (error.message) {
    errorMessage = error.message;
  }

  toast.error(`Erreur : ${errorMessage}`, {
    position: 'bottom-right',
  });
}
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Gestion des Élèves
        </div>
        <Button onClick={() => {
          setEditingStudent(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Élève
        </Button>
      </div>

      <ModalStudent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingStudent={editingStudent}
        onSave={handleSaveStudent}
        establishments={establishments}
       
        parentStudents={currentDemoData.parentStudents}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedStudents.length > 0 ? (
          paginatedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucun élève trouvé.</p>
        )}
      </div>

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