// components/StudentsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalStudent } from '@/components/models/ModalStudent';
import StudentCard from './StudentCard';

const ITEMS_PER_PAGE = 3;

const StudentsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [establishmentFilter, setEstablishmentFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  useEffect(() => {
    console.log("currentDemoData updated, filtering students...");
    const allStudents = currentDemoData.students.filter(student => !student.deletedAt);

    // Enrich students with establishment name and parent names
    const enrichedStudents = allStudents.map(student => {
      const establishment = currentDemoData.establishments.find(est => est.id === student.establishmentId);

      const parentIds = currentDemoData.parentStudents
        .filter(ps => ps.studentId === student.id)
        .map(ps => ps.parentId);

      const parentNames = parentIds.map(parentId => {
        const parent = currentDemoData.users.find(user => user.id === parentId);
        return parent ? parent.fullname : 'N/A';
      });

      return {
        ...student,
        establishmentName: establishment ? establishment.name : 'Non attribué',
        parentNames: parentNames.length > 0 ? parentNames.join(',') : 'Aucun parent associé',
        status: student.deletedAt ? 'INACTIVE' : 'ACTIVE'
      };
    });

    setStudents(enrichedStudents);
  }, [currentDemoData]);

  // Apply filters and search
  useEffect(() => {
    const filtered = students.filter(student => {
      // Search term matching
      const matchesSearch = 
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.establishmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentNames?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && !student.deletedAt) || 
        (statusFilter === 'INACTIVE' && student.deletedAt);

      // Establishment filter
      const matchesEstablishment = 
        establishmentFilter === 'ALL' || 
        student.establishmentId === parseInt(establishmentFilter);

      // Grade filter
      const matchesGrade = 
        gradeFilter === 'ALL' || 
        student.grade?.toLowerCase() === gradeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesEstablishment && matchesGrade;
    });

    setFilteredStudents(filtered);

    // Adjust current page if needed
    const newTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && filtered.length > 0) {
      setCurrentPage(1);
    } else if (filtered.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [students, searchTerm, statusFilter, establishmentFilter, gradeFilter, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
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

  const handleDeleteStudent = (id) => {
    try {
      console.log(`Attempting to soft delete student with ID: ${id}`);
      const updatedStudents = currentDemoData.students.map(student =>
        student.id === id ? { ...student, deletedAt: new Date().toISOString() } : student
      );
      
      setCurrentDemoData(prevData => ({
        ...prevData,
        students: updatedStudents,
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

      if (editingStudent) {
        const index = updatedStudentsArray.findIndex(s => s.id === editingStudent.id);
        if (index !== -1) {
          const studentToUpdate = updatedStudentsArray[index];
          const updatedStudent = {
            ...studentToUpdate,
            ...studentData,
            id: editingStudent.id,
            dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString() : null,
          };
          updatedStudentsArray[index] = updatedStudent;
          message = 'Élève modifié avec succès';

          // Update parent-student links
          updatedParentStudentsArray = updatedParentStudentsArray.filter(ps => ps.studentId !== updatedStudent.id);
          if (studentData.parentIds && studentData.parentIds.length > 0) {
            studentData.parentIds.forEach(parentId => {
              updatedParentStudentsArray.push({ parentId: parseInt(parentId), studentId: updatedStudent.id });
            });
          }
        } else {
          throw new Error("Élève à modifier non trouvé.");
        }
      } else {
        const newId = Math.max(...currentDemoData.students.map(s => s.id), 0) + 1;
        const newStudent = {
          ...studentData,
          id: newId,
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString() : null,
          deletedAt: null,
        };
        updatedStudentsArray.push(newStudent);
        message = 'Élève ajouté avec succès';

        // Add parent-student links for new student
        if (studentData.parentIds && studentData.parentIds.length > 0) {
          studentData.parentIds.forEach(parentId => {
            updatedParentStudentsArray.push({ parentId: parseInt(parentId), studentId: newId });
          });
        }
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        students: updatedStudentsArray,
        parentStudents: updatedParentStudentsArray,
      }));

      toast.success(message);
      setIsModalOpen(false);
      setEditingStudent(null);

    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  // Get unique grades for filter
  const uniqueGrades = [...new Set(students.map(student => student.grade))].filter(Boolean);

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

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Input
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="ACTIVE">Actifs</SelectItem>
            <SelectItem value="INACTIVE">Inactifs</SelectItem>
          </SelectContent>
        </Select>

        <Select value={establishmentFilter} onValueChange={setEstablishmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Établissement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les établissements</SelectItem>
            {currentDemoData.establishments.map(est => (
              <SelectItem key={est.id} value={String(est.id)}>
                {est.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Niveau scolaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les niveaux</SelectItem>
            {uniqueGrades.map(grade => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ModalStudent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingStudent={editingStudent}
        onSave={handleSaveStudent}
        establishments={currentDemoData.establishments}
        parents={currentDemoData.users.filter(user => user.role === 'PARENT')}
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
          <div className="col-span-full text-center py-12">
            <Icon icon="heroicons:user-group" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun élève trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'ALL' || establishmentFilter !== 'ALL'|| gradeFilter !== 'ALL'
                ? 'Aucun élève ne correspond à vos critères de recherche'
                : 'Commencez par ajouter votre premier élève.'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && establishmentFilter === 'ALL' && gradeFilter ==='ALL' && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4"
              >
                <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
                Ajouter un élève
              </Button>
            )}
          </div>
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