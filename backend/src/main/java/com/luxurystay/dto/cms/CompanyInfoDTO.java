package com.luxurystay.dto.cms;

import lombok.Data;
import java.util.List;

@Data
public class CompanyInfoDTO {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private String copyrightText;
    private List<SocialLinkDTO> socialLinks;
    private List<ContactInformationDTO> contacts;
}
