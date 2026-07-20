import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Bed, Calendar as CalendarIcon, Users, Briefcase, Plus, Search, Edit, Trash2, Star, MapPin } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';
import { usePageTitle } from '../hooks/usePageTitle';
import { Badge, statusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
  useHotels, useAllRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, 
  useEmployees, useHotelReviews, useAdminBookings 
} from '../hooks/useApi';
import toast from 'react-hot-toast';
import { AIInsightsWidget } from '../components/ui/AIInsightsWidget';
import { OptimizedImage } from '../components/ui/Image';

const roomSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  roomType: z.string(),
  pricePerNight: z.number().min(1),
  maxGuests: z.number().min(1),
  bedCount: z.number().min(1),
  bedType: z.string(),
  size: z.number().min(1),
  view: z.string().optional(),
});

export default function OwnerDashboard() {
  usePageTitle('Owner Dashboard');
  const [activeTab, setActiveTab] = usePersistentState('owner_active_tab', 'hotels');
  
  // Real Data Hooks
  const { data: hotelsData } = useHotels(0, 50); // Assuming owner sees all for now, or backend filters
  const hotels = hotelsData?.data?.content || [];
  
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  
  const { data: roomsData } = useAllRooms(selectedHotelId || 0);
  const rooms = roomsData?.data || [];
  
  const { data: employeesData } = useEmployees();
  const employees = (employeesData?.data || []).filter(e => e.hotelId === selectedHotelId);

  const { data: reviewsData } = useHotelReviews(selectedHotelId || 0);
  const reviews = reviewsData?.data || [];

  const { data: bookingsData } = useAdminBookings();
  const bookings = (bookingsData?.data?.content || []).filter(b => b.hotelId === selectedHotelId);

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const roomForm = useForm({ resolver: zodResolver(roomSchema) });

  const handleCreateRoom = async (data: any) => {
    if (!selectedHotelId) return;
    try {
      if (editingRoom) await updateRoom.mutateAsync({ hotelId: selectedHotelId, roomId: editingRoom.id, data });
      else await createRoom.mutateAsync({ hotelId: selectedHotelId, data });
      toast.success(`Room ${editingRoom ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      setEditingRoom(null);
      roomForm.reset();
    } catch { toast.error('Failed to save room'); }
  };

  const openRoomModal = (room?: any) => {
    setEditingRoom(room);
    if (room) roomForm.reset(room);
    else roomForm.reset();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-surface-hover flex pt-[72px]">
      {/* Sidebar */}
      <aside className="w-64 bg-primary min-h-[calc(100vh-72px)] p-4 hidden lg:flex flex-col sticky top-[72px] shrink-0 shadow-2xl z-10 rounded-r-3xl overflow-hidden border-r border-white/10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="mb-10 px-4 py-4">
          <span className="text-transparent bg-clip-text gold-gradient font-serif text-2xl font-bold tracking-wider">Owner Portal</span>
          <span className="block text-xs font-bold text-secondary uppercase tracking-widest mt-2">Property Management</span>
        </div>
        <nav className="space-y-2 flex-1 relative z-10">
          {[
            { id: 'hotels', label: 'My Hotels', icon: Building2 },
            { id: 'rooms', label: 'Room Management', icon: Bed },
            { id: 'calendar', label: 'Availability', icon: CalendarIcon },
            { id: 'staff', label: 'Staff Management', icon: Briefcase },
            { id: 'reviews', label: 'Guest Reviews', icon: Users },
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
            { id: 'hotels', label: 'My Hotels', icon: Building2 },
            { id: 'rooms', label: 'Rooms', icon: Bed },
            { id: 'calendar', label: 'Availability', icon: CalendarIcon },
            { id: 'staff', label: 'Staff', icon: Briefcase },
            { id: 'reviews', label: 'Reviews', icon: Users },
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
      <main className="flex-1 w-full p-6 lg:p-10 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl font-serif font-bold text-text-base capitalize">{activeTab.replace('-', ' ')}</h1>
          
          {/* Global Hotel Selector for Context-Aware Tabs */}
          {activeTab !== 'hotels' && (
            <div className="relative w-full sm:w-72">
              <select 
                className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-bold text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none shadow-sm"
                value={selectedHotelId || ''}
                onChange={(e) => setSelectedHotelId(Number(e.target.value))}
              >
                <option value="">Select a property...</option>
                {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">▼</div>
            </div>
          )}
        </div>
        
        {selectedHotelId && activeTab === 'hotels' && (
          <AIInsightsWidget 
            hotel={hotels.find((h: any) => h.id === selectedHotelId) || hotels[0]} 
            bookings={bookings} 
            reviews={reviews} 
          />
        )}

        {activeTab === 'hotels' && (
          <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base overflow-hidden">
            <div className="p-6 border-b border-border-base flex items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" placeholder="Search properties..." className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface-hover">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Property Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {hotels.map((hotel: any) => (
                    <tr key={hotel.id} className="hover:bg-bg-surface-hover transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <OptimizedImage src={hotel.logoUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100&h=100&fit=crop'} alt="" className="w-12 h-12 rounded-xl object-cover" containerClassName="w-12 h-12 rounded-xl shrink-0" />
                          <div>
                            <div className="font-bold text-text-base">{hotel.name}</div>
                            <div className="text-sm font-medium text-text-muted mt-0.5">ID: #{hotel.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-text-muted">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {hotel.city}, {hotel.country}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-text-base">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary w-fit">
                          {hotel.starRating} <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && selectedHotelId && (
          <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base p-8">
             <div className="flex justify-end mb-6">
                <Button onClick={() => openRoomModal()} icon={<Plus className="w-4 h-4" />}>Add Room</Button>
             </div>
             <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-strong">
                    <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Room Name</th>
                    <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Type</th>
                    <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Capacity</th>
                    <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Price/Night</th>
                    <th className="text-right text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {rooms.map((room: any) => (
                    <tr key={room.id} className="hover:bg-bg-surface-hover transition-colors">
                      <td className="py-4 px-2 font-bold text-text-base">{room.name}</td>
                      <td className="py-4 px-2"><span className="px-2.5 py-1 rounded-md bg-bg-surface-active text-xs font-bold text-text-base">{room.roomType?.replace('_', ' ')}</span></td>
                      <td className="py-4 px-2 text-sm font-medium text-text-muted">{room.maxGuests} Guests</td>
                      <td className="py-4 px-2 font-bold text-text-base">${room.pricePerNight}</td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openRoomModal(room)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteRoom.mutate({ hotelId: selectedHotelId, roomId: room.id })} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff' && selectedHotelId && (
          <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base p-8">
            <h3 className="text-xl font-serif font-bold text-text-base mb-6">Staff Roster</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-strong">
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Employee ID</th>
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Position</th>
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Department</th>
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-bg-surface-hover transition-colors">
                        <td className="py-4 px-2 text-sm font-bold text-text-base">#{emp.id}</td>
                        <td className="py-4 px-2 text-sm font-bold text-text-base">{emp.position}</td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted">{emp.department}</td>
                        <td className="py-4 px-2"><Badge className={emp.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-bg-surface-active text-text-muted'}>{emp.status}</Badge></td>
                      </tr>
                    ))}
                    {employees.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-text-muted font-medium">No staff assigned to this property yet.</td></tr>}
                  </tbody>
                </table>
              </div>
          </div>
        )}

        {activeTab === 'reviews' && selectedHotelId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {reviews.length > 0 ? reviews.map((review: any) => (
                <div key={review.id} className="bg-bg-surface rounded-2xl border border-border-base p-6 shadow-sm hover:border-border-strong transition-colors">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-secondary fill-secondary' : 'text-border-strong'}`} />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-text-base leading-relaxed mb-4">"{review.comment}"</p>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Guest ID: #{review.userId}</p>
                </div>
              )) : (
                <div className="col-span-full bg-bg-surface rounded-2xl border border-border-base p-16 text-center shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-bg-surface-hover flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="text-lg font-bold text-text-base mb-1">No Reviews Yet</p>
                  <p className="text-text-muted font-medium">This property hasn't received any guest reviews.</p>
                </div>
              )}
          </div>
        )}
        
        {activeTab === 'calendar' && selectedHotelId && (
           <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-base p-8">
              <h3 className="text-xl font-serif font-bold text-text-base mb-6">Upcoming Reservations Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-strong">
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Reference</th>
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Dates</th>
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Guests</th>
                      <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-bg-surface-hover transition-colors">
                        <td className="py-4 px-2 text-sm font-bold text-text-base">#{booking.bookingReference}</td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> {booking.checkInDate} <span className="text-border-strong">→</span> {booking.checkOutDate}</td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted">{booking.guestCount} Guests</td>
                        <td className="py-4 px-2"><Badge {...statusBadge(booking.status)}>{booking.status}</Badge></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-text-muted font-medium">No reservations found for this property.</td></tr>}
                  </tbody>
                </table>
              </div>
           </div>
        )}

        {/* Please Select Property State */}
        {activeTab !== 'hotels' && !selectedHotelId && (
          <div className="bg-bg-surface rounded-2xl border border-border-base p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-bg-surface-hover flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-text-base mb-2">Select a Property</h2>
            <p className="text-text-muted font-medium max-w-md mx-auto">
              Please select a property from the dropdown above to manage its {activeTab.replace('-', ' ')}.
            </p>
          </div>
        )}

      </main>

      {/* Room Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingRoom ? 'Edit' : 'Add'} Room`} size="lg">
        <form onSubmit={roomForm.handleSubmit(handleCreateRoom)} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <Input label="Name" {...roomForm.register('name')} error={roomForm.formState.errors.name?.message as string} />
              <div>
                <label className="text-sm font-bold text-text-base mb-1.5 block">Room Type</label>
                <select {...roomForm.register('roomType')} className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-medium text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="STANDARD">Standard</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="SUITE">Suite</option>
                  <option value="VILLA">Villa</option>
                </select>
              </div>
              <Input label="Price / Night" type="number" {...roomForm.register('pricePerNight', { valueAsNumber: true })} error={roomForm.formState.errors.pricePerNight?.message as string} />
              <Input label="Max Guests" type="number" {...roomForm.register('maxGuests', { valueAsNumber: true })} error={roomForm.formState.errors.maxGuests?.message as string} />
              <Input label="Bed Count" type="number" {...roomForm.register('bedCount', { valueAsNumber: true })} error={roomForm.formState.errors.bedCount?.message as string} />
              <Input label="Bed Type" placeholder="e.g. King, Queen" {...roomForm.register('bedType')} error={roomForm.formState.errors.bedType?.message as string} />
              <Input label="Size (sqm)" type="number" {...roomForm.register('size', { valueAsNumber: true })} error={roomForm.formState.errors.size?.message as string} />
              <Input label="View" placeholder="e.g. Ocean, City" {...roomForm.register('view')} error={roomForm.formState.errors.view?.message as string} />
              <div className="col-span-2">
                <label className="text-sm font-bold text-text-base mb-1.5 block">Description</label>
                <textarea {...roomForm.register('description')} className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-medium text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none h-28" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border-base">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Room</Button>
            </div>
          </form>
      </Modal>
    </div>
  );
}
