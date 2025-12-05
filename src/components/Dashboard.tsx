import React, { useMemo } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Zap, 
  Timer
} from 'lucide-react';
import { Ticket, getPriorityColor, getTicketTypeColor, getTicketTypeLabel } from '../lib/data';
import { Badge } from "./ui/badge";
import { useLanguage } from './LanguageContext';

interface DashboardProps {
  tickets?: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  onViewAllClick?: () => void;
}

export function Dashboard({ tickets = [], onTicketClick, onViewAllClick }: DashboardProps) {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const ongoingTickets = tickets.filter(t => ['assigned', 'departed', 'arrived', 'review', 'in-progress'].includes(t.status));
    const completedToday = tickets.filter(t => t.status === 'completed').length;
    const nearbyOpportunities = tickets.filter(t => t.status === 'open').slice(0, 3);
    
    return {
      ongoingTickets,
      completedToday,
      nearbyOpportunities,
      hoursLogged: 5.5 // Mock hours
    };
  }, [tickets]);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      
      {/* Hero / Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">{t.hello}, Mike</h1>
        <p className="text-slate-500">{t.freeToGrab}</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        <Card className="border-slate-200 shadow-sm">
           <CardContent className="p-4 md:p-6 flex items-center justify-between h-full">
              <div>
                <div className="text-2xl font-bold">{stats.completedToday}</div>
                <div className="text-xs text-slate-500">{t.jobsCompleted}</div>
              </div>
              <div className="p-2 bg-indigo-50 w-fit rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Active Job Section */}
      {stats.ongoingTickets.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            {t.currentJob}
          </h2>
          {stats.ongoingTickets.slice(0, 1).map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => onTicketClick?.(ticket)}
              className="bg-white border border-indigo-100 shadow-lg shadow-indigo-50 rounded-xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform mb-3"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${
                ticket.status === 'review' ? 'bg-purple-500' : 'bg-indigo-500'
              }`}></div>
              <div className="pl-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 capitalize">
                    {ticket.status}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{ticket.title}</h3>
                <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {ticket.location}
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  {t.continueJob}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
           <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
             <Zap className="w-6 h-6 text-slate-400" />
           </div>
           <h3 className="font-medium text-slate-900">{t.noActiveJobs}</h3>
           <p className="text-sm text-slate-500 mb-4">{t.freeToGrab}</p>
        </div>
      )}

      {/* Nearby Opportunities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <h2 className="font-semibold text-slate-900 flex items-center gap-2">
             <MapPin className="w-4 h-4 text-green-600" />
             {t.nearbyOpportunities}
           </h2>
           {/* TODO: Backend Integration - View All Queue */}
           <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onViewAllClick}>{t.viewAll}</Button>
        </div>
        
        <div className="space-y-3">
          {stats.nearbyOpportunities.length > 0 ? (
            stats.nearbyOpportunities.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => onTicketClick?.(ticket)}
                className="bg-white border rounded-xl p-4 shadow-sm active:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(ticket.priority)} className="capitalize text-[10px] h-5 px-1.5">
                        {ticket.priority}
                      </Badge>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getTicketTypeColor(ticket.type)}`}>
                         {getTicketTypeLabel(ticket.type)}
                      </span>
                   </div>
                   <span className="text-xs text-slate-400">2.5km</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{ticket.title}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-1">{ticket.location}</p>
                
                <div className="flex items-center justify-between border-t pt-3 mt-2">
                  <div className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.estTime} 2h
                  </div>
                  {/* Removed price div */}
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-8 text-slate-500 text-sm">
               {t.noTickets}
             </div>
          )}
        </div>
      </div>
      
      {/* Removed Technician Rating Footer */}
    </div>
  );
}
