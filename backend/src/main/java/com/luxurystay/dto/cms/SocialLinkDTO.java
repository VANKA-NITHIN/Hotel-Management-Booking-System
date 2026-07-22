package com.luxurystay.dto.cms;

import lombok.Data;

@Data
public class SocialLinkDTO {
    private Long id;
    private String platform;
    private String url;
    private String iconClass;
    private int displayOrder;
}
