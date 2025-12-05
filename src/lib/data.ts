import { Badge } from "../components/ui/badge";
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Zap,
  Wrench,
  CalendarDays,
  ClipboardCheck
} from "lucide-react";
import React from "react";

export type TicketStatus = 'open' | 'assigned' | 'departed' | 'arrived' | 'review' | 'completed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketType = 'corrective' | 'planned' | 'preventive' | 'problem';

export interface TicketStep {
  id: string;
  label: string;
  description?: string;
  photoUrl?: string; // Deprecated, kept for compatibility
  photoUrls?: string[]; // New field for multiple photos
  timestamp?: string;
  location?: string;
  completed: boolean;
  status?: 'pass' | 'fail' | 'na' | 'pending';
  cause?: string;
  beforePhotoUrl?: string; // Deprecated
  beforePhotoUrls?: string[]; // New
  afterPhotoUrl?: string; // Deprecated
  afterPhotoUrls?: string[]; // New
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  requester: string;
  createdAt: string;
  tags: string[];
  assignee?: string;
  location?: string; 
  steps?: TicketStep[];
  history?: {
    departedAt?: string;
    arrivedAt?: string;
    completedAt?: string;
  };
  rootCause?: string;
  solution?: string;
  beforePhotoUrl?: string; // Deprecated
  beforePhotoUrls?: string[]; // New
  afterPhotoUrl?: string; // Deprecated
  afterPhotoUrls?: string[]; // New
  feedback?: string;
  feedbackPhotoUrls?: string[];
  estimatedResolutionTime?: string;
  problemPhotoUrls?: string[];
  relatedTicketId?: string;
}

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "WO-2024",
    title: "Station #405 Offline - Downtown Plaza",
    description: "Station is reporting offline status for more than 2 hours. Remote reset failed. Likely network module issue or power cut.",
    status: "open",
    priority: "critical",
    type: "corrective",
    requester: "System Monitor",
    createdAt: "2023-10-27T14:30:00Z",
    tags: ["offline", "network", "urgent"],
    location: "Downtown Plaza, Bay 4",
    steps: [
      { id: '1', label: 'Initial Inspection', completed: false },
      { id: '2', label: 'Check Power Supply', completed: false },
      { id: '3', label: 'Network Diagnostic', completed: false },
      { id: '4', label: 'Module Replacement', completed: false },
      { id: '5', label: 'Final Verification', completed: false },
    ]
  },
  {
    id: "WO-2025",
    title: "Connector B Damage - Highway Rest Stop 12",
    description: "Customer reported CCS connector locking mechanism is broken. Visual inspection required. Spare part #CCS-Type2-L might be needed.",
    status: "assigned",
    priority: "high",
    type: "corrective",
    requester: "Customer Report",
    createdAt: "2023-10-27T10:00:00Z",
    assignee: "Mike Technician",
    tags: ["hardware", "connector", "safety"],
    location: "Highway 101, Rest Stop 12",
    steps: [
      { id: '1', label: 'Visual Assessment', completed: false },
      { id: '2', label: 'Lock Mechanism Test', completed: false },
      { id: '3', label: 'Replace Connector Head', completed: false },
      { id: '4', label: 'Safety Check', completed: false },
    ]
  },
  {
    id: "WO-2026",
    title: "Routine Maintenance - Mall of City (Level 2)",
    description: "Quarterly preventive maintenance for cluster A. Check cables, clean screens, test voltage output.",
    status: "open",
    priority: "medium",
    type: "preventive",
    requester: "Ops Manager",
    createdAt: "2023-10-26T16:20:00Z",
    tags: ["maintenance", "routine"],
    location: "Mall of City, P2 Green Zone",
    steps: [
      { id: '1', label: 'Check the MDB cabinet and charging station cabinet for rust,leaks, and the condition of the door handles.', completed: false },
      { id: '2', label: 'Check the fire extinguishers and monitor the equipment to ensure they are functioning properly.', completed: false },
      { id: '3', label: 'Check the ground condition, drainage, and cleaning.', completed: false },
      { id: '4', label: 'Check the charging gun head and charging cable for any damage or scratches. Ensure the cable ends are securely installed.', completed: false },
      { id: '5', label: 'Check if the charging input line is normal.', completed: false },
      { id: '6', label: 'Check that all terminals on the charging station\'s mainboard are securely plugged in and that all cables are loose.', completed: false },
      { id: '7', label: 'Check if the display screen is intact and verify that all parameter settings are correct.', completed: false },
      { id: '8', label: 'Check if the indicator lights on the charging station are functioning properly.', completed: false },
      { id: '9', label: 'Check if all communication functions of the charging station are normal.', completed: false },
      { id: '10', label: 'Check that the emergency stop button is intact and that it functions properly.', completed: false },
      { id: '11', label: 'Check if the charging module is operating normally and if the power indicator light is flashing. There should be no red alarm light illuminated.', completed: false },
      { id: '12', label: 'Check that the surge protector is in good working order and has not been damaged.', completed: false },
      { id: '13', label: 'Check if the dust screen needs cleaning.', completed: false },
      { id: '14', label: 'Check all historical records of the charging station for any abnormal fault data.', completed: false },
      { id: '15', label: 'Check if the communication between the charging station and the backend is normal and if the data is being sent normally.', completed: false },
      { id: '16', label: 'Check if the charger contactor is functioning properly and On-site test of charging action.', completed: false },
    ]
  },
  {
    id: "WO-2027",
    title: "Scheduled Modem Upgrade - Westside Park",
    description: "Replace 3G modems with 4G LTE units for Stations 1-4 as part of the Q4 connectivity upgrade plan.",
    status: "open",
    priority: "medium",
    type: "planned",
    requester: "Network Planning",
    createdAt: "2023-10-25T09:15:00Z",
    tags: ["upgrade", "connectivity", "planned"],
    location: "Westside Park, Stations 1-4",
    steps: [
       { id: '1', label: 'Remove Old Modem', completed: false },
       { id: '2', label: 'Install 4G Unit', completed: false },
       { id: '3', label: 'Signal Test', completed: false },
    ]
  },
  {
    id: "WO-2028",
    title: "Payment Terminal Jammed - Central Station",
    description: "Credit card reader is not accepting cards. Physical obstruction detected in the slot.",
    status: "open",
    priority: "low",
    type: "corrective",
    requester: "Site Security",
    createdAt: "2023-10-24T11:00:00Z",
    tags: ["payment", "hardware"],
    location: "Central Station, Main Entrance",
    steps: [
      { id: '1', label: 'Inspect Slot', completed: false },
      { id: '2', label: 'Remove Obstruction', completed: false },
      { id: '3', label: 'Test Card Read', completed: false },
    ]
  },
  {
    id: "WO-2029",
    title: "Recurring Power Fluctuation - Sector 7",
    description: "Multiple users reporting power output instability. Requires deep analysis and long-term monitoring strategy.",
    status: "assigned",
    priority: "high",
    type: "problem",
    requester: "Regional Director",
    createdAt: "2023-10-24T09:00:00Z",
    assignee: "Mike Technician",
    tags: ["power", "investigation"],
    location: "Sector 7, Industrial Zone",
    relatedTicketId: "WO-2024"
  }
];

export const getPriorityColor = (priority: TicketPriority) => {
  switch (priority) {
    case 'critical': return 'destructive'; // Red
    case 'high': return 'default'; // Black/Dark
    case 'medium': return 'secondary'; // Gray
    case 'low': return 'outline'; // White/Outline
    default: return 'secondary';
  }
};

export const getTicketTypeLabel = (type: TicketType) => {
  switch (type) {
    case 'corrective': return 'Corrective Maintenance';
    case 'planned': return 'Planned Maintenance';
    case 'preventive': return 'Preventive Maintenance';
    case 'problem': return 'Problem Management';
    default: return type;
  }
};

export const getTicketTypeIcon = (type: TicketType) => {
  switch (type) {
    case 'corrective': return <Wrench className="w-3 h-3" />;
    case 'planned': return <CalendarDays className="w-3 h-3" />;
    case 'preventive': return <ClipboardCheck className="w-3 h-3" />;
    case 'problem': return <HelpCircle className="w-3 h-3" />;
  }
};

export const getTicketTypeColor = (type: TicketType) => {
   switch (type) {
    case 'corrective': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'planned': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'preventive': return 'text-green-600 bg-green-50 border-green-200';
    case 'problem': return 'text-rose-600 bg-rose-50 border-rose-200';
  }
};

export const getStatusIcon = (status: TicketStatus) => {
  switch (status) {
    case 'open': return <Zap className="w-4 h-4 text-blue-500" />; 
    case 'assigned': return <ClipboardCheck className="w-4 h-4 text-indigo-500" />;
    case 'departed': return <Clock className="w-4 h-4 text-orange-500" />;
    case 'arrived': return <Wrench className="w-4 h-4 text-yellow-500" />;
    case 'review': return <AlertCircle className="w-4 h-4 text-purple-500" />;
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    default: return <Zap className="w-4 h-4 text-slate-500" />;
  }
};
