import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePersistentState } from '../hooks/usePersistentState';
import {
  LayoutDashboard, Users, Building2, Bed, Calendar, BarChart3,
  TrendingUp, Settings, Edit, Trash2, Plus,
  DollarSign, Package, ArrowUp, ArrowDown, MapPin, X
} from 'lucide-react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserProfile } from '@clerk/clerk-react';
import { 
  useDashboardStats, useAdminBookings, useMonthlyStats, useHotels, 
  useCreateHotel, useUpdateHotel, useDeleteHotel,
  useAllRooms, useCreateRoom, useUpdateRoom, useDeleteRoom,
  useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee
} from '../hooks/useApi';
import { Badge, statusBadge } from '../components/ui/Badge';
import { StatsCardSkeleton } from '../components/ui/Skeleton';
import { usePageTitle } from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const roomTypeData = [
  { name: 'Luxury Suite', value: 35, color: '#c9a84c' },
  { name: 'Deluxe', value: 28, color: '#1a1a2e' },
  { name: 'Executive', value: 20, color: '#0f3460' },
  { name: 'Standard', value: 12, color: '#6b7280' },
  { name: 'Villa', value: 5, color: '#10b981' },
];

const adminTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'hotels', label: 'Hotels', icon: Building2 },
  { id: 'rooms', label: 'Rooms', icon: Bed },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const hotelSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  zipCode: z.string().min(4, 'ZIP code is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  starRating: z.number().min(1).max(5),
});

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

const employeeSchema = z.object({
  userId: z.number(),
  hotelId: z.number(),
  position: z.string(),
  department: z.string(),
  salary: z.number().min(0),
  status: z.string(),
});


export default function AdminDashboard() {
  usePageTitle('Admin Dashboard');
  const [activeTab, setActiveTab] = usePersistentState('admin_active_tab', 'overview');
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: monthlyStats } = useMonthlyStats();
  const { data: bookingsData } = useAdminBookings();
  const { data: hotelsData } = useHotels(0, 100);
  const { data: employeesData } = useEmployees();

  const createHotel = useCreateHotel();
  const updateHotel = useUpdateHotel();
  const deleteHotel = useDeleteHotel();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const stats = statsData?.data;
  const chartData = monthlyStats?.data ?? [];
  const bookings = bookingsData?.data?.content || [];
  const hotels = hotelsData?.data?.content || [];
  const employees = employeesData?.data || [];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Forms
  const hotelForm = useForm({ resolver: zodResolver(hotelSchema) });
  const employeeForm = useForm({ resolver: zodResolver(employeeSchema) });

  const handleCreateHotel = async (data: any) => {
    try {
      if (editingItem) await updateHotel.mutateAsync({ id: editingItem.id, data });
      else await createHotel.mutateAsync(data);
      toast.success(`Hotel ${editingItem ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      setEditingItem(null);
      hotelForm.reset();
    } catch { toast.error('Failed to save hotel'); }
  };

  const handleCreateEmployee = async (data: any) => {
    try {
      if (editingItem) await updateEmployee.mutateAsync({ id: editingItem.id, data });
      else await createEmployee.mutateAsync(data);
      toast.success(`Employee ${editingItem ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
      setEditingItem(null);
      employeeForm.reset();
    } catch { toast.error('Failed to save employee'); }
  };

  const openModal = (item?: any) => {
    setEditingItem(item);
    if (activeTab === 'hotels') {
      if (item) hotelForm.reset(item);
      else hotelForm.reset({ starRating: 5 });
    }
    if (activeTab === 'employees') {
      if (item) employeeForm.reset(item);
      else employeeForm.reset({ status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const { data: roomsData } = useAllRooms(selectedHotelId || 0);
  const rooms = roomsData?.data || [];
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const roomForm = useForm({ resolver: zodResolver(roomSchema) });

  const handleCreateRoom = async (data: any) => {
    if (!selectedHotelId) return;
    try {
      if (editingItem) await updateRoom.mutateAsync({ hotelId: selectedHotelId, roomId: editingItem.id, data });
      else await createRoom.mutateAsync({ hotelId: selectedHotelId, data });
      toast.success(`Room ${editingItem ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      setEditingItem(null);
      roomForm.reset();
    } catch { toast.error('Failed to save room'); }
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-primary min-h-[calc(100vh-5rem)] p-4 hidden lg:flex flex-col sticky top-20 shrink-0 shadow-2xl z-10 rounded-r-2xl border-r border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="mb-8 px-4 py-3">
            <span className="text-transparent bg-clip-text gold-gradient font-serif text-xl font-bold tracking-wide">Admin Portal</span>
          </div>
          <nav className="space-y-1 flex-1 relative z-10">
            {adminTabs.map((tab) => (
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
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
                ) : (
                  [
                    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, change: '+12.5%', up: true, icon: DollarSign, color: 'text-green-500 bg-green-50' },
                    { label: 'Total Bookings', value: (stats?.totalBookings || 0).toLocaleString(), change: '+8.2%', up: true, icon: Package, color: 'text-secondary bg-secondary/10' },
                    { label: 'Total Customers', value: (stats?.totalCustomers || 0).toLocaleString(), change: '+15.3%', up: true, icon: Users, color: 'text-blue-500 bg-blue-50' },
                    { label: 'Occupancy Rate', value: `${stats?.occupancyRate || 0}%`, change: '+5.1%', up: true, icon: TrendingUp, color: 'text-purple-500 bg-purple-50' },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                        <span className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.up ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}{stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Revenue Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Room Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={roomTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                        {roomTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hotels' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Hotel Management</h1>
                <button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" /> Add Hotel</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Property</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Location</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Rating</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {hotels.map((hotel: any) => (
                      <tr key={hotel.id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img src={hotel.logoUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div className="font-medium text-gray-900">{hotel.name}</div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-500 flex items-center gap-1 mt-2.5"><MapPin className="w-3.5 h-3.5" /> {hotel.city}, {hotel.country}</td>
                        <td className="py-3 text-sm font-bold text-gray-900">{hotel.starRating} Stars</td>
                        <td className="py-3 text-right">
                          <button onClick={() => openModal(hotel)} className="text-secondary hover:text-secondary-dark p-2"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteHotel.mutate(hotel.id)} className="text-danger hover:text-danger-dark p-2"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'rooms' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Select Property to Manage Rooms</label>
                  <select 
                    className="input-field max-w-md"
                    value={selectedHotelId || ''}
                    onChange={(e) => setSelectedHotelId(Number(e.target.value))}
                  >
                    <option value="">Select a hotel...</option>
                    {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                {selectedHotelId && (
                  <button onClick={() => openModal()} className="btn-primary shrink-0"><Plus className="w-4 h-4 mr-2" /> Add Room</button>
                )}
              </div>

              {selectedHotelId && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                              <button onClick={() => { setEditingItem(room); roomForm.reset(room); setIsModalOpen(true); }} className="text-secondary hover:text-secondary-dark p-2"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => deleteRoom.mutate({ hotelId: selectedHotelId, roomId: room.id })} className="text-danger hover:text-danger-dark p-2"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Reference</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Hotel ID</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Check-in</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Check-out</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Status</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{booking.bookingReference}</td>
                        <td className="py-3 text-sm text-gray-500">#{booking.hotelId}</td>
                        <td className="py-3 text-sm text-gray-500">{booking.checkInDate}</td>
                        <td className="py-3 text-sm text-gray-500">{booking.checkOutDate}</td>
                        <td className="py-3"><Badge {...statusBadge(booking.status)}>{booking.status}</Badge></td>
                        <td className="py-3 text-sm font-bold text-right">${booking.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'employees' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
                <button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" /> Add Employee</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Employee ID</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Position</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Department</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Status</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">#{emp.id}</td>
                        <td className="py-3 text-sm text-gray-900">{emp.position}</td>
                        <td className="py-3 text-sm text-gray-500">{emp.department}</td>
                        <td className="py-3"><Badge className={emp.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}>{emp.status}</Badge></td>
                        <td className="py-3 text-right">
                          <button onClick={() => openModal(emp)} className="text-secondary hover:text-secondary-dark p-2"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteEmployee.mutate(emp.id)} className="text-danger hover:text-danger-dark p-2"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Revenue & Bookings</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip /><Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} />
                      <Line type="monotone" dataKey="bookings" stroke="#1a1a2e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-center">
                 <UserProfile />
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Reusable Modal for Forms */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              {activeTab === 'hotels' && (
                <form onSubmit={hotelForm.handleSubmit(handleCreateHotel)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                      <input type="text" {...hotelForm.register('name')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
                      <input type="text" {...hotelForm.register('city')} className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
                      <input type="text" {...hotelForm.register('address')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                      <input type="text" {...hotelForm.register('state')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Country</label>
                      <input type="text" {...hotelForm.register('country')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ZIP Code</label>
                      <input type="text" {...hotelForm.register('zipCode')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Star Rating</label>
                      <input type="number" {...hotelForm.register('starRating', { valueAsNumber: true })} className="input-field" min="1" max="5" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                      <textarea {...hotelForm.register('description')} className="input-field resize-none h-24" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary">Save Hotel</button>
                  </div>
                </form>
              )}

              {activeTab === 'rooms' && (
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
              )}

              {activeTab === 'employees' && (
                <form onSubmit={employeeForm.handleSubmit(handleCreateEmployee)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">User ID</label>
                      <input type="number" {...employeeForm.register('userId', { valueAsNumber: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Hotel ID</label>
                      <input type="number" {...employeeForm.register('hotelId', { valueAsNumber: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Position</label>
                      <input type="text" {...employeeForm.register('position')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Department</label>
                      <input type="text" {...employeeForm.register('department')} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Salary</label>
                      <input type="number" {...employeeForm.register('salary', { valueAsNumber: true })} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                      <select {...employeeForm.register('status')} className="input-field">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary">Save Employee</button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
