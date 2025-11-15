import { jsPDF } from 'jspdf';

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

const formatExperience = (value: string) => {
  const map: Record<string, string> = {
    'none': 'Aucune expérience',
    'some': 'Quelques années d\'expérience',
    'expert': 'Expert dans le domaine'
  };
  return map[value] || value;
};

const formatTeam = (value: string) => {
  const map: Record<string, string> = {
    'solo': 'Seul(e)',
    'small': 'Petite équipe (2-5 personnes)',
    'large': 'Équipe constituée (6+ personnes)'
  };
  return map[value] || value;
};

const formatTimeline = (value: string) => {
  const map: Record<string, string> = {
    'immediate': 'Immédiat (1-3 mois)',
    'medium': 'Moyen terme (3-6 mois)',
    'long': 'Long terme (6+ mois)'
  };
  return map[value] || value;
};

const calculateFeasibilityScore = (data: FormData): number => {
  let score = 0;

  // Investissement initial (max 20 points)
  if (data.initialInvestment > 0) score += Math.min(20, data.initialInvestment / 5000);

  // Chiffre d'affaires estimé (max 30 points)
  if (data.monthlyRevenue > 0) score += Math.min(30, data.monthlyRevenue / 1000);

  // Expérience (max 25 points)
  if (data.experience === 'expert') score += 25;
  else if (data.experience === 'some') score += 15;
  else score += 5;

  // Équipe (max 15 points)
  if (data.hasTeam === 'large') score += 15;
  else if (data.hasTeam === 'small') score += 10;
  else score += 5;

  // Budget marketing (max 10 points)
  if (data.marketingBudget > 0) score += Math.min(10, data.marketingBudget / 500);

  return Math.min(100, Math.round(score));
};

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('AlphaBeta Consulting', 20, 20);

  doc.setFontSize(16);
  doc.text(title, 20, 32);

  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc: jsPDF, pageNumber: number) => {
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Page ${pageNumber}`, 105, 285, { align: 'center' });
  doc.text(`© ${new Date().getFullYear()} AlphaBeta Consulting`, 105, 292, { align: 'center' });
};

export const generatePDF = (data: FormData, type: 'feasibility' | 'summary') => {
  const doc = new jsPDF();

  if (type === 'feasibility') {
    // Test de faisabilité
    addHeader(doc, 'Test de Faisabilité');

    let yPos = 55;
    const lineHeight = 8;

    // Informations générales
    doc.setFontSize(14);
    doc.text('Informations Générales', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(11);
    doc.text(`Nom du projet: ${data.businessName}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Type d'activité: ${data.businessType}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Localisation: ${data.location}`, 20, yPos);
    yPos += lineHeight + 5;

    // Aspects financiers
    doc.setFontSize(14);
    doc.text('Aspects Financiers', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(11);
    doc.text(`Investissement initial: ${data.initialInvestment.toLocaleString('fr-FR')} €`, 20, yPos);
    yPos += lineHeight;
    doc.text(`CA mensuel estimé: ${data.monthlyRevenue.toLocaleString('fr-FR')} €`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Budget marketing: ${data.marketingBudget.toLocaleString('fr-FR')} €`, 20, yPos);
    yPos += lineHeight + 5;

    // Expérience et équipe
    doc.setFontSize(14);
    doc.text('Expérience et Équipe', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(11);
    doc.text(`Expérience: ${formatExperience(data.experience)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Équipe: ${formatTeam(data.hasTeam)}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Calendrier: ${formatTimeline(data.timeline)}`, 20, yPos);
    yPos += lineHeight + 10;

    // Score de faisabilité
    const score = calculateFeasibilityScore(data);
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(20, yPos, 170, 30, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Score de Faisabilité', 105, yPos + 12, { align: 'center' });
    doc.setFontSize(24);
    doc.text(`${score}/100`, 105, yPos + 25, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos += 40;

    // Recommandations
    doc.setFontSize(14);
    doc.text('Recommandations', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(10);
    if (score >= 70) {
      doc.text('✓ Votre projet présente un bon potentiel de faisabilité.', 20, yPos);
      yPos += lineHeight;
      doc.text('✓ Nous recommandons de passer à l\'étape suivante.', 20, yPos);
    } else if (score >= 40) {
      doc.text('• Votre projet a du potentiel mais nécessite des ajustements.', 20, yPos);
      yPos += lineHeight;
      doc.text('• Planifiez un rendez-vous de validation pour affiner votre stratégie.', 20, yPos);
    } else {
      doc.text('! Votre projet nécessite une révision approfondie.', 20, yPos);
      yPos += lineHeight;
      doc.text('! Contactez-nous pour un accompagnement personnalisé.', 20, yPos);
    }

    addFooter(doc, 1);

  } else {
    // Résumé opérationnel
    addHeader(doc, 'Résumé Opérationnel');

    let yPos = 55;
    const lineHeight = 7;

    doc.setFontSize(14);
    doc.text(`Projet: ${data.businessName}`, 20, yPos);
    yPos += lineHeight + 5;

    // Marché cible
    doc.setFontSize(12);
    doc.text('Marché Cible', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    const targetMarketLines = doc.splitTextToSize(data.targetMarket || 'Non spécifié', 170);
    doc.text(targetMarketLines, 20, yPos);
    yPos += targetMarketLines.length * lineHeight + 5;

    // Proposition de valeur
    doc.setFontSize(12);
    doc.text('Proposition de Valeur Unique', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    const valueLines = doc.splitTextToSize(data.uniqueValue || 'Non spécifié', 170);
    doc.text(valueLines, 20, yPos);
    yPos += valueLines.length * lineHeight + 5;

    // Concurrents
    doc.setFontSize(12);
    doc.text('Analyse Concurrentielle', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    const competitorLines = doc.splitTextToSize(data.competitors || 'Non spécifié', 170);
    doc.text(competitorLines, 20, yPos);
    yPos += competitorLines.length * lineHeight + 10;

    // Prochaines étapes
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, yPos, 170, 50, 3, 3, 'F');

    doc.setFontSize(12);
    doc.text('Prochaines Étapes Recommandées', 25, yPos + 8);

    doc.setFontSize(10);
    doc.text('1. Planifier un rendez-vous de validation (30 min, gratuit)', 25, yPos + 18);
    doc.text('2. Affiner votre business plan avec notre accompagnement', 25, yPos + 26);
    doc.text('3. Commencer l\'implémentation avec un coaching personnalisé', 25, yPos + 34);
    doc.text('4. Lancer votre activité avec confiance', 25, yPos + 42);

    addFooter(doc, 1);
  }

  const filename = type === 'feasibility'
    ? `Test-Faisabilite-${data.businessName.replace(/\s+/g, '-')}.pdf`
    : `Resume-Operationnel-${data.businessName.replace(/\s+/g, '-')}.pdf`;

  doc.save(filename);
};
