package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.EmployeeDTO;

import java.util.List;
import java.util.Map;

public interface EmployeeService {

    List<EmployeeDTO> getAllEmployees();

    EmployeeDTO getEmployeeById(Long id);

    EmployeeDTO createEmployee(Map<String, Object> body);

    EmployeeDTO updateEmployee(Long id, Map<String, Object> body);

    ApiResponse deleteEmployee(Long id);
}
