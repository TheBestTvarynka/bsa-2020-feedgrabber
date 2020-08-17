package com.feed_grabber.event_processor.rabbit

import org.springframework.amqp.rabbit.core.RabbitTemplate

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class Sender {
    @Value("\${rabbitmq.exchange}")
    private val exchange: String? = null

    @Value("\${rabbitmq.routing-key-response}")
    private val routingKey: String? = null

    @Autowired
    private val template: RabbitTemplate? = null

    fun send(text: String) {
        println(" [x] Sending...")
        template!!.convertAndSend(exchange!!, routingKey!!, text!!)
        println(" [x] Sent $text")
    }

}