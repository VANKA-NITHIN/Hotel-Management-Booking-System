import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Bed, Calendar as CalendarIcon, Users, Briefcase, Plus, Search, Edit, Trash2, X, Star, MapPin } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';
import { usePageTitle } from '../hooks/usePageTitle';
import { Badge } from '../components/ui/Badge';
import { 
  useHotels, useAllRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, 
  useEmployees, useHotelReviews, useAdminBookings 
} from '../hooks/useApi';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white min-h-screen p-4 sticky top-0 flex flex-col shadow-2xl z-20">
        <div className="mb-8 px-4 py-3">
          <span className="text-transparent bg-clip-text gold-gradient font-serif text-xl font-bold">Owner Portal</span>
          <span className="block text-xs text-gray-400 mt-1">Property Management</span>
        </div>
        <nav className="space-y-1 flex-1">
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
          
          {/* Global Hotel Selector for Context-Aware Tabs */}
          {activeTab !== 'hotels' && (
            <select 
              className="input-field max-w-xs"
              value={selectedHotelId || ''}
              onChange={(e) => setSelectedHotelId(Number(e.target.value))}
            >
              <option value="">Select a property...</option>
              {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          )}
        </div>

        {activeTab === 'hotels' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search hotels..." className="input-field pl-9 py-2 text-sm" />
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hotels.map((hotel: any) => (
                  <tr key={hotel.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={hotel.logoUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-medium text-gray-900">{hotel.name}</div>
                          <div className="text-sm text-gray-500">ID: #{hotel.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1 mt-1.5"><MapPin className="w-3.5 h-3.5" /> {hotel.city}, {hotel.country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{hotel.starRating} Stars</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'rooms' && selectedHotelId && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <div className="flex justify-end mb-4">
                <button onClick={() => openRoomModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" /> Add Room</button>
             </div>
             <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Room Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Capacity</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Price/Night</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rooms.map((room: any) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{room.name}</td>
                      <td className="py-3"><Badge className="bg-gray-100 text-gray-700">{room.roomType}</Badge></td>
                      <td className="py-3 text-sm text-gray-500">{room.maxGuests} Guests</td>
                      <td className="py-3 font-bold text-gray-900">${room.pricePerNight}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => openRoomModal(room)} className="text-secondary hover:text-secondary-dark p-2"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteRoom.mutate({ hotelId: selectedHotelId, roomId: room.id })} className="text-danger hover:text-danger-dark p-2"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff' && selectedHotelId && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Staff Roster</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Employee ID</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Position</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Department</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">#{emp.id}</td>
                        <td className="py-3 text-sm text-gray-900">{emp.position}</td>
                        <td className="py-3 text-sm text-gray-500">{emp.department}</td>
                        <td className="py-3"><Badge className={emp.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}>{emp.status}</Badge></td>
                      </tr>
                    ))}
                    {employees.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No staff assigned to this property yet.</td></tr>}
                  </tbody>
                </table>
              </div>
          </div>
        )}

        {activeTab === 'reviews' && selectedHotelId && (
          <div className="space-y-4">
             {reviews.length > 0 ? reviews.map((review: any) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-secondary fill-secondary" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">"{review.comment}"</p>
                  <p className="text-xs text-gray-400 mt-2">By Guest ID: {review.userId}</p>
                </div>
              )) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                  <p className="text-gray-500">No reviews yet for this property.</p>
                </div>
              )}
          </div>
        )}
        
        {activeTab === 'calendar' && selectedHotelId && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Upcoming Reservations Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Reference</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Dates</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Guests</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{booking.bookingReference}</td>
                        <td className="py-3 text-sm text-gray-500">{booking.checkInDate} → {booking.checkOutDate}</td>
                        <td className="py-3 text-sm text-gray-500">{booking.guestCount} Guests</td>
                        <td className="py-3"><Badge className="bg-gray-100 text-gray-700">{booking.status}</Badge></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No reservations found.</td></tr>}
                  </tbody>
                </table>
              </div>
           </div>
        )}

        {/* Please Select Property State */}
        {activeTab !== 'hotels' && !selectedHotelId && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Property</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Please select a property from the dropdown above to manage its {activeTab}.
            </p>
          </div>
        )}

      </main>

      {/* Room Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{editingRoom ? 'Edit Room' : 'Add Room'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={roomForm.handleSubmit(handleCreateRoom)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                      <input type="text" {...roomForm.register('name')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Room Type</label>
                      <select {...roomForm.register('roomType')} className="input-field">
                        <option value="STANDARD">Standard</option>
                        <option value="DELUXE">Deluxe</option>
                        <option value="SUITE">Suite</option>
                        <option value="VILLA">Villa</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Price / Night</label>
                      <input type="number" {...roomForm.register('pricePerNight', { valueAsNumber: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Max Guests</label>
                      <input type="number" {...roomForm.register('maxGuests', { valueAsNumber: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Bed Count</label>
                      <input type="number" {...roomForm.register('bedCount', { valueAsNumber: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Bed Type</label>
                      <input type="text" {...roomForm.register('bedType')} className="input-field" placeholder="e.g. King, Queen" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Size (sqm)</label>
                      <input type="number" {...roomForm.register('size', { valueAsNumber: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">View</label>
                      <input type="text" {...roomForm.register('view')} className="input-field" placeholder="e.g. Ocean, City" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                      <textarea {...roomForm.register('description')} className="input-field resize-none h-24" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary">Save Room</button>
                  </div>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
