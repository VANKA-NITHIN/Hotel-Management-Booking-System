import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePersistentState } from '../hooks/usePersistentState';
import {
  LayoutDashboard, Users, Building2, Bed, Calendar, BarChart3,
  TrendingUp, Settings, Edit, Trash2, Plus,
  DollarSign, Package, ArrowUp, ArrowDown, MapPin, Star, Download
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
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { OptimizedImage } from '../components/ui/Image';
import { reportApi } from '../api';
import { useExport } from '../hooks/useExport';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['admin', 'common']);
  usePageTitle(t('admin:dashboard', 'Admin Dashboard'));
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
  const { downloadFile, isExporting } = useExport();

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
    <div className="min-h-screen bg-bg-surface-hover pt-[72px]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 3xl:w-80 bg-primary min-h-[calc(100vh-72px)] p-4 hidden lg:flex flex-col sticky top-[72px] shrink-0 shadow-2xl z-10 rounded-e-3xl overflow-hidden border-e border-white/10">
          <div className="absolute top-0 end-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="mb-10 px-4 py-4">
            <span className="text-transparent bg-clip-text gold-gradient font-serif text-2xl font-bold tracking-wider">{t('admin:dashboard', 'Admin Portal')}</span>
          </div>
          <nav className="space-y-2 flex-1 relative z-10">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-secondary text-primary shadow-lg shadow-secondary/20 translate-x-1'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-white/60'}`} /> {t(`common:${tab.id}`, tab.label)}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden sticky top-[72px] z-20 bg-bg-surface border-b border-border-base px-4 py-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-1">
            {adminTabs.map((tab) => (
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
                {t(`common:${tab.id}`, tab.label)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full p-6 lg:p-10 max-w-[100rem] 3xl:max-w-[140rem] mx-auto">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <h1 className="text-3xl font-serif font-bold text-text-base">{t('admin:overview', 'Dashboard Overview')}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
                ) : (
                  [
                    { label: t('admin:totalRevenue', 'Total Revenue'), value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, change: '+12.5%', up: true, icon: DollarSign, color: 'text-success bg-success/10' },
                    { label: t('admin:totalBookings', 'Total Bookings'), value: (stats?.totalBookings || 0).toLocaleString(), change: '+8.2%', up: true, icon: Package, color: 'text-secondary bg-secondary/10' },
                    { label: t('admin:totalUsers', 'Total Customers'), value: (stats?.totalCustomers || 0).toLocaleString(), change: '+15.3%', up: true, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
                    { label: t('admin:occupancyRate', 'Occupancy Rate'), value: `${stats?.occupancyRate || 0}%`, change: '+5.1%', up: true, icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10' },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-bg-surface rounded-2xl p-6 shadow-sm border border-border-base">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                        <span className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {stat.up ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}{stat.change}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-text-base font-serif">{stat.value}</div>
                      <div className="text-sm font-medium text-text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base">
                  <h3 className="text-lg font-bold text-text-base mb-6">Revenue Overview</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base">
                  <h3 className="text-lg font-bold text-text-base mb-6">Room Distribution</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={roomTypeData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" stroke="none">
                        {roomTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hotels' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-serif font-bold text-text-base">{t('admin:hotelManagement', 'Hotel Management')}</h1>
                <Button onClick={() => openModal()} icon={<Plus className="w-4 h-4" />}>{t('admin:addHotel', 'Add Hotel')}</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-strong">
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Property</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Location</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Rating</th>
                      <th className="text-end text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {hotels.map((hotel: any) => (
                      <tr key={hotel.id} className="hover:bg-bg-surface-hover transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-4">
                            <OptimizedImage src={hotel.logoUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100&h=100&fit=crop'} alt="" className="w-12 h-12 rounded-xl object-cover" containerClassName="w-12 h-12 rounded-xl shrink-0" />
                            <div className="font-bold text-text-base">{hotel.name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted">
                           <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {hotel.city}, {hotel.country}</div>
                        </td>
                        <td className="py-4 px-2 text-sm font-bold text-text-base">
                           <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary w-fit">
                              {hotel.starRating} <Star className="w-3.5 h-3.5 fill-current" />
                           </div>
                        </td>
                        <td className="py-4 px-2 text-end">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => openModal(hotel)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></button>
                             <button onClick={() => deleteHotel.mutate(hotel.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
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
              <div className="bg-bg-surface rounded-2xl p-6 sm:p-8 shadow-sm border border-border-base flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="flex-1 w-full max-w-md">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Select Property to Manage Rooms</label>
                  <div className="relative">
                     <select 
                       className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-bold text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                       value={selectedHotelId || ''}
                       onChange={(e) => setSelectedHotelId(Number(e.target.value))}
                     >
                       <option value="">Select a hotel...</option>
                       {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                     </select>
                     <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none">▼</div>
                  </div>
                </div>
                {selectedHotelId && (
                  <Button onClick={() => openModal()} icon={<Plus className="w-4 h-4" />} className="shrink-0">Add Room</Button>
                )}
              </div>

              {selectedHotelId && (
                <div className="bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border-strong">
                          <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Room Name</th>
                          <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Type</th>
                          <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Capacity</th>
                          <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Price/Night</th>
                          <th className="text-end text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-base">
                        {rooms.map((room: any) => (
                          <tr key={room.id} className="hover:bg-bg-surface-hover transition-colors">
                            <td className="py-4 px-2 font-bold text-text-base">{room.name}</td>
                            <td className="py-4 px-2"><span className="px-2.5 py-1 rounded-md bg-bg-surface-active text-xs font-bold text-text-base">{room.roomType?.replace('_', ' ')}</span></td>
                            <td className="py-4 px-2 text-sm font-medium text-text-muted">{room.maxGuests} Guests</td>
                            <td className="py-4 px-2 font-bold text-text-base">${room.pricePerNight}</td>
                            <td className="py-4 px-2 text-end">
                              <div className="flex items-center justify-end gap-2">
                                 <button onClick={() => { setEditingItem(room); roomForm.reset(room); setIsModalOpen(true); }} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></button>
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
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-serif font-bold text-text-base">{t('admin:recentBookings', 'All Bookings')}</h1>
                <div className="flex items-center gap-3">
                  <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={() => downloadFile(() => reportApi.exportAdminBookings('pdf'), 'pdf', { filenamePrefix: 'Admin_Bookings' })} disabled={isExporting}>
                    {t('admin:exportPDF', 'Export PDF')}
                  </Button>
                  <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={() => downloadFile(() => reportApi.exportAdminBookings('csv'), 'csv', { filenamePrefix: 'Admin_Bookings' })} disabled={isExporting}>
                    {t('admin:exportCSV', 'Export CSV')}
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-strong">
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Reference</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Hotel ID</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Check-in</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Check-out</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Status</th>
                      <th className="text-end text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-bg-surface-hover transition-colors">
                        <td className="py-4 px-2 text-sm font-bold text-text-base">#{booking.bookingReference}</td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted">{booking.hotelId}</td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted">{booking.checkInDate}</td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted">{booking.checkOutDate}</td>
                        <td className="py-4 px-2"><Badge {...statusBadge(booking.status)}>{booking.status}</Badge></td>
                        <td className="py-4 px-2 text-sm font-bold text-end text-text-base">${booking.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'employees' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-serif font-bold text-text-base">Employee Directory</h1>
                <div className="flex items-center gap-3">
                  <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={() => downloadFile(() => reportApi.exportAdminEmployees('pdf'), 'pdf', { filenamePrefix: 'Admin_Employees' })} disabled={isExporting}>
                    Export PDF
                  </Button>
                  <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={() => downloadFile(() => reportApi.exportAdminEmployees('csv'), 'csv', { filenamePrefix: 'Admin_Employees' })} disabled={isExporting}>
                    Export CSV
                  </Button>
                  <Button onClick={() => openModal()} icon={<Plus className="w-4 h-4" />}>Add Employee</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-strong">
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Employee ID</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Position</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Department</th>
                      <th className="text-start text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Status</th>
                      <th className="text-end text-xs font-bold text-text-muted uppercase tracking-wider pb-4 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-bg-surface-hover transition-colors">
                        <td className="py-4 px-2 text-sm font-bold text-text-base">#{emp.id}</td>
                        <td className="py-4 px-2 text-sm font-bold text-text-base">{emp.position}</td>
                        <td className="py-4 px-2 text-sm font-medium text-text-muted">{emp.department}</td>
                        <td className="py-4 px-2"><Badge className={emp.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-bg-surface-active text-text-muted'}>{emp.status}</Badge></td>
                        <td className="py-4 px-2 text-end">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => openModal(emp)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></button>
                             <button onClick={() => deleteEmployee.mutate(emp.id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <h1 className="text-3xl font-serif font-bold text-text-base">Analytics</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base">
                  <h3 className="text-lg font-bold text-text-base mb-6">Revenue & Bookings Trend</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#c9a84c" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#1a1a2e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h1 className="text-3xl font-serif font-bold text-text-base mb-6">Settings</h1>
              <div className="bg-bg-surface rounded-2xl p-8 shadow-sm border border-border-base flex justify-center">
                 <UserProfile 
                   appearance={{
                     elements: {
                       card: 'shadow-none border-0 bg-transparent',
                       navbar: 'hidden',
                       pageScrollBox: 'p-0',
                       headerTitle: 'text-2xl font-serif font-bold text-text-base',
                       headerSubtitle: 'text-text-muted font-medium',
                       formButtonPrimary: 'bg-primary hover:bg-primary-600 text-white font-bold',
                       formFieldInput: 'bg-bg-surface-hover border-border-base hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-primary',
                       formFieldLabel: 'text-sm font-bold text-text-base',
                     }
                   }}
                 />
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Reusable Modal for Forms */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingItem ? 'Edit' : 'Create'} ${activeTab.slice(0, -1)}`} size="lg">
        {activeTab === 'hotels' && (
          <form onSubmit={hotelForm.handleSubmit(handleCreateHotel)} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <Input label="Name" {...hotelForm.register('name')} error={hotelForm.formState.errors.name?.message as string} />
              <Input label="City" {...hotelForm.register('city')} error={hotelForm.formState.errors.city?.message as string} />
              <div className="col-span-2">
                <Input label="Address" {...hotelForm.register('address')} error={hotelForm.formState.errors.address?.message as string} />
              </div>
              <Input label="State" {...hotelForm.register('state')} error={hotelForm.formState.errors.state?.message as string} />
              <Input label="Country" {...hotelForm.register('country')} error={hotelForm.formState.errors.country?.message as string} />
              <Input label="ZIP Code" {...hotelForm.register('zipCode')} error={hotelForm.formState.errors.zipCode?.message as string} />
              <Input label="Star Rating" type="number" {...hotelForm.register('starRating', { valueAsNumber: true })} min="1" max="5" error={hotelForm.formState.errors.starRating?.message as string} />
              <div className="col-span-2">
                <label className="text-sm font-bold text-text-base mb-1.5 block">Description</label>
                <textarea {...hotelForm.register('description')} className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-medium text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none h-28" />
                {hotelForm.formState.errors.description && <p className="text-danger text-xs mt-1 font-medium">{hotelForm.formState.errors.description.message as string}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border-base">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Hotel</Button>
            </div>
          </form>
        )}

        {activeTab === 'rooms' && (
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
        )}

        {activeTab === 'employees' && (
          <form onSubmit={employeeForm.handleSubmit(handleCreateEmployee)} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <Input label="User ID" type="number" {...employeeForm.register('userId', { valueAsNumber: true })} error={employeeForm.formState.errors.userId?.message as string} />
              <Input label="Hotel ID" type="number" {...employeeForm.register('hotelId', { valueAsNumber: true })} error={employeeForm.formState.errors.hotelId?.message as string} />
              <Input label="Position" {...employeeForm.register('position')} error={employeeForm.formState.errors.position?.message as string} />
              <Input label="Department" {...employeeForm.register('department')} error={employeeForm.formState.errors.department?.message as string} />
              <Input label="Salary" type="number" {...employeeForm.register('salary', { valueAsNumber: true })} error={employeeForm.formState.errors.salary?.message as string} />
              <div>
                <label className="text-sm font-bold text-text-base mb-1.5 block">Status</label>
                <select {...employeeForm.register('status')} className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-medium text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border-base">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Employee</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
