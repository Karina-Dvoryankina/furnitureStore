package com.example.furnitureStore.DTO;

public class InformationResponce {

    private Long id;
    private String name;
    private String description;
    private String url;
    private float rating_count;
    private int price;
    private String video;
    private String tools;
    
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getUrl() {
        return url;
    }
    public void setUrl(String url) {
        this.url = url;
    }
    public float getRating_count() {
        return rating_count;
    }
    public void setRating_count(float rating_count) {
        this.rating_count = rating_count;
    }
    public int getPrice() {
        return price;
    }
    public void setPrice(int price) {
        this.price = price;
    }
    public String getVideo() {
        return video;
    }
    public void setVideo(String video) {
        this.video = video;
    }
    public String getTools() {
        return tools;
    }
    public void setTools(String tools) {
        this.tools = tools;
    }

    
  

}
