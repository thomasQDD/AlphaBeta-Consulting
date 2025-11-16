import { jsPDF } from 'jspdf';

interface FormData {
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

const formatBusinessType = (value: string) => {
  const map: Record<string, string> = {
    'product': 'Produit',
    'service': 'Service'
  };
  return map[value] || value;
};

const formatActivityCategory = (value: string) => {
  const map: Record<string, string> = {
    'direct-sale': 'Vente directe',
    'commission': 'Commissions & intermédiation',
    'premium': 'Services premium & expertise',
    'other': 'Autres'
  };
  return map[value] || value;
};

const formatWhere = (where: string[]) => {
  const map: Record<string, string> = {
    'local': 'Local',
    'region': 'Région',
    'country': 'Pays',
    'online': 'Internet'
  };
  return where.map(w => map[w] || w).join(', ');
};

const formatNumber = (num: number): string => {
  // Format number with space as thousand separator for PDF compatibility
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const calculateFeasibilityScore = (data: FormData): number => {
  let score = 0;

  // Apport personnel et financement (max 20 points)
  const totalFunding = data.personalContribution + data.financialNeedAtLaunch;
  if (totalFunding > 0) score += Math.min(20, totalFunding / 5000);

  // Cohérence revenus vs charges (max 25 points)
  if (data.revenueToUse > 0 && data.monthlyCharges > 0) {
    const ratio = data.revenueToUse / data.monthlyCharges;
    if (ratio >= 2) score += 25;
    else if (ratio >= 1.5) score += 18;
    else if (ratio >= 1.2) score += 12;
    else score += 5;
  }

  // Équipe (max 20 points)
  const totalTeam = (data.workingAlone ? 1 : 0) + data.numberOfPartners + data.numberOfEmployees;
  if (totalTeam >= 5) score += 20;
  else if (totalTeam >= 3) score += 15;
  else if (totalTeam >= 2) score += 10;
  else score += 5;

  // Clarté du modèle économique (max 20 points)
  if (data.averageBasket > 0 && data.customersPerMonth > 0) score += 20;
  else if (data.revenueToUse > 0) score += 10;

  // Préparation (autorisations) (max 15 points)
  if (!data.needsAuthorizations) score += 15;
  else if (data.hasAuthorizations) score += 15;
  else if (data.authorizationCost > 0 && data.authorizationDelay > 0) score += 8;

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

const checkPageBreak = (doc: jsPDF, yPos: number, requiredSpace: number, title: string): number => {
  const pageHeight = 297; // A4 height in mm
  const maxY = 280; // Maximum Y position before footer

  if (yPos + requiredSpace > maxY) {
    doc.addPage();
    addHeader(doc, title);
    const currentPage = doc.getCurrentPageInfo().pageNumber;
    addFooter(doc, currentPage);
    return 55; // Return to starting Y position after header
  }

  return yPos;
};

export const generatePDF = (data: FormData, type: 'feasibility' | 'summary') => {
  const doc = new jsPDF();

  if (type === 'feasibility') {
    // Test de faisabilité (au mois)
    const pdfTitle = 'Test de Faisabilité (au mois)';
    addHeader(doc, pdfTitle);
    addFooter(doc, 1); // Add footer to first page

    let yPos = 55;
    const lineHeight = 10;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.businessName, 20, yPos);
    yPos += lineHeight + 10;

    // Section métriques
    yPos = checkPageBreak(doc, yPos, 100, pdfTitle);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Salaire visé (A)
    yPos = checkPageBreak(doc, yPos, lineHeight + 5, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Salaire vise (A)', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`${formatNumber(data.desiredSalary)} EUR`, 120, yPos);
    yPos += lineHeight + 5;

    // Chiffre d'affaires (B)
    yPos = checkPageBreak(doc, yPos, lineHeight + 5, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Chiffre d\'affaires (B)', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`${formatNumber(data.revenueToUse)} EUR`, 120, yPos);
    yPos += lineHeight + 5;

    // Nombre de clients (N)
    yPos = checkPageBreak(doc, yPos, lineHeight + 5, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre de clients (N)', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`${formatNumber(data.customersPerMonth || 0)}`, 120, yPos);
    yPos += lineHeight + 5;

    // Panier moyen (M)
    yPos = checkPageBreak(doc, yPos, lineHeight + 5, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Panier moyen (M)', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`${formatNumber(data.averageBasket)} EUR`, 120, yPos);
    yPos += lineHeight + 5;

    // Charges (Z)
    yPos = checkPageBreak(doc, yPos, lineHeight + 15, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Charges (Z)', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`${formatNumber(data.monthlyCharges)} EUR`, 120, yPos);
    yPos += lineHeight + 15;

    // Score de faisabilité
    yPos = checkPageBreak(doc, yPos, 70, pdfTitle);
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
    yPos = checkPageBreak(doc, yPos, 40, pdfTitle);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommandations', 20, yPos);
    yPos += lineHeight + 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
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

    // Footer is already added by checkPageBreak or initial setup

  } else {
    // Résumé opérationnel
    const pdfTitle = 'Résumé Opérationnel';
    addHeader(doc, pdfTitle);
    addFooter(doc, 1); // Add footer to first page

    let yPos = 55;
    const lineHeight = 8;

    // Nom du projet
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.businessName, 20, yPos);
    yPos += lineHeight + 8;

    // Produit/service - détail
    yPos = checkPageBreak(doc, yPos, 30, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Produit/Service', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formatBusinessType(data.businessType)} - ${formatActivityCategory(data.activityCategory)}`, 20, yPos);
    yPos += lineHeight;
    const detailLines = doc.splitTextToSize(data.whatYouSell || 'Non spécifié', 170);
    yPos = checkPageBreak(doc, yPos, detailLines.length * lineHeight + 8, pdfTitle);
    doc.text(detailLines, 20, yPos);
    yPos += detailLines.length * lineHeight + 8;

    // Description de l'activité (quoi, avec qui)
    yPos = checkPageBreak(doc, yPos, 30, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Description de l\'activité', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const activityLines = doc.splitTextToSize(data.teamDescription || 'Non specifie', 170);
    yPos = checkPageBreak(doc, yPos, activityLines.length * lineHeight + 15, pdfTitle);
    doc.text(activityLines, 20, yPos);
    yPos += activityLines.length * lineHeight + 3;

    const teamComposition = [];
    if (data.workingAlone) teamComposition.push('Fondateur');
    if (data.numberOfPartners > 0) teamComposition.push(`${data.numberOfPartners} associe(s)`);
    if (data.numberOfEmployees > 0) teamComposition.push(`${data.numberOfEmployees} salarie(s)`);
    doc.text(`Equipe: ${teamComposition.join(', ')}`, 20, yPos);
    yPos += lineHeight + 8;

    // Business model - reconstitution du CA - clientèle
    yPos = checkPageBreak(doc, yPos, 60, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Model', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Panier moyen: ${formatNumber(data.averageBasket)} EUR`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Nombre de clients vises: ${formatNumber(data.customersPerMonth || 0)} clients/mois`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Chiffre d'affaires: ${formatNumber(data.revenueToUse)} EUR / mois`, 20, yPos);
    yPos += lineHeight + 3;

    // Pour qui, où, quand, comment
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Clientèle:', 20, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.text(`Où: ${formatWhere(data.where)}${data.whereCity ? ' (' + data.whereCity + ')' : ''}`, 20, yPos);
    yPos += lineHeight;

    if (data.isSeasonal && data.highMonths.length > 0) {
      doc.text(`Quand: Mois forts - ${data.highMonths.slice(0, 3).join(', ')}`, 20, yPos);
      yPos += lineHeight;
    }

    const clientDescLines = doc.splitTextToSize(data.firstClientsDescription || 'Non specifie', 170);
    yPos = checkPageBreak(doc, yPos, clientDescLines.length * lineHeight + 8, pdfTitle);
    doc.text(clientDescLines, 20, yPos);
    yPos += clientDescLines.length * lineHeight + 8;

    // Avantage concurrentiel
    yPos = checkPageBreak(doc, yPos, 30, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Avantage Concurrentiel', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const advantageLines = doc.splitTextToSize(data.competitiveAdvantage || 'Non specifie', 170);
    yPos = checkPageBreak(doc, yPos, advantageLines.length * lineHeight + 8, pdfTitle);
    doc.text(advantageLines, 20, yPos);
    yPos += advantageLines.length * lineHeight + 8;

    // Besoin financier
    yPos = checkPageBreak(doc, yPos, 40, pdfTitle);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Besoin Financier', 20, yPos);
    yPos += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Apport personnel: ${formatNumber(data.personalContribution)} EUR`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Besoin de financement: ${formatNumber(data.financialNeedAtLaunch)} EUR`, 20, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatNumber(data.personalContribution + data.financialNeedAtLaunch)} EUR`, 20, yPos);
    yPos += lineHeight + 5;

    // Prochaines étapes
    yPos = checkPageBreak(doc, yPos, 60, pdfTitle);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, yPos, 170, 50, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Prochaines Étapes Recommandées', 25, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('1. Planifier un rendez-vous de validation (30 min, gratuit)', 25, yPos + 18);
    doc.text('2. Affiner votre business plan avec notre accompagnement', 25, yPos + 26);
    doc.text('3. Commencer l\'implémentation avec un coaching personnalisé', 25, yPos + 34);
    doc.text('4. Lancer votre activité avec confiance', 25, yPos + 42);

    // Footer is already added by checkPageBreak or initial setup
  }

  const filename = type === 'feasibility'
    ? `Test-Faisabilite-${data.businessName.replace(/\s+/g, '-')}.pdf`
    : `Resume-Operationnel-${data.businessName.replace(/\s+/g, '-')}.pdf`;

  doc.save(filename);
};
