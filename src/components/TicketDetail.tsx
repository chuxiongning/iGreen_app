import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle2,
  Zap,
  MapPin,
  Camera,
  FileText,
  Navigation,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Image as ImageIcon,
  Wrench,
  CalendarDays,
  ClipboardCheck,
  HelpCircle
} from 'lucide-react';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  Ticket, 
  TicketStep,
  getPriorityColor, 
  getStatusIcon, 
  getTicketTypeLabel, 
  getTicketTypeColor,
  getTicketTypeIcon,
  TicketStatus
} from '../lib/data';
import { toast } from "sonner@2.0.3";
import { useLanguage } from './LanguageContext';

interface TicketDetailProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => void;
  onViewRelatedTicket?: (ticketId: string) => void;
}

export function TicketDetail({ ticket, onClose, onUpdateTicket, onViewRelatedTicket }: TicketDetailProps) {
  const { t } = useLanguage();
  const [loadingImage, setLoadingImage] = useState<string | null>(null);

  if (!ticket) return null;

  const ensureSteps = () => {
      if (ticket.type === 'corrective' || ticket.type === 'planned' || ticket.type === 'problem') return; // Corrective, Planned and Problem tickets don't use steps in this new flow

      if (!ticket.steps || ticket.steps.length === 0) {
          const newSteps: TicketStep[] = [
              { id: '1', label: 'Check the MDB cabinet and charging station cabinet for rust, leaks, and the condition of the door handles.', completed: false },
              { id: '2', label: 'Check the fire extinguishers and monitor the equipment to ensure they are functioning properly.', completed: false },
              { id: '3', label: 'Check the ground condition, drainage, and cleaning.', completed: false },
              { id: '4', label: 'Check the charging gun head and charging cable for any damage or scratches. Ensure the cable ends are securely installed.', completed: false },
              { id: '5', label: 'Check if the charging input line is normal.', completed: false },
              { id: '6', label: "Check that all terminals on the charging station's mainboard are securely plugged in and that all cables are loose.", completed: false },
              { id: '7', label: 'Check if the display screen is intact and verify that all parameter settings are correct.', completed: false },
              { id: '8', label: 'Check if the indicator lights on the charging station are functioning properly.', completed: false },
              { id: '9', label: 'Check if all communication functions of the charging station are normal.', completed: false },
              { id: '10', label: 'Check that the emergency stop button is intact and that it functions properly.', completed: false },
              { id: '11', label: 'Check if the charging module is operating normally and if the power indicator light is flashing. There should be no red alarm light illuminated.', completed: false },
              { id: '12', label: 'Check that the surge protector is in good working order and has not been damaged.', completed: false },
              { id: '13', label: 'Check if the dust screen needs cleaning.', completed: false },
              { id: '14', label: 'Check all historical records of the charging station for any abnormal fault data.', completed: false },
              { id: '15', label: 'Check if the communication between the charging station and the backend is normal and if the data is being sent normally.', completed: false },
              { id: '16', label: 'Check if the charger contactor is functioning properly and On-site test of charging action', completed: false },
          ];
          onUpdateTicket(ticket.id, { steps: newSteps });
      }
  };

  const handleGrabOrder = () => {
      // TODO: Backend Integration - Grab Ticket
      // Call API to assign ticket to current user and update status
      // Example: await api.updateTicket(ticket.id, { status: 'assigned', assignee: currentUser.id });

      if (ticket.type === 'problem') {
          onUpdateTicket(ticket.id, { 
              status: 'arrived', // Skip to arrived/work-in-progress for problem tickets
              assignee: 'Mike Technician',
              history: { ...ticket.history, arrivedAt: new Date().toISOString() }
          });
          toast.success("Ticket accepted. Please provide solution details.");
      } else {
          onUpdateTicket(ticket.id, { 
              status: 'assigned',
              assignee: 'Mike Technician' // Hardcoded for demo
          });
          toast.success("Ticket assigned to you");
      }
  };

  const handleDepart = () => {
      // TODO: Backend Integration - Departure
      // Update ticket status to 'departed' and record timestamp
      // Example: await api.updateTicket(ticket.id, { status: 'departed', departedAt: new Date() });

      onUpdateTicket(ticket.id, { 
          status: 'departed',
          history: { ...ticket.history, departedAt: new Date().toISOString() }
      });
      toast.success("Departure recorded");
  };

  const handleArrive = () => {
      ensureSteps();
      // TODO: Backend Integration - Arrival
      // Update ticket status to 'arrived', record timestamp, and initialize steps if needed
      // Example: await api.updateTicket(ticket.id, { status: 'arrived', arrivedAt: new Date() });

      onUpdateTicket(ticket.id, { 
          status: 'arrived',
          history: { ...ticket.history, arrivedAt: new Date().toISOString() }
      });
      toast.success("Arrival recorded - Start working on steps");
  };

  const handleStepToggle = (stepId: string, checked: boolean) => {
      // TODO: Backend Integration - Complete Step
      // Update specific step status in the database
      // Example: await api.updateTicketStep(ticket.id, stepId, { completed: checked });
      
      const updatedSteps = ticket.steps?.map(s => 
          s.id === stepId ? { ...s, completed: checked } : s
      );
      onUpdateTicket(ticket.id, { steps: updatedSteps });
  };

  const handleStepDescription = (stepId: string, desc: string) => {
       // TODO: Backend Integration - Step Description (Debounced)
       // Save step description
       
       const updatedSteps = ticket.steps?.map(s => 
          s.id === stepId ? { ...s, description: desc } : s
      );
      onUpdateTicket(ticket.id, { steps: updatedSteps });
  };

  const handlePreventiveStepUpdate = (stepId: string, updates: Partial<TicketStep>) => {
      const updatedSteps = ticket.steps?.map(s => {
          if (s.id === stepId) {
              const newStep = { ...s, ...updates };
              // Auto-calculate completion status based on rules
              let isCompleted = false;
              if (newStep.status === 'na') {
                  isCompleted = true;
              } else if (newStep.status === 'pass') {
                  // Pass requires photo? User said "upload photo即可".
                  // Check if photos exist (either old singular or new plural)
                  if (newStep.photoUrl || (newStep.photoUrls && newStep.photoUrls.length > 0)) isCompleted = true;
              } else if (newStep.status === 'fail') {
                  // Fail requires cause + before/after photos
                  const hasBefore = newStep.beforePhotoUrl || (newStep.beforePhotoUrls && newStep.beforePhotoUrls.length > 0);
                  const hasAfter = newStep.afterPhotoUrl || (newStep.afterPhotoUrls && newStep.afterPhotoUrls.length > 0);
                  if (newStep.cause && hasBefore && hasAfter) isCompleted = true;
              }
              newStep.completed = isCompleted;
              return newStep;
          }
          return s;
      });
      onUpdateTicket(ticket.id, { steps: updatedSteps });
  };

  const handleAddPhoto = async (
      source: 'camera' | 'gallery',
      stepId: string, 
      fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto' = 'photo',
      isCorrectiveOrPlanned: boolean = false
  ) => {
      // Construct field names
      const singularField = `${fieldPrefix}Url` as 'photoUrl' | 'beforePhotoUrl' | 'afterPhotoUrl'; // Note: feedbackPhotoUrl might not exist on TicketStep, but we cast for dynamic access
      const pluralField = `${fieldPrefix}Urls` as 'photoUrls' | 'beforePhotoUrls' | 'afterPhotoUrls' | 'feedbackPhotoUrls' | 'problemPhotoUrls';

      setLoadingImage(stepId + singularField);
      try {
        // Mock upload - get 1-3 photos based on source
        // Camera = 1 photo, Gallery = 1-3 photos
        const count = source === 'camera' ? 1 : Math.floor(Math.random() * 3) + 1;
        
        const newPhotos: string[] = [];
        for(let i=0; i<count; i++) {
            newPhotos.push(`https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&random=${Math.random()}`);
        }

        if (isCorrectiveOrPlanned) {
            // Get existing photos
            const existingPhotos = (ticket as any)[pluralField] || ((ticket as any)[singularField] ? [(ticket as any)[singularField]!] : []);
            const updatedPhotos = [...existingPhotos, ...newPhotos];
            
            onUpdateTicket(ticket.id, {
                // [singularField]: updatedPhotos[0], // Only update singular if it exists in type, simpler to just rely on plural for new fields
                [pluralField]: updatedPhotos
            });
        } else {
            // Find step to get existing photos
            const step = ticket.steps?.find(s => s.id === stepId);
            const existingPhotos = step?.[pluralField] || (step?.[singularField] ? [step[singularField]!] : []);
            const updatedPhotos = [...existingPhotos, ...newPhotos];

            handlePreventiveStepUpdate(stepId, { 
                [singularField]: updatedPhotos[0], // Update singular for backward compatibility
                [pluralField]: updatedPhotos,
                timestamp: new Date().toISOString()
            });
        }
        toast.success(`${count} photo(s) added from ${source}`);
      } catch (e) {
        toast.error("Failed to add photo");
      } finally {
        setLoadingImage(null);
      }
  };

  const renderPhotoUploader = (
    stepId: string, 
    fieldPrefix: 'photo' | 'beforePhoto' | 'afterPhoto' | 'feedbackPhoto' | 'problemPhoto',
    isCorrectiveOrPlanned: boolean = false,
    existingPhotos: string[] = [],
    label: string = "Add Photo"
  ) => {
      const singularField = `${fieldPrefix}Url`;
      const loadingKey = stepId + singularField;
      const isLoading = loadingImage === loadingKey;

      return (
          <div className="space-y-2">
              {label && <div className="text-xs font-medium text-slate-500">{label}</div>}
              
              <div className="flex flex-wrap gap-2">
                  {existingPhotos.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={url} className="w-full h-full object-cover" alt="Evidence" />
                          {/* Delete button could go here */}
                      </div>
                  ))}
                  
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <div className="cursor-pointer w-20 h-20 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600">
                              {isLoading ? (
                                  <div className="animate-spin w-5 h-5 border-2 border-indigo-600 rounded-full border-t-transparent"></div>
                              ) : (
                                  <>
                                      <Camera className="w-5 h-5 mb-1" />
                                      <span className="text-[10px]">Add</span>
                                  </>
                              )}
                          </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleAddPhoto('camera', stepId, fieldPrefix, isCorrectiveOrPlanned)}>
                              <Camera className="w-4 h-4 mr-2" />
                              Take Photo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddPhoto('gallery', stepId, fieldPrefix, isCorrectiveOrPlanned)}>
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Choose from Album
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          </div>
      );
  };

  const handleFinish = () => {
      if (ticket.type === 'corrective') {
          // Check for multiple photos support
          const hasBefore = ticket.beforePhotoUrl || (ticket.beforePhotoUrls && ticket.beforePhotoUrls.length > 0);
          const hasAfter = ticket.afterPhotoUrl || (ticket.afterPhotoUrls && ticket.afterPhotoUrls.length > 0);
          
          if (!ticket.rootCause || !ticket.solution || !hasBefore || !hasAfter) {
              toast.error("Please complete all fields and photos.");
              return;
          }
      } else if (ticket.type === 'planned') {
          if (!ticket.feedback || (!ticket.feedbackPhotoUrls || ticket.feedbackPhotoUrls.length === 0)) {
              toast.error("Please provide feedback and at least one photo.");
              return;
          }
      } else if (ticket.type === 'problem') {
          if (!ticket.solution || !ticket.estimatedResolutionTime || (!ticket.problemPhotoUrls || ticket.problemPhotoUrls.length === 0)) {
              toast.error("Please provide solution, estimated resolution date, and photos.");
              return;
          }
      } else {
        // Validate all steps completed for other types
        const allCompleted = ticket.steps?.every(s => s.completed);
        if (!allCompleted) {
            toast.error("Please complete all steps before finishing.");
            return;
        }
      }

      // TODO: Backend Integration - Finish Work
      // Update status to 'review', maybe trigger notification to admin
      // Example: await api.updateTicket(ticket.id, { status: 'review' });

      onUpdateTicket(ticket.id, { status: 'review' });
      toast.success("Work finished. Pending review.");
  };

  const handleConfirm = () => {
       // For demo, we act as if we are the system confirming it.
       // In real app, this might be done by another user (admin).
       
       // If you want to simulate "Reject" for testing:
       // Change this boolean to true to simulate rejection
       const simulateReject = false; 

       if (simulateReject) {
           handleReject();
       } else {
           onUpdateTicket(ticket.id, { 
               status: 'completed',
               history: { ...ticket.history, completedAt: new Date().toISOString() }
           });
           toast.success("Ticket confirmed and closed.");
       }
  };

  const handleReject = () => {
      // When rejected, move back to 'arrived' (work in progress) or a specific state
      // User requirement: "return to before finish submission, support edit and re-submit"
      // So we return to 'arrived' which allows editing steps and clicking Finish again.
      
      onUpdateTicket(ticket.id, { 
          status: 'arrived',
          // Optional: add a rejection note or reset some flags if needed
      });
      toast.error("Work rejected. Please check steps and resubmit.");
  };

  // Render Logic for the Action Area
  const renderSummary = () => (
      <div className="w-full bg-white p-4 rounded-lg border border-slate-200 text-left text-sm space-y-4">
          <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Steps Completed:</span>
                  <span className="font-medium">{ticket.steps?.length || 0}/{ticket.steps?.length || 0}</span>
              </div>
              {ticket.type !== 'problem' && (
                  <>
                      <div className="flex justify-between">
                          <span className="text-slate-500">Departed:</span>
                          <span className="font-medium">{ticket.history?.departedAt ? new Date(ticket.history.departedAt).toLocaleTimeString() : '-'}</span>
                      </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">Arrived:</span>
                          <span className="font-medium">{ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : '-'}</span>
                      </div>
                  </>
              )}
          </div>

          {/* Preventive Maintenance Summary */}
          {ticket.type === 'preventive' && ticket.steps && (
              <div className="space-y-3 pt-2 border-t">
                  <h4 className="font-medium text-slate-900 text-xs uppercase tracking-wider">Findings</h4>
                  {ticket.steps.map(step => (
                      <div key={step.id} className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                              <span className="text-slate-600">{step.label}</span>
                              {step.status === 'pass' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5">Pass</Badge>}
                              {step.status === 'fail' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 h-5">Not Pass</Badge>}
                              {step.status === 'na' && <Badge variant="outline" className="bg-slate-50 text-slate-500 h-5">N/A</Badge>}
                          </div>
                          {step.status === 'fail' && (
                              <div className="bg-red-50/50 p-2 rounded border border-red-100 mt-1">
                                  <div className="font-medium text-red-800 mb-1">Cause: {step.cause}</div>
                                  <div className="flex flex-wrap gap-2">
                                      {(step.beforePhotoUrls || (step.beforePhotoUrl ? [step.beforePhotoUrl] : [])).map((url, i) => (
                                          <img key={`before-${i}`} src={url} className="w-10 h-10 rounded object-cover border" title="Before" />
                                      ))}
                                      {(step.afterPhotoUrls || (step.afterPhotoUrl ? [step.afterPhotoUrl] : [])).map((url, i) => (
                                          <img key={`after-${i}`} src={url} className="w-10 h-10 rounded object-cover border" title="After" />
                                      ))}
                                  </div>
                              </div>
                          )}
                          {step.status === 'pass' && (step.photoUrls || step.photoUrl) && (
                              <div className="mt-1 flex flex-wrap gap-2">
                                  {(step.photoUrls || (step.photoUrl ? [step.photoUrl] : [])).map((url, i) => (
                                      <img key={i} src={url} className="w-10 h-10 rounded object-cover border" title="Evidence" />
                                  ))}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          )}

          {/* Corrective Maintenance Summary */}
          {ticket.type === 'corrective' && (
               <div className="space-y-3 pt-2 border-t text-xs">
                   <div className="space-y-1">
                       <span className="font-medium text-slate-900 block">Root Cause:</span>
                       <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.rootCause}</p>
                   </div>
                   <div className="space-y-1">
                       <span className="font-medium text-slate-900 block">Solution:</span>
                       <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.solution}</p>
                   </div>
                   <div className="flex flex-wrap gap-2 pt-1">
                       {(ticket.beforePhotoUrls || (ticket.beforePhotoUrl ? [ticket.beforePhotoUrl] : [])).map((url, i) => (
                           <div key={`before-${i}`} className="space-y-1">
                               <span className="text-[10px] text-slate-500 block">Before {i+1}</span>
                               <img src={url} className="w-20 h-20 rounded object-cover border" />
                           </div>
                       ))}
                       {(ticket.afterPhotoUrls || (ticket.afterPhotoUrl ? [ticket.afterPhotoUrl] : [])).map((url, i) => (
                           <div key={`after-${i}`} className="space-y-1">
                               <span className="text-[10px] text-slate-500 block">After {i+1}</span>
                               <img src={url} className="w-20 h-20 rounded object-cover border" />
                           </div>
                       ))}
                   </div>
               </div>
          )}

          {/* Planned Maintenance Summary */}
          {ticket.type === 'planned' && (
               <div className="space-y-3 pt-2 border-t text-xs">
                   <div className="space-y-1">
                       <span className="font-medium text-slate-900 block">Feedback:</span>
                       <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.feedback}</p>
                   </div>
                   {ticket.feedbackPhotoUrls && ticket.feedbackPhotoUrls.length > 0 && (
                       <div className="space-y-1">
                            <span className="font-medium text-slate-900 block">Photos:</span>
                            <div className="flex flex-wrap gap-2">
                                {ticket.feedbackPhotoUrls.map((url, i) => (
                                    <img key={i} src={url} className="w-20 h-20 rounded object-cover border" />
                                ))}
                            </div>
                       </div>
                   )}
               </div>
          )}

          {/* Problem Management Summary */}
          {ticket.type === 'problem' && (
               <div className="space-y-3 pt-2 border-t text-xs">
                   <div className="space-y-1">
                       <span className="font-medium text-slate-900 block">Solution:</span>
                       <p className="text-slate-600 bg-slate-50 p-2 rounded">{ticket.solution}</p>
                   </div>
                   <div className="space-y-1">
                       <span className="font-medium text-slate-900 block">Est. Resolution:</span>
                       <p className="text-slate-600 bg-slate-50 p-2 rounded">
                           {ticket.estimatedResolutionTime ? new Date(ticket.estimatedResolutionTime).toLocaleString() : '-'}
                       </p>
                   </div>
                   {ticket.problemPhotoUrls && ticket.problemPhotoUrls.length > 0 && (
                       <div className="space-y-1">
                            <span className="font-medium text-slate-900 block">Photos:</span>
                            <div className="flex flex-wrap gap-2">
                                {ticket.problemPhotoUrls.map((url, i) => (
                                    <img key={i} src={url} className="w-20 h-20 rounded object-cover border" />
                                ))}
                            </div>
                       </div>
                   )}
               </div>
          )}
      </div>
  );

  const renderWorkflow = () => {
      switch (ticket.status) {
          case 'open':
              return (
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center text-center space-y-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                          <Zap className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="text-lg font-semibold text-blue-900">New Opportunity</h3>
                          <p className="text-blue-700 max-w-sm">This ticket is available. Accept it to start the workflow.</p>
                      </div>
                      <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700" onClick={handleGrabOrder}>
                          Accept & Assign to Me
                      </Button>
                  </div>
              );
          
          case 'assigned':
              return (
                  <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center text-center space-y-4">
                       <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                          <Navigation className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="text-lg font-semibold text-indigo-900">Ready to Depart?</h3>
                          <p className="text-indigo-700 max-w-sm">Confirm when you are leaving for the site.</p>
                      </div>
                      <Button size="lg" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700" onClick={handleDepart}>
                          Departure Now
                      </Button>
                  </div>
              );

          case 'departed':
              return (
                   <div className="p-6 bg-orange-50 border border-orange-100 rounded-xl flex flex-col items-center text-center space-y-4">
                       <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2">
                          <MapPin className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                          <h3 className="text-lg font-semibold text-orange-900">En Route</h3>
                          <p className="text-orange-700 max-w-sm">You are on the way to {ticket.location}.</p>
                          <p className="text-xs text-orange-600 mt-2 font-mono">Departed at: {ticket.history?.departedAt ? new Date(ticket.history.departedAt).toLocaleTimeString() : 'Just now'}</p>
                      </div>
                      <Button size="lg" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700" onClick={handleArrive}>
                          I Have Arrived
                      </Button>
                  </div>
              );

          case 'arrived':
              if (ticket.type === 'corrective') {
                  return (
                      <div className="space-y-6">
                          <div className="flex items-center justify-between bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-orange-900">On Site - Corrective Maintenance</h3>
                                    <p className="text-xs text-orange-700">Arrived at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 p-1">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Root Cause</label>
                                    <Textarea 
                                        placeholder="Describe the root cause of the issue..." 
                                        value={ticket.rootCause || ''}
                                        onChange={(e) => onUpdateTicket(ticket.id, { rootCause: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Solution</label>
                                    <Textarea 
                                        placeholder="Describe the solution implemented..." 
                                        value={ticket.solution || ''}
                                        onChange={(e) => onUpdateTicket(ticket.id, { solution: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                {renderPhotoUploader(
                                    'corrective',
                                    'beforePhoto',
                                    true,
                                    ticket.beforePhotoUrls || (ticket.beforePhotoUrl ? [ticket.beforePhotoUrl] : []),
                                    "Before"
                                )}
                                {renderPhotoUploader(
                                    'corrective',
                                    'afterPhoto',
                                    true,
                                    ticket.afterPhotoUrls || (ticket.afterPhotoUrl ? [ticket.afterPhotoUrl] : []),
                                    "After"
                                )}
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className={`w-full ${ticket.rootCause && ticket.solution && (ticket.beforePhotoUrl || ticket.beforePhotoUrls?.length) && (ticket.afterPhotoUrl || ticket.afterPhotoUrls?.length) ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-300 cursor-not-allowed'}`}
                            onClick={handleFinish}
                            disabled={!(ticket.rootCause && ticket.solution && (ticket.beforePhotoUrl || ticket.beforePhotoUrls?.length) && (ticket.afterPhotoUrl || ticket.afterPhotoUrls?.length))}
                        >
                            Finish Maintenance
                        </Button>
                      </div>
                  );
              }

              if (ticket.type === 'planned') {
                  return (
                      <div className="space-y-6">
                          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <CalendarDays className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900">On Site - Planned Maintenance</h3>
                                    <p className="text-xs text-blue-700">Arrived at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 p-1">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Feedback / Notes</label>
                                    <Textarea 
                                        placeholder="Enter maintenance feedback and notes..." 
                                        value={ticket.feedback || ''}
                                        onChange={(e) => onUpdateTicket(ticket.id, { feedback: e.target.value })}
                                        className="min-h-[150px]"
                                    />
                                </div>
                             </div>

                             <div className="space-y-2">
                                {renderPhotoUploader(
                                    'planned',
                                    'feedbackPhoto',
                                    true,
                                    ticket.feedbackPhotoUrls || [],
                                    "Maintenance Photos"
                                )}
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className={`w-full ${ticket.feedback && ticket.feedbackPhotoUrls?.length ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}
                            onClick={handleFinish}
                            disabled={!(ticket.feedback && ticket.feedbackPhotoUrls?.length)}
                        >
                            Finish Maintenance
                        </Button>
                      </div>
                  );
              }

              if (ticket.type === 'problem') {
                  return (
                      <div className="space-y-6">
                          <div className="flex items-center justify-between bg-rose-50 p-4 rounded-lg border border-rose-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-rose-900">Problem Management</h3>
                                    <p className="text-xs text-rose-700">Started at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                                </div>
                            </div>
                        </div>

                        {ticket.relatedTicketId && (
                            <Button 
                                variant="outline" 
                                className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                                onClick={() => onViewRelatedTicket?.(ticket.relatedTicketId!)}
                            >
                                <Wrench className="w-4 h-4" />
                                View Related Corrective Ticket
                                <ArrowRight className="w-4 h-4 ml-auto" />
                            </Button>
                        )}

                        <div className="space-y-6 p-1">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Solution / Action Plan</label>
                                    <Textarea 
                                        placeholder="Describe the solution or action plan..." 
                                        value={ticket.solution || ''}
                                        onChange={(e) => onUpdateTicket(ticket.id, { solution: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Estimated Date for Resolution (mm/dd/yy)</label>
                                    <Input 
                                        type="date"
                                        value={ticket.estimatedResolutionTime || ''}
                                        onChange={(e) => onUpdateTicket(ticket.id, { estimatedResolutionTime: e.target.value })}
                                    />
                                </div>
                             </div>

                             <div className="space-y-2">
                                {renderPhotoUploader(
                                    'problem',
                                    'problemPhoto',
                                    true,
                                    ticket.problemPhotoUrls || [],
                                    "Evidence Photos"
                                )}
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className={`w-full ${ticket.solution && ticket.estimatedResolutionTime && ticket.problemPhotoUrls?.length ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-300 cursor-not-allowed'}`}
                            onClick={handleFinish}
                            disabled={!(ticket.solution && ticket.estimatedResolutionTime && ticket.problemPhotoUrls?.length)}
                        >
                            Finish Management
                        </Button>
                      </div>
                  );
              }

              if (ticket.type === 'preventive') {
                  return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-900">On Site - Preventive Maintenance</h3>
                                    <p className="text-xs text-green-700">Arrived at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <CheckSquare className="w-4 h-4" />
                                Maintenance Checklist
                            </h3>
                            
                            <div className="space-y-4">
                                {ticket.steps?.map((step) => (
                                    <div key={step.id} className={`border rounded-xl p-4 transition-all ${step.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-slate-900">{step.label}</label>
                                                {step.completed && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>}
                                            </div>

                                            <ToggleGroup type="single" value={step.status || ''} onValueChange={(val) => handlePreventiveStepUpdate(step.id, { status: val as any })} className="justify-start">
                                                <ToggleGroupItem value="pass" aria-label="Pass" className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700 gap-2">
                                                    <ThumbsUp className="w-4 h-4" /> Pass
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="fail" aria-label="Not Pass" className="data-[state=on]:bg-red-100 data-[state=on]:text-red-700 gap-2">
                                                    <ThumbsDown className="w-4 h-4" /> Not Pass
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="na" aria-label="N/A" className="data-[state=on]:bg-slate-100 data-[state=on]:text-slate-700 gap-2">
                                                    <MinusCircle className="w-4 h-4" /> N/A
                                                </ToggleGroupItem>
                                            </ToggleGroup>

                                            {step.status === 'pass' && (
                                                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                                                    {renderPhotoUploader(
                                                        step.id, 
                                                        'photo', 
                                                        false, 
                                                        step.photoUrls || (step.photoUrl ? [step.photoUrl] : []),
                                                        "Evidence Photos"
                                                    )}
                                                </div>
                                            )}

                                            {step.status === 'fail' && (
                                                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                                                    <Textarea 
                                                        placeholder="Describe the cause of failure..." 
                                                        value={step.cause || ''}
                                                        onChange={(e) => handlePreventiveStepUpdate(step.id, { cause: e.target.value })}
                                                        className="text-sm min-h-[80px]"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {renderPhotoUploader(
                                                            step.id,
                                                            'beforePhoto',
                                                            false,
                                                            step.beforePhotoUrls || (step.beforePhotoUrl ? [step.beforePhotoUrl] : []),
                                                            "Before"
                                                        )}
                                                        {renderPhotoUploader(
                                                            step.id,
                                                            'afterPhoto',
                                                            false,
                                                            step.afterPhotoUrls || (step.afterPhotoUrl ? [step.afterPhotoUrl] : []),
                                                            "After"
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className={`w-full ${ticket.steps?.every(s => s.completed) ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
                            onClick={handleFinish}
                            disabled={!ticket.steps?.every(s => s.completed)}
                        >
                            Finish Maintenance
                        </Button>
                    </div>
                  );
              }

              return (
                  <div className="space-y-6">
                      <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                  <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                  <h3 className="font-semibold text-green-900">On Site - Work in Progress</h3>
                                  <p className="text-xs text-green-700">Arrived at {ticket.history?.arrivedAt ? new Date(ticket.history.arrivedAt).toLocaleTimeString() : 'Just now'}</p>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <CheckSquare className="w-4 h-4" />
                              Required Steps
                          </h3>
                          
                          <div className="space-y-4">
                              {ticket.steps?.map((step, index) => (
                                  <div key={step.id} className={`border rounded-xl p-4 transition-all ${step.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'}`}>
                                      <div className="flex items-start gap-3">
                                          <Checkbox 
                                              id={`step-${step.id}`} 
                                              checked={step.completed} 
                                              disabled
                                              className={`mt-1 ${step.completed ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 opacity-100" : ""}`}
                                          />
                                          <div className="flex-1 space-y-3">
                                              <label 
                                                  htmlFor={`step-${step.id}`}
                                                  className={`text-sm font-medium leading-none block transition-colors ${step.completed ? 'text-green-700' : 'text-slate-900'}`}
                                              >
                                                  {step.label}
                                              </label>
                                              
                                              {!step.completed && (
                                                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                      <Textarea 
                                                          placeholder="Add notes/description..." 
                                                          value={step.description || ''}
                                                          onChange={(e) => handleStepDescription(step.id, e.target.value)}
                                                          className="text-sm min-h-[80px]"
                                                      />
                                                      <div className="flex items-center justify-between gap-2">
                                                          <Button 
                                                              size="sm" 
                                                              variant="outline" 
                                                              className="text-xs gap-2 h-9"
                                                              onClick={() => handleAddPhoto(step.id, step.label)}
                                                              disabled={loadingImage === step.id}
                                                          >
                                                              <Camera className="w-3 h-3" />
                                                              {step.photoUrl ? 'Retake Photo' : 'Add Photo'}
                                                          </Button>
                                                          
                                                          <Button 
                                                              size="sm" 
                                                              className="text-xs gap-2 h-9 bg-green-600 hover:bg-green-700 text-white"
                                                              onClick={() => handleStepToggle(step.id, true)}
                                                          >
                                                              <CheckCircle2 className="w-3 h-3" />
                                                              Complete
                                                          </Button>
                                                      </div>
                                                      
                                                      {step.location && (
                                                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
                                                              <MapPin className="w-3 h-3" />
                                                              Loc: {step.location}
                                                          </div>
                                                      )}
                                                  </div>
                                              )}

                                              {step.photoUrl && (
                                                  <div className="mt-2 relative rounded-lg overflow-hidden border aspect-video w-full max-w-[200px]">
                                                      <img src={step.photoUrl} alt="Step evidence" className="w-full h-full object-cover" />
                                                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                                                          {step.timestamp && new Date(step.timestamp).toLocaleTimeString()}
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <Button 
                          size="lg" 
                          className={`w-full ${ticket.steps?.every(s => s.completed) ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
                          onClick={handleFinish}
                          disabled={!ticket.steps?.every(s => s.completed)}
                      >
                          Finish Work
                      </Button>
                  </div>
              );

          case 'review':
              return (
                   <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center text-center space-y-4">
                       <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
                          <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="text-lg font-semibold text-purple-900">Pending Confirmation</h3>
                          <p className="text-purple-700 max-w-sm">Work is finished. Waiting for system/admin confirmation.</p>
                      </div>
                      
                      {renderSummary()}

                      <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" size="lg" className="flex-1 gap-2 border-red-200 text-red-700 hover:bg-red-50" onClick={handleReject}>
                            <X className="w-4 h-4" />
                            Reject
                        </Button>
                        <Button variant="outline" size="lg" className="flex-1 gap-2 border-purple-200 text-purple-700 hover:bg-purple-100" onClick={handleConfirm}>
                            <ShieldCheck className="w-4 h-4" />
                            Confirm
                        </Button>
                      </div>
                  </div>
              );

          case 'completed':
              return (
                   <div className="p-6 bg-green-50 border border-green-100 rounded-xl flex flex-col items-center text-center space-y-4">
                       <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                          <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-green-900">Work Completed</h3>
                          <p className="text-green-700">Great job! This ticket is now closed.</p>
                           <p className="text-xs text-green-600 mt-2">Completed at: {ticket.history?.completedAt ? new Date(ticket.history.completedAt).toLocaleString() : '-'}</p>
                      </div>
                      
                      {renderSummary()}
                  </div>
              );
          
          default:
              return null;
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 md:border-l">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b flex items-start justify-between bg-slate-50 safe-area-top">
          <div className="space-y-1 flex-1 mr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs text-slate-500">
                {ticket.id}
              </Badge>
              <Badge variant={getPriorityColor(ticket.priority)}>
                {ticket.priority} {t.priority}
              </Badge>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTicketTypeColor(ticket.type)}`}>
                {getTicketTypeIcon(ticket.type)}
                {getTicketTypeLabel(ticket.type)}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 leading-tight">
              {ticket.title}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-200 shrink-0">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6">
            
            {/* Active Workflow Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderWorkflow()}
            </div>

            <Separator />

            {/* Details & Info */}
            <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity">
                {/* Location */}
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                    <h3 className="text-sm font-medium text-slate-900">Location</h3>
                    <p className="text-sm text-slate-600">{ticket.location || "No location specified"}</p>
                    </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                    <h3 className="text-sm font-medium text-slate-900">Description</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>
                    </div>
                </div>

                 {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500">{t.reportedBy}</div>
                        <div className="flex items-center gap-2 text-sm font-medium truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{ticket.requester}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500">{t.reportedAt}</div>
                        <div className="flex items-center gap-2 text-sm font-medium truncate">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500">{t.tags}</div>
                        <div className="flex flex-wrap gap-1">
                        {ticket.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-600">
                            #{tag}
                            </Badge>
                        ))}
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
