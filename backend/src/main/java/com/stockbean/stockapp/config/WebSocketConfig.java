package com.stockbean.stockapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita un broker simple en memoria para llevar mensajes de vuelta al cliente
        // /topic -> para mensajes de grupo/hilo donde todos los que están en el "room" escuchan.
        // /queue -> para mensajes dirigidos a un solo usuario en específico (notificaciones).
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefijo que usarán los clientes para enviar un mensaje AL servidor (ej. /app/chat.enviar)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Punto de entrada (endpoint) al cual se conectará nuestro cliente (React).
        // .withSockJS() permite soportar navegadores que carecen de soporte nativo WebSocket.
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // Se debe ajustar al dominio del frontend en Producción
                .withSockJS();
    }
}
