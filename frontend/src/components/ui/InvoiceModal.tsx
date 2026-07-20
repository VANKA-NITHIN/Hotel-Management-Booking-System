import { Modal } from './Modal';
import { Button } from './Button';
import { Printer, Download, Building, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BookingInvoiceData {
  bookingId: string | number;
  hotelName: string;
  hotelAddress?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  totalAmount: number;
  status: string;
  createdAt?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingInvoiceData;
}

export function InvoiceModal({ isOpen, onClose, booking }: InvoiceModalProps) {
  const { formatPrice } = useCurrency();

  const nights = booking.checkIn && booking.checkOut
    ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
    : 1;

  const roomSubtotal = Math.round(booking.totalAmount / 1.12);
  const taxAmount = booking.totalAmount - roomSubtotal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Invoice" size="lg">
      <div className="p-4 sm:p-6 space-y-6 print:p-0" id="printable-invoice">
        {/* Header Branding */}
        <div className="flex items-start justify-between border-b border-border-base pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-serif font-bold text-lg">
                L
              </div>
              <span className="font-serif font-bold text-xl text-text-base tracking-wide">LUXURYSTAY</span>
            </div>
            <p className="text-xs text-text-muted">Enterprise Hospitality & Luxury Booking</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PAID & CONFIRMED
            </span>
            <p className="text-xs font-mono font-bold text-text-base mt-2">INVOICE #{booking.bookingId}</p>
            <p className="text-[11px] text-text-muted">Issued: {new Date(booking.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Guest & Hotel Info Grid */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-bg-surface-hover rounded-xl border border-border-base/50 text-xs">
          <div>
            <span className="font-bold text-text-muted uppercase tracking-wider block mb-1">Billed To</span>
            <p className="font-bold text-text-base text-sm">{booking.guestName}</p>
            <p className="text-text-muted mt-0.5">{booking.guestEmail}</p>
          </div>
          <div>
            <span className="font-bold text-text-muted uppercase tracking-wider block mb-1">Property Details</span>
            <p className="font-bold text-text-base text-sm flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-primary shrink-0" /> {booking.hotelName}
            </p>
            {booking.hotelAddress && <p className="text-text-muted mt-0.5">{booking.hotelAddress}</p>}
          </div>
        </div>

        {/* Stay Duration Details */}
        <div className="grid grid-cols-3 gap-4 border border-border-base rounded-xl p-4 text-center">
          <div>
            <span className="text-[11px] text-text-muted uppercase font-bold block">Check-in</span>
            <span className="text-sm font-bold text-text-base">{booking.checkIn}</span>
          </div>
          <div className="border-x border-border-base">
            <span className="text-[11px] text-text-muted uppercase font-bold block">Duration</span>
            <span className="text-sm font-bold text-primary">{nights} Night{nights > 1 ? 's' : ''} ({booking.guests} Guest{booking.guests > 1 ? 's' : ''})</span>
          </div>
          <div>
            <span className="text-[11px] text-text-muted uppercase font-bold block">Check-out</span>
            <span className="text-sm font-bold text-text-base">{booking.checkOut}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-border-base rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-4 bg-bg-surface-hover p-3 font-bold text-text-muted border-b border-border-base uppercase tracking-wider">
            <span className="col-span-2">Description</span>
            <span className="text-center">Rate / Night</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="grid grid-cols-4 p-3.5 border-b border-border-base/50 text-text-base">
            <span className="col-span-2 font-semibold">{booking.roomName} ({nights} nights)</span>
            <span className="text-center text-text-muted">{formatPrice(Math.round(roomSubtotal / nights))}</span>
            <span className="text-right font-bold">{formatPrice(roomSubtotal)}</span>
          </div>
          <div className="grid grid-cols-4 p-3.5 border-b border-border-base/50 text-text-base">
            <span className="col-span-2 text-text-muted">Taxes & Service Fees (12%)</span>
            <span className="text-center text-text-muted">—</span>
            <span className="text-right font-bold text-text-muted">{formatPrice(taxAmount)}</span>
          </div>
          <div className="grid grid-cols-4 p-4 bg-primary/5 font-bold text-sm text-text-base">
            <span className="col-span-3 text-right">Total Paid:</span>
            <span className="text-right text-primary text-base font-extrabold">{formatPrice(booking.totalAmount)}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
          <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print / Save PDF
          </Button>
          <Button icon={<Download className="w-4 h-4" />} onClick={handlePrint}>
            Download Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
}
