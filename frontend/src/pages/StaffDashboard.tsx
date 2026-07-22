import { useState, useMemo } from 'react';
import { ClipboardList, Key, Users, CheckCircle, Clock, Building2 } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';
import { usePageTitle } from '../hooks/usePageTitle';
import { Badge, statusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  useHotels, useAdminBookings, useUpdateBookingStatus, 
  useHousekeeping, useUpdateHousekeepingStatus, useAllRooms 
} from '../hooks/useApi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const { t } = useTranslation(['staff', 'common']);
  usePageTitle(t('staff:dashboard', 'Staff Dashboard'));
  const [activeTab, setActiveTab] = usePersistentState('staff_active_tab', 'front-desk');
  
  const { data: hotelsData } = useHotels(0, 50);
  const hotels = hotelsData?.data?.content || [];
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);

  const { data: bookingsData } = useAdminBookings(0, 100);
  const bookings = (bookingsData?.data?.content || []).filter(b => b.hotelId === selectedHotelId);
  const updateBookingStatus = useUpdateBookingStatus();

  const { data: housekeepingData } = useHousekeeping(selectedHotelId || 0);
  const housekeepingTasks = housekeepingData?.data || [];
  const updateHousekeeping = useUpdateHousekeepingStatus();

  const { data: roomsData } = useAllRooms(selectedHotelId || 0);
  const rooms = roomsData?.data || [];

  // Filter today's arrivals and departures
  const today = new Date().toISOString().split('T')[0];
  const arrivals = useMemo(() => bookings.filter((b: any) => b.checkInDate === today), [bookings, today]);
  const departures = useMemo(() => bookings.filter((b: any) => b.checkOutDate === today), [bookings, today]);
  const inHouse = useMemo(() => bookings.filter((b: any) => b.status === 'CHECKED_IN'), [bookings]);

  const handleCheckIn = async (id: number) => {
    try {
      await updateBookingStatus.mutateAsync({ id, status: 'CHECKED_IN' });
      toast.success('Guest checked in successfully');
    } catch { toast.error('Check-in failed'); }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await updateBookingStatus.mutateAsync({ id, status: 'CHECKED_OUT' });
      toast.success('Guest checked out successfully');
    } catch { toast.error('Check-out failed'); }
  };

  const handleUpdateCleaning = async (id: number, status: string) => {
    try {
      await updateHousekeeping.mutateAsync({ id, status });
      toast.success('Room status updated');
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="min-h-screen bg-bg-surface-hover flex pt-[72px]">
      {/* Sidebar */}
      <aside className="w-64 3xl:w-80 bg-primary min-h-[calc(100vh-72px)] p-4 hidden lg:flex flex-col sticky top-[72px] shrink-0 shadow-2xl z-10 rounded-e-3xl overflow-hidden border-e border-white/10">
        <div className="absolute top-0 end-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="mb-10 px-4 py-4">
          <span className="text-transparent bg-clip-text gold-gradient font-serif text-2xl font-bold tracking-wider">{t('staff:dashboard', 'Staff Portal')}</span>
          <span className="block text-xs font-bold text-secondary uppercase tracking-widest mt-2">Operations & Service</span>
        </div>
        <nav className="space-y-2 flex-1 relative z-10">
          {[
            { id: 'front-desk', label: t('staff:reception', 'Front Desk'), icon: Key },
            { id: 'housekeeping', label: t('staff:housekeeping', 'Housekeeping'), icon: ClipboardList },
            { id: 'guests', label: t('staff:guestRequests', 'In-House Guests'), icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-secondary text-primary shadow-lg shadow-secondary/20 translate-x-1'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-white/60'}`} /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden sticky top-[72px] z-20 bg-bg-surface border-b border-border-base px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-1">
          {[
            { id: 'front-desk', label: t('staff:reception', 'Front Desk'), icon: Key },
            { id: 'housekeeping', label: t('staff:housekeeping', 'Housekeeping'), icon: ClipboardList },
            { id: 'guests', label: t('staff:guestRequests', 'In-House'), icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-base'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-text-muted'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full p-6 lg:p-10 max-w-[100rem] 3xl:max-w-[140rem] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl font-serif font-bold text-text-base capitalize">{activeTab.replace('-', ' ')}</h1>
          
          <div className="relative w-full sm:w-72">
            <select 
              className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-bold text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none shadow-sm"
              value={selectedHotelId || ''}
              onChange={(e) => setSelectedHotelId(Number(e.target.value))}
            >
              <option value="">Select a property...</option>
              {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">▼</div>
          </div>
        </div>

        {!selectedHotelId ? (
          <div className="bg-bg-surface rounded-2xl border border-border-base p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-bg-surface-hover flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-text-base mb-2">Select a Property</h2>
            <p className="text-text-muted font-medium max-w-md mx-auto">
              Please select a property from the dropdown above to manage operations.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'front-desk' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Arrivals */}
                <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base p-6 sm:p-8">
                  <h3 className="text-xl font-serif font-bold text-text-base mb-6 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-secondary" /> {t('staff:checkIns', "Today's Arrivals")} <span className="bg-secondary/10 text-secondary text-sm px-2.5 py-0.5 rounded-full">{arrivals.length}</span>
                  </h3>
                  <div className="space-y-4">
                    {arrivals.map((arr: any) => (
                      <div key={arr.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border-base hover:border-border-strong transition-colors bg-bg-surface-hover gap-4">
                        <div>
                          <p className="font-bold text-text-base">Ref: #{arr.bookingReference}</p>
                          <p className="text-sm font-medium text-text-muted mt-1">{arr.guestCount} Guests • Confirmed</p>
                        </div>
                        {arr.status === 'CONFIRMED' ? (
                          <Button size="sm" onClick={() => handleCheckIn(arr.id)}>Check-in</Button>
                        ) : arr.status === 'CHECKED_IN' ? (
                          <span className="flex items-center gap-1.5 text-sm text-success font-bold bg-success/10 px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-4 h-4" /> Checked In
                          </span>
                        ) : (
                          <Badge {...statusBadge(arr.status)}>{arr.status}</Badge>
                        )}
                      </div>
                    ))}
                    {arrivals.length === 0 && (
                       <div className="text-center py-8 text-text-muted font-medium">No arrivals scheduled for today.</div>
                    )}
                  </div>
                </div>

                {/* Departures */}
                <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base p-6 sm:p-8">
                  <h3 className="text-xl font-serif font-bold text-text-base mb-6 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-secondary" /> {t('staff:checkOuts', "Today's Departures")} <span className="bg-secondary/10 text-secondary text-sm px-2.5 py-0.5 rounded-full">{departures.length}</span>
                  </h3>
                  <div className="space-y-4">
                    {departures.map((dep: any) => (
                      <div key={dep.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border-base hover:border-border-strong transition-colors bg-bg-surface-hover gap-4">
                        <div>
                          <p className="font-bold text-text-base">Ref: #{dep.bookingReference}</p>
                          <p className="text-sm font-medium text-text-muted mt-1">Checking out today</p>
                        </div>
                        {dep.status === 'CHECKED_IN' ? (
                          <Button variant="outline" size="sm" onClick={() => handleCheckOut(dep.id)} className="hover:bg-danger/10 hover:text-danger hover:border-danger/30">Check-out</Button>
                        ) : dep.status === 'CHECKED_OUT' ? (
                          <span className="flex items-center gap-1.5 text-sm text-text-muted font-bold bg-bg-surface-active px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-4 h-4" /> Departed
                          </span>
                        ) : (
                          <Badge {...statusBadge(dep.status)}>{dep.status}</Badge>
                        )}
                      </div>
                    ))}
                    {departures.length === 0 && (
                       <div className="text-center py-8 text-text-muted font-medium">No departures scheduled for today.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'housekeeping' && (
              <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h3 className="text-xl font-serif font-bold text-text-base">Room Statuses</h3>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">Clean</span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">Dirty</span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">Maintenance</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {rooms.map((room: any) => {
                    const task = housekeepingTasks.find((t: any) => t.roomId === room.id);
                    const status = task?.status || 'CLEAN';
                    
                    return (
                      <div key={room.id} className="border border-border-base rounded-2xl p-5 flex flex-col justify-between bg-bg-surface hover:border-border-strong transition-colors">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="font-bold text-text-base text-lg">{room.name}</h4>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">{room.roomType?.replace('_', ' ')}</p>
                          </div>
                          <Badge className={
                            status === 'CLEAN' ? 'bg-success/10 text-success border border-success/20' : 
                            status === 'DIRTY' ? 'bg-danger/10 text-danger border border-danger/20' : 
                            'bg-warning/10 text-warning border border-warning/20'
                          }>{status}</Badge>
                        </div>
                        <div className="relative">
                           <select 
                             className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-2.5 text-sm font-bold text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                             value={status}
                             onChange={(e) => handleUpdateCleaning(task?.id || room.id, e.target.value)}
                           >
                             <option value="CLEAN">Mark as Clean</option>
                             <option value="DIRTY">Mark as Dirty</option>
                             <option value="MAINTENANCE">Maintenance Req.</option>
                           </select>
                           <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">▼</div>
                        </div>
                      </div>
                    );
                  })}
                  {rooms.length === 0 && <p className="col-span-full text-center text-text-muted font-medium py-12">No rooms found for this property.</p>}
                </div>
              </div>
            )}

            {activeTab === 'guests' && (
              <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base p-6 sm:p-8">
                <h3 className="text-xl font-serif font-bold text-text-base mb-6">In-House Guests <span className="bg-secondary/10 text-secondary text-sm px-2.5 py-0.5 rounded-full font-sans ms-2">{inHouse.length}</span></h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-strong">
                        <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Reference</th>
                        <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Check-in Date</th>
                        <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Check-out Date</th>
                        <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Guests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-base">
                      {inHouse.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-bg-surface-hover transition-colors">
                          <td className="py-4 px-2 font-bold text-text-base">#{booking.bookingReference}</td>
                          <td className="py-4 px-2 text-sm font-medium text-text-muted">{booking.checkInDate}</td>
                          <td className="py-4 px-2 text-sm font-medium text-text-muted">{booking.checkOutDate}</td>
                          <td className="py-4 px-2 text-sm font-medium text-text-muted flex items-center gap-2"><Users className="w-4 h-4" /> {booking.guestCount}</td>
                        </tr>
                      ))}
                      {inHouse.length === 0 && (
                        <tr><td colSpan={4} className="py-12 text-center text-text-muted font-medium">No guests currently checked in.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
