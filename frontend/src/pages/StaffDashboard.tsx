import { useState, useMemo } from 'react';
import { ClipboardList, Key, Users, CheckCircle, Clock } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';
import { usePageTitle } from '../hooks/usePageTitle';
import { Badge, statusBadge } from '../components/ui/Badge';
import { 
  useHotels, useAdminBookings, useUpdateBookingStatus, 
  useHousekeeping, useUpdateHousekeepingStatus, useAllRooms 
} from '../hooks/useApi';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  usePageTitle('Staff Dashboard');
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white min-h-screen p-4 sticky top-0 flex flex-col shadow-2xl z-20">
        <div className="mb-8 px-4 py-3">
          <span className="text-transparent bg-clip-text gold-gradient font-serif text-xl font-bold">Staff Portal</span>
          <span className="block text-xs text-gray-400 mt-1">Operations & Service</span>
        </div>
        <nav className="space-y-1 flex-1">
          {[
            { id: 'front-desk', label: 'Front Desk', icon: Key },
            { id: 'housekeeping', label: 'Housekeeping', icon: ClipboardList },
            { id: 'guests', label: 'In-House Guests', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-secondary text-primary shadow-md translate-x-1'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
          
          <select 
            className="input-field max-w-xs"
            value={selectedHotelId || ''}
            onChange={(e) => setSelectedHotelId(Number(e.target.value))}
          >
            <option value="">Select a property...</option>
            {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        {!selectedHotelId ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Property</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Please select a property from the dropdown above to manage operations.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'front-desk' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Arrivals */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary" /> Today's Arrivals ({arrivals.length})
                  </h3>
                  <div className="space-y-3">
                    {arrivals.map((arr: any) => (
                      <div key={arr.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 gap-3">
                        <div>
                          <p className="font-medium text-gray-900">Ref: {arr.bookingReference}</p>
                          <p className="text-sm text-gray-500">{arr.guestCount} Guests • Confirmed</p>
                        </div>
                        {arr.status === 'CONFIRMED' ? (
                          <button onClick={() => handleCheckIn(arr.id)} className="btn-primary btn-sm">Check-in</button>
                        ) : arr.status === 'CHECKED_IN' ? (
                          <span className="flex items-center gap-1 text-sm text-success font-medium">
                            <CheckCircle className="w-4 h-4" /> Checked In
                          </span>
                        ) : (
                          <Badge {...statusBadge(arr.status)}>{arr.status}</Badge>
                        )}
                      </div>
                    ))}
                    {arrivals.length === 0 && <p className="text-gray-500 text-center py-4">No arrivals scheduled for today.</p>}
                  </div>
                </div>

                {/* Departures */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary" /> Today's Departures ({departures.length})
                  </h3>
                  <div className="space-y-3">
                    {departures.map((dep: any) => (
                      <div key={dep.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 gap-3">
                        <div>
                          <p className="font-medium text-gray-900">Ref: {dep.bookingReference}</p>
                          <p className="text-sm text-gray-500">Checking out today</p>
                        </div>
                        {dep.status === 'CHECKED_IN' ? (
                          <button onClick={() => handleCheckOut(dep.id)} className="btn-outline btn-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200">Check-out</button>
                        ) : dep.status === 'CHECKED_OUT' ? (
                          <span className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                            <CheckCircle className="w-4 h-4" /> Departed
                          </span>
                        ) : (
                          <Badge {...statusBadge(dep.status)}>{dep.status}</Badge>
                        )}
                      </div>
                    ))}
                    {departures.length === 0 && <p className="text-gray-500 text-center py-4">No departures scheduled for today.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'housekeeping' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">Room Statuses</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Clean</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Dirty</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Maintenance</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {rooms.map((room: any) => {
                    const task = housekeepingTasks.find((t: any) => t.roomId === room.id);
                    const status = task?.status || 'CLEAN';
                    
                    return (
                      <div key={room.id} className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900">{room.name}</h4>
                            <p className="text-xs text-gray-500">{room.roomType}</p>
                          </div>
                          <Badge className={
                            status === 'CLEAN' ? 'bg-green-100 text-green-700' : 
                            status === 'DIRTY' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }>{status}</Badge>
                        </div>
                        <select 
                          className="input-field text-sm"
                          value={status}
                          onChange={(e) => handleUpdateCleaning(task?.id || room.id, e.target.value)} // Fallback id if task doesn't exist
                        >
                          <option value="CLEAN">Mark as Clean</option>
                          <option value="DIRTY">Mark as Dirty</option>
                          <option value="MAINTENANCE">Maintenance Req.</option>
                        </select>
                      </div>
                    );
                  })}
                  {rooms.length === 0 && <p className="col-span-full text-center text-gray-500 py-8">No rooms found for this property.</p>}
                </div>
              </div>
            )}

            {activeTab === 'guests' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-6">In-House Guests ({inHouse.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Reference</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Check-in Date</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Check-out Date</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Guests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {inHouse.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="py-3 font-medium text-gray-900">{booking.bookingReference}</td>
                          <td className="py-3 text-sm text-gray-500">{booking.checkInDate}</td>
                          <td className="py-3 text-sm text-gray-500">{booking.checkOutDate}</td>
                          <td className="py-3 text-sm text-gray-500">{booking.guestCount}</td>
                        </tr>
                      ))}
                      {inHouse.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-500">No guests currently checked in.</td></tr>
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
