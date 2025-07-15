package com.example.furnitureStore.DTO;

import java.util.List;

public class BulkUpdateQuantityDTO {
    private List<UpdateQuantityDTO> updates;

    public List<UpdateQuantityDTO> getUpdates() {
        return updates;
    }

    public void setUpdates(List<UpdateQuantityDTO> updates) {
        this.updates = updates;
    }
}