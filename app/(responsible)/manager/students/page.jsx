// pages/manager/StudentsPage.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {confirmToast} from '@/components/ui/confirmToast';
import { ModalStudent } from '@/components/models/ModalStudent';
import StudentCard from './StudentCard';
import {
  getStudentsByUser,
  requestStudentDeletion, // Remplace deleteStudentPermanently
  createStudent,
  updateStudent
} from '@/services/students';
import { fetchUserEstablishments } from '@/services/etablissements';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 6;

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [userEstablishmentId, setuserEstablishmentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        const establishments = await fetchUserEstablishments();
        if (!establishments || establishments.length === 0) {
          setError('Aucun établissement trouvé.');
          setLoading(false);
          return;
        }
        setuserEstablishmentId(establishments[0].id);
      } catch (err) {
        console.error('Échec du chargement des établissements', err);
        setError('Impossible de charger les établissements.');
        toast.error("Erreur lors du chargement des établissements");
      }
    };

    fetchEstablishment();
  }, []);
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudentsByUser({
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });

      if (response.success) {
        const data = response.data || [];
        setStudents(data);
        setFilteredStudents(data);
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        throw new Error('Erreur serveur ou réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      toast.error("Impossible de charger les étudiants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = students.filter(student =>
      student.fullname?.toLowerCase().includes(lowerSearch) ||
      student.class?.toLowerCase().includes(lowerSearch) ||
      student.quartie?.toLowerCase().includes(lowerSearch) ||
      student.address?.toLowerCase().includes(lowerSearch) ||
      student.parentLinks?.some(link =>
        link.parent?.fullname?.toLowerCase().includes(lowerSearch)
      )
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, students]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id) => {
    // Vérifiez que id est valide
    if (!id || typeof id !== 'number') {
      console.error("ID d'étudiant invalide :", id);
      return;
    }
  
    // Appel à confirmToast avec une fonction en second paramètre
    confirmToast({
      message: "Êtes-vous sûr de vouloir demander la suppression de cet élève ?",
      onConfirm: async () => {
        try {
          await requestStudentDeletion(id, "Demande de suppression par l'utilisateur");
          toast.success("Demande de suppression envoyée avec succès");
          fetchStudents(); // Recharger après demande de suppression
        } catch (error) {
          console.error("Erreur lors de la demande de suppression:", error);
          toast.error("Erreur lors de la demande de suppression de l'étudiant.");
        }
      }
    });
  };

  const handleSaveStudent = async (studentData) => {
    try {
      let message = '';
      const dataWithEstablishment = {
        ...studentData,
        establishmentId: userEstablishmentId
      };

      if (editingStudent) {
        await updateStudent(editingStudent.id, dataWithEstablishment);
        message = "Étudiant mis à jour avec succès";
      } else {
        await createStudent(dataWithEstablishment);
        message = "Étudiant ajouté avec succès";
      }

      toast.success(message);
      setIsModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Chargement des étudiants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Étudiants
        </h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Étudiant
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom, classe, quartier ou parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon
            icon="heroicons:magnifying-glass"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </div>
      </div>

      <ModalStudent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingStudent={editingStudent}
        onSave={handleSaveStudent}
        establishmentId={userEstablishmentId}
      />

      <div className="p-6">
        {filteredStudents.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Aucun étudiant trouvé.</p>
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
              className="w-8 h-8"
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