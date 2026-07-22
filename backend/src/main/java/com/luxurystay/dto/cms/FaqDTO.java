package com.luxurystay.dto.cms;

import lombok.Data;

@Data
public class FaqDTO {
    private Long id;
    private String question;
    private String answer;
    private String category;
    private boolean active;
    private int displayOrder;
}
