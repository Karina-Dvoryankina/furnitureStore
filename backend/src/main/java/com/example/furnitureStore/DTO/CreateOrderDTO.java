package com.example.furnitureStore.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderDTO {

    private String deliveryType;
    private String paymentMethod;
    private String deliveryAddress;
    private BigDecimal deliveryPrice;
    private List<OrderCartItemDTO> cart;

    // @AssertTrue(message = "Address is required for delivery")
    // public boolean isAddressValid() {
    //     return !"delivery".equals(deliveryType) || 
    //            (deliveryAddress != null && !deliveryAddress.isBlank());
    // }

    public void setDeliveryType(String deliveryType){
        this.deliveryType = deliveryType;
    }

    public void setPaymentMethod(String paymentMethod){
        this.paymentMethod = paymentMethod;
    }

    public void setDeliveryAddress(String deliveryAddress){
        this.deliveryAddress = deliveryAddress;
    }

    public void setCart(List<OrderCartItemDTO> cart){
        this.cart = cart;
    }

    public String getDeliveryType(){
        return this.deliveryType;
    }

    public String getPaymentMethod(){
        return this.paymentMethod;
    }

    public String getDeliveryAddress(){
        return this.deliveryAddress;
    }

    public List<OrderCartItemDTO> getCart(){
        return this.cart;
    }
}

