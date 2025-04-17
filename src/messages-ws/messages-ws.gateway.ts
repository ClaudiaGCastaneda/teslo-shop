import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';


@WebSocketGateway({cors:true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect{
 
  @WebSocketServer() wss:Server;

  constructor(private readonly messagesWsService: MessagesWsService) {}
  handleConnection(client: Socket) {
    //console.log('Cliente conectado ', client.id);
    this.messagesWsService.registerClient(client);

    //console.log({conectados: this.messagesWsService.getConnectedClients() } );
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());


    
  }
  handleDisconnect(client: Socket) {
    //console.log('Cliente desconectado', client.id);
    this.messagesWsService.removeClient(client.id);
    //console.log({conectados: this.messagesWsService.getConnectedClients() } );
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
   
  }

  //message from client

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client:Socket, payload:NewMessageDto ){

    console.log(client.id, payload);

    //message-from-server
    //! Emitir únicamente al cliente
    // client.emit('message-from-server', {
    //   fullName:'Soy yo',
    //   message: payload.message || 'no-message!!'
    // }) 

    //! Emitir a todos MENOS al cliente inicial con broadcast

    // client.broadcast.emit('message-from-server', {
    //   fullName:'Soy yo',
    //   message: payload.message || 'no-message!!'
    // })

        //! Emitir a todos los cliente incluyendo a quien generó el mensaje
    this.wss.emit('message-from-server', {
      fullName:'Soy yo',
      message: payload.message || 'no-message!!'
    }) 






  }


}



