package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.DestinationDTO;
import com.luxurystay.dto.cms.BannerDTO;
import com.luxurystay.dto.cms.CompanyInfoDTO;
import com.luxurystay.dto.cms.ContactInformationDTO;
import com.luxurystay.dto.cms.FaqDTO;
import com.luxurystay.dto.cms.SocialLinkDTO;
import com.luxurystay.entity.Destination;
import com.luxurystay.entity.cms.*;
import com.luxurystay.repository.DestinationRepository;
import com.luxurystay.repository.cms.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final BannerRepository bannerRepository;
    private final FaqRepository faqRepository;
    private final DestinationRepository destinationRepository;
    private final CompanyInfoRepository companyInfoRepository;
    private final SocialLinkRepository socialLinkRepository;
    private final ContactInformationRepository contactInfoRepository;

    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<BannerDTO>>> getBanners() {
        List<BannerDTO> banners = bannerRepository.findByActiveTrueOrderByDisplayOrderAsc().stream().map(b -> {
            BannerDTO dto = new BannerDTO();
            dto.setId(b.getId());
            dto.setTitle(b.getTitle());
            dto.setSubtitle(b.getSubtitle());
            dto.setImageUrl(b.getImageUrl());
            dto.setLinkUrl(b.getLinkUrl());
            dto.setButtonText(b.getButtonText());
            dto.setActive(b.isActive());
            dto.setDisplayOrder(b.getDisplayOrder());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Banners retrieved", banners));
    }

    @GetMapping("/faqs")
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getFaqs() {
        List<FaqDTO> faqs = faqRepository.findByActiveTrueOrderByDisplayOrderAsc().stream().map(f -> {
            FaqDTO dto = new FaqDTO();
            dto.setId(f.getId());
            dto.setQuestion(f.getQuestion());
            dto.setAnswer(f.getAnswer());
            dto.setCategory(f.getCategory());
            dto.setActive(f.isActive());
            dto.setDisplayOrder(f.getDisplayOrder());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "FAQs retrieved", faqs));
    }

    @GetMapping("/destinations/featured")
    public ResponseEntity<ApiResponse<List<DestinationDTO>>> getFeaturedDestinations() {
        List<DestinationDTO> dests = destinationRepository.findByFeaturedTrue().stream().map(d -> {
            DestinationDTO dto = new DestinationDTO();
            dto.setId(d.getId());
            dto.setName(d.getName());
            dto.setCountry(d.getCountry());
            dto.setImageUrl(d.getImageUrl());
            dto.setDescription(d.getDescription());
            dto.setFeatured(d.isFeatured());
            dto.setHotelCount(d.getHotelCount());
            dto.setAveragePrice(d.getAveragePrice());
            dto.setRating(d.getRating());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Destinations retrieved", dests));
    }

    @GetMapping("/company-info")
    public ResponseEntity<ApiResponse<CompanyInfoDTO>> getCompanyInfo() {
        CompanyInfoDTO dto = new CompanyInfoDTO();
        
        companyInfoRepository.findAll().stream().findFirst().ifPresent(info -> {
            dto.setId(info.getId());
            dto.setName(info.getName());
            dto.setDescription(info.getDescription());
            dto.setLogoUrl(info.getLogoUrl());
            dto.setCopyrightText(info.getCopyrightText());
        });
        
        List<SocialLinkDTO> socialLinks = socialLinkRepository.findByActiveTrueOrderByDisplayOrderAsc().stream().map(s -> {
            SocialLinkDTO sDto = new SocialLinkDTO();
            sDto.setId(s.getId());
            sDto.setPlatform(s.getPlatform());
            sDto.setUrl(s.getUrl());
            sDto.setIconClass(s.getIconClass());
            sDto.setDisplayOrder(s.getDisplayOrder());
            return sDto;
        }).collect(Collectors.toList());
        dto.setSocialLinks(socialLinks);
        
        List<ContactInformationDTO> contacts = contactInfoRepository.findByActiveTrue().stream().map(c -> {
            ContactInformationDTO cDto = new ContactInformationDTO();
            cDto.setId(c.getId());
            cDto.setType(c.getType());
            cDto.setValue(c.getValue());
            cDto.setLabel(c.getLabel());
            return cDto;
        }).collect(Collectors.toList());
        dto.setContacts(contacts);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Company info retrieved", dto));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("luxuryHotels", 500); 
        stats.put("happyGuests", 2000000); 
        stats.put("awardsWon", 150);
        stats.put("premiumRooms", 10000);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Statistics retrieved", stats));
    }
}
