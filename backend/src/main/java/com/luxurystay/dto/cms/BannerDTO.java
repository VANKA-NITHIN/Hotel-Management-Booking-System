package com.luxurystay.dto.cms;

import lombok.Data;

@Data
public class BannerDTO {
    private Long id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private String buttonText;
    private boolean active;
    private int displayOrder;
}
