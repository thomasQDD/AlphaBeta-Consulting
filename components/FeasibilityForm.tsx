import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, ArrowRight, Download, CheckCircle } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

export interface FormData {
  // Informations générales
  businessName: string;
  businessType: 'product' | 'service' | '';
  activityCategory: string;
  activitySubcategory: string;
  whatYouSell: string;
  where: string[];
  whereCity: string;

  // Équipe (Variables E, E1, E2, E3)
  workingAlone: boolean;
  numberOfPartners: number; // E2
  numberOfEmployees: number; // E3

  // Répartition temps
  productionPercentage: number;
  salesPercentage: number;

  // Saisonnalité
  isSeasonal: boolean;
  highMonths: string[];
  lowMonths: string[];

  // Clients et marché
  firstClientsDescription: string;
  competitiveAdvantage: string;
  whyRecommend: string;

  // Organisation équipe
  teamDescription: string;

  // Autorisations
  needsAuthorizations: boolean;
  hasAuthorizations: boolean;
  authorizationCost: number;
  authorizationDelay: number;

  // Finances (Variables financières)
  desiredSalary: number; // A
  targetRevenueProduct: number; // B1
  targetRevenueService: number; // B2
  averageBasket: number; // M
  customersPerMonth: number; // N
  monthlyCharges: number; // Z
  personalContribution: number; // L
  financialNeedAtLaunch: number; // F1
  monthsToReachSalary: number; // T

  // Calculés automatiquement
  revenueToUse: number; // B
  revenuePerDay: number; // C
  hourlyRate: number; // D
  realisticMonths: number; // Tr
}

interface FeasibilityFormProps {
  onComplete: (data: FormData) => void;
  onBack: () => void;
}

// Composant pour le formulaire d'inscription
function AccountForm({ onAccountCreated }: { onAccountCreated: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    onAccountCreated(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full">
        Créer mon compte
      </Button>
    </form>
  );
}

export function FeasibilityForm({ onComplete, onBack }: FeasibilityFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [isCompleted, setIsCompleted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Informations générales
    businessName: '',
    businessType: '',
    activityCategory: '',
    activitySubcategory: '',
    whatYouSell: '',
    where: [],
    whereCity: '',

    // Équipe
    workingAlone: true,
    numberOfPartners: 0,
    numberOfEmployees: 0,

    // Répartition temps
    productionPercentage: 50,
    salesPercentage: 50,

    // Saisonnalité
    isSeasonal: false,
    highMonths: [],
    lowMonths: [],

    // Clients et marché
    firstClientsDescription: '',
    competitiveAdvantage: '',
    whyRecommend: '',

    // Organisation équipe
    teamDescription: '',

    // Autorisations
    needsAuthorizations: false,
    hasAuthorizations: false,
    authorizationCost: 0,
    authorizationDelay: 0,

    // Finances
    desiredSalary: 0,
    targetRevenueProduct: 0,
    targetRevenueService: 0,
    averageBasket: 0,
    customersPerMonth: 0,
    monthlyCharges: 0,
    personalContribution: 0,
    financialNeedAtLaunch: 0,
    monthsToReachSalary: 0,

    // Calculés
    revenueToUse: 0,
    revenuePerDay: 0,
    hourlyRate: 0,
    realisticMonths: 0,
  });

  const updateField = (field: keyof FormData, value: string | number | boolean | string[] | number[]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Calculs automatiques
      if (field === 'businessType' || field === 'targetRevenueProduct' || field === 'targetRevenueService') {
        updated.revenueToUse = updated.businessType === 'product'
          ? updated.targetRevenueProduct
          : updated.targetRevenueService;
        updated.revenuePerDay = updated.revenueToUse / 20; // hypothèse 20 jours ouvrés
        updated.hourlyRate = updated.revenuePerDay / 8; // hypothèse 8h par jour
      }

      if (field === 'monthsToReachSalary') {
        updated.realisticMonths = (value as number) * 3; // hypothèse coefficient 3
      }

      // Validation M * N = B
      if (field === 'averageBasket' && updated.customersPerMonth > 0) {
        updated.revenueToUse = updated.averageBasket * updated.customersPerMonth;
        updated.revenuePerDay = updated.revenueToUse / 20;
        updated.hourlyRate = updated.revenuePerDay / 8;
      }

      if (field === 'customersPerMonth' && updated.averageBasket > 0) {
        updated.revenueToUse = updated.averageBasket * updated.customersPerMonth;
        updated.revenuePerDay = updated.revenueToUse / 20;
        updated.hourlyRate = updated.revenuePerDay / 8;
      }

      // Sync productionPercentage et salesPercentage
      if (field === 'productionPercentage') {
        updated.salesPercentage = 100 - (value as number);
      }
      if (field === 'salesPercentage') {
        updated.productionPercentage = 100 - (value as number);
      }

      return updated;
    });
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
    setIsCompleted(true);
  };

  const handleDownload = (type: 'feasibility' | 'summary') => {
    generatePDF(formData, type);
  };

  const progress = (currentStep / totalSteps) * 100;

  // Si le formulaire est terminé, afficher la page de téléchargement
  if (isCompleted) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>

              <h2>Félicitations !</h2>
              <p className="text-gray-600">
                Votre étude de faisabilité est terminée. Téléchargez vos livrables ci-dessous.
              </p>

              <div className="pt-6 space-y-4">
                <h3>Télécharger vos livrables</h3>
                <div className="grid gap-3 max-w-md mx-auto">
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
          </Card>

          {/* Formulaire d'inscription en dessous */}
          <Card className="p-8 mt-8">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <h3 className="mb-2">Créez votre compte</h3>
                <p className="text-gray-600 text-sm">
                  Sauvegardez votre travail et accédez à plus de fonctionnalités
                </p>
              </div>

              <AccountForm
                onAccountCreated={(email) => {
                  onComplete(formData);
                }}
              />

              <div className="text-center pt-4">
                <Button variant="ghost" onClick={onBack}>
                  Retour à l&apos;accueil
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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

              <div className="space-y-3">
                <Label>Au choix, je vends :</Label>
                <RadioGroup value={formData.businessType} onValueChange={(value) => updateField('businessType', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="product" id="type-product" />
                    <Label htmlFor="type-product">Un produit (B1)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="service" id="type-service" />
                    <Label htmlFor="type-service">Un service (B2)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityCategory">Type général d&apos;activité</Label>
                <Select value={formData.activityCategory} onValueChange={(value) => updateField('activityCategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct-sale">Vente directe</SelectItem>
                    <SelectItem value="commission">Commissions & intermédiation</SelectItem>
                    <SelectItem value="premium">Services premium & expertise</SelectItem>
                    <SelectItem value="other">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.activityCategory === 'direct-sale' && (
                <div className="space-y-2">
                  <Label htmlFor="activitySubcategory">Sous-thème</Label>
                  <Select value={formData.activitySubcategory} onValueChange={(value) => updateField('activitySubcategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">Achat unique</SelectItem>
                      <SelectItem value="recurring">Achat récurrent</SelectItem>
                      <SelectItem value="subscription">Abonnement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.activityCategory === 'commission' && (
                <div className="space-y-2">
                  <Label htmlFor="activitySubcategory">Sous-thème</Label>
                  <Select value={formData.activitySubcategory} onValueChange={(value) => updateField('activitySubcategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketplace">Commission sur transaction ou marketplace</SelectItem>
                      <SelectItem value="affiliation">Affiliation</SelectItem>
                      <SelectItem value="dropshipping">Drop-shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.activityCategory === 'premium' && (
                <div className="space-y-2">
                  <Label htmlFor="activitySubcategory">Sous-thème</Label>
                  <Select value={formData.activitySubcategory} onValueChange={(value) => updateField('activitySubcategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulting">Consulting & accompagnement</SelectItem>
                      <SelectItem value="training">Formation</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="assistance">Assistance, services à la personne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.activityCategory === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="activitySubcategory">Sous-thème</Label>
                  <Select value={formData.activitySubcategory} onValueChange={(value) => updateField('activitySubcategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advertising">Publicité & sponsoring</SelectItem>
                      <SelectItem value="digital">Produits digitaux</SelectItem>
                      <SelectItem value="financial">Modèles financiers (donations, crowdfunding…)</SelectItem>
                      <SelectItem value="indirect">Monétisation indirecte (leads, data, co-branding)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="whatYouSell">Et plus précisément, tu vends quoi ?</Label>
                <Input
                  id="whatYouSell"
                  value={formData.whatYouSell}
                  onChange={(e) => updateField('whatYouSell', e.target.value)}
                  placeholder="Décrivez votre produit/service"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3>Localisation et équipe</h3>

              <div className="space-y-3">
                <Label>Où veux-tu vendre ? (plusieurs choix possibles)</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="where-local"
                      checked={formData.where.includes('local')}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...formData.where, 'local']
                          : formData.where.filter(w => w !== 'local');
                        updateField('where', updated);
                      }}
                    />
                    <Label htmlFor="where-local">Une ville et ses alentours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="where-region"
                      checked={formData.where.includes('region')}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...formData.where, 'region']
                          : formData.where.filter(w => w !== 'region');
                        updateField('where', updated);
                      }}
                    />
                    <Label htmlFor="where-region">Ma région</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="where-country"
                      checked={formData.where.includes('country')}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...formData.where, 'country']
                          : formData.where.filter(w => w !== 'country');
                        updateField('where', updated);
                      }}
                    />
                    <Label htmlFor="where-country">Mon pays</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="where-online"
                      checked={formData.where.includes('online')}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...formData.where, 'online']
                          : formData.where.filter(w => w !== 'online');
                        updateField('where', updated);
                      }}
                    />
                    <Label htmlFor="where-online">Sur internet</Label>
                  </div>
                </div>
              </div>

              {formData.where.includes('local') && (
                <div className="space-y-2">
                  <Label htmlFor="whereCity">Quelle ville ?</Label>
                  <Input
                    id="whereCity"
                    value={formData.whereCity}
                    onChange={(e) => updateField('whereCity', e.target.value)}
                    placeholder="Ex: Paris, Lyon..."
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>Avec qui travailles-tu ?</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="workingAlone"
                      checked={formData.workingAlone}
                      onCheckedChange={(checked) => updateField('workingAlone', checked)}
                    />
                    <Label htmlFor="workingAlone">Seul (fondateur)</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfPartners">Nombre d&apos;associés (hors toi)</Label>
                    <Input
                      id="numberOfPartners"
                      type="number"
                      value={formData.numberOfPartners || ''}
                      onChange={(e) => updateField('numberOfPartners', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfEmployees">Nombre de salariés (sauf associés et fondateur)</Label>
                    <Input
                      id="numberOfEmployees"
                      type="number"
                      value={formData.numberOfEmployees || ''}
                      onChange={(e) => updateField('numberOfEmployees', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamDescription">Raconte-nous qui va faire quoi, comment tu vas le faire :</Label>
                <Textarea
                  id="teamDescription"
                  value={formData.teamDescription}
                  onChange={(e) => updateField('teamDescription', e.target.value)}
                  placeholder="Décrivez la répartition des rôles et responsabilités..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3>Organisation du temps</h3>

              <div className="space-y-4">
                <Label>Répartition de ton temps entre production et vente</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Production: {formData.productionPercentage}%</span>
                    <span>Vente: {formData.salesPercentage}%</span>
                  </div>
                  <Slider
                    value={[formData.productionPercentage]}
                    onValueChange={([value]) => updateField('productionPercentage', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Production</span>
                    <span>Vente</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Ton activité est-elle saisonnière ?</Label>
                <RadioGroup
                  value={formData.isSeasonal ? 'yes' : 'no'}
                  onValueChange={(value) => updateField('isSeasonal', value === 'yes')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="seasonal-yes" />
                    <Label htmlFor="seasonal-yes">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="seasonal-no" />
                    <Label htmlFor="seasonal-no">Non</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.isSeasonal && (
                <>
                  <div className="space-y-3">
                    <Label>Sélectionne les 3 mois de fort chiffre d&apos;affaires</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month) => (
                        <Button
                          key={month}
                          type="button"
                          variant={formData.highMonths.includes(month) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const updated = formData.highMonths.includes(month)
                              ? formData.highMonths.filter(m => m !== month)
                              : formData.highMonths.length < 3
                              ? [...formData.highMonths, month]
                              : formData.highMonths;
                            updateField('highMonths', updated);
                          }}
                          disabled={!formData.highMonths.includes(month) && formData.highMonths.length >= 3}
                        >
                          {month.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Sélectionne les 3 mois de faible chiffre d&apos;affaires</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month) => (
                        <Button
                          key={month}
                          type="button"
                          variant={formData.lowMonths.includes(month) ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const updated = formData.lowMonths.includes(month)
                              ? formData.lowMonths.filter(m => m !== month)
                              : formData.lowMonths.length < 3
                              ? [...formData.lowMonths, month]
                              : formData.lowMonths;
                            updateField('lowMonths', updated);
                          }}
                          disabled={!formData.lowMonths.includes(month) && formData.lowMonths.length >= 3}
                        >
                          {month.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3>Clients et marché</h3>

              <div className="space-y-2">
                <Label htmlFor="firstClients">Parle-nous de tes premiers clients</Label>
                <Textarea
                  id="firstClients"
                  value={formData.firstClientsDescription}
                  onChange={(e) => updateField('firstClientsDescription', e.target.value)}
                  placeholder="Comment penses-tu les rencontrer et les conquérir ?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitiveAdvantage">Quel est ton avantage concurrentiel ?</Label>
                <Textarea
                  id="competitiveAdvantage"
                  value={formData.competitiveAdvantage}
                  onChange={(e) => updateField('competitiveAdvantage', e.target.value)}
                  placeholder="Une qualité précise, une expertise, un emplacement géographique..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyRecommend">Pourquoi tes clients te recommandent-ils ?</Label>
                <Textarea
                  id="whyRecommend"
                  value={formData.whyRecommend}
                  onChange={(e) => updateField('whyRecommend', e.target.value)}
                  placeholder="Quelle valeur apportes-tu qui fait qu'on parle de toi ?"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3>Autorisations et réglementations</h3>

              <div className="space-y-3">
                <Label>As-tu besoin d&apos;autorisations, d&apos;habilitations, de diplômes ou autres pour exercer ?</Label>
                <RadioGroup
                  value={formData.needsAuthorizations ? 'yes' : 'no'}
                  onValueChange={(value) => updateField('needsAuthorizations', value === 'yes')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="auth-yes" />
                    <Label htmlFor="auth-yes">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="auth-no" />
                    <Label htmlFor="auth-no">Non</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.needsAuthorizations && (
                <>
                  <div className="space-y-3">
                    <Label>Les détiens-tu déjà ?</Label>
                    <RadioGroup
                      value={formData.hasAuthorizations ? 'yes' : 'no'}
                      onValueChange={(value) => updateField('hasAuthorizations', value === 'yes')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="has-auth-yes" />
                        <Label htmlFor="has-auth-yes">Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="has-auth-no" />
                        <Label htmlFor="has-auth-no">Non</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {!formData.hasAuthorizations && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="authorizationCost">Coût pour les obtenir (€)</Label>
                        <Input
                          id="authorizationCost"
                          type="number"
                          value={formData.authorizationCost || ''}
                          onChange={(e) => updateField('authorizationCost', parseFloat(e.target.value) || 0)}
                          placeholder="Ex: 1500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="authorizationDelay">Délai pour les obtenir (en mois)</Label>
                        <Input
                          id="authorizationDelay"
                          type="number"
                          value={formData.authorizationDelay || ''}
                          onChange={(e) => updateField('authorizationDelay', parseInt(e.target.value) || 0)}
                          placeholder="Ex: 6"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h3>Finances - Revenus</h3>

              <div className="space-y-2">
                <Label htmlFor="desiredSalary">Salaire mensuel souhaité (€)</Label>
                <Input
                  id="desiredSalary"
                  type="number"
                  value={formData.desiredSalary || ''}
                  onChange={(e) => updateField('desiredSalary', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 3000"
                />
              </div>

              {formData.businessType === 'product' && (
                <div className="space-y-2">
                  <Label htmlFor="targetRevenueProduct">Chiffre d&apos;affaires cible mensuel - Produit (€)</Label>
                  <Input
                    id="targetRevenueProduct"
                    type="number"
                    value={formData.targetRevenueProduct || ''}
                    onChange={(e) => updateField('targetRevenueProduct', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 10000"
                  />
                  <p className="text-xs text-gray-500">Hypothèse : 4 semaines de congés par an</p>
                </div>
              )}

              {formData.businessType === 'service' && (
                <div className="space-y-2">
                  <Label htmlFor="targetRevenueService">Chiffre d&apos;affaires cible mensuel - Service (€)</Label>
                  <Input
                    id="targetRevenueService"
                    type="number"
                    value={formData.targetRevenueService || ''}
                    onChange={(e) => updateField('targetRevenueService', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 8000"
                  />
                  <p className="text-xs text-gray-500">Hypothèse : 4 semaines de congés par an</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Calculs automatiques</h4>
                <p className="text-sm">CA par jour : <span className="font-bold">{formData.revenuePerDay.toFixed(2)} €</span> (20 jours ouvrés)</p>
                <p className="text-sm">Taux horaire : <span className="font-bold">{formData.hourlyRate.toFixed(2)} €/h</span> (8h/jour)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="averageBasket">Panier moyen (€)</Label>
                <Input
                  id="averageBasket"
                  type="number"
                  value={formData.averageBasket || ''}
                  onChange={(e) => updateField('averageBasket', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customersPerMonth">Nombre de clients par mois</Label>
                <Input
                  id="customersPerMonth"
                  type="number"
                  value={formData.customersPerMonth || ''}
                  onChange={(e) => updateField('customersPerMonth', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 200"
                />
              </div>

              {formData.averageBasket > 0 && formData.customersPerMonth > 0 && (
                <div className="bg-green-50 p-3 rounded text-sm">
                  <p>Validation : Panier moyen × Nombre de clients = <span className="font-bold">{(formData.averageBasket * formData.customersPerMonth).toFixed(2)} €</span></p>
                </div>
              )}
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <h3>Finances - Charges et financement</h3>

              <div className="space-y-2">
                <Label htmlFor="monthlyCharges">Charges mensuelles (€)</Label>
                <Input
                  id="monthlyCharges"
                  type="number"
                  value={formData.monthlyCharges || ''}
                  onChange={(e) => updateField('monthlyCharges', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 2500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalContribution">Apport personnel au lancement (€)</Label>
                <Input
                  id="personalContribution"
                  type="number"
                  value={formData.personalContribution || ''}
                  onChange={(e) => updateField('personalContribution', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="financialNeedAtLaunch">Besoin initial de financement (en plus de ton apport) (€)</Label>
                <Input
                  id="financialNeedAtLaunch"
                  type="number"
                  value={formData.financialNeedAtLaunch || ''}
                  onChange={(e) => updateField('financialNeedAtLaunch', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 15000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthsToReachSalary">Nombre de mois pour atteindre ton salaire cible</Label>
                <Input
                  id="monthsToReachSalary"
                  type="number"
                  value={formData.monthsToReachSalary || ''}
                  onChange={(e) => updateField('monthsToReachSalary', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 12"
                />
              </div>

              {formData.monthsToReachSalary > 0 && (
                <div className="bg-yellow-50 p-3 rounded text-sm">
                  <p>Estimation réaliste : <span className="font-bold">{formData.realisticMonths} mois</span> (coefficient 3)</p>
                </div>
              )}
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
