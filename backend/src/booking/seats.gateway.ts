import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/seats',
})
export class SeatsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SeatsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinEvent')
  handleJoinEvent(
    @MessageBody() data: { eventId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `event-${data.eventId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joinedEvent', data: { room } };
  }

  @SubscribeMessage('leaveEvent')
  handleLeaveEvent(
    @MessageBody() data: { eventId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `event-${data.eventId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  /** Called by BookingService to push seat status changes to all viewers */
  broadcastSeatUpdate(
    eventId: number,
    seats: { id: number; status: string; lockedById?: number | null }[],
  ) {
    const room = `event-${eventId}`;
    this.server.to(room).emit('seatUpdate', { eventId, seats });
  }
}
