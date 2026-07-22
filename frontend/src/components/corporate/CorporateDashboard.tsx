import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  Building2, Users, Briefcase, TrendingUp, DollarSign, 
  MapPin, Clock, Calendar, ShieldCheck, X 
} from 'lucide-react';
import { 
  useMyCompany, useCompanyEmployees, useCorporateBookings, 
  useCorporateAnalytics, usePendingInvitations, useInviteEmployee 
} from '../../hooks/useApi';
import CorporateOnboarding from './CorporateOnboarding';
import { useCurrency } from '../../contexts/CurrencyContext';
import { reportApi } from '../../api';
import { useExport } from '../../hooks/useExport';
import { Download } from 'lucide-react';

export default function CorporateDashboard() {
  const { user: clerkUser } = useUser();
  // Using public metadata or passing down full user would be better, but we'll use an API call or just the metadata here.
  // Actually, we can get the user profile from authApi if needed, or just rely on the backend via useMyCompany().
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'directory' | 'bookings' | 'analytics' | 'admin'>('overview');

  if (companyLoading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  // If user has no company, show onboarding
  if (!company && !clerkUser?.publicMetadata?.companyId) {
    return (
      <div className="py-8">
        <CorporateOnboarding onSuccess={() => window.location.reload()} />
      </div>
    );
  }

  // If company is pending approval
  if (company?.status === 'PENDING' || company?.status === 'UNDER_REVIEW') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-200 dark:border-orange-800 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
          <Clock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Under Review</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your company <strong>{company?.name}</strong> is currently being reviewed by our team. 
          You will receive an email once your corporate account is approved and activated.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{company?.name} Portal</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
            Verified Enterprise Account • {((clerkUser?.publicMetadata?.companyRole as string) || 'EMPLOYEE').replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'directory', label: 'Employee Directory', icon: Users },
          { id: 'bookings', label: 'Corporate Bookings', icon: Briefcase },
          { id: 'analytics', label: 'Analytics & Spend', icon: DollarSign },
          { id: 'admin', label: 'Administration', icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <CorporateOverview />}
        {activeTab === 'directory' && <EmployeeDirectory role={clerkUser?.publicMetadata?.companyRole as string} />}
        {activeTab === 'bookings' && <CorporateBookings role={clerkUser?.publicMetadata?.companyRole as string} />}
        {activeTab === 'analytics' && <CorporateAnalyticsView formatPrice={formatPrice} />}
        {activeTab === 'admin' && <CorporateAdministration company={company} />}
      </div>
    </div>
  );
}

function CorporateOverview() {
  const { data: analytics, isLoading } = useCorporateAnalytics();
  const { formatPrice } = useCurrency();

  if (isLoading) return <div className="h-64 flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Employees</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.totalEmployees || 0}</h3>
            <span className="text-sm text-green-600 mb-1">{analytics?.activeEmployees || 0} active</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Corporate Bookings</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.totalBookings || 0}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Spend</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(analytics?.monthlySpend || 0)}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Trip Cost</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(analytics?.averageBookingValue || 0)}</h3>
        </div>
      </div>
    </div>
  );
}

function EmployeeDirectory({ role }: { role?: string }) {
  const { data: employees, isLoading } = useCompanyEmployees();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const canInvite = role === 'SUPER_ADMIN' || role === 'CORPORATE_ADMIN' || role === 'HR_MANAGER';

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Employee Directory</h3>
        {canInvite && (
          <button 
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Invite Employee
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Department</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Job Title</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {employees?.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{emp.firstName} {emp.lastName}</p>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {emp.companyRole?.replace('_', ' ') || 'EMPLOYEE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                  {emp.department || '-'}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                  {emp.jobTitle || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const { mutate: invite, isPending } = useInviteEmployee();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    invite({ email, role }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invite Employee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corporate Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="EMPLOYEE">Employee</option>
              <option value="DEPARTMENT_MANAGER">Department Manager</option>
              <option value="TRAVEL_MANAGER">Travel Manager</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CorporateBookings({ role }: { role?: string }) {
  const { data: bookings, isLoading } = useCorporateBookings();
  const { formatPrice } = useCurrency();
  const { downloadFile, isExporting } = useExport();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Corporate Bookings</h3>
          <p className="text-sm text-gray-500">Viewing {role === 'EMPLOYEE' ? 'your corporate bookings' : 'all team bookings'}</p>
        </div>
        {(role === 'COMPANY_ADMIN' || role === 'TRAVEL_MANAGER' || role === 'SUPER_ADMIN') && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => downloadFile(() => reportApi.exportCorporateBookings('pdf'), 'pdf', { filenamePrefix: 'Corporate_Bookings' })}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Download size={16} /> PDF
            </button>
            <button 
              onClick={() => downloadFile(() => reportApi.exportCorporateBookings('csv'), 'csv', { filenamePrefix: 'Corporate_Bookings' })}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Download size={16} /> CSV
            </button>
          </div>
        )}
      </div>
      
      {bookings?.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No corporate bookings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Reference</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Employee</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Hotel</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Dates</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {bookings?.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{b.bookingReference}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{b.guestName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{b.hotelName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatPrice(b.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CorporateAnalyticsView({ formatPrice }: { formatPrice: (val: number) => string }) {
  const { data: analytics } = useCorporateAnalytics();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Spend by Department</h3>
          {analytics?.spendByDepartment?.length ? (
            <div className="space-y-4">
              {analytics.spendByDepartment.map(dept => (
                <div key={dept.department} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                  <span className="text-gray-600 dark:text-gray-300">{dept.department}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(dept.spend)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No departmental spend data available yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Destinations</h3>
          {analytics?.topDestinations?.length ? (
            <div className="space-y-4">
              {analytics.topDestinations.map(dest => (
                <div key={dest.destination} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                  <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    {dest.destination}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{dest.bookingCount} trips</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No destination data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CorporateAdministration({ company }: { company: any }) {
  const { data: invitations } = usePendingInvitations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Company Profile</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{company?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Code</p>
              <p className="font-medium text-gray-900 dark:text-white">{company?.companyCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{company?.contactEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                {company?.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pending Invitations</h3>
          {invitations?.length ? (
            <div className="space-y-3">
              {invitations.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{inv.email}</p>
                    <p className="text-xs text-gray-500">Role: {inv.role?.replace('_', ' ')} • Sent by {inv.createdByUserName}</p>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Pending</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending invitations.</p>
          )}
        </div>
      </div>

      <div className="col-span-1 space-y-4">
        {/* Placeholders for Future Enterprise Features */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <ShieldCheck className="mx-auto text-gray-400 mb-2" size={24} />
          <h4 className="font-medium text-gray-900 dark:text-white">Travel Policies</h4>
          <p className="text-xs text-gray-500 mt-1">Configure spending limits and approval workflows. (Coming Soon)</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <Calendar className="mx-auto text-gray-400 mb-2" size={24} />
          <h4 className="font-medium text-gray-900 dark:text-white">Cost Centers</h4>
          <p className="text-xs text-gray-500 mt-1">Manage departmental budgets and project codes. (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
