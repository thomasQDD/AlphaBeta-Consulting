'use client';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { FeasibilityForm } from '@/components/FeasibilityForm';
import { AccountModal } from '@/components/AccountModal';
import { ShareModal } from '@/components/ShareModal';

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

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleFormComplete = (data: FormData) => {
    setFormData(data);
    setShowAccountModal(true);
  };

  const handleAccountCreated = (email: string) => {
    setIsLoggedIn(true);
    setShowAccountModal(false);
    // Sauvegarder dans localStorage
    localStorage.setItem('userEmail', email);
    if (formData) {
      localStorage.setItem('formData', JSON.stringify(formData));
    }
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!showForm ? (
        <Hero onStartFeasibility={() => setShowForm(true)} />
      ) : (
        <FeasibilityForm
          onComplete={handleFormComplete}
          onBack={() => setShowForm(false)}
        />
      )}

      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onAccountCreated={handleAccountCreated}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formData={formData}
      />
    </div>
  );
}
