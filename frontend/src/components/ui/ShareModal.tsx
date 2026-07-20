import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Copy, Check, Share2, Mail, MessageSquare, Globe, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  description?: string;
}

export function ShareModal({ isOpen, onClose, title, url = window.location.href, description }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Property link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(`Check out ${title} on LuxuryStay! ${description || ''}`);
  const encodedUrl = encodeURIComponent(url);

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
      href: `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`,
    },
    {
      name: 'Twitter / X',
      icon: Globe,
      color: 'bg-sky-500/10 text-sky-600 hover:bg-sky-500/20',
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: Globe,
      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${shareText}%20${encodedUrl}`,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Property" size="md">
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 p-3 bg-bg-surface-hover rounded-xl border border-border-base/50">
          <Share2 className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-text-base truncate">{title}</h4>
            <p className="text-xs text-text-muted truncate">{url}</p>
          </div>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">Direct Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 bg-bg-surface-hover border border-border-base rounded-xl px-3 py-2.5 text-xs text-text-base font-mono focus:outline-none"
            />
            <Button
              onClick={handleCopy}
              icon={copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 block">Share Via</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-3 rounded-xl border border-border-base/50 transition-all font-bold text-xs gap-2 ${item.color}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* QR Code Toggle */}
        <div className="border-t border-border-base pt-4">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-between w-full text-xs font-bold text-text-base hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary" /> Mobile QR Code
            </span>
            <span className="text-primary underline">{showQR ? 'Hide QR' : 'Show QR'}</span>
          </button>

          {showQR && (
            <div className="mt-4 p-6 bg-white rounded-2xl border border-border-base flex flex-col items-center text-center animate-in fade-in duration-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodedUrl}`}
                alt="QR Code"
                className="w-40 h-40 rounded-lg shadow-sm mb-3"
              />
              <p className="text-xs font-semibold text-gray-700">Scan with your mobile camera to view property</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
