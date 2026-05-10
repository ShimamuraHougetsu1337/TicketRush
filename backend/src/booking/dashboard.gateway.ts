import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/admin-dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(DashboardGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Admin connected to dashboard: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Admin disconnected from dashboard: ${client.id}`);
  }

  broadcastUpdate() {
    this.logger.log('Broadcasting dashboard update signal');
    this.server.emit('dashboardUpdate');
  }
}
