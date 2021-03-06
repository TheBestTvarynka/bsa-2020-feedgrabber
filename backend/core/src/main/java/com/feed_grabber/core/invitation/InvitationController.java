package com.feed_grabber.core.invitation;

import com.feed_grabber.core.auth.exceptions.JwtTokenException;
import com.feed_grabber.core.auth.security.TokenService;
import com.feed_grabber.core.company.exceptions.CompanyNotFoundException;
import com.feed_grabber.core.invitation.dto.InvitationDto;
import com.feed_grabber.core.invitation.dto.InvitationGenerateRequestDto;
import com.feed_grabber.core.invitation.dto.InvitationGenerateResponseDto;
import com.feed_grabber.core.invitation.dto.InvitationSignUpDto;
import com.feed_grabber.core.invitation.exceptions.InvitationAlreadyExistsException;
import com.feed_grabber.core.invitation.exceptions.InvitationNotFoundException;
import com.feed_grabber.core.apiContract.AppResponse;
import com.feed_grabber.core.invitation.exceptions.InvitationUserAlreadyExistsException;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.feed_grabber.core.role.RoleConstants.ROLE_COMPANY_OWNER;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    @Autowired
    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @ApiOperation(value = "Get the invitation by id",
            notes = "Provide id in the path to get the invitation")
    @GetMapping("/sign-up/{id}")
    public AppResponse<InvitationSignUpDto> getById(
            @ApiParam(value = "ID to get the invitation", required = true)
            @PathVariable UUID id) throws InvitationNotFoundException {
        return new AppResponse<>(invitationService.getById(id));
    }

    @ApiOperation(value = "Get the list of invitations",
    notes = "All invitations are got for one company, that is got from the token")
    @GetMapping
    @Secured(value = {ROLE_COMPANY_OWNER})
    public AppResponse<List<InvitationDto>> getByCompanyId() {
        var companyId = TokenService.getCompanyId();
        return new AppResponse<>(invitationService.getByCompanyId(companyId));
    }

    @ApiOperation(value = "Generate new invitation",
            notes = "Provide email and company id in request body")
    @PostMapping
    @Secured(value = {ROLE_COMPANY_OWNER})
    public AppResponse<InvitationGenerateResponseDto> generate(@RequestBody InvitationGenerateRequestDto dto)
            throws CompanyNotFoundException, InvitationAlreadyExistsException, InvitationUserAlreadyExistsException {
        dto.setCompanyId(TokenService.getCompanyId());
        return new AppResponse<>(invitationService.generate(dto));
    }

    @ApiOperation(value = "Regenerate the invitation",
            notes = "Provide id in the path to get the invitation, that was expired")
    @PostMapping("/resend")
    @Secured(value = {ROLE_COMPANY_OWNER})
    public AppResponse<InvitationGenerateResponseDto> reGenerate(@RequestBody InvitationGenerateRequestDto dto)
            throws CompanyNotFoundException, InvitationAlreadyExistsException, InvitationUserAlreadyExistsException {
        dto.setCompanyId(TokenService.getCompanyId());
        return new AppResponse<>(invitationService.reGenerate(dto));
    }

    @ApiOperation(value = "Delete invitation by email, that was used to generate it")
    @DeleteMapping
    @Secured(value = {ROLE_COMPANY_OWNER})
    public void delete(@RequestParam String email) {
        var companyId = TokenService.getCompanyId();
        invitationService.deleteByCompanyIdAndEmail(companyId, email);
    }

    private void assertCompanyOwner() {
        if (!TokenService.getRoleName().equals("company_owner")) {
            throw new JwtTokenException("Only company owner could manage invitations");
        }
    }
}
