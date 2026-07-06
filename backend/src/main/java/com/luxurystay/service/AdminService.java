package com.luxurystay.service;

import com.luxurystay.dto.ChartDataPointDTO;
import java.util.List;

public interface AdminService {
    List<ChartDataPointDTO> getMonthlyStats(Long hotelId);
}
