import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

interface FormData {
  businessName: string;
  businessType: string;
  targetMarket: string;
  initialInvestment: number;
  monthlyRevenue: number;
  experience: string;
  hasTeam: string;
  location: string;
  timeline: string;
  marketingBudget: number;
  competitors: string;
  uniqueValue: string;
}

interface FeasibilityFormProps {
  onComplete: (data: FormData) => void;
  onBack: () => void;
}

export function FeasibilityForm({ onComplete, onBack }: FeasibilityFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessType: '',
    targetMarket: '',
    initialInvestment: 0,
    monthlyRevenue: 0,
    experience: '',
    hasTeam: '',
    location: '',
    timeline: '',
    marketingBudget: 0,
    competitors: '',
    uniqueValue: ''
  });

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const handleDownload = (type: 'feasibility' | 'summary') => {
    generatePDF(formData, type);
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h2 className="mb-2">Étude de faisabilité</h2>
          <p className="text-gray-600">
            Étape {currentStep} sur {totalSteps}
          </p>
          <Progress value={progress} className="mt-4" />
        </div>

        {/* Form Card */}
        <Card className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3>Informations générales</h3>

              <div className="space-y-2">
                <Label htmlFor="businessName">Nom du projet / entreprise</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="Ex: Ma Startup Innovante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Type d'activité</Label>
                <Input
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => updateField('businessType', e.target.value)}
                  placeholder="Ex: E-commerce, Conseil, Restauration..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMarket">Marché cible</Label>
                <Textarea
                  id="targetMarket"
                  value={formData.targetMarket}
                  onChange={(e) => updateField('targetMarket', e.target.value)}
                  placeholder="Décrivez votre marché cible et vos clients potentiels"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Ex: Paris, Lyon, En ligne..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3>Aspects financiers</h3>

              <div className="space-y-2">
                <Label htmlFor="initialInvestment">Investissement initial prévu (€)</Label>
                <Input
                  id="initialInvestment"
                  type="number"
                  value={formData.initialInvestment || ''}
                  onChange={(e) => updateField('initialInvestment', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyRevenue">Chiffre d'affaires mensuel estimé (€)</Label>
                <Input
                  id="monthlyRevenue"
                  type="number"
                  value={formData.monthlyRevenue || ''}
                  onChange={(e) => updateField('monthlyRevenue', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 15000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketingBudget">Budget marketing mensuel (€)</Label>
                <Input
                  id="marketingBudget"
                  type="number"
                  value={formData.marketingBudget || ''}
                  onChange={(e) => updateField('marketingBudget', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 2000"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3>Expérience et équipe</h3>

              <div className="space-y-3">
                <Label>Avez-vous une expérience dans ce domaine ?</Label>
                <RadioGroup value={formData.experience} onValueChange={(value) => updateField('experience', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="exp-none" />
                    <Label htmlFor="exp-none">Aucune expérience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="some" id="exp-some" />
                    <Label htmlFor="exp-some">Quelques années d'expérience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expert" id="exp-expert" />
                    <Label htmlFor="exp-expert">Expert dans le domaine</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Avez-vous déjà une équipe ?</Label>
                <RadioGroup value={formData.hasTeam} onValueChange={(value) => updateField('hasTeam', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo" id="team-solo" />
                    <Label htmlFor="team-solo">Seul(e)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="team-small" />
                    <Label htmlFor="team-small">Petite équipe (2-5 personnes)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="team-large" />
                    <Label htmlFor="team-large">Équipe constituée (6+ personnes)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Calendrier de lancement souhaité</Label>
                <RadioGroup value={formData.timeline} onValueChange={(value) => updateField('timeline', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="time-immediate" />
                    <Label htmlFor="time-immediate">Immédiat (1-3 mois)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="time-medium" />
                    <Label htmlFor="time-medium">Moyen terme (3-6 mois)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="time-long" />
                    <Label htmlFor="time-long">Long terme (6+ mois)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3>Analyse de marché</h3>

              <div className="space-y-2">
                <Label htmlFor="competitors">Principaux concurrents</Label>
                <Textarea
                  id="competitors"
                  value={formData.competitors}
                  onChange={(e) => updateField('competitors', e.target.value)}
                  placeholder="Listez vos principaux concurrents et leurs points forts"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueValue">Votre proposition de valeur unique</Label>
                <Textarea
                  id="uniqueValue"
                  value={formData.uniqueValue}
                  onChange={(e) => updateField('uniqueValue', e.target.value)}
                  placeholder="Qu'est-ce qui vous différencie de la concurrence ?"
                />
              </div>

              {/* Download Buttons */}
              <div className="pt-6 border-t space-y-4">
                <h4>Télécharger vos livrables</h4>
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDownload('feasibility')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Test de faisabilité
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDownload('summary')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Résumé opérationnel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps ? 'Terminer' : 'Suivant'}
              {currentStep < totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
