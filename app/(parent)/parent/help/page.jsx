'use client';
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import parentService from '@/services/parentService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from '@iconify/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from 'react-hot-toast';

import { getUser } from '@/utils/auth'; // Assuming auth.js is the correct path for getUser

const ParentHelpPage = () => {
  // Existing states
  const [childrenStudents, setChildrenStudents] = useState([]);
  const [associatedSchools, setAssociatedSchools] = useState([]);
  const [associatedEstablishments, setAssociatedEstablishments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'NORMAL'
  });

  // NEW: Add a loading state
  const [loading, setLoading] = useState(true);

  const currentUser = typeof window !== 'undefined' ? getUser() : null;
  const parentId = currentUser?.id; // Or currentUser?._id if your user object uses _id

  // These logs run on every render (useful for initial component mount check)
  console.log("ParentHelpPage: Current User (on render):", currentUser);
  console.log("ParentHelpPage: Parent ID (on render):", parentId);

  // Use useCallback to memoize fetchchildren and prevent infinite loops in useEffect
  const fetchchildren = useCallback(async () => {
    console.log("fetchchildren function invoked."); // This log should now appear
    setLoading(true); // Set loading to true when starting data fetch

    try {
      console.log("Attempting to fetch children links from parentService...");
      const childrenLinks = await parentService.getChildren();
      console.log("Children Links (from API):", childrenLinks);

      if (!Array.isArray(childrenLinks)) {
        console.error("Expected childrenLinks to be an array, but received:", childrenLinks);
        toast.error("Format de données inattendu pour les enfants.");
        return;
      }

      const students = childrenLinks.map(link => link.student).filter(Boolean);
      setChildrenStudents(students);
      console.log("Students derived from childrenLinks:", students);

      const establishmentsMap = {};
      const schoolIdsSet = new Set();

      for (const student of students) {
        if (student && student.establishmentId) {
          const est = await parentService.getEstablishmentById(student.establishmentId);
          if (est) {
            establishmentsMap[est.id] = est;
            schoolIdsSet.add(est.schoolId);
          }
        }
      }

      const schools = await Promise.all(
        Array.from(schoolIdsSet).map((schoolId) => parentService.getSchoolById(schoolId))
      );

      setAssociatedSchools(schools.filter(Boolean));
      setAssociatedEstablishments(establishmentsMap);
      console.log("Data fetching completed successfully.");
    } catch (error) {
      console.error('Erreur lors du chargement des données dans fetchchildren:', error);
      toast.error("Erreur lors du chargement des données.");
    } finally {
      setLoading(false); // Always set loading to false when fetch is complete (success or error)
    }
  }, [setChildrenStudents, setAssociatedSchools, setAssociatedEstablishments]); // Dependencies for useCallback

  useEffect(() => {
    // This log runs when useEffect is triggered
    console.log("useEffect triggered. Parent ID in useEffect:", parentId);

    if (parentId) {
      console.log("Parent ID is available, calling fetchchildren()...");
      fetchchildren();
    } else {
      console.log("Parent ID is NOT available, skipping data fetch.");
      setLoading(false); // If no parentId, ensure loading is false
    }
  }, [parentId, fetchchildren]); // Add fetchchildren to dependencies

  const handleContactSubmit = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      return toast.error('Veuillez remplir tous les champs obligatoires.');
    }

    if (contactForm.message.trim().length < 10) {
      return toast.error("Le message doit contenir au moins 10 caractères.");
    }

    try {
      const child = childrenStudents.length > 0 ? childrenStudents[0] : null;
      let targetResponsibleId = null;

      if (child) {
        const est = await parentService.getEstablishmentById(child.establishmentId);
        targetResponsibleId = est?.responsableId;
      }

      if (!targetResponsibleId) {
        const admin = await parentService.getDefaultAdmin();
        targetResponsibleId = admin?.id;
      }

      if (targetResponsibleId) {
        await parentService.sendConcern({
          parentId,
          type: contactForm.priority,
          title: contactForm.subject.trim(),
          message: contactForm.message.trim(),
          recipientUserId: targetResponsibleId,
        });

        toast.success("Votre message a été envoyé avec succès !");
        setIsContactModalOpen(false);
        setContactForm({ subject: '', message: '', priority: 'NORMAL' });
      } else {
        toast.error("Aucun responsable disponible pour recevoir le message.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Une erreur est survenue lors de l'envoi.");
    }
  };

  const faqData = [
    {
      id: 'tracking',
      question: 'Comment suivre le bus de mon enfant ?',
      answer: 'Vous pouvez suivre le bus de votre enfant en temps réel via la section "Vue d\'ensemble Enfants" de l\'application. Cliquez sur "Suivre le bus" pour voir la position en direct.',
      category: 'Suivi',
      icon: 'heroicons:map-pin'
    },
    {
      id: 'attendance',
      question: 'Comment signaler une absence ou un retard ?',
      answer: 'Pour signaler une absence ou un retard, allez dans la section "Mes Enfants", sélectionnez l\'enfant concerné, puis utilisez l\'option "Signaler une absence/retard".',
      category: 'Présence',
      icon: 'heroicons:user-group'
    },
    {
      id: 'incident',
      question: 'Que faire en cas d\'incident ?',
      answer: 'En cas d\'incident grave ou urgent, contactez immédiatement l\'école. Pour les incidents non urgents, utilisez la fonction "Signaler une préoccupation".',
      category: 'Urgence',
      icon: 'heroicons:exclamation-triangle'
    },
    {
      id: 'profile',
      question: 'Comment mettre à jour mes informations personnelles ?',
      answer: 'Vos informations personnelles peuvent être mises à jour dans la section "Mon Profil". Pour toute modification nécessitant une vérification, un processus de validation sera requis.',
      category: 'Profil',
      icon: 'heroicons:user-circle'
    }
  ];

  const filteredFaq = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickActions = [
    {
      title: 'Suivre le bus',
      description: 'Voir la position en temps réel',
      icon: 'heroicons:map-pin',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => toast.info('Redirection vers le suivi du bus...')
    },
    {
      title: 'Signaler absence',
      description: 'Marquer absence ou retard',
      icon: 'heroicons:user-minus',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => toast.info('Redirection vers le signalement...')
    },
    {
      title: 'Voir notifications',
      description: 'Consulter les alertes',
      icon: 'heroicons:bell',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => toast.info('Redirection vers les notifications...')
    },
    {
      title: 'Contacter support',
      description: 'Envoyer un message',
      icon: 'heroicons:chat-bubble-left-right',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => setIsContactModalOpen(true)
    }
  ];

  // Display a loading indicator for the entire page
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <Icon icon="heroicons:arrow-path" className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-default-900">Centre d&apos;Aide & Support</h1>
        <p className="text-lg text-default-600">Trouvez des réponses à vos questions et obtenez l&apos;aide dont vous avez besoin</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-wrap">
        {quickActions.map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition" onClick={action.action}>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className={`flex-shrink-0 p-3 rounded-full ${action.bgColor}`}>
                <Icon icon={action.icon} className={`h-6 w-6 ${action.color}`} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
                <CardDescription className="text-xs">{action.description}</CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="heroicons:question-mark-circle" className="h-6 w-6 text-blue-500" />
                Foire Aux Questions (FAQ)
              </CardTitle>
              <CardDescription>
                Trouvez rapidement des réponses aux questions fréquemment posées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Input
                  placeholder="Rechercher dans la FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                />
              </div>

              {/* FAQ Accordion */}
              <Accordion type="single" collapsible className="w-full">
                {filteredFaq.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3">
                        <Icon icon={faq.icon} className="h-5 w-5 text-blue-500" />
                        <span>{faq.question}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFaq.length === 0 && (
                <div className="text-center py-8">
                  <Icon icon="heroicons:magnifying-glass" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">Aucune question trouvée pour votre recherche.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="heroicons:chat-bubble-oval-left" className="h-6 w-6 text-purple-500" />
                  Nous Contacter
                </CardTitle>
                <CardDescription>
                  Envoyez-nous un message et nous vous répondrons dans les plus brefs délais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  <Icon icon="heroicons:envelope" className="h-5 w-5 mr-2" />
                  Envoyer un message
                </Button>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Contacts d&apos;urgence</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="heroicons:phone" className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Urgences : +212 5XX XXXXXX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="heroicons:envelope" className="h-4 w-4 text-blue-500" />
                      <span>support@schooltrans.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* School Contacts */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="heroicons:academic-cap" className="h-6 w-6 text-green-500" />
                  Contacts École
                </CardTitle>
                <CardDescription>
                  Coordonnées des établissements de vos enfants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {associatedSchools.length > 0 ? (
                  <div className="space-y-4">
                    {associatedSchools.map(school => (
                      <div key={school.id} className="p-4 bg-gray-50 rounded-lg"> {/* Corrected bg-gray-500 to a lighter shade if desired */}
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{school.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{school.name}</h4>
                            <p className="text-sm text-muted-foreground">École principale</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Icon icon="heroicons:envelope" className="h-4 w-4 text-blue-500" />
                            <span>{school.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon icon="heroicons:phone" className="h-4 w-4 text-green-500" />
                            <span>{school.phone}</span>
                          </div>
                        </div>

                        {Object.values(associatedEstablishments)
                          .filter(est => est.schoolId === school.id)
                          .map(est => (
                            <div key={est.id} className="mt-3 pt-3 border-t border-gray-200">
                              <h5 className="font-medium text-sm mb-2">{est.name}</h5>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Icon icon="heroicons:envelope" className="h-3 w-3" />
                                  <span>{est.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Icon icon="heroicons:phone" className="h-3 w-3" />
                                  <span>{est.phone}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="heroicons:academic-cap" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucune école associée trouvée.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="heroicons:envelope" className="h-5 w-5" />
              Envoyer un message
            </DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour nous contacter
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet *</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Ex: Problème avec le suivi GPS..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={contactForm.priority}
                onValueChange={(value) => setContactForm({ ...contactForm, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="NORMAL">Normale</SelectItem>
                  <SelectItem value="HIGH">Élevée</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Décrivez votre problème ou question..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleContactSubmit}>
              <Icon icon="heroicons:paper-airplane" className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentHelpPage;