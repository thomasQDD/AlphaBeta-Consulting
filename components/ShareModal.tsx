'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Mail, MessageSquare, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
}

export function ShareModal({ isOpen, onClose, formData }: ShareModalProps) {
  const shareText = `J'ai complété mon étude de faisabilité avec AlphaBeta Consulting pour mon projet : ${formData?.businessName || 'mon projet'}`;

  const handleEmailShare = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const subject = encodeURIComponent('Mon étude de faisabilité - AlphaBeta Consulting');
    const body = encodeURIComponent(`${shareText}\n\nConsultez AlphaBeta Consulting pour lancer votre propre projet : ${shareUrl}`);
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const handleWhatsAppShare = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleSMSShare = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    if (typeof window !== 'undefined') {
      window.location.href = `sms:?&body=${text}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compte créé avec succès !</DialogTitle>
          <DialogDescription>
            Votre travail a été sauvegardé. Vous pouvez maintenant le partager avec d'autres.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleEmailShare}
          >
            <Mail className="mr-2 h-4 w-4" />
            Partager par Email
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleWhatsAppShare}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Partager sur WhatsApp
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSMSShare}
          >
            <Send className="mr-2 h-4 w-4" />
            Partager par SMS
          </Button>
        </div>

        <Button onClick={onClose} className="w-full mt-4">
          Terminer
        </Button>
      </DialogContent>
    </Dialog>
  );
}
