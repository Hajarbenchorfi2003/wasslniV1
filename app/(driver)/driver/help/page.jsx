'use client';
import React, { useState } from 'react';
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

 const DriverHelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'NORMAL'
  });

  const handleContactSubmit = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (contactForm.message.trim().length < 10) {
      toast.error("Le message doit contenir au moins 10 caractères.");
      return;
    }

    try {
      // Simulation d'envoi de message
      toast.success("Votre message a été envoyé avec succès !");
      setIsContactModalOpen(false);
      setContactForm({ subject: '', message: '', priority: 'NORMAL' });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Une erreur est survenue lors de l'envoi du message.");
    }
  };

  const faqData = [
    {
      id: 'gps-tracking',
      question: 'Comment activer le suivi GPS de mon bus ?',
      answer: 'Pour activer le suivi GPS, allez dans la section "Mes Trajets", sélectionnez le trajet actif, puis cliquez sur "Activer le suivi GPS". Assurez-vous que votre téléphone a une connexion internet stable.',
      category: 'GPS',
      icon: 'heroicons:map-pin'
    },
    {
      id: 'attendance',
      question: 'Comment marquer la présence des élèves ?',
      answer: 'Dans la section "Mes Trajets", sélectionnez un trajet, puis cliquez sur "Marquer la présence". Vous pouvez marquer chaque élève comme présent, absent ou en retard, et ajouter des notes si nécessaire.',
      category: 'Présence',
      icon: 'heroicons:user-group'
    },
    {
      id: 'incident',
      question: 'Comment signaler un incident ?',
      answer: 'Utilisez la fonction "Signaler un incident" dans la section "Mes Trajets" ou dans le menu principal. Remplissez le formulaire avec le type d\'incident, la gravité, la localisation et les détails.',
      category: 'Incidents',
      icon: 'heroicons:exclamation-triangle'
    },
    {
      id: 'route',
      question: 'Comment consulter mon itinéraire ?',
      answer: 'Votre itinéraire est visible dans la section "Mes Trajets". Cliquez sur un trajet pour voir la carte avec tous les arrêts, les horaires et les informations détaillées.',
      category: 'Itinéraire',
      icon: 'heroicons:map'
    },
    {
      id: 'notifications',
      question: 'Comment gérer mes notifications ?',
      answer: 'Accédez à la section "Notifications" pour voir toutes vos alertes. Marquez-les comme lues, filtrez par type et configurez vos préférences de notification.',
      category: 'Notifications',
      icon: 'heroicons:bell'
    },
    {
      id: 'emergency',
      question: 'Que faire en cas d\'urgence ?',
      answer: 'En cas d\'urgence, utilisez immédiatement le bouton "Urgence" dans l\'application. Contactez également les autorités compétentes et votre responsable. L\'application enverra automatiquement une alerte.',
      category: 'Urgence',
      icon: 'heroicons:exclamation-circle'
    }
  ];

  const filteredFaq = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

   

  const safetyGuidelines = [
    {
      title: 'Vérifications pré-départ',
      items: [
        'Vérifier l\'état du véhicule',
        'Contrôler les équipements de sécurité',
        'S\'assurer que tous les élèves sont attachés',
        'Vérifier les documents de transport'
      ]
    },
    {
      title: 'Pendant le trajet',
      items: [
        'Respecter strictement le code de la route',
        'Maintenir une vitesse adaptée',
        'Surveiller le comportement des élèves',
        'Rester en contact avec le centre de contrôle'
      ]
    },
    {
      title: 'En cas d&apos;incident',
      items: [
        'Sécuriser immédiatement les élèves',
        'Contacter les secours si nécessaire',
        'Signaler l&apos;incident via l&apos;application',
        'Attendre les instructions du responsable'
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-default-900">Centre d&apos;Aide Conducteur</h1>
        <p className="text-lg text-default-600">Guide complet pour utiliser l&apos;application de transport scolaire</p>
      </div>
 
      {/* Main Content */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="safety">Sécurité</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="heroicons:question-mark-circle" className="h-6 w-6 text-blue-500" />
                Questions Fréquentes
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

      

        <TabsContent value="safety" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {safetyGuidelines.map((guideline, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon 
                      icon={index === 0 ? "heroicons:check-circle" : index === 1 ? "heroicons:shield-check" : "heroicons:exclamation-triangle"} 
                      className={`h-6 w-6 ${index === 0 ? 'text-green-500' : index === 1 ? 'text-blue-500' : 'text-red-500'}`} 
                    />
                    {guideline.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guideline.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <Icon icon="heroicons:check" className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="heroicons:exclamation-circle" className="h-6 w-6 text-red-500" />
                Procédure d&apos;urgence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">En cas d&apos;urgence :</h4>
                <div className="space-y-2 text-sm text-red-700">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:phone" className="h-4 w-4" />
                    <span>1. Appelez immédiatement les secours : 190 (Police) / 150 (Ambulance)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:exclamation" className="h-4 w-4" />
                    <span>2. Utilisez le bouton &quot;URGENCE&quot; dans l&apos;application</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:user-group" className="h-4 w-4" />
                    <span>3. Sécurisez tous les élèves et attendez les secours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:phone" className="h-4 w-4" />
                    <span>4. Contactez votre responsable : +212 5XX XXXXXX</span>
                  </div>
                </div>
              </div>
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
                      <span className="text-sm">Urgences : 190 (Police) / 150 (Ambulance)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="heroicons:phone" className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Responsable : +212 5XX XXXXXX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="heroicons:envelope" className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">support@schooltrans.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Info */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="heroicons:user-circle" className="h-6 w-6 text-green-500" />
                  Informations Conducteur
                </CardTitle>
                <CardDescription>
                  Vos informations et statut actuel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>CD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">Conducteur</h4>
                      <p className="text-sm text-muted-foreground">ID: DRV-001</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Actif
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Véhicule assigné</span>
                      <span className="text-sm text-muted-foreground">Bus-001</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Trajets aujourd&apos;hui</span>
                      <span className="text-sm text-muted-foreground">4 trajets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Statut GPS</span>
                      <Badge variant="outline" className="text-xs">
                        Actif
                      </Badge>
                    </div>
                  </div>
                </div>
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
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                placeholder="Ex: Problème avec le GPS..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select 
                value={contactForm.priority} 
                onValueChange={(value) => setContactForm({...contactForm, priority: value})}
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
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
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

export default DriverHelpPage;
