import { io, Socket } from 'socket.io-client';
import { AuditLogEntry, AuditState, AuditSummary, ToolName, ToolStatus } from '../types';

class SocketService {
  private socket: Socket;

  constructor() {
    // Connect to the backend server
    this.socket = io('http://localhost:3001');

    this.socket.on('connect', () => {
      console.log('Connected to backend server with ID:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from backend server.');
    });
  }

  // --- EMITTERS (Client -> Server) ---

  public getInitialToolStatus() {
    this.socket.emit('agent:get-initial-status');
  }
  
  public startAudit(target: string) {
    this.socket.emit('agent:start-audit', { target });
  }

  public sendConfirmation(confirmed: boolean) {
    this.socket.emit('agent:user-confirmation', { confirmed });
  }


  // --- LISTENERS (Server -> Client) ---

  public onInitialToolStatus(callback: (statuses: Record<ToolName, ToolStatus>) => void) {
    this.socket.on('agent:initial-status', callback);
  }

  public onLog(callback: (entry: AuditLogEntry) => void) {
    this.socket.on('agent:log', callback);
  }

  public onToolStatusUpdate(callback: (data: { toolId: ToolName; status: ToolStatus }) => void) {
    this.socket.on('agent:tool-status-update', callback);
  }
  
  public onAuditStateChange(callback: (state: AuditState) => void) {
      this.socket.on('agent:state-change', callback);
  }

  public onSummaryUpdate(callback: (summary: AuditSummary | null) => void) {
      this.socket.on('agent:summary-update', callback);
  }

  public onRequestConfirmation(callback: (data: { toolId: ToolName }) => void) {
      this.socket.on('agent:request-confirmation', callback);
  }
  
  // --- Cleanup ---
  
  public disconnect() {
    this.socket.disconnect();
  }
}

export const socketService = new SocketService();
