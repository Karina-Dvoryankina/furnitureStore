package com.example.furnitureStore.Controllers;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.furnitureStore.DTO.CreateOrderDTO;
import com.example.furnitureStore.DTO.OrderResponseDTO;
import com.example.furnitureStore.Services.OrderService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderDTO orderDTO, Principal principal) {
        try {
            System.out.println("Creating order for user: " + principal.getName());
            System.out.println("Order data: " + orderDTO);
            System.out.println("Parsed cart items: " + orderDTO.getCart());
            OrderResponseDTO response = orderService.createOrder(
                    orderDTO,
                    Long.valueOf(principal.getName())
            );
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Order creation failed: " + e.getMessage()));
        }
    }
    
    // @GetMapping
    // public ResponseEntity<List<OrderResponseDTO>> getUserOrders(Principal principal) {
    //     List<OrderResponseDTO> orders = orderService.getUserOrders(principal.getName());
    //     return ResponseEntity.ok(orders);
    // }
}
