package com.stockbean.stockapp.controller.chat;

import com.stockbean.stockapp.dto.chat.ChatMensajeDTO;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import com.stockbean.stockapp.service.chat.ChatService;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    /**
     * Endpoint por el que los usuarios envían mensajes al chat.
     * URI de envío en cliente: /app/chat/{idChat}/enviar
     * @param idChat identificador de la conversación
     * @param mensajeDTO los datos que envía el usuario (ej. contenidoChat, idUsuario)
     * @return El mensaje transmitido a todos los subscritos en el topic del hilo.
     */
    @MessageMapping("/chat/{idChat}/enviar")
    @SendTo("/topic/hilos/{idChat}")
    public ChatMensajeDTO recibirYPropagarMensaje(
            @DestinationVariable Integer idChat, 
            @Payload ChatMensajeDTO mensajeDTO) {
        
        // Asignar el idChat al DTO solo por seguridad
        mensajeDTO.setIdChat(idChat);
        
        // Persistir el mensaje en PostgreSQL usando el ChatService
        ChatMensajeDTO guardadoDTO = chatService.guardarMensaje(mensajeDTO);
        
        return guardadoDTO;
    }
}
