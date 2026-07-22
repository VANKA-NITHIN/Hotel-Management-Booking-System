package com.luxurystay.dto.cms;

import lombok.Data;

@Data
public class ContactInformationDTO {
    private Long id;
    private String type;
    private String value;
    private String label;
}
