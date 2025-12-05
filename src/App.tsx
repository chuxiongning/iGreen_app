import React, { useState, useEffect } from 'react';
import { Sidebar, Header, MobileNav } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { Ticket, TicketStatus } from './lib/data';
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { api } from './lib/api';
import { Button } from "./components/ui/button";
import { RefreshCw, Database } from 'lucide-react';
import { LanguageProvider, useLanguage } from './components/LanguageContext';

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
  group: string;
  id: string;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<UserProfile>({
    name: "Mike Technician",
    email: "mike.tech@volttech.com",
    username: "mike.tech",
    phone: "+1 (555) 123-4567",
    group: "Bangkok Operations (Zone A)",
    id: "TECH-8821"
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useLanguage();

  const loadTickets = async (reset = false) => {
    if (loadingMore && !reset) return;
    
    try {
      if (reset) {
        setRefreshing(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      const limit = 20;
      const offset = reset ? 0 : tickets.length;
      
      const data = await api.getTickets(offset, limit);
      
      if (data.length < limit) {
        setHasMore(false);
      }
      
      if (reset) {
        setTickets(data);
      } else {
        setTickets(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      toast.error("Failed to load tickets. Is the backend running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const seedData = async () => {
    try {
      setLoading(true);
      await api.seedTickets();
      toast.success("Database seeded with sample data");
      await loadTickets(true);
    } catch (error) {
      toast.error("Failed to seed database");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets(true);
    }
  }, [isAuthenticated]);

  const handleTicketClick = (ticket: Ticket) => {
    // TODO: Backend Integration - Ticket Details
    // If the list only contains summary data, fetch full details here.
    // Example: const fullTicket = await api.getTicketDetails(ticket.id);
    setSelectedTicket(ticket);
  };

  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>) => {
    // Optimistic update
    const previousTickets = [...tickets];
    const targetTicket = tickets.find(t => t.id === id);
    if (!targetTicket) return;

    if (targetTicket.status === 'open' && updates.status === 'assigned') {
      updates.assignee = "Mike Technician"; 
    }

    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));

    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, ...updates } : null);
    }

    try {
      await api.updateTicket(id, updates);
    } catch (error) {
      // Revert on failure
      setTickets(previousTickets);
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(targetTicket);
      }
      toast.error("Failed to update ticket");
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
     handleUpdateTicket(id, { status: newStatus as TicketStatus });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
    toast.success("Profile updated successfully");
  };

  const handleViewRelatedTicket = (ticketId: string) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (targetTicket) {
      setSelectedTicket(targetTicket);
    } else {
      // Try to see if we can fetch it or if it's just not in the list
      // For now, just show error
      toast.error("Related ticket not found in current list.");
    }
  };

  // Filter tickets based on view
  const getFilteredTickets = () => {
    switch (currentView) {
      case 'queue':
        return tickets.filter(t => t.status === 'open');
      case 'my-work':
        return tickets.filter(t => ['assigned', 'departed', 'arrived', 'review'].includes(t.status));
      case 'history':
        return tickets.filter(t => t.status === 'completed');
      default:
        return [];
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <div className="hidden md:block">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <Header />
        
        {currentView !== 'profile' && (
          <div className="bg-white border-b px-4 md:px-6 py-2 flex items-center justify-between">
             <div className="text-xs text-slate-500 flex items-center gap-2">
                {loading ? "Syncing..." : `Last synced: ${new Date().toLocaleTimeString()}`}
             </div>
             <div className="flex items-center gap-2">
               {!loading && (
                 <Button variant="outline" size="sm" onClick={seedData} className="gap-2 h-8 text-xs">
                   <Database className="w-3 h-3" />
                   Reset Data
                 </Button>
               )}
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => loadTickets(true)} 
                 disabled={refreshing}
                 className="h-8 w-8 p-0"
               >
                 <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
               </Button>
             </div>
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto relative" id="main-scroll-container">
          {loading && tickets.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <p>Loading workspace...</p>
              </div>
            </div>
          ) : null}

          {currentView === 'dashboard' && (
            <Dashboard 
              tickets={tickets} 
              onTicketClick={handleTicketClick}
              onViewAllClick={() => setCurrentView('queue')}
            />
          )}
          
          {currentView === 'queue' && (
            <TicketList 
              title={t.queue}
              tickets={getFilteredTickets()} 
              onTicketClick={handleTicketClick}
              showAssignee={false}
              onRefresh={() => loadTickets(true)}
              refreshing={refreshing}
              onLoadMore={() => loadTickets(false)}
              hasMore={hasMore}
              loadingMore={loadingMore}
            />
          )}
          
          {currentView === 'my-work' && (
            <TicketList 
              title={t.myWork}
              tickets={getFilteredTickets()} 
              onTicketClick={handleTicketClick}
              onLoadMore={() => loadTickets(false)}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onRefresh={() => loadTickets(true)}
              refreshing={refreshing}
            />
          )}
          
          {currentView === 'history' && (
            <TicketList 
              title={t.history}
              tickets={getFilteredTickets()} 
              onTicketClick={handleTicketClick}
              onLoadMore={() => loadTickets(false)}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onRefresh={() => loadTickets(true)}
              refreshing={refreshing}
            />
          )}

          {currentView === 'profile' && (
            <Profile 
              onLogout={handleLogout} 
              user={user}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileNav currentView={currentView} setCurrentView={setCurrentView} />
      </div>

      <TicketDetail 
        ticket={selectedTicket} 
        onClose={handleCloseDetail} 
        onUpdateTicket={handleUpdateTicket}
        onViewRelatedTicket={handleViewRelatedTicket}
      />
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
