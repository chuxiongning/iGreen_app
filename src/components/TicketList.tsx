import React, { useState, useRef, useEffect } from 'react';
import { Ticket, TicketStatus } from '../lib/data';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Zap, RefreshCw, ArrowDown } from 'lucide-react';
import { 
  getPriorityColor, 
  getStatusIcon, 
  getTicketTypeLabel, 
  getTicketTypeColor,
  getTicketTypeIcon
} from '../lib/data';
import { useLanguage } from './LanguageContext';

interface TicketListProps {
  tickets: Ticket[];
  title: string;
  onTicketClick: (ticket: Ticket) => void;
  showAssignee?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function TicketList({ 
  tickets, 
  title, 
  onTicketClick, 
  showAssignee = true,
  onRefresh,
  refreshing = false,
  onLoadMore,
  hasMore = false,
  loadingMore = false
}: TicketListProps) {
  const { t } = useLanguage();
  const [pullY, setPullY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const isPulling = useRef(false); // Distinguished from general dragging

  // Infinite scroll detection
  useEffect(() => {
    const main = document.querySelector('#main-scroll-container');
    if (!main || !onLoadMore || !hasMore) return;

    const handleScroll = () => {
        if (loadingMore) return;
        
        const { scrollTop, scrollHeight, clientHeight } = main;
        // Trigger when within 100px of bottom
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            onLoadMore();
        }
    };

    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, hasMore, loadingMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const main = document.querySelector('main');
      const scrollTop = main?.scrollTop || 0;
      
      // Only enable pull to refresh if we are at the top
      if (scrollTop <= 1) {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
        isPulling.current = false;
      } else {
        isDragging.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !onRefresh || refreshing) return;

      const main = document.querySelector('main');
      const scrollTop = main?.scrollTop || 0;

      // If we scrolled down during the drag, stop pulling
      if (scrollTop > 1) {
        isDragging.current = false;
        setPullY(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        // We are pulling down at the top
        isPulling.current = true;
        
        // Prevent default to stop scrolling/rubber-banding
        if (e.cancelable) {
            e.preventDefault();
        }
        
        // Resistance logic
        setPullY(Math.min(diff * 0.4, 120));
      } else {
        isPulling.current = false;
        setPullY(0);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling.current && pullY > 60 && onRefresh) {
        // TODO: Backend Integration - Pull to Refresh
        // Triggers data reload
        onRefresh();
      }
      isDragging.current = false;
      isPulling.current = false;
      setPullY(0);
    };

    // Passive: false is crucial for preventing scroll when pulling down
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, refreshing, pullY]);

  return (
    <div 
        ref={containerRef}
        className="space-y-4 p-4 md:p-6 min-h-full"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {/* Removed desktop refresh button as requested for Ticket Queue page, though technically user asked to 'remove the small refresh button' in the context of pull-to-refresh, which usually implies mobile. I will hide it for mobile but keep for desktop if needed, OR just remove it completely if the user wants pull-to-refresh to be the main way. Given the prompt "support pull down refresh, remove the refresh small button", I will remove it completely from here. */}
      </div>

      {/* Pull to Refresh Indicator */}
      <div 
        className={`md:hidden flex justify-center overflow-hidden transition-all duration-300 ${refreshing ? 'h-12 opacity-100' : 'h-0 opacity-0'}`}
        style={!refreshing && pullY > 0 ? { height: pullY, opacity: Math.min(pullY / 60, 1) } : {}}
      >
        <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
            {refreshing ? (
                <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Syncing...</span>
                </>
            ) : (
                <>
                    <ArrowDown className={`w-4 h-4 transition-transform ${pullY > 60 ? 'rotate-180 text-blue-600' : ''}`} />
                    <span>{pullY > 60 ? 'Release to refresh' : 'Pull down'}</span>
                </>
            )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">{t.id}</TableHead>
              <TableHead className="min-w-[300px]">{t.issueLocation}</TableHead>
              <TableHead>{t.type}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{t.priority}</TableHead>
              {showAssignee && <TableHead>{t.technician}</TableHead>}
              <TableHead className="text-right">{t.reported}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                   {t.noTickets}
                 </TableCell>
               </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow 
                  key={ticket.id} 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => onTicketClick(ticket)}
                >
                  <TableCell className="font-mono font-medium text-slate-600">
                    {ticket.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{ticket.title}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                       {ticket.location && (
                         <>
                           <MapPin className="w-3 h-3 text-slate-400" />
                           <span className="font-medium text-slate-600">{ticket.location}</span>
                           <span className="text-slate-300">•</span>
                         </>
                       )}
                       <span className="truncate max-w-[200px]">{ticket.requester}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTicketTypeColor(ticket.type)}`}>
                        {getTicketTypeIcon(ticket.type)}
                        {getTicketTypeLabel(ticket.type)}
                     </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 capitalize text-sm">
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(ticket.priority)} className="capitalize">
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  {showAssignee && (
                    <TableCell>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                            {ticket.assignee.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600">{ticket.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right text-slate-500 text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {tickets.length === 0 ? (
          <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
            {t.noTickets}
          </div>
        ) : (
          tickets.map((ticket) => (
             <div 
               key={ticket.id}
               className="bg-white p-4 rounded-lg border shadow-sm active:bg-slate-50 transition-colors relative overflow-hidden"
               onClick={() => onTicketClick(ticket)}
             >
               {/* Status Stripe */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                 ticket.status === 'open' ? 'bg-blue-500' :
                 ticket.status === 'completed' ? 'bg-green-500' :
                 ticket.status === 'review' ? 'bg-purple-500' : 'bg-yellow-500'
               }`}></div>

               <div className="flex items-start justify-between mb-2 pl-2">
                 <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-[10px] text-slate-500">{ticket.id}</Badge>
                    <Badge variant={getPriorityColor(ticket.priority)} className="text-[10px] px-1.5 h-5 capitalize">
                      {ticket.priority}
                    </Badge>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTicketTypeColor(ticket.type)}`}>
                      {getTicketTypeLabel(ticket.type)}
                    </span>
                 </div>
                 <span className="text-xs text-slate-400 shrink-0">{new Date(ticket.createdAt).toLocaleDateString()}</span>
               </div>
               
               <div className="pl-2 mb-3">
                 <h3 className="font-bold text-slate-900 mb-1 text-base leading-snug">{ticket.title}</h3>
                 {ticket.location && (
                   <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                      <MapPin className="w-3 h-3" />
                      {ticket.location}
                   </div>
                 )}
               </div>

               <div className="flex items-center justify-between mt-3 pl-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                       {getStatusIcon(ticket.status)}
                       <span className="capitalize text-slate-700">{ticket.status}</span>
                  </div>
                  
                  {ticket.status === 'open' ? (
                    <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Zap className="w-3 h-3 mr-1" />
                      {/* TODO: Backend Integration - Direct Grab Button */}
                      {/* If clicking this button should immediately grab the ticket, attach onClick handler */}
                      {/* Example: onClick={(e) => { e.stopPropagation(); handleGrab(ticket.id); }} */}
                      {t.grab}
                    </Button>
                  ) : (
                    showAssignee && ticket.assignee && (
                       <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                             {ticket.assignee.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-500 max-w-[80px] truncate">{ticket.assignee}</span>
                       </div>
                    )
                  )}
               </div>
             </div>
          ))
        )}
        
        {loadingMore && (
          <div className="flex justify-center py-4">
             <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}
