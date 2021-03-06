package com.feed_grabber.core.role.dto;

import com.feed_grabber.core.role.SystemRole;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class RoleCreationDto {

    private String name;

    private String description;

    private SystemRole systemRole;

    private UUID companyId;
}
