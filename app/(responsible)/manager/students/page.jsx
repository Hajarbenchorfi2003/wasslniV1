// components/StudentsPage.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalStudent } from '@/components/models/ModalStudent';
import StudentCard from './StudentCard';
import { fetchUserEstablishments } from '@/services/etablissements';
import {
  getStudentsByUser,
  requestStudentDeletion,
  createStudent,
  createAssignation,
  updateStudent,
  removeAssignation
} from '@/services/students';
import { confirmToast } from '@/components/ui/confirmToast';

const ITEMS_PER_PAGE = 6;

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState({
    students: false,
    establishments: false,
    actions: false
  });

  // Memoized data calculations
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Fetch establishments with proper cleanup
  useEffect(() => {
    let isMounted = true;

    const loadEstablishments = async () => {
      if (establishments.length > 0) return;
      
      try {
        setLoading(prev => ({ ...prev, establishments: true }));
        const data = await fetchUserEstablishments();
        if (isMounted) setEstablishments(data);
      } catch (error) {
        console.error('Error loading establishments:', error);
        toast.error("Impossible de charger les établissements");
      } finally {
        if (isMounted) setLoading(prev => ({ ...prev, establishments: false }));
      }
    };

    loadEstablishments();

    return () => {
      isMounted = false;
    };
  }, [establishments.length]);

  // Fetch students with error handling
  const loadStudents = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const { data } = await getStudentsByUser({ page: 1, limit: 100 });
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error("Impossible de charger les élèves");
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Student CRUD operations
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (id) => {
    if (!id || typeof id !== 'number') {
      console.error("Invalid student ID:", id);
      return;
    }

    confirmToast({
      message: "Êtes-vous sûr de vouloir demander la suppression de cet élève ?",
      onConfirm: async () => {
        try {
          setLoading(prev => ({ ...prev, actions: true }));
          await requestStudentDeletion(id, "Demande de suppression par l'utilisateur");
          toast.success("Demande de suppression envoyée avec succès");
          await loadStudents();
        } catch (error) {
          console.error("Deletion request error:", error);
          toast.error("Erreur lors de la demande de suppression");
        } finally {
          setLoading(prev => ({ ...prev, actions: false }));
        }
      }
    });
  };

  const handleSaveStudent = async (studentData) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      
      const processedData = {
        ...studentData,
        dateOfBirth: studentData.dateOfBirth 
          ? new Date(studentData.dateOfBirth).toISOString() 
          : null
      };

      if (editingStudent) {
        await handleUpdateStudent(processedData);
      } else {
        await handleCreateStudent(processedData);
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      await loadStudents();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleUpdateStudent = async (studentData) => {
    const updatedStudent = await updateStudent(editingStudent.id, studentData);
    toast.success('Élève modifié avec succès', { position: 'bottom-right' });

    if (studentData.parentIds?.length) {
      await updateParentAssignations(
        updatedStudent.id,
        editingStudent.parentLinks.map(link => link.parent.id),
        studentData.parentIds
      );
    }
  };

  const handleCreateStudent = async (studentData) => {
    const newStudent = await createStudent(studentData);
    toast.success('Élève ajouté avec succès', { position: 'bottom-right' });

    if (studentData.parentIds?.length) {
      await Promise.all(
        studentData.parentIds.map(parentId => 
          createAssignation({
            studentId: newStudent.id,
            parentId: parseInt(parentId, 10)
          })
        )
      );
      toast.success('Parents assignés avec succès', { position: 'bottom-right' });
    }
  };

  const updateParentAssignations = async (studentId, oldParentIds, newParentIds) => {
    const toAdd = newParentIds.filter(id => !oldParentIds.includes(id));
    const toRemove = oldParentIds.filter(id => !newParentIds.includes(id));

    await Promise.all([
      ...toAdd.map(parentId => 
        createAssignation({ studentId, parentId: parseInt(parentId, 10) })
      ),
      ...toRemove.map(parentId => 
        removeAssignation(studentId, parentId)
      )
    ]);
  };

  const handleApiError = (error) => {
    let errorMessage = 'Une erreur est survenue';

    if (error.response?.data) {
      const { data } = error.response;

      if (data.errors) {
        Object.entries(data.errors).forEach(([field, messages]) => {
          messages.forEach(msg => toast.error(`${field}: ${msg}`, { position: 'bottom-right' }));
        });
        return;
      }

      errorMessage = data.error?.message || data.error || data;
    } else {
      errorMessage = error.message || error.toString();
    }

    toast.error(`Erreur: ${errorMessage}`, { position: 'bottom-right' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <h1 className="text-2xl font-medium text-default-800">
          Gestion des Élèves
        </h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          disabled={loading.establishments || loading.students}
        >
          <Icon 
            icon={loading.actions ? "heroicons:arrow-path" : "heroicons:plus"} 
            className={cn("h-5 w-5 mr-2", loading.actions && "animate-spin")} 
          />
          Ajouter un Élève
        </Button>
      </div>

      <ModalStudent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingStudent={editingStudent}
        onSave={handleSaveStudent}
        establishments={establishments}
        isLoading={loading.actions}
      />

      {loading.students ? (
        <div className="flex justify-center items-center h-64">
          <Icon icon="heroicons:arrow-path" className="h-12 w-12 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                  isDeleting={loading.actions}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">
                Aucun élève trouvé.
              </p>
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
        </>
      )}
    </div>
  );
};

export default StudentsPage;