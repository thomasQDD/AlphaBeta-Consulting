import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, Calendar, Briefcase, Users } from 'lucide-react';

interface HeroProps {
  onStartFeasibility: () => void;
}

export function Hero({ onStartFeasibility }: HeroProps) {
  const steps = [
    {
      icon: CheckCircle2,
      title: "Étude de faisabilité",
      description: "Évaluez la viabilité de votre projet avec notre formulaire interactif",
      price: "Gratuit",
      color: "text-green-600 bg-green-50"
    },
    {
      icon: Calendar,
      title: "Rendez-vous de validation",
      description: "Un rendez-vous de 30 minutes pour valider votre projet",
      price: "Gratuit",
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: Briefcase,
      title: "Accompagnement à la création",
      description: "Un forfait sur mesure adapté à votre type d'activité et sa complexité",
      price: "Sur devis",
      color: "text-purple-600 bg-purple-50"
    },
    {
      icon: Users,
      title: "Coaching de dirigeants",
      description: "Un accompagnement continu avec des rendez-vous réguliers",
      price: "À partir de 250€/mois",
      color: "text-orange-600 bg-orange-50"
    }
  ];

  const coachingPlans = [
    {
      duration: "30 minutes",
      frequency: "2 rendez-vous par semaine",
      price: "250€/mois"
    },
    {
      duration: "1 heure",
      frequency: "2 rendez-vous par semaine",
      price: "400€/mois"
    },
    {
      duration: "2 heures",
      frequency: "2 rendez-vous par semaine",
      price: "700€/mois"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-blue-600">AlphaBeta Consulting</h1>
          <p className="text-gray-600 mt-2">Votre partenaire pour lancer votre activité</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-6">Lancez votre activité en toute confiance</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          De l'étude de faisabilité au coaching continu, nous vous accompagnons à chaque étape
          de la création et du développement de votre entreprise.
        </p>
        <Button
          size="lg"
          onClick={onStartFeasibility}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6"
        >
          Commencer l'étude de faisabilité gratuite
        </Button>
      </section>

      {/* Steps Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-center mb-12">Nos 4 étapes d'accompagnement</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-lg ${step.color} flex items-center justify-center mb-4`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="mb-2 text-gray-500">Étape {index + 1}</div>
              <h3 className="mb-3">{step.title}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <div className="text-blue-600">{step.price}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Coaching Details */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-4">Formules de coaching de dirigeants</h2>
          <p className="text-center text-gray-600 mb-12">
            Choisissez la formule qui correspond à vos besoins
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {coachingPlans.map((plan, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
                <div className="text-blue-600 mb-3">{plan.duration}</div>
                <div className="text-gray-600 mb-4">{plan.frequency}</div>
                <div className="text-blue-600">{plan.price}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
          <h2 className="text-white mb-4">Prêt à démarrer ?</h2>
          <p className="mb-8 text-blue-50">
            Commencez par notre étude de faisabilité gratuite et recevez immédiatement vos livrables
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={onStartFeasibility}
            className="bg-white text-blue-600 hover:bg-blue-50 border-0"
          >
            Démarrer maintenant
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 AlphaBeta Consulting. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
